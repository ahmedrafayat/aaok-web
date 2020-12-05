import { Sequelize } from 'sequelize';
import { baseConfig } from './config';

console.log(
  baseConfig.development.database,
  baseConfig.development.username,
  baseConfig.development.password,
  {
    host: baseConfig.development.host,
    dialect: 'postgres',
  }
);

export const sequelize = new Sequelize(
  baseConfig.development.database,
  baseConfig.development.username,
  baseConfig.development.password,
  {
    host: baseConfig.development.host,
    dialect: 'postgres',
  }
);
