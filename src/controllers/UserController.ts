import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { col, fn, Op, QueryTypes } from 'sequelize';

import { User } from '../models/User';
import { sequelize } from '../config/sequelize';
import { sendEnabledEmail } from '../config/nodemailer';

const disabledUsersAfterLastEnabledCountQuery = `
SELECT 
	CASE EXISTS(SELECT U.CREATED_AT FROM USERS U WHERE IS_ENABLED = 1)
		WHEN TRUE THEN (SELECT COUNT (*) FROM USERS U2 WHERE U2.CREATED_AT > (SELECT U3.CREATED_AT FROM USERS U3 WHERE U3.IS_ENABLED = 1 ORDER BY U3.CREATED_AT DESC LIMIT 1))
		ELSE (SELECT COUNT(*) FROM USERS U4)
	END
`;

const userListQuery = `
SELECT
   u.user_id "userId",
   u.first_name || ' ' || u.last_name AS "name",
   (
   SELECT
       count(*)::INTEGER
   FROM
       responses r
   WHERE
       r.user_id = u.user_id ) "submissions",
   u.email,
   u.is_enabled "isEnabled",
   u.is_registered "isRegistered",
   u.created_at "createdAt",
   u.updated_at "updatedAt"
FROM
   public.users u
WHERE
   u.is_management <> 1
ORDER BY
    u.created_at DESC, 
    u.user_id ASC
`;

export const UserController = {
  getUsers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await sequelize.query(userListQuery, {
        type: QueryTypes.SELECT,
      });

      res.send(users);
    } catch (error) {
      next(error);
    }
  },
  getUserByName: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const term = req.query.name || '';
      const admin = req.query.admin === 'true' || false;
      let adminCond = admin
        ? [
            {
              isManagement: 1,
            },
          ]
        : [];

      const users = await User.findAll({
        limit: 25,
        attributes: [
          ['user_id', 'userId'],
          [fn('CONCAT', col('first_name'), ' ', col('last_name')), 'name'],
          'email',
        ],
        where: {
          [Op.or]: [
            {
              lastName: {
                [Op.iLike]: `%${term}%`,
              },
            },
            {
              firstName: {
                [Op.iLike]: `%${term}%`,
              },
            },
            {
              email: {
                [Op.iLike]: `%${term}%`,
              },
            },
          ],
          [Op.and]: adminCond,
        },
      });

      res.send(users);
    } catch (error) {
      next(error);
    }
  },
  changeStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.userId;
      const newStatus = req.body.status;

      let user = await User.findByPk(Number(userId));

      if (newStatus === undefined) {
        throw new createHttpError.BadRequest();
      }

      let emailSent = false;

      if (user) {
        const updateUsers = await User.update(
          { isEnabled: Number(newStatus) },
          { where: { userId: userId } }
        );
        if (updateUsers.length > 0) {
          user.isEnabled = Number(newStatus);
        }
        if (Number(newStatus) === 1) {
          sendEnabledEmail({
            name: user.firstName + ' ' + user.lastName,
            toEmail: user.email,
          });
        }
      } else {
        throw new createHttpError.BadRequest('User does not exist');
      }

      res.send({ isEnabled: user.isEnabled });
    } catch (error) {
      next(error);
    }
  },
  getDisabledUsersAfterLastEnabled: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const disabledCount = await sequelize.query(disabledUsersAfterLastEnabledCountQuery, {
        type: QueryTypes.SELECT,
      });

      res.send(disabledCount);
    } catch (error) {
      next(error);
    }
  },
};
