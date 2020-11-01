import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { User } from './User';
import { Question } from './Question';

const sequelize: Sequelize = require('../config/db');

interface FormAttributes {
  formId: number;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

type FormCreationAttributes = Optional<
  FormAttributes,
  'formId' | 'createdAt' | 'updatedAt'
>;

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
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        len: [1, 50],
      },
    },
    description: {
      type: DataTypes.STRING,
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  },
  { tableName: 'forms', timestamps: true, sequelize }
);

Form.hasMany(Question, {
  foreignKey: 'questionId',
});
