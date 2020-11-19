import { Router } from 'express';
import { Form } from '../models/Form';

const router = Router();

// Fetch all forms
router.get('/', (req, res) => {
  Form.findAll()
    .then((forms) => {
      res.send(forms);
    })
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
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
    // next(err);
  }
});

module.exports = router;
