import { NextFunction, Request, Response } from 'express';
import { QueryTypes } from 'sequelize';

const sequelize = require('../config/db');

const userListQuery = `
SELECT
   u.user_id "userId",
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

const userSearchQuery = `
SELECT 
    user_id "userId",
    first_name || ' ' || last_name "name",
    email
FROM 
    users u 
WHERE 
    u.first_name ILIKE :term
    OR u.last_name ILIKE :term
    OR u.email ILIKE :term
LIMIT 25
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
  getUserByNAme: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const term = req.query.name || '';

      const users = await sequelize.query(userSearchQuery, {
        type: QueryTypes.SELECT,
        replacements: { term: '%' + term + '%' },
      });

      res.send(users);
    } catch (error) {
      next(error);
    }
  },
};
