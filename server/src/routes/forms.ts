import { Router } from 'express';
import { Form } from '../models/Form';
import { QueryTypes } from 'sequelize';

const sequelize = require('../config/db');

const router = Router();

// Fetch all forms
router.get('/', async (req, res) => {
  const formsFields = await sequelize.query(
    `select
  fields.form_id "formId",
    forms.title,
    forms.description,
    fields.field_id "fieldId",
    fields."label",
    fields.field_type "fieldType",
    fields.sort_order "sortOrder",
    forms.management_only "isManagementOnly"
  from
  forms,
    fields
  where
  forms.form_id = fields.form_id
  order by
  forms.form_id,
    fields.sort_order`,
    {
      type: QueryTypes.SELECT,
    }
  );
  res.send(formsFields);
});

// Create a new form
router.post('/', async (req, res) => {
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
    res.status(400).send(err.errors);
  }
});

module.exports = router;
