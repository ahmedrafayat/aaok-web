import { SignOptions } from 'jsonwebtoken';
import { compare } from 'bcrypt';
import createError from 'http-errors';
import JWT = require('jsonwebtoken');

import client = require('./initRedis');
import { NextFunction, Request, Response } from 'express';

const YEAR_IN_SECONDS = 365 * 24 * 60 * 60;
const ACCESS_TOKEN_EXPIRY = '30m';
const REFRESH_TOKEN_EXPIRY = '1y';

type UserData = {
  firstName: string;
  lastName: string;
  isManagement: number;
  id: number;
};

module.exports = {
  signAccessToken: async (userData: UserData) => {
    return new Promise((resolve, reject) => {
      const payload = userData;
      const secret = process.env.ACCESS_TOKEN_SECRET;
      if (secret) {
        const options: SignOptions = {
          expiresIn: ACCESS_TOKEN_EXPIRY,
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
  signRefreshToken: async (userData: UserData) => {
    return new Promise((resolve, reject) => {
      const payload = userData;
      const secret = process.env.REFRESH_TOKEN_SECRET;
      if (secret) {
        const options: SignOptions = {
          expiresIn: REFRESH_TOKEN_EXPIRY,
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
  verifyAccessToken: (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers['authorization'])
      return next(new createError.Unauthorized());

    const authHeader = req.headers['authorization'];
    const bearerToken = authHeader.split(' ');
    const token: string = bearerToken[1];
    const secret = process.env.ACCESS_TOKEN_SECRET;

    if (secret) {
      JWT.verify(token, secret, (err) => {
        if (err) {
          const message =
            err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message;
          return next(new createError.Unauthorized(message));
        }
        next();
      });
    }
  },
  verifyRefreshToken: (refreshToken: string): Promise<UserData> => {
    return new Promise((resolve, reject) => {
      const secret = process.env.REFRESH_TOKEN_SECRET;
      if (secret) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                  id: payload.id,
                });
              else reject(createError.Unauthorized);
            });
          } else
            throw new createError.Unauthorized(
              'Invalid token, please login again'
            );
        });
      } else {
        console.log('Refresh Token not found');
        throw new createError.InternalServerError();
      }
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
