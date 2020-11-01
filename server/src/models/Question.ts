import { DataTypes, Model, Optional } from 'sequelize';
import { QuestionType } from '../enums/QuestionType';

const sequelize = require('../config/db');

export interface QuestionAttributes {
  questionId: number;
  formId: number;
  questionText: string;
  type: QuestionType;
  createdAt: string;
  updatedAt: string;
}

type QuestionCreationAttributes = Optional<QuestionAttributes, 'questionId'>;

export class Question
  extends Model<QuestionAttributes, QuestionCreationAttributes>
  implements QuestionAttributes {
  public questionId!: number;
  public formId!: number;
  public questionText!: string;
  public type!: QuestionType;
  public createdAt!: string;
  public updatedAt!: string;
}

Question.init(
  {
    questionId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      field: 'question_id',
    },
    formId: {
      type: DataTypes.INTEGER.UNSIGNED,
      field: 'form_id',
    },
    questionText: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'question_text',
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
    },
  },
  {
    tableName: 'questions',
    timestamps: true,
    sequelize,
  }
);

// Question.belongsTo(Form);
