import { Sequelize } from 'sequelize';
import { baseConfig } from './config';

export const sequelize = new Sequelize(
  baseConfig.development.database,
  baseConfig.development.username,
  baseConfig.development.password,
  {
    host: baseConfig.development.host,
    dialect: 'postgres',
  }
);
