import { ConnectionError } from 'sequelize';
import express from 'express';

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;
const sequelize = require('./config/db');

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully');
  })
  .catch((err: ConnectionError) => {
    console.log('Unable to connect to the database: ', err);
  });

app.use(`${process.env.API_BASE_URL}/forms`, require('./routes/forms'));
app.use(`${process.env.API_BASE_URL}/questions`, require('./routes/questions'));

app.listen(port, () => {
  console.log(`Express server is running on localhost:${port}`);
});
