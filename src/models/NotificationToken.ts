import { DataTypes, Model, Op, Optional } from 'sequelize';
import { sequelize } from '../config/sequelize';
import { User } from './User';

interface NotificationTokenAttributes {
  tokenId: number;
  tokenValue: string;
  userId: number;
}

type NotificationTokenCreationAttributes = Optional<NotificationTokenAttributes, 'tokenId'>;

export class NotificationToken
  extends Model<NotificationTokenAttributes, NotificationTokenCreationAttributes>
  implements NotificationTokenAttributes {
  public tokenId!: number;
  public tokenValue!: string;
  public userId!: number;

  static async findTokenByValue(tokenValue: string) {
    return await NotificationToken.findOne({
      where: {
        tokenValue: {
          [Op.eq]: tokenValue,
        },
      },
    });
  }

  static async getUserTokens(userId: number) {
    return await NotificationToken.findAll({
      where: {
        userId: {
          [Op.eq]: userId,
        },
      },
    });
  }

  static async deleteTokenByValue(tokenValue: string) {
    const rowsDeleted = await NotificationToken.destroy({
      where: {
        tokenValue: {
          [Op.eq]: tokenValue,
        },
      },
    });

    return rowsDeleted > 0;
  }

  public readonly tokenUser?: User;
}

NotificationToken.init(
  {
    tokenId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      field: 'token_id',
    },
    tokenValue: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      field: 'token_value',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
    },
  },
  { sequelize, tableName: 'notification_tokens', freezeTableName: true, timestamps: false }
);

NotificationToken.belongsTo(User, {
  targetKey: 'userId',
  foreignKey: 'tokenId',
  as: 'tokenUser',
});

User.hasMany(NotificationToken, {
  as: 'notificationTokens',
  foreignKey: 'tokenId',
});
