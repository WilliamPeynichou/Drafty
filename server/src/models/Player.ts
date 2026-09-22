import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';
import type { Position, Sport } from '@draft/shared';
import { sequelize } from '../db/sequelize.js';

/**
 * Joueur réel du catalogue.
 * Ces données ne quittent jamais le serveur avant la phase de révélation.
 */
export class Player extends Model<
  InferAttributes<Player>,
  InferCreationAttributes<Player>
> {
  declare id: CreationOptional<number>;
  declare sport: Sport;
  declare name: string;
  declare position: Position;
  declare club: string;
  declare country: string;
  /** Note de type jeu vidéo, de 0 à 99. */
  declare rating: number;
  /** Évaluation locale au meilleur niveau, présente pour les entrées football F2. */
  declare primeRating: number | null;
  /** Palier de valeur servant à équilibrer le tirage des lots. */
  declare tier: 1 | 2 | 3;
  declare active: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Player.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    sport: { type: DataTypes.ENUM('football', 'basketball'), allowNull: false },
    name: { type: DataTypes.STRING(120), allowNull: false },
    position: { type: DataTypes.STRING(4), allowNull: false },
    club: { type: DataTypes.STRING(120), allowNull: false },
    country: { type: DataTypes.STRING(60), allowNull: false },
    rating: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      validate: { min: 1, max: 99, isInt: true },
    },
    primeRating: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
      validate: { min: 1, max: 99, isInt: true },
    },
    tier: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      validate: { min: 1, max: 3, isInt: true },
    },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'players',
    indexes: [
      { fields: ['sport', 'tier'] },
      { fields: ['sport', 'position'] },
      { unique: true, fields: ['sport', 'name'] },
    ],
  },
);
