import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';
import type { CancelReason, MatchPhase, SeatId, Sport } from '@draft/shared';
import { sequelize } from '../db/sequelize.js';

/** Partie jouée : trace persistante, l'état vivant restant en mémoire. */
export class Match extends Model<
  InferAttributes<Match>,
  InferCreationAttributes<Match>
> {
  declare id: CreationOptional<string>;
  /** Code court à partager pour rejoindre un salon privé. */
  declare code: string;
  declare sport: Sport;
  declare phase: CreationOptional<MatchPhase>;
  declare seatAUserId: CreationOptional<string | null>;
  declare seatBUserId: CreationOptional<string | null>;
  declare seatBIsBot: CreationOptional<boolean>;
  declare winnerSeat: CreationOptional<SeatId | null>;
  declare scoreA: CreationOptional<number | null>;
  declare scoreB: CreationOptional<number | null>;
  declare cancelReason: CreationOptional<CancelReason | null>;
  declare finishedAt: CreationOptional<Date | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Match.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    code: { type: DataTypes.STRING(8), allowNull: false, unique: true },
    sport: { type: DataTypes.ENUM('football', 'basketball'), allowNull: false },
    phase: {
      type: DataTypes.ENUM('lobby', 'draft', 'reveal', 'results', 'cancelled'),
      allowNull: false,
      defaultValue: 'lobby',
    },
    seatAUserId: { type: DataTypes.UUID, allowNull: true },
    seatBUserId: { type: DataTypes.UUID, allowNull: true },
    seatBIsBot: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    winnerSeat: { type: DataTypes.ENUM('A', 'B'), allowNull: true },
    scoreA: { type: DataTypes.INTEGER, allowNull: true },
    scoreB: { type: DataTypes.INTEGER, allowNull: true },
    cancelReason: {
      type: DataTypes.ENUM('double_timeout', 'both_idle', 'opponent_left'),
      allowNull: true,
    },
    finishedAt: { type: DataTypes.DATE, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: 'matches' },
);
