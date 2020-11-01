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
router.post('/', async (req, res) => {
  const { title, description } = req.body;
  try {
    const newForm = await Form.create({
      title,
      description,
    });
    console.log('validation', await newForm.validate());
    newForm.save();
    res.send({
      title: newForm.title,
      description: newForm.description,
    });
  } catch (err) {
    res.status(400).send(err.errors);
  }
});

module.exports = router;
