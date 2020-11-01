import { Request, Response, Router } from 'express';
import { Form } from '../models/Form';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  Form.findAll()
    .then((forms) => {
      res.send(forms);
    })
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
});

module.exports = router;
