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
      console.log(userData);
      const payload = userData;
      const secret = process.env.ACCESS_TOKEN_SECRET;
      if (secret) {
        const options: SignOptions = {
          expiresIn: ms('1m'),
          issuer: 'AAOKay.com',
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
          return next(new createError.Unauthorized());
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
