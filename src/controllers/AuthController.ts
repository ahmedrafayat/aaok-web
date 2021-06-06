import createError from 'http-errors';
import { Op, UniqueConstraintError } from 'sequelize';
import { NextFunction, Request, Response } from 'express';
import JWT from 'jsonwebtoken';
import { User } from '../models/User';
import { JwtUtils } from '../utils/jwtUtils';
import { redisClient } from '../utils/initRedis';
import { sendResetPasswordEmail } from '../config/nodemailer';
import { UserManagementTypes } from '../models/enums/UserManagementTypes';

export const AuthController = {
  register: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, firstName, lastName } = req.body;
      if (!email || !password || !firstName || !lastName) {
        return next(new createError.BadRequest('Please enter all fields'));
      }

      if (typeof password !== 'string' || password.length < 8) {
        return next(new createError.BadRequest('Password must be have at least 8 characters'));
      }

      // fetch user by email
      const userExists = await User.findOne({
        where: {
          email: {
            [Op.iLike]: email,
          },
        },
      });

      const newUser: User = new User({
        email: String(email).toLowerCase(),
        password: String(password),
        firstName: String(firstName),
        lastName: String(lastName),
        isRegistered: 1,
        isManagement: UserManagementTypes.NORMAL_USER,
      });

      if (userExists !== null && (!userExists.isRegistered || !userExists.password) && userExists.isEnabled) {
        const savedUser = await userExists
          .set('password', newUser.password)
          .set('firstName', newUser.firstName)
          .set('lastName', newUser.lastName)
          .set('isRegistered', newUser.isRegistered)
          .set('isManagement', newUser.isManagement)
          .save();
        const tokenPayload = {
          isManagement: savedUser.isManagement,
          id: savedUser.userId,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
        };
        const accessToken = await JwtUtils.signAccessToken(tokenPayload);
        const refreshToken = await JwtUtils.signRefreshToken(tokenPayload);
        if (accessToken !== null && refreshToken !== null) {
          res.send({ accessToken, refreshToken });
        }
      } else if (userExists !== null && (userExists.isRegistered || userExists.password)) {
        return next(new createError.Conflict('A user with this email already exists'));
      }
      // when not exists, register and make disabled
      else {
        const newSavedUser = await User.create(
          {
            email,
            password,
            firstName,
            lastName,
            isManagement: UserManagementTypes.NORMAL_USER,
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
  },

  login: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new createError.BadRequest('Invalid Username/Password'));
      }

      const user = await User.findOne({
        where: {
          email: {
            [Op.iLike]: email,
          },
        },
      });

      if (user === null) {
        return next(new createError.NotFound('User Not Registered'));
      }

      if (!user.isEnabled) {
        return next(new createError.Unauthorized('User is not enabled. Please contact an administrator'));
      }

      const isMatch = await JwtUtils.isValidPassword(password, user.password);
      if (!isMatch) {
        return next(new createError.Unauthorized('Invalid username/password'));
      }

      const tokenPayload = {
        firstName: user.firstName,
        lastName: user.lastName,
        id: user.userId,
        isManagement: user.isManagement,
      };
      const accessToken = await JwtUtils.signAccessToken(tokenPayload);
      const refreshToken = await JwtUtils.signRefreshToken(tokenPayload);
      if (accessToken && refreshToken) {
        res.send({ accessToken, refreshToken });
      } else {
        return next(new createError.InternalServerError());
      }
    } catch (error) {
      next(error);
    }
  },

  refreshToken: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return next(new createError.BadRequest());
      }
      const tokenPayload = await JwtUtils.verifyRefreshToken(refreshToken);

      const accessToken = await JwtUtils.signAccessToken(tokenPayload);
      const refToken = await JwtUtils.signRefreshToken(tokenPayload);

      if (accessToken && refToken) {
        res.send({ accessToken, refreshToken: refToken });
      } else {
        return next(new createError.InternalServerError());
      }
    } catch (error) {
      next(error);
    }
  },

  logout: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return next(new createError.BadRequest());
      }
      const userData = await JwtUtils.verifyRefreshToken(refreshToken);

      redisClient.DEL(String(userData.id), (err) => {
        if (err) {
          console.log(err.message);
          throw new createError.InternalServerError();
        }
        res.sendStatus(204);
      });
    } catch (error) {
      next(error);
    }
  },

  adminLogin: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new createError.BadRequest('Invalid Username/Password'));
      }

      const user = await User.findOne({
        where: {
          email: {
            [Op.iLike]: email,
          },
        },
      });

      if (user === null) {
        return next(new createError.NotFound('User Not Registered'));
      }

      if (user.isManagement === UserManagementTypes.NORMAL_USER) {
        return next(new createError.Unauthorized('You are not allowed to access this site'));
      }

      const isMatch = await isValidPassword(password, user.password);
      if (!isMatch) {
        return next(new createError.Unauthorized('Invalid username/password'));
      }

      const tokenPayload = {
        firstName: user.firstName,
        lastName: user.lastName,
        id: user.userId,
        isManagement: user.isManagement,
      };
      const accessToken = await JwtUtils.signAccessToken(tokenPayload);
      const refreshToken = await JwtUtils.signRefreshToken(tokenPayload);
      if (accessToken && refreshToken) {
        res.send({ accessToken, refreshToken });
      } else {
        return next(new createError.InternalServerError());
      }
    } catch (error) {
      next(error);
    }
  },

  forgotPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const email = req.body.email.trim();
      const user = await User.findOne({
        where: {
          email: {
            [Op.iLike]: email,
          },
        },
      });
      if (user) {
        const token = await JwtUtils.signPasswordResetToken(user.userId);
        if (token) {
          user.resetToken = token;
          await user.save();
          await sendResetPasswordEmail({
            name: `${user.firstName} ${user.lastName}`,
            resetToken: token,
            toEmail: user.email,
          });
        }
      }
      res.sendStatus(200);
    } catch (e) {
      next(e);
    }
  },

  resetPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const password = req.body.password.trim();
      const token = req.body.token.trim();
      const decodedToken = JWT.decode(token);
      let user;

      if (decodedToken && typeof decodedToken !== 'string' && decodedToken['id']) {
        user = await User.findByPk(decodedToken.id);
        if (!user || user.resetToken !== token) {
          return next(
            new createError.Unauthorized(
              'The password reset link is invalid or expired, please try again with a new link'
            )
          );
        }
      } else {
        return next(
          new createError.Unauthorized(
            'The password reset link is invalid or expired, please try again with a new link'
          )
        );
      }

      if (password && token && user) {
        const isValidToken = await JwtUtils.verifyPasswordResetToken(token);
        if (isValidToken) {
          user.password = password;
          user.resetToken = '';
          await user.save();
          res.send({ isManagement: user.isManagement });
        } else {
          return next(new createError.Unauthorized('Invalid token'));
        }
      } else {
        return next(new createError.BadRequest());
      }
    } catch (e) {
      if (e.name === 'TokenExpiredError') {
        return next(new createError.Unauthorized('Token has expired'));
      }
      next(e);
    }
  },
};

async function isValidPassword(enteredPassword: string, actualPassword: string) {
  return await JwtUtils.isValidPassword(enteredPassword, actualPassword);
}
