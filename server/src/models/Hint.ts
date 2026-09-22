import {
  DataTypes,
  Model,
  type CreationOptional,
  type ForeignKey,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../db/sequelize.js';
import { Player } from './Player.js';

/** Anecdote servant d'indice, rédigée manuellement, souvent liée au palmarès. */
export class Hint extends Model<
  InferAttributes<Hint>,
  InferCreationAttributes<Hint>
> {
  declare id: CreationOptional<number>;
  declare playerId: ForeignKey<Player['id']>;
  declare text: string;
  /** 1 = très vague, 5 = presque explicite. */
  declare difficulty: CreationOptional<number>;
  /** Origine éditoriale de l'indice; jamais résolue par un appel réseau. */
  declare provenance: CreationOptional<'hand-authored'>;
  /** Langue du texte de l'indice. */
  declare language: CreationOptional<'fr'>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Hint.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    playerId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    text: { type: DataTypes.STRING(400), allowNull: false },
    difficulty: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 3,
      validate: { min: 1, max: 5, isInt: true },
    },
    provenance: { type: DataTypes.ENUM('hand-authored'), allowNull: false, defaultValue: 'hand-authored' },
    language: { type: DataTypes.ENUM('fr'), allowNull: false, defaultValue: 'fr' },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: 'hints', indexes: [{ fields: ['player_id'] }] },
);

Player.hasMany(Hint, { foreignKey: 'playerId', as: 'hints', onDelete: 'CASCADE' });

Hint.belongsTo(Player, { foreignKey: 'playerId', as: 'player' });
