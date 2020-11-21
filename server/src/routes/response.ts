import { Router } from 'express';
import { FieldType } from '../enums/FieldType';
import { Field } from '../models/Field';
import { Response } from '../models/Response';
import { Transaction } from 'sequelize';
import { Answer, AnswerCreationAttributes } from '../models/Answer';

const sequelize = require('../config/db');
const router = Router();

function generateValueType(field: Field, fieldValue: any) {
  switch (field.fieldType) {
    case FieldType.LOCATION:
      return {
        type: field.fieldType,
        latitude: fieldValue.latitude,
        longitude: fieldValue.longitude,
      };
    default:
      return {
        type: field.fieldType,
        value: fieldValue,
      };
  }
}

function isAnonymousResponse(response: any) {
  return 'isAnonymous' in response && response.isAnonymous;
}

router.post('/:formId', async (req, res, next) => {
  const formId = Number(req.params.formId);
  const responseAnswers = req.body;
  // @ts-ignore
  let userId = req.payload.id;

  if (isAnonymousResponse(responseAnswers)) {
    userId = null;
  }

  const formFields = await Field.findAll({
    where: {
      formId: formId,
    },
  });

  try {
    const result = await sequelize.transaction(async (t: Transaction) => {
      const newResponse = await Response.create(
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
          const value = generateValueType(field, fieldValue);
          const answer = {
            responseId,
            fieldId: field.fieldId,
            value,
          };
          answersToBeSaved.push(answer);
        }
      }

      return await Answer.bulkCreate(answersToBeSaved);
    });

    res.send(result);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
