import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

const sequelize: Sequelize = require('../config/db');

export interface FormAttributes {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

type FormCreationAttributes = Optional<FormAttributes, 'id'>;

class FormModel
  extends Model<FormAttributes, FormCreationAttributes>
  implements FormAttributes {
  public id!: number;
  public title!: string;

  public readonly createdAt!: string;
  public readonly updatedAt!: string;
}

FormModel.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(50),
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  { tableName: 'forms', timestamps: true, sequelize }
);

export const Form = FormModel;
