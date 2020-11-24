import { HttpException } from './models/HttpException';

require('dotenv').config();

import { ConnectionError } from 'sequelize';
import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import compression from 'compression';
import createError = require('http-errors');
import AuthRoute = require('./routes/auth');

const port = process.env.PORT || 5000;
const apiBaseUrl = process.env.API_BASE_URL;
const app = express();
const sequelize = require('./config/db');
const jwtUtils = require('./utils/jwtUtils');

app.use(compression());
app.use(morgan('dev'));
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

app.use(`${apiBaseUrl}/auth`, AuthRoute);
app.use(
  `${apiBaseUrl}/forms`,
  jwtUtils.verifyAccessToken,
  require('./routes/forms')
);
app.use(
  `${apiBaseUrl}/fields`,
  jwtUtils.verifyAccessToken,
  require('./routes/fields')
);

app.use(
  `${apiBaseUrl}/response`,
  jwtUtils.verifyAccessToken,
  require('./routes/response')
);

app.use(
  `${apiBaseUrl}/upload`,
  jwtUtils.verifyAccessToken,
  require('./routes/upload')
);

app.use(async (req, res, next) => {
  next(new createError.NotFound('Route Not Found'));
});

app.use(
  //@ts-ignore
  (err: HttpException, req: Request, res: Response, _next: NextFunction) => {
    console.log('error occurred');
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
