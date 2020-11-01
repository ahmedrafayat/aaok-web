import { Question } from '../models/Question';
import { Request, Response, Router } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  Question.findAll()
    .then((questions) => {
      res.send(questions);
    })
    .catch((err) => res.send(err));
});

module.exports = router;
