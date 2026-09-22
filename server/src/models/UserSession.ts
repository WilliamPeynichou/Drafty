import {
  DataTypes,
  Model,
  type CreationOptional,
  type ForeignKey,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../db/sequelize.js';
import { User } from './User.js';

/** Jeton de session persisté sous forme de hash, révocable à la déconnexion. */
export class UserSession extends Model<
  InferAttributes<UserSession>,
  InferCreationAttributes<UserSession>
> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<User['id']>;
  declare tokenHash: string;
  declare expiresAt: Date;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

UserSession.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    tokenHash: { type: DataTypes.CHAR(64), allowNull: false, unique: true },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: 'user_sessions', indexes: [{ fields: ['user_id'] }, { fields: ['expires_at'] }] },
);

User.hasMany(UserSession, { foreignKey: 'userId', as: 'sessions', onDelete: 'CASCADE' });
UserSession.belongsTo(User, { foreignKey: 'userId', as: 'user' });
