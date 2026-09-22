import {
  DataTypes,
  Model,
  type CreationOptional,
  type ForeignKey,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';
import type { SeatId } from '@draft/shared';
import { sequelize } from '../db/sequelize.js';
import { Match } from './Match.js';
import { Player } from './Player.js';

/**
 * Journal des mises et des attributions, permettant d'auditer une partie contestée.
 */
export class MatchEvent extends Model<
  InferAttributes<MatchEvent>,
  InferCreationAttributes<MatchEvent>
> {
  declare id: CreationOptional<number>;
  declare matchId: ForeignKey<Match['id']>;
  declare round: number;
  declare kind: 'lot_opened' | 'bid' | 'pass' | 'timeout' | 'awarded' | 'unsold';
  declare seat: CreationOptional<SeatId | null>;
  declare amount: CreationOptional<number | null>;
  declare playerId: CreationOptional<ForeignKey<Player['id']> | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

MatchEvent.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    matchId: { type: DataTypes.UUID, allowNull: false },
    round: { type: DataTypes.TINYINT.UNSIGNED, allowNull: false },
    kind: {
      type: DataTypes.ENUM('lot_opened', 'bid', 'pass', 'timeout', 'awarded', 'unsold'),
      allowNull: false,
    },
    seat: { type: DataTypes.ENUM('A', 'B'), allowNull: true },
    amount: { type: DataTypes.SMALLINT, allowNull: true },
    playerId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: 'match_events', indexes: [{ fields: ['match_id', 'round'] }] },
);

Match.hasMany(MatchEvent, { foreignKey: 'matchId', as: 'events', onDelete: 'CASCADE' });

MatchEvent.belongsTo(Match, { foreignKey: 'matchId', as: 'match' });

MatchEvent.belongsTo(Player, { foreignKey: 'playerId', as: 'player' });
