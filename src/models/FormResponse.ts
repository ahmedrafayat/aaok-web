import { DataTypes, Model, Optional } from 'sequelize';

import { sequelize } from '../config/sequelize';

interface FormResponseAttributes {
  responseId: number;
  userId: number;
  formId: number;
  assignedTo: number;
  status: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

type FormResponseCreationAttributes = Optional<
  FormResponseAttributes,
  'responseId' | 'userId' | 'assignedTo' | 'status' | 'notes' | 'createdAt' | 'updatedAt'
>;

export class FormResponse
  extends Model<FormResponseAttributes, FormResponseCreationAttributes>
  implements FormResponseAttributes {
  public responseId!: number;
  public userId!: number;
  public formId!: number;
  public assignedTo!: number;
  public status!: number;
  public notes!: string;
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
    assignedTo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'assigned_to',
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'status',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'notes',
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
