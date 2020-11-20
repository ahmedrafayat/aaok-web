import { SignOptions } from 'jsonwebtoken';
import { compare } from 'bcrypt';
import createError from 'http-errors';
import JWT = require('jsonwebtoken');
import ms = require('ms');

type userData = {
  firstName: string;
  lastName: string;
  isManagement: number;
  email: string;
};

module.exports = {
  signAccessToken: async (userData: userData) => {
    return new Promise((resolve, reject) => {
      const payload = userData;
      const secret = process.env.ACCESS_TOKEN_SECRET;
      if (secret) {
        const options: SignOptions = {
          expiresIn: ms('1m'),
          issuer: process.env.HOST_URL || 'AAOKay',
        };
        JWT.sign(payload, secret, options, (err, token) => {
          if (err) {
            console.log(err.message);
            reject(new createError.InternalServerError());
          }
          resolve(token);
        });
      } else {
        resolve(null);
      }
    });
  },
  signRefreshToken: async (userData: userData) => {
    return new Promise((resolve, reject) => {
      const payload = userData;
      const secret = process.env.REFRESH_TOKEN_SECRET;
      if (secret) {
        const options: SignOptions = {
          expiresIn: ms('1y'),
          issuer: process.env.HOST_URL || 'AAOKay',
        };
        JWT.sign(payload, secret, options, (err, token) => {
          if (err) {
            console.log(err.message);
            reject(new createError.InternalServerError());
          }
          resolve(token);
        });
      } else {
        resolve(null);
      }
    });
  },
  verifyRefreshToken: (refreshToken: string) => {
    return new Promise((resolve, reject) => {
      const secret = process.env.REFRESH_TOKEN_SECRET;
      if (secret) {
        JWT.verify(refreshToken, secret, (err, payload: any) => {
          if (err) return reject(new createError.Unauthorized());
          // const { firstName, lastName, isManagement, email } = payload;
          if (
            'firstName' in payload &&
            'lastName' in payload &&
            'isManagement' in payload &&
            'email' in payload
          ) {
            return resolve({
              firstName: payload.firstName,
              lastName: payload.lastName,
              isManagement: payload.isManagement,
              email: payload.email,
            });
          } else throw new createError.Unauthorized('Invalid token');
        });
      } else throw new createError.Unauthorized();
    });
  },

  verifyAccessToken: (req: any, res: any, next: any) => {
    if (!req.headers['authorization'])
      return next(new createError.Unauthorized());

    const authHeader = req.headers['authorization'];
    const bearerToken = authHeader.split(' ');
    const token: string = bearerToken[1];
    const secret = process.env.ACCESS_TOKEN_SECRET;

    if (secret) {
      JWT.verify(token, secret, (err, payload) => {
        if (err) {
          const message =
            err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message;
          return next(new createError.Unauthorized(message));
        }
        req.payload = payload;
        next();
      });
    }
  },
  isValidPassword: async (password: string, userPassword: string) => {
    try {
      return await compare(password, userPassword);
    } catch (error) {
      throw error;
    }
  },
};
