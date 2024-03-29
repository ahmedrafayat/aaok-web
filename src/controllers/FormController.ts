import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { QueryTypes } from 'sequelize';

import { Form } from '../models/Form';
import { sequelize } from '../config/sequelize';
import { AppRequest } from '../models/types/AppRequest';

const getFormsWithNameQuery = `
SELECT 
    f.title,
    f.form_id "formId"
FROM
    forms f 
WHERE
    f.title ILIKE :term
ORDER BY
    f.form_id ASC
LIMIT 10
`;

export const FormController = {
  getFormsByName: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const term = req.query.title || '';

      const allForms = await sequelize.query(getFormsWithNameQuery, {
        replacements: { term: '%' + term + '%' },
        type: QueryTypes.SELECT,
      });

      res.send(allForms);
    } catch (error) {
      next(error);
    }
  },
  getFormsWithFields: async (req: AppRequest, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const decodedToken = req.payload;
      if (!decodedToken) {
        return;
      }
      const isManagement = !!Number(decodedToken.isManagement);

      const formsFields = await sequelize.query(
        `
      SELECT
        fields.form_id "formId",
        forms.title,
        forms.description,
        fields.field_id "fieldId",
        fields."label",
        fields.field_type "fieldType",
        fields.json_config "jsonConfig",
        fields.sort_order "sortOrder",
        forms.management_only "isManagementOnly"
      FROM
        forms, fields
      WHERE
        forms.form_id = fields.form_id
        ${!isManagement ? 'AND forms.management_only = :isManagement' : ''}
      ORDER BY
        forms.form_id,
        fields.sort_order`,
        {
          replacements: { isManagement: isManagement },
          type: QueryTypes.SELECT,
        }
      );
      res.send(formsFields);
    } catch (error) {
      next(new createHttpError.InternalServerError('A problem occurred while fetching forms'));
    }
  },
  createNewForm: async (req: Request, res: Response, next: NextFunction) => {
    const { title, description, managementOnly } = req.body;
    try {
      const newForm = await Form.create({
        title,
        description,
        managementOnly,
      });
      await newForm.save();
      res.send({
        title: newForm.title,
        description: newForm.description,
      });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
};
