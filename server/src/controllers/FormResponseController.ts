import { NextFunction, Request, Response } from 'express';
import { Field } from '../models/Field';
import { FormResponse } from '../models/FormResponse';
import { Transaction } from 'sequelize';
import { Answer, AnswerCreationAttributes } from '../models/Answer';
import formResponseUtil = require('../utils/formResponseUtils');

const sequelize = require('../config/db');

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
      next(error);
    }
  },
};
