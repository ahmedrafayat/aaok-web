import { Form } from './Form';
import { DataTypes, Model, Optional } from 'sequelize';
import { QuestionType } from '../enums/QuestionType';

const sequelize = require('../config/db');

export interface QuestionAttributes {
  question_id: number;
  form_id: number;
  questionText: string;
  type: QuestionType;
  createdAt: string;
  updatedAt: string;
}

type QuestionCreationAttributes = Optional<QuestionAttributes, 'question_id'>;

export class Question
  extends Model<QuestionAttributes, QuestionCreationAttributes>
  implements QuestionAttributes {
  public question_id!: number;
  public form_id!: number;
  public questionText!: string;
  public type!: QuestionType;
  public createdAt!: string;
  public updatedAt!: string;
}

Question.init(
  {
    question_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
    },
    form_id: {
      type: DataTypes.INTEGER.UNSIGNED,
    },
    questionText: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: 'questions',
    timestamps: true,
    sequelize,
  }
);

// Question.belongsTo(Form);
