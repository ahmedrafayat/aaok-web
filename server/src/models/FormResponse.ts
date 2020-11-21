import { DataTypes, Model, Optional } from 'sequelize';

const sequelize = require('../config/db');

interface FormResponseAttributes {
  responseId: number;
  userId: number;
  formId: number;
  createdAt: string;
  updatedAt: string;
}

type FormResponseCreationAttributes = Optional<
  FormResponseAttributes,
  'responseId' | 'userId' | 'createdAt' | 'updatedAt'
>;

export class FormResponse
  extends Model<FormResponseAttributes, FormResponseCreationAttributes>
  implements FormResponseAttributes {
  public responseId!: number;
  public userId!: number;
  public formId!: number;
  public createdAt!: string;
  public updatedAt!: string;
}

FormResponse.init(
  {
    responseId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: 'response_id',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'user_id',
    },
    formId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'form_id',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'updated_at',
    },
  },
  { tableName: 'responses', freezeTableName: true, timestamps: true, sequelize }
);
