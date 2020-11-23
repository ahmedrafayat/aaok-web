import { NextFunction, Request, Response } from 'express';
import { Field } from '../models/Field';
import { FormResponse } from '../models/FormResponse';
import { Transaction } from 'sequelize';
import { Answer, AnswerCreationAttributes } from '../models/Answer';
import formResponseUtil = require('../utils/formResponseUtils');
import createHttpError from 'http-errors';

const sequelize = require('../config/db');
const DEFAULT_PAGE_SIZE = 10;

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
  getResponseWithPagination: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const size = Number(req.query.size) || DEFAULT_PAGE_SIZE;
      const pageIndex = Number(req.query.page) || 1;

      const startIndex = (pageIndex - 1) * size;

      const result = await FormResponse.findAll({
        order: [
          ['createdAt', 'DESC'],
          ['response_id', 'ASC'],
        ],
        limit: size,
        offset: startIndex,
      });

      res.send(result);
    } catch (error) {
      next(error);
    }
  },
};
