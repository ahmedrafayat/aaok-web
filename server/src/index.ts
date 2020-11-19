import { ConnectionError } from 'sequelize';
import express from 'express';
import morgan from 'morgan';

require('dotenv').config();

const bodyParser = require('body-parser');
const app = express();
const createError = require('http-errors');

const AuthRoute = require('./routes/auth');

const port = process.env.PORT || 5000;

app.use(morgan('dev'));
const sequelize = require('./config/db');

sequelize
  .authenticate({ logging: console.log })
  .then(() => {
    console.log('Connection has been established successfully');
  })
  .catch((err: ConnectionError) => {
    console.log('Unable to connect to the database: ', err);
  });

app.use(bodyParser.urlencoded({ extended: false }));

app.use(`${process.env.API_BASE_URL}/auth`, AuthRoute);
app.use(`${process.env.API_BASE_URL}/forms`, require('./routes/forms'));
app.use(`${process.env.API_BASE_URL}/fields`, require('./routes/fields'));

app.use(async (req, res, next) => {
  next(createError.NotFound('Route Not Found'));
});

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
