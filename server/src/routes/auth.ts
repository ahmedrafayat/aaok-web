import { User } from '../models/User';
import { Router } from 'express';
import createError from 'http-errors';
import { UniqueConstraintError } from 'sequelize';

const router = Router();

router.post('/register', async (req, res, next) => {
  console.log(req.body);
  try {
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password || !firstName || !lastName)
      throw new createError.BadRequest();

    const newUser = await User.create(
      {
        email,
        password,
        firstName,
        lastName,
      },
      { validate: true }
    );

    res.send(newUser);
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      // @ts-ignore
      error.status = 422;
    }
    next(error);
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
