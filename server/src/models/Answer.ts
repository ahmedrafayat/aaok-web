import { DataTypes, Model, Optional } from 'sequelize';
import { FieldType } from '../enums/FieldType';

const sequelize = require('../config/db');

interface ValueType {
  type: FieldType;
}

export class LocationValue implements ValueType {
  constructor(
    public latitude: number,
    public longitude: number,
    public type: FieldType
  ) {}
}

export class GenericValue implements ValueType {
  constructor(public value: string, public type: FieldType) {}
}

export class CheckValue implements ValueType {
  constructor(public value: number[], public type: FieldType) {}
}

interface AnswerAttributes {
  answerId: number;
  responseId: number;
  fieldId: number;
  value: LocationValue | GenericValue | CheckValue;
  createdAt: string;
  updatedAt: string;
}

export type AnswerCreationAttributes = Optional<
  AnswerAttributes,
  'answerId' | 'createdAt' | 'updatedAt'
>;

export class Answer
  extends Model<AnswerAttributes, AnswerCreationAttributes>
  implements AnswerAttributes {
  public answerId!: number;
  public responseId!: number;
  public fieldId!: number;
  public value!: LocationValue | GenericValue | CheckValue;
  public createdAt!: string;
  public updatedAt!: string;
}

Answer.init(
  {
    answerId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      field: 'answer_id',
      autoIncrement: true,
    },
    responseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'response_id',
    },
    fieldId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'field_id',
    },
    value: {
      type: DataTypes.JSONB,
      allowNull: true,
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
  { tableName: 'answers', freezeTableName: true, timestamps: true, sequelize }
);
