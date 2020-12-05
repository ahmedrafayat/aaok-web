import { Field } from '../models/Field';
import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  Field.findAll()
    .then((fields) => res.send(fields))
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
});

// Fetch all fields for a form
router.get('/form/:formId', (req, res) => {
  Field.findAll({
    where: { formId: req.params.formId },
  })
    .then((fields) => res.send(fields))
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
});

export const FieldRouter = router;
