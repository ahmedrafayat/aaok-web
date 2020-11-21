import { SignOptions } from 'jsonwebtoken';
import { compare } from 'bcrypt';
import createError from 'http-errors';
import JWT = require('jsonwebtoken');
import ms = require('ms');

import client = require('./initRedis');

const YEAR_IN_SECONDS = 365 * 24 * 60 * 60;

type userData = {
  firstName: string;
  lastName: string;
  isManagement: number;
  // email: string;
  id: number;
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
            return;
          } else {
            if (token)
              client.SET(
                String(userData.id),
                token,
                'EX',
                YEAR_IN_SECONDS,
                (err) => {
                  if (err) {
                    console.log(err.message);
                    reject(new createError.InternalServerError());
                    return;
                  }
                  return resolve(token);
                }
              );
            else return;
          }
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
          const message =
            err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message;
          return next(new createError.Unauthorized(message));
        }
        req.payload = payload;
        next();
      });
    }
  },
  verifyRefreshToken: (refreshToken: string) => {
    return new Promise((resolve, reject) => {
      const secret = process.env.REFRESH_TOKEN_SECRET;
      if (secret) {
        JWT.verify(refreshToken, secret, (err, payload: any) => {
          if (err) return reject(new createError.Unauthorized());
          if (
            'firstName' in payload &&
            'lastName' in payload &&
            'isManagement' in payload &&
            'id' in payload
          ) {
            const userId = payload.id;
            client.GET(userId, (err, result) => {
              if (err) {
                console.log(err.message);
                reject(new createError.InternalServerError());
                return;
              }

              if (refreshToken === result)
                return resolve({
                  firstName: payload.firstName,
                  lastName: payload.lastName,
                  isManagement: payload.isManagement,
                  // email: payload.email,
                  id: payload.id,
                });
              else reject(createError.Unauthorized);
            });
          } else throw new createError.Unauthorized('Invalid token');
        });
      } else throw new createError.Unauthorized();
    });
  },
  isValidPassword: async (password: string, userPassword: string) => {
    try {
      return await compare(password, userPassword);
    } catch (error) {
      throw error;
    }
  },
};
