import { Model, Optional, DataTypes } from 'sequelize';

const sequelize = require('../config/db');

interface UserAttributes {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isEnabled: number;
  isRegistered: number;
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
>;

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes {
  public userId!: number;
  public firstName!: string;
  public lastName!: string;
  public email!: string;
  public password!: string;
  public isEnabled!: number;
  public isRegistered!: number;

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
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
      // defaultValue: Sequelize.literal('NOW()'),
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
      // defaultValue: Sequelize.literal('NOW()'),
    },
  },
  { tableName: 'users', freezeTableName: true, timestamps: true, sequelize }
);
