import { User } from '../models/User';
import { Router } from 'express';
import createError from 'http-errors';

const router = Router();

router.post('/register', async (req, res, next) => {
  console.log(req.body);
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new createError.BadRequest();

    const userDoesExist = await User.findOne({ where: { email: 'sadfsad' } });
    console.log('userDoesExist', userDoesExist);
    if (userDoesExist)
      throw new createError.Conflict(`${email} is already been registered`);

    let newUser;
    try {
      newUser = await User.create({
        email: email,
        password: String(password),
      });
    } catch (e) {
      throw e;
    }

    res.send(newUser);
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
