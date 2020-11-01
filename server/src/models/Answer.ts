import { Form } from './Form';
import { Question } from './Question';
import { User } from './User';
import { Model, Optional, DataTypes } from 'sequelize';

const sequelize = require('../config/db');

interface AnswerAttributes {
  answerId: number;
  formId: number;
  questionId: number;
  userId: number;
  value: string;
  createdAt: string;
  updatedAt: string;
}

type AnswerCreationAttributes = Optional<AnswerAttributes, 'answerId'>;

export class Answer
  extends Model<AnswerAttributes, AnswerCreationAttributes>
  implements AnswerAttributes {
  public answerId!: number;
  public formId!: number;
  public questionId!: number;
  public userId!: number;
  public value!: string;
  public createdAt!: string;
  public updatedAt!: string;
}

Answer.init(
  {
    answerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      field: 'answer_id',
    },
    formId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    questionId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    value: {
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
  { tableName: 'answers', timestamps: true, sequelize }
);

Answer.belongsTo(User);
Answer.belongsTo(Question);
Answer.belongsTo(Form);
