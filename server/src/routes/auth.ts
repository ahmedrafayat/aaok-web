import { User } from '../models/User';
import { Router } from 'express';
import createError from 'http-errors';
import { Op, UniqueConstraintError } from 'sequelize';

import client = require('../utils/initRedis');

const jwtUtil = require('../utils/jwtUtils');
const router = Router();

router.post('/register', async (req, res, next) => {
  console.log(req.body);
  try {
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password || !firstName || !lastName)
      throw new createError.BadRequest('Please enter all fields');

    if (typeof password !== 'string' && password.length < 8)
      throw new createError.BadRequest(
        'Password must be have at least 8 characters'
      );

    // fetch user by email
    const userExists = await User.findOne({
      where: {
        email: {
          [Op.iLike]: email,
        },
      },
    });

    const newUser: User = new User({
      email: String(email),
      password: String(password),
      firstName: String(firstName),
      lastName: String(lastName),
      isRegistered: 1,
      isManagement: 0,
    });

    // if email exists and is enabled but hasn't registered
    if (
      userExists !== null &&
      (!userExists.isRegistered || !userExists.password) &&
      userExists.isEnabled
    ) {
      const savedUser = await userExists
        .set('email', newUser.email)
        .set('password', newUser.password)
        .set('firstName', newUser.firstName)
        .set('lastName', newUser.lastName)
        .set('isRegistered', newUser.isRegistered)
        .set('isManagement', newUser.isManagement)
        .save();
      const tokenPayload = {
        isManagement: savedUser.isManagement,
        id: savedUser.userId,
        // email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
      };
      const accessToken = await jwtUtil.signAccessToken(tokenPayload);
      const refreshToken = await jwtUtil.signRefreshToken(tokenPayload);
      if (accessToken !== null) {
        res.send({ accessToken, refreshToken });
      }
    } else if (
      userExists !== null &&
      (userExists.isRegistered || userExists.password)
    ) {
      throw new createError.Conflict('A user with this email already exists');
    }
    // when not exists, register and make disabled
    else {
      const newSavedUser = await User.create(
        {
          email,
          password,
          firstName,
          lastName,
          isManagement: 0,
          isRegistered: 1,
          isEnabled: 0,
        },
        { validate: false }
      );

      res.send(newSavedUser);
    }
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      // @ts-ignore
      error.status = 422;
    }
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      throw new createError.BadRequest('Invalid Username/Password');

    const user = await User.findOne({
      where: {
        email: {
          [Op.iLike]: email,
        },
      },
    });

    if (user === null) {
      throw new createError.NotFound('User Not Registered');
    }

    if (!user.isEnabled) {
      throw new createError.Unauthorized(
        'User is not enabled. Please contact an administrator'
      );
    }

    const isMatch = await jwtUtil.isValidPassword(password, user.password);
    if (!isMatch)
      throw new createError.Unauthorized('Invalid username/password');

    const tokenPayload = {
      firstName: user.firstName,
      lastName: user.lastName,
      // email: user.email,
      id: user.userId,
      isManagement: user.isManagement,
    };
    const accessToken = await jwtUtil.signAccessToken(tokenPayload);
    const refreshToken = await jwtUtil.signRefreshToken(tokenPayload);
    if (accessToken && refreshToken) {
      res.send({ accessToken, refreshToken });
    } else throw new createError.InternalServerError();
  } catch (error) {
    next(error);
  }
});

router.post('/refresh-token', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new createError.BadRequest();
    const tokenPayload = await jwtUtil.verifyRefreshToken(refreshToken);

    const accessToken = await jwtUtil.signAccessToken(tokenPayload);
    const refToken = await jwtUtil.signRefreshToken(tokenPayload);

    if (accessToken && refToken) {
      res.send({ accessToken, refreshToken: refToken });
    } else throw new createError.InternalServerError();
  } catch (error) {
    next(error);
  }
});

router.delete('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new createError.BadRequest();
    const userData = await jwtUtil.verifyRefreshToken(refreshToken);

    client.DEL(String(userData.id), (err, reply) => {
      if (err) {
        console.log(err.message);
        throw new createError.InternalServerError();
      }
      console.log('User successfully logged out', reply);
      res.send(204);
    });
  } catch (error) {}
});

module.exports = router;
