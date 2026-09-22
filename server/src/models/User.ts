import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../db/sequelize.js';

/** Compte utilisateur, invité ou créé avec une adresse e-mail. */
export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: CreationOptional<string>;
  declare displayName: string;
  declare provider: 'guest' | 'google' | 'local';
  declare googleId: CreationOptional<string | null>;
  declare email: CreationOptional<string | null>;
  /** Hash scrypt sérialisé ; jamais exposé par les routes HTTP. */
  declare passwordHash: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    displayName: { type: DataTypes.STRING(40), allowNull: false },
    provider: {
      type: DataTypes.ENUM('guest', 'google', 'local'),
      allowNull: false,
      defaultValue: 'guest',
    },
    googleId: { type: DataTypes.STRING(64), allowNull: true, unique: true },
    email: { type: DataTypes.STRING(190), allowNull: true, unique: true },
    passwordHash: { type: DataTypes.STRING(255), allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: 'users' },
);
