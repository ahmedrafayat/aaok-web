require('dotenv').config();

import { HttpException } from './models/HttpException';
import { ConnectionError } from 'sequelize';
import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import compression from 'compression';
import createError from 'http-errors';
import cors from 'cors';

import { AuthRouter } from './routes/auth';
import { FormRouter } from './routes/forms';
import { FormResponseRouter } from './routes/response';
import { JwtUtils } from './utils/jwtUtils';
import { UserRouter } from './routes/users';
import { FieldRouter } from './routes/fields';
import { FileUploadRouter } from './routes/upload';
import { sequelize } from './config/sequelize';

const port = process.env.PORT || 5000;
const apiBaseUrl = process.env.API_BASE_URL;
const app = express();

app.use(compression());
app.use(morgan('dev'));
app.use(cors());
app.use(express.urlencoded());
app.use(express.json());
app.use(express.static('./public'));

sequelize
  .authenticate({ logging: console.log })
  .then(() => {
    console.log('Connection has been established successfully');
  })
  .catch((err: ConnectionError) => {
    console.log('Unable to connect to the database: ', err);
  });

/*
 * APP ROUTES
 */
app.use(`${apiBaseUrl}/auth`, AuthRouter);
app.use(`${apiBaseUrl}/forms`, JwtUtils.verifyAccessToken, FormRouter);
app.use(`${apiBaseUrl}/fields`, JwtUtils.verifyAccessToken, FieldRouter);
app.use(`${apiBaseUrl}/responses`, JwtUtils.verifyAccessToken, FormResponseRouter);
app.use(`${apiBaseUrl}/users`, JwtUtils.verifyAccessToken, UserRouter);
app.use(`${apiBaseUrl}/upload`, JwtUtils.verifyAccessToken, FileUploadRouter);

/*
 * NOT FOUND ROUTE
 */
app.use(async (req, res, next) => {
  next(new createError.NotFound('Route Not Found'));
});

/*
 * DEFAULT ERROR HANDLER
 */
app.use(
  // @ts-ignore
  (err: HttpException, req: Request, res: Response, _next: NextFunction) => {
    console.log('Unhandled Error occurred', err.status);
    if (err.status) {
      res.status(err.status);
    }
    res.send({
      error: {
        status: err.status || 500,
        message: err.message,
      },
    });
  }
);

app.listen(port, () => {
  console.log(`Express server is running on localhost:${port}`);
});
