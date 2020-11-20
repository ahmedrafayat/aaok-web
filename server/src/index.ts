require('dotenv').config();

import { ConnectionError } from 'sequelize';
import express from 'express';
import morgan from 'morgan';
import createError = require('http-errors');

const port = process.env.PORT || 5000;
const apiBaseUrl = process.env.API_BASE_URL;
const app = express();
const AuthRoute = require('./routes/auth');
const sequelize = require('./config/db');
const jwtUtils = require('./utils/jwtUtils');

app.use(morgan('dev'));
app.use(express.urlencoded());
app.use(express.json());

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

app.use(async (req, res, next) => {
  next(new createError.NotFound('Route Not Found'));
});

// @ts-ignore
app.use((err, req, res, next) => {
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});

app.listen(port, () => {
  console.log(`Express server is running on localhost:${port}`);
});
