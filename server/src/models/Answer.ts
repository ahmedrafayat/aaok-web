import { DataTypes, Model, Optional } from 'sequelize';

const sequelize = require('../config/db');

interface LocationValue {
  latitude: number;
  longitude: number;
}

interface GenericValue {
  value: string;
}

interface CheckValue {
  value: number[];
}

type ValueType = GenericValue | LocationValue | CheckValue;

interface AnswerAttributes {
  answerId: number;
  responseId: number;
  fieldId: number;
  value: ValueType;
  createdAt: string;
  updatedAt: string;
}

type AnswerCreationAttributes = Optional<
  AnswerAttributes,
  'answerId' | 'createdAt' | 'updatedAt'
>;

export class Answer
  extends Model<AnswerAttributes, AnswerCreationAttributes>
  implements AnswerAttributes {
  public answerId!: number;
  public responseId!: number;
  public fieldId!: number;
  public value!: ValueType;
  public createdAt!: string;
  public updatedAt!: string;
}

Answer.init(
  {
    answerId: {
      type: DataTypes.INTEGER,
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
