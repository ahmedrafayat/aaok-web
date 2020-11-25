import { NextFunction, Request, Response } from 'express';
import { QueryTypes } from 'sequelize';

const sequelize = require('../config/db');

const userListQuery = `
SELECT
   u.first_name || ' ' || u.last_name AS "name",
   (
   SELECT
       count(*)
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
`;

export = {
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
};
