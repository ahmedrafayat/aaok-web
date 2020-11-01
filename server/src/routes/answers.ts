import { Router } from 'express';
const router = Router();

router.post('/', async (req, res) => {
  console.log(req.body);
  res.send();
});

module.exports = router;
