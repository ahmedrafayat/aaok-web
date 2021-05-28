import JWT, { SignOptions } from 'jsonwebtoken';
import { compare } from 'bcrypt';
import createError from 'http-errors';
import { NextFunction, Request, Response } from 'express';

import { redisClient } from './initRedis';

const YEAR_IN_SECONDS = 365 * 24 * 60 * 60;
const ACCESS_TOKEN_EXPIRY = '30m';
const REFRESH_TOKEN_EXPIRY = '1y';

const access_token_secret =
  process.env.NODE_ENV === 'production'
    ? process.env.PROD_ACCESS_TOKEN_SECRET
    : process.env.DEV_ACCESS_TOKEN_SECRET;

const refresh_token_secret =
  process.env.NODE_ENV === 'production'
    ? process.env.PROD_REFRESH_TOKEN_SECRET
    : process.env.DEV_REFRESH_TOKEN_SECRET;

const reset_pass_token_secret =
  process.env.NODE_ENV === 'production'
    ? process.env.PROD_PASS_RESET_SECRET
    : process.env.DEV_PASS_RESET_SECRET;

export type UserData = {
  firstName: string;
  lastName: string;
  isManagement: number;
  id: number;
};

export const JwtUtils = {
  signAccessToken: async (userData: UserData) => {
    return new Promise((resolve, reject) => {
      const payload = userData;
      if (access_token_secret) {
        const options: SignOptions = {
          expiresIn: ACCESS_TOKEN_EXPIRY,
          issuer: process.env.HOST_URL || 'AAOKay',
        };
        JWT.sign(payload, access_token_secret, options, (err, token) => {
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
      if (refresh_token_secret) {
        const options: SignOptions = {
          expiresIn: REFRESH_TOKEN_EXPIRY,
          issuer: process.env.HOST_URL || 'AAOKay',
        };
        JWT.sign(payload, refresh_token_secret, options, (err, token) => {
          if (err) {
            console.log(err.message);
            reject(new createError.InternalServerError());
            return;
          } else {
            if (token)
              redisClient.SET(String(userData.id), token, 'EX', YEAR_IN_SECONDS, (err) => {
                if (err) {
                  console.log(err.message);
                  reject(new createError.InternalServerError());
                  return;
                }
                return resolve(token);
              });
            else return;
          }
        });
      } else {
        resolve(null);
      }
    });
  },
  verifyAccessToken: (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers['authorization']) return next(new createError.Unauthorized());

    const authHeader = req.headers['authorization'];
    const bearerToken = authHeader.split(' ');
    const token: string = bearerToken[1];

    if (access_token_secret) {
      JWT.verify(token, access_token_secret, (err, payload) => {
        if (err) {
          const message = err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message;
          return next(new createError.Unauthorized(message));
        }
        // @ts-ignore
        req.payload = payload;
        next();
      });
    }
  },
  verifyRefreshToken: (refreshToken: string): Promise<UserData> => {
    return new Promise((resolve, reject) => {
      if (refresh_token_secret) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        JWT.verify(refreshToken, refresh_token_secret, (err, payload: any) => {
          if (err) return reject(new createError.Unauthorized());
          if (
            'firstName' in payload &&
            'lastName' in payload &&
            'isManagement' in payload &&
            'id' in payload
          ) {
            const userId = payload.id;
            redisClient.GET(userId, (err, result) => {
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
          } else throw new createError.Unauthorized('Invalid token, please login again');
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
  signPasswordResetToken: async (userId: number): Promise<string | undefined> => {
    return new Promise((resolve, reject) => {
      if (reset_pass_token_secret) {
        const options: SignOptions = {
          expiresIn: '20m',
          issuer: process.env.HOST_URL,
        };
        JWT.sign({ id: userId }, reset_pass_token_secret, options, (err, token) => {
          if (err) {
            reject(new createError.InternalServerError());
          }
          resolve(token);
        });
      } else {
        reject(new createError.InternalServerError());
      }
    });
  },
  verifyPasswordResetToken: async (token: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      if (reset_pass_token_secret) {
        JWT.verify(token, reset_pass_token_secret, (err, decodedToken) => {
          if (err) {
            const message = err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message;
            reject(err);
          } else if (decodedToken) {
            resolve(true);
          } else {
            reject('Failed to decode token');
          }
        });
      } else {
        reject(new createError.InternalServerError());
      }
    });
  },
};
