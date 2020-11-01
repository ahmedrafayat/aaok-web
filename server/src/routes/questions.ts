import { Question } from '../models/Question';
import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  Question.findAll()
    .then((questions) => res.send(questions))
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
});

// Fetch all questions for a form
router.get('/form/:formId', (req, res) => {
  Question.findAll({
    where: { formId: req.params.formId },
  })
    .then((questions) => res.send(questions))
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
});

module.exports = router;
