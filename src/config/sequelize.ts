import { Sequelize } from 'sequelize';
import { baseConfig } from './config';

const config =
  process.env.NODE_ENV === 'production' ? baseConfig.production : baseConfig.development;

export const sequelize = new Sequelize(config.database, config.username, config.password, {
  logging: false,
  host: config.host,
  dialect: 'postgres',
});
