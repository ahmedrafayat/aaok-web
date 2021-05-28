import { NextFunction, Request, Response } from 'express';
import { col, fn, Op, QueryTypes, Transaction } from 'sequelize';
import createHttpError from 'http-errors';
import { Field } from '../models/Field';
import { FormResponse, FormResponseStatus } from '../models/FormResponse';
import { Answer, AnswerCreationAttributes } from '../models/Answer';
import { sequelize } from '../config/sequelize';
import { User, UserManagementTypes } from '../models/User';
import formResponseUtil = require('../utils/formResponseUtils');
import { notificationService } from '../notification/NotificationService';
import { NotificationMessage } from '../notification/NotificationMessage';

const fetchResponseAnswersQuery = `
SELECT
    f."label" "label",
    a.value,
    f.json_config "jsonConfig"
FROM
    responses r,
    answers a,
    fields f
WHERE
    r.response_id = :responseId
    AND r.response_id = a.response_id
    AND f.field_id = a.field_id
`;

const fetchResponseFormQuery = `
SELECT
    f.title,
    f.description,
    u.email,
    COALESCE(u.first_name || ' ' || u.last_name, 'Anonymous User') "submitter",
    COALESCE(u2.first_name || ' ' || u2.last_name, null) "assignedTo",
    r.status status,
    r.notes notes
FROM
    responses r
INNER JOIN forms f ON
    f.form_id = r.form_id
LEFT JOIN users u ON
    u.user_id = r.user_id
LEFT JOIN users u2 ON
    u2.user_id = r.assigned_to
WHERE
    r.response_id = :responseId
`;

const fetchResponseListQuery = (filterQuery: string) => `
SELECT
    r.response_id "responseId",
    f.title title,
    COALESCE(u.first_name || ' ' || u.last_name, 'Anonymous User') "name",
    u.email email,
    COALESCE(u2.first_name || ' ' || u2.last_name, '') "assignedTo",
    r.notes notes,
    r.status status,
    r.created_at "createdAt",
    (
    SELECT
        array_to_json(array_agg(row_to_json(t)))
    FROM
        (
        SELECT
            a2.value -> 'value' "value",
            f2.field_key "fieldKey"
        FROM
            answers a2,
            fields f2
        WHERE
            f2.field_id = a2.field_id
            AND a2.response_id = r.response_id
            AND f2.field_type IN (0, 3, 7)) t) "extraFields"
FROM
    responses r
INNER JOIN forms f ON
    r.form_id = f.form_id
LEFT JOIN users u ON
    r.user_id = u.user_id
LEFT JOIN users u2 ON
    r.assigned_to = u2.user_id
${filterQuery}
ORDER BY
    r.created_at DESC,
    r.response_id ASC
`;

const fetchCsvGenerationData = (responseIds: string) => `
select
    a.value ->> 'value' "value",
    a.response_id "responseId",
    f.field_key "fieldKey",
    f.label 
from
    answers a,
    fields f
where
    f.field_id = a.field_id
    and a.response_id in (${responseIds})
    and f.field_type in (0, 7)
`;

export const FormResponseController = {
  submitForm: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const formId = Number(req.params.formId);
    const responseAnswers = req.body;
    // @ts-ignore
    let userId = req.payload.id;

    if (formResponseUtil.isAnonymousResponse(responseAnswers)) {
      userId = null;
    }

    const formFields = await Field.findAll({
      where: {
        formId: formId,
      },
    });

    try {
      const result = await sequelize.transaction(async (t: Transaction) => {
        const newResponse = await FormResponse.create(
          { userId: userId, formId: formId },
          { transaction: t }
        );
        const responseId = newResponse.responseId;

        const answersToBeSaved: AnswerCreationAttributes[] = [];

        for (const [fieldKey, fieldValue] of Object.entries(responseAnswers)) {
          const field = formFields.find((field) => fieldKey === String(field.fieldId));
          if (field) {
            const value = formResponseUtil.generateValueType(field, fieldValue);
            const answer = {
              responseId,
              fieldId: field.fieldId,
              value,
            };
            answersToBeSaved.push(answer);
          }
        }

        return await Answer.bulkCreate(answersToBeSaved, {
          validate: true,
        });
      });

      res.send(result);
    } catch (error) {
      console.log(error);
      next(
        new createHttpError.InternalServerError(
          'Could not submit your response. Please contact an administrator'
        )
      );
    }
  },
  getResponses: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { form, user, assignedTo, status, startDate, endDate } = req.query;

      const filterQuery = buildFilterQuery(
        form as string,
        user as string,
        assignedTo as string,
        status as string | null,
        {
          startDate: startDate as string,
          endDate: endDate as string,
        }
      );

      const result = await sequelize.query(fetchResponseListQuery(filterQuery), {
        type: QueryTypes.SELECT,
      });

      res.send(result);
    } catch (error) {
      next(error);
    }
  },
  getResponse: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const responseId = req.params.responseId;

      const answers = await sequelize.query(fetchResponseAnswersQuery, {
        replacements: { responseId: responseId },
        type: QueryTypes.SELECT,
      });

      const formData = await sequelize.query(fetchResponseFormQuery, {
        replacements: { responseId: responseId },
        type: QueryTypes.SELECT,
      });

      const adminUsers = await User.findAll({
        where: {
          isManagement: {
            [Op.gt]: UserManagementTypes.NORMAL_USER,
          },
        },
        attributes: ['user_id', [fn('CONCAT', col('first_name'), ' ', col('last_name')), 'name']],
      });

      res.send({
        ...formData[0],
        adminUsers,
        answers: answers,
      });
    } catch (error) {
      next(error);
    }
  },
  getCsvGenerationData: async (req: Request, res: Response, next: NextFunction) => {
    const responseIds = req.query.responseIds;
    console.log(responseIds);

    try {
      if (typeof responseIds === 'string' && responseIds.length > 0) {
        const result = await sequelize.query(fetchCsvGenerationData(responseIds), {
          type: QueryTypes.SELECT,
        });
        res.send(result);
      } else {
        next(new createHttpError.BadRequest());
      }
    } catch (e) {
      console.error(e.message);
      next(e);
    }
  },
  saveAdminFields: async (req: Request, res: Response, next: NextFunction) => {
    const responseId = req.params.responseId;
    const { assignedTo, status, notes } = req.body;
    // console.log('-> req.body', req.body);
    try {
      const response = await FormResponse.findByPk(responseId);
      // console.log('-> response', response);
      if (response) {
        let shouldSendAdminAssignmentNotification = false;
        let shouldNotifyUserResponseInProgress = false;
        if (
          (response.assignedTo === null && Number(assignedTo) !== 0) ||
          Number(response.assignedTo) !== Number(assignedTo)
        ) {
          shouldSendAdminAssignmentNotification = true;
        }

        if (Number(status) === FormResponseStatus.IN_PROGRESS) {
          shouldNotifyUserResponseInProgress = true;
        }

        response.assignedTo = Number(assignedTo) === 0 ? null : assignedTo;
        response.status = status;
        response.notes = notes;
        const savedResponse = await response.save();

        if (savedResponse && shouldNotifyUserResponseInProgress) {
          const notificationMessage = new NotificationMessage(
            'Response in progress',
            'And here is the body!',
            {
              someData: 'goes here',
            }
          );
          notificationService
            .sendPushNotification('ExponentPushToken[sOjcq2MTWxPBDiXfjh83jW]', notificationMessage)
            .then((res) => console.log('-> res success', res))
            .catch((err) => console.error(err));
        }

        res.status(200).send({ assignedTo, status, notes });
      } else {
        next(new createHttpError.BadRequest('Form Response not found'));
      }
    } catch (e) {
      next(e);
    }
  },
};

const buildFilterQuery = (
  forms: string,
  users: string,
  assignedTo: string,
  status: string | null,
  dateRange: { startDate: string; endDate: string }
) => {
  const filters = [];
  if (forms && forms.length > 0) {
    filters.push(`r.form_id IN (${forms})`);
  }
  if (users && users.length > 0) {
    filters.push(`r.user_id IN (${users})`);
  }
  if (dateRange.startDate && dateRange.endDate) {
    filters.push(
      `r.created_at::date >= '${dateRange.startDate}' AND r.created_at::date <= '${dateRange.endDate}'`
    );
  }
  if (status && status.length > 0) {
    filters.push(`r.status IN (${status})`);
  }
  if (assignedTo && assignedTo.length > 0) {
    filters.push(`r.assigned_to IN (${assignedTo})`);
  }

  if (filters.length > 0) {
    return 'WHERE ' + filters.join(' AND ');
  } else {
    return '';
  }
};
