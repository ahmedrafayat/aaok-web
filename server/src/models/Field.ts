import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { FieldType } from '../enums/FieldType';

const sequelize = require('../config/db');

export interface FieldAttributes {
  fieldId: number;
  formId: number;
  fieldKey: string;
  label: string;
  fieldType: FieldType;
  jsonConfig: never;
  createdAt: string;
  updatedAt: string;
}

type FieldCreationAttributes = Optional<
  FieldAttributes,
  'fieldId' | 'createdAt' | 'updatedAt'
>;

export class Field
  extends Model<FieldAttributes, FieldCreationAttributes>
  implements FieldAttributes {
  public fieldId!: number;
  public formId!: number;
  public fieldKey!: string;
  public label!: string;
  public fieldType!: FieldType;
  public jsonConfig!: never;
  public createdAt!: string;
  public updatedAt!: string;
}

Field.init(
  {
    fieldId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      field: 'field_id',
    },
    formId: {
      type: DataTypes.INTEGER.UNSIGNED,
      field: 'form_id',
    },
    fieldKey: {
      type: DataTypes.STRING,
      field: 'field_key',
    },
    label: {
      type: DataTypes.STRING,
    },
    fieldType: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'field_type',
    },
    jsonConfig: {
      type: DataTypes.JSONB,
      field: 'json_config',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
      defaultValue: Sequelize.literal('NOW()'),
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
      defaultValue: Sequelize.literal('NOW()'),
    },
  },
  {
    tableName: 'fields',
    freezeTableName: true,
    timestamps: true,
    sequelize,
  }
);
