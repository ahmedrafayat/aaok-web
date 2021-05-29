import { genSalt, hash } from 'bcrypt';
import { DataTypes, Model, Optional } from 'sequelize';

import { sequelize } from '../config/sequelize';
import { NotificationToken } from './NotificationToken';
import { UserManagementTypes } from './enums/UserManagementTypes';

const SALT_ROUNDS = 10;

interface UserAttributes {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isEnabled: number;
  isRegistered: number;
  isManagement: UserManagementTypes;
  resetToken: string;
  createdAt: string;
  updatedAt: string;
}

type UserCreationAttributes = Optional<
  UserAttributes,
  | 'userId'
  | 'createdAt'
  | 'updatedAt'
  | 'firstName'
  | 'lastName'
  | 'password'
  | 'isEnabled'
  | 'isRegistered'
  | 'resetToken'
>;

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public userId!: number;
  public firstName!: string;
  public lastName!: string;
  public email!: string;
  public password!: string;
  public isEnabled!: number;
  public isRegistered!: number;
  public isManagement!: UserManagementTypes;
  public resetToken!: string;

  public readonly notificationTokens?: NotificationToken[];

  public createdAt!: string;
  public updatedAt!: string;
}

User.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      field: 'user_id',
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING,
      field: 'first_name',
      allowNull: true,
    },
    lastName: {
      type: DataTypes.STRING,
      field: 'last_name',
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        name: 'Unique email Violation',
        msg: 'This email is already is use',
      },
      validate: {
        isEmail: true,
        isLowercase: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isEnabled: {
      type: DataTypes.INTEGER,
      field: 'is_enabled',
      allowNull: true,
    },
    isRegistered: {
      type: DataTypes.INTEGER,
      field: 'is_registered',
      allowNull: true,
    },
    isManagement: {
      type: DataTypes.INTEGER,
      field: 'is_management',
      allowNull: false,
    },
    resetToken: {
      type: DataTypes.TEXT,
      field: 'reset_token',
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
  {
    hooks: {
      beforeCreate: async (user) => {
        const salt = await genSalt(SALT_ROUNDS);
        user.password = await hash(user.password, salt);
      },
      beforeUpdate: async (user) => {
        const salt = await genSalt(SALT_ROUNDS);
        user.password = await hash(user.password, salt);
      },
    },
    tableName: 'users',
    freezeTableName: true,
    timestamps: true,
    sequelize,
  }
);
