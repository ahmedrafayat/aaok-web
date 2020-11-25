import { NextFunction, Request, Response } from 'express';
import { Field } from '../models/Field';
import { FormResponse } from '../models/FormResponse';
import { Transaction } from 'sequelize';
import { Answer, AnswerCreationAttributes } from '../models/Answer';
import createHttpError from 'http-errors';
import { QueryTypes } from 'sequelize';
import formResponseUtil = require('../utils/formResponseUtils');

const sequelize = require('../config/db');
// const DEFAULT_PAGE_SIZE = 10;

export = {
  submitForm: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
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
          const field = formFields.find(
            (field) => fieldKey === String(field.fieldId)
          );
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
      // const size = Number(req.query.size) || DEFAULT_PAGE_SIZE;
      // const pageIndex = Number(req.query.page) || 1;

      // const startIndex = (pageIndex - 1) * size;

      const result = await sequelize.query(
        `
      SELECT
        r.response_id "responseId",
        f.title title,
        COALESCE(u.first_name || ' ' || u.last_name, 'Anonymous User') "name",
        u.email email,
        r.created_at "createdAt"
      FROM
        responses r
      INNER JOIN forms f ON
        r.form_id = f.form_id 
      LEFT JOIN users u ON
        r.user_id = u.user_id
      ORDER BY
        r.created_at DESC, 
        r.response_id ASC
      `,
        {
          type: QueryTypes.SELECT,
        }
      );

      res.send(result);
    } catch (error) {
      next(error);
    }
  },
};
