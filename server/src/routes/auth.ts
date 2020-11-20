import { User } from '../models/User';
import { Router } from 'express';
import createError from 'http-errors';
import { UniqueConstraintError } from 'sequelize';

const jwtUtil = require('../utils/jwtUtils');
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
    const accessToken = await jwtUtil.signAccessToken(newUser.userId);
    if (accessToken !== null) {
      res.send({ accessToken });
    } else {
      throw new createError.InternalServerError(
        'Could not generate access token'
      );
    }
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
