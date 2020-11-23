import { Router } from 'express';
import { Form } from '../models/Form';
import { QueryTypes } from 'sequelize';
import createHttpError from 'http-errors';

const sequelize = require('../config/db');

const router = Router();

// Fetch all forms
router.get('/', async (req, res, next) => {
  try {
    // @ts-ignore
    const decodedToken = req.payload;
    console.log('decodedToken', decodedToken);
    const isManagement = !!Number(decodedToken.isManagement);
    console.log('isManagement', isManagement);

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
    next(
      new createHttpError.InternalServerError(
        'A problem occurred while fetching forms'
      )
    );
  }
});

// Create a new form
router.post('/', async (req, res, next) => {
  const { title, description, managementOnly } = req.body;
  try {
    const newForm = await Form.create({
      title,
      description,
      managementOnly,
    });
    console.log('validation', await newForm.validate());
    await newForm.save();
    res.send({
      title: newForm.title,
      description: newForm.description,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

module.exports = router;
