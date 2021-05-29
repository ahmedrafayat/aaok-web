import { DataTypes, Model, Optional } from 'sequelize';

import { sequelize } from '../config/sequelize';
import { FormResponseStatus } from './enums/FormResponseStatus';
import { Form } from './Form';
import { User } from './User';

interface FormResponseAttributes {
  responseId: number;
  userId: number | null;
  formId: number;
  assignedTo: number | null;
  status: FormResponseStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

type FormResponseCreationAttributes = Optional<
  FormResponseAttributes,
  'responseId' | 'userId' | 'assignedTo' | 'status' | 'notes' | 'createdAt' | 'updatedAt'
>;

export class FormResponse
  extends Model<FormResponseAttributes, FormResponseCreationAttributes>
  implements FormResponseAttributes {
  public responseId!: number;
  public userId!: number | null;
  public formId!: number;
  public assignedTo!: number | null;
  public status!: FormResponseStatus;
  public notes!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;

  // This only exists with eager loading the model
  public form?: Form;

  public hasOwner() {
    return this.userId !== null;
  }

  public isUnassigned() {
    return this.assignedTo === null;
  }

  static getStatusText(status: FormResponseStatus) {
    switch (status) {
      case FormResponseStatus.PENDING:
        return 'Pending';
      case FormResponseStatus.IN_PROGRESS:
        return 'In Progress';
      case FormResponseStatus.RESOLVED:
        return 'Resolved';
    }
  }

  static getStatusNotificationBody(status: FormResponseStatus) {
    switch (status) {
      case FormResponseStatus.PENDING:
        return '';
      case FormResponseStatus.IN_PROGRESS:
        return 'An Admin is currently reviewing your submission';
      case FormResponseStatus.RESOLVED:
        return 'An Admin has completed reviewing your submission';
    }
  }
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
      defaultValue: null,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: FormResponseStatus.PENDING,
      field: 'status',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'notes',
      defaultValue: null,
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

FormResponse.belongsTo(Form, {
  foreignKey: 'formId',
  as: 'form',
});

Form.hasMany(FormResponse, {
  foreignKey: 'formId',
});

FormResponse.belongsTo(User, {
  foreignKey: 'userId',
  as: 'owner',
});

User.hasMany(FormResponse, {
  foreignKey: 'userId',
});
