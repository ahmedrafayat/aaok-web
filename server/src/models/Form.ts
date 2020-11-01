import { Question } from './Question';
import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

const sequelize: Sequelize = require('../config/db');

export interface FormAttributes {
  formId: number;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

type FormCreationAttributes = Optional<FormAttributes, 'formId'>;

export class Form
  extends Model<FormAttributes, FormCreationAttributes>
  implements FormAttributes {
  public formId!: number;
  public title!: string;
  public description!: string;

  public readonly createdAt!: string;
  public readonly updatedAt!: string;
}

Form.init(
  {
    formId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      field: 'form_id',
    },
    title: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
      field: 'updated_at',
    },
  },
  { tableName: 'forms', timestamps: true, sequelize }
);

Form.hasMany(Question, {
  foreignKey: 'question_id',
});
