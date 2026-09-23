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

/** Session persistée : seul le hash du jeton HTTP est stocké. */
export class Session extends Model<InferAttributes<Session>, InferCreationAttributes<Session>> {
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<User['id']>;
  declare tokenHash: string;
  declare expiresAt: Date;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare user?: User;
}

Session.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    tokenHash: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: 'sessions', indexes: [{ fields: ['user_id', 'expires_at'] }] },
);

User.hasMany(Session, { foreignKey: 'userId', as: 'sessions', onDelete: 'CASCADE' });
Session.belongsTo(User, { foreignKey: 'userId', as: 'user' });
