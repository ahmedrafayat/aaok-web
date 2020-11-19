import { Router } from 'express';
import createError from 'http-errors';

const router = Router();

router.post('/register', async (req, res, next) => {
  console.log(req.body);
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new createError.BadRequest();
  } catch (e) {
    next(e);
  }
});

router.post('/login', async (req, res) => {
  res.send('login route');
});

router.post('/refresh-token', async (req, res) => {
  res.send('refresh token route');
});

router.delete('/logout', async (req, res) => {
  res.send('logout route');
});

module.exports = router;
