import createHttpError from 'http-errors';
import isNil from 'lodash/isNil';
import { AppRequest } from '../models/types/AppRequest';
import { NextFunction, Response } from 'express';
import { NotificationToken } from '../models/NotificationToken';

export const TokenController = {
  createNewToken: async (req: AppRequest, res: Response, next: NextFunction) => {
    const newToken = (req.body.token || '').trim();
    if (req.payload && newToken) {
      const { id } = req.payload;
      if (id) {
        const existingToken = await NotificationToken.findTokenByValue(newToken);
        // token with save value exists and is for the same user
        if (!isNil(existingToken) && existingToken.userId === id) {
          console.log('token exists and is for the same user');
          res.sendStatus(200);
          return;
        }
        // token with save value exists and is for another user, then we must delete the existing token
        if (!isNil(existingToken) && existingToken.userId !== id) {
          console.log('token exists and is for another user, then we must delete the existing token');
          existingToken.set('userId', id);
          existingToken.save();
          res.sendStatus(200);
          return;
          // await NotificationToken.deleteTokenByValue(newToken);
        }
        // Then create this token for this user
        try {
          await NotificationToken.create({ tokenValue: newToken, userId: id });
        } catch (e) {
          console.error(e);
          next(new createHttpError.InternalServerError(e.message));
        }
        res.sendStatus(200);
      }
    } else {
      next(new createHttpError.BadRequest());
    }
  },
};
