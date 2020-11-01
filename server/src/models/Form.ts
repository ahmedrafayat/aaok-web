import { Question } from './Question';
import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

const sequelize: Sequelize = require('../config/db');

export interface FormAttributes {
  form_id: number;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

type FormCreationAttributes = Optional<FormAttributes, 'form_id'>;

export class Form
  extends Model<FormAttributes, FormCreationAttributes>
  implements FormAttributes {
  public form_id!: number;
  public title!: string;
  public description!: string;

  public readonly createdAt!: string;
  public readonly updatedAt!: string;
}

Form.init(
  {
    form_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
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
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  { tableName: 'forms', timestamps: true, sequelize }
);

Form.hasMany(Question, {
  foreignKey: 'question_id',
});
