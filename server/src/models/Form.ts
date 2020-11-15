import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { Field } from './Field';

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
      type: DataTypes.INTEGER,
      primaryKey: true,
      field: 'form_id',
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
      defaultValue: Sequelize.literal('NOW()'),
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
      defaultValue: Sequelize.literal('NOW()'),
    },
  },
  {
    tableName: 'forms',
    freezeTableName: true,
    timestamps: true,
    sequelize,
  }
);

Form.hasMany(Field, {
  foreignKey: 'fieldId',
});
