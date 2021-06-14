import { NextFunction, Request, Response } from 'express';
import { col, fn, Op, QueryTypes, Transaction } from 'sequelize';
import format from 'date-fns/format';
import createHttpError from 'http-errors';
import { Field } from '../models/Field';
import { FormResponse } from '../models/FormResponse';
import { Answer, AnswerCreationAttributes } from '../models/Answer';
import { sequelize } from '../config/sequelize';
import { User } from '../models/User';
import { notificationService } from '../notification/NotificationService';
import { NotificationMessage } from '../notification/NotificationMessage';
import { AppRequest } from '../models/types/AppRequest';
import { Form } from '../models/Form';
import { NotificationToken } from '../models/NotificationToken';
import { FormResponseStatus } from '../models/enums/FormResponseStatus';
import { formResponseUtil } from '../utils/formResponseUtils';
import { UserManagementTypes } from '../models/enums/UserManagementTypes';
import {
  sendAdminAssignmentEmailToAdmin,
  sendAssignmentEmailToUser,
  sendEmailToManagersForNewSubmission,
} from '../config/nodemailer';

const fetchResponseFormQuery = `
    SELECT f.title,
           f.description,
           u.email,
           COALESCE(u.first_name || ' ' || u.last_name, 'Anonymous User') "submitter",
           u2.first_name || ' ' || u2.last_name                           "assignedTo",
           r.assigned_to                                                  "assignedToId",
           r.status,
           r.notes
    FROM responses r
             INNER JOIN forms f ON
        f.form_id = r.form_id
             LEFT JOIN users u ON
        u.user_id = r.user_id
             LEFT JOIN users u2 ON
        u2.user_id = r.assigned_to
    WHERE r.response_id = :responseId
`;

const fetchResponseListQuery = (filterQuery: string) => `
    SELECT r.response_id AS                                               "responseId",
           f.title       AS                                               "title",
           COALESCE(u.first_name || ' ' || u.last_name, 'Anonymous User') "name",
           u.email       AS                                               "email",
           COALESCE(u2.first_name || ' ' || u2.last_name, '')             "assignedTo",
           r.notes       AS                                               "notes",
           r.status      AS                                               "status",
           r.created_at                                                   "createdAt",
           (
               SELECT array_to_json(array_agg(row_to_json(t)))
               FROM (
                        SELECT a2.value -> 'value' "value",
                               f2.field_key        "fieldKey"
                        FROM answers a2,
                             fields f2
                        WHERE f2.field_id = a2.field_id
                          AND a2.response_id = r.response_id
                          AND f2.field_type IN (0, 3, 7)) t)              "extraFields"
    FROM responses r
             INNER JOIN forms f ON
        r.form_id = f.form_id
             LEFT JOIN users u ON
        r.user_id = u.user_id
             LEFT JOIN users u2 ON
            r.assigned_to = u2.user_id
            ${filterQuery}
    ORDER BY r.created_at DESC,
             r.response_id
`;

const fetchCsvGenerationData = (responseIds: string) => `
    select a.value ->> 'value' AS "value",
           a.response_id          "responseId",
           f.field_key            "fieldKey",
           f.label
    from answers a,
         fields f
    where f.field_id = a.field_id
      and a.response_id in (${responseIds})
      and f.field_type in (0, 7)
`;

export const FormResponseController = {
  submitForm: async (req: AppRequest, res: Response, next: NextFunction): Promise<void> => {
    const formId = Number(req.params.formId);
    const responseAnswers = req.body;
    if (!req.payload) {
      return;
    }
    let userId: number | null = req.payload.id;

    if (formResponseUtil.isAnonymousResponse(responseAnswers)) {
      userId = null;
    }

    const formFields = await Field.findAll({
      where: {
        formId: formId,
      },
    });

    try {
      const { answers, newResponse } = await sequelize.transaction(async (t: Transaction) => {
        const newResponse = await FormResponse.create({ userId: userId, formId: formId }, { transaction: t });
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

        const answers = await Answer.bulkCreate(answersToBeSaved, {
          validate: true,
        });
        return { answers, newResponse };
      });

      if (answers.length > 0 && newResponse) {
        let admins: User[] = [];
        try {
          admins = await User.findAll({
            where: {
              isManagement: UserManagementTypes.ADMIN,
              isEnabled: 1,
            },
            attributes: ['userId', 'email'],
          });
        } catch (e) {
          console.error(e);
        }
        const form = await Form.findByPk(newResponse.formId);
        const user = newResponse.userId !== null ? await User.findByPk(newResponse.userId) : null;
        const ownerTokens = await NotificationToken.findAll({ where: { userId: admins.map((admin) => admin.userId) } });
        if (form !== null) {
          sendEmailToManagersForNewSubmission({
            submissionId: newResponse.responseId,
            admins,
            submitter: user,
            formTitle: form.title,
            formDescription: form.description,
            submissionDate: format(newResponse.createdAt, 'do LLL yyy HH:mm'),
          });

          const notificationMessage = new NotificationMessage(
            'New Submission!',
            `There was a new submission to the form "${form.title}" by ${
              user === null ? 'an Anonymous user' : user.getFullName()
            }`
          );
          console.log('SENDING NEW SUBMISSON NOTIFICATION TO THE ADMINS');
          notificationService
            .sendPushNotification(
              ownerTokens.map((token) => token.tokenValue),
              notificationMessage
            )
            .catch((err) => console.error(err));
        }
      }

      res.send(answers);
    } catch (error) {
      console.error(error);
      next(new createHttpError.InternalServerError('Could not submit your response. Please contact an administrator'));
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

      const answers = await Answer.findAll({
        where: {
          responseId: responseId,
        },
        include: [{ model: Field, as: 'field', required: true, attributes: ['label'] }],
        attributes: ['value'],
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
        answers: answers.map((answer) => ({ value: answer.value, label: answer.field?.label })),
      });
    } catch (error) {
      next(error);
    }
  },
  getCsvGenerationData: async (req: Request, res: Response, next: NextFunction) => {
    const responseIds = req.query.responseIds;
    console.log('IN GetCsvGenerationData with response IDs', responseIds);

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
    const { notes } = req.body;
    const newStatus = Number(req.body.status);
    const assignedTo = Number(req.body.assignedTo);
    try {
      const formResponse = await FormResponse.findByPk(responseId, {
        include: [
          { model: Form, as: 'form', required: true },
          { model: User, as: 'owner' },
        ],
      });

      if (formResponse && formResponse.form) {
        let shouldSendAdminAssignmentNotification = false;
        let shouldNotifyUserResponseInProgress = false;
        if (assignedTo !== 0 && (formResponse.isUnassigned() || formResponse.assignedTo !== assignedTo)) {
          shouldSendAdminAssignmentNotification = true;
        }

        if (
          formResponse.hasOwner() &&
          (newStatus === FormResponseStatus.IN_PROGRESS || newStatus === FormResponseStatus.RESOLVED) &&
          formResponse.status !== newStatus
        ) {
          shouldNotifyUserResponseInProgress = true;
        }

        // Save admin fields
        formResponse.assignedTo = assignedTo === 0 ? null : assignedTo;
        formResponse.status = newStatus;
        formResponse.notes = notes;
        const savedResponse = await formResponse.save();

        if (shouldSendAdminAssignmentNotification && assignedTo > 0) {
          const assignedAdmin = await User.findByPk(assignedTo, {
            include: {
              model: NotificationToken,
              as: 'notificationTokens',
            },
          });
          if (assignedAdmin !== null) {
            sendAdminAssignmentEmailToAdmin({
              submissionId: formResponse.responseId,
              adminName: assignedAdmin.getFullName(),
              adminEmail: assignedAdmin.email,
              formTitle: formResponse.form.title,
              formDescription: formResponse.form.description,
              submissionDate: format(formResponse.createdAt, 'do LLL yyyy HH:mm'),
              user: formResponse.owner || null,
            });
            const notificationMessage = new NotificationMessage(
              `Assigned to form`,
              `A New '${formResponse.form.title}' submission has been assigned to you`
            );
            console.log('SENDING NEW ASSIGNMENT NOTIFICATION TO ADMIN :' + assignedAdmin?.email);
            notificationService
              .sendPushNotification(
                (assignedAdmin?.notificationTokens || []).map((token) => token.tokenValue),
                notificationMessage
              )
              .catch((e) => console.error('Failed to send admin assignment notification' + e))
              .then(() => console.log('Admin assignment notification has been sent'));
          }
        }

        // If notification should be sent to user
        if (
          savedResponse &&
          shouldNotifyUserResponseInProgress &&
          formResponse.userId !== null &&
          formResponse.owner &&
          savedResponse.assignedTo !== null
        ) {
          const assignedAdmin = await User.findByPk(savedResponse.assignedTo);
          const ownerTokens = await NotificationToken.getUserTokens(formResponse.userId);
          const tokenStrings = ownerTokens.map((token) => token.tokenValue);
          const sendEmailToUser = () => {
            if (assignedAdmin !== null)
              sendAssignmentEmailToUser({
                assignedAdmin,
                user: formResponse.owner,
                formTitle: formResponse.form?.title || '',
                formDescription: formResponse.form?.description || '',
                submissionDate: format(formResponse.createdAt, 'do LLL yyyy HH:mm'),
                status: FormResponse.getStatusText(savedResponse.status),
              });
          };

          if (assignedAdmin !== null) {
            const notificationMessage = new NotificationMessage(
              `Status update! ${FormResponse.getStatusText(formResponse.status)}`,
              `${FormResponse.getStatusNotificationBody(formResponse.status)} "${formResponse.form.title}"`
            );
            console.log('SENDING ASSIGNMENT ALERT NOTIFICATION TO USER :' + formResponse.owner.email);
            if (tokenStrings.length > 0) {
              notificationService
                .sendPushNotification(tokenStrings, notificationMessage, sendEmailToUser)
                .catch((err) => console.error(err));
            } else {
              sendEmailToUser();
            }
          }
        }

        res.status(200).send({ assignedTo, status: newStatus, notes });
      } else {
        next(new createHttpError.BadRequest('Form Response not found'));
      }
    } catch (e) {
      console.error(e);
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
    filters.push(`r.created_at::date >= '${dateRange.startDate}' AND r.created_at::date <= '${dateRange.endDate}'`);
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
