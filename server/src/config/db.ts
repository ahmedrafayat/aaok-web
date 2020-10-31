import { Sequelize } from 'sequelize';

const configurations = require('./config');

module.exports = new Sequelize(
  configurations.development.database,
  configurations.development.username,
  configurations.development.password,
  {
    host: configurations.development.host,
    dialect: configurations.development.dialect,
  }
);
