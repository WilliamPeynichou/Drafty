import { Op } from 'sequelize';
import type { HistoryRepository, HistoryRow } from '../../application/history/get-user-history.js';
import { Match } from '../../models/index.js';

interface HistoryQuery {
  where: { [Op.or]: [{ seatAUserId: string }, { seatBUserId: string }]; phase: 'results' };
  order: [['finishedAt', 'DESC']];
  limit: number;
}

/** Adaptateur de persistance : Sequelize ne traverse pas la frontière application. */
export interface HistoryDatabase {
  findAll(options: HistoryQuery): Promise<HistoryRow[]>;
}

export function createSequelizeHistoryRepository(database?: HistoryDatabase): HistoryRepository {
  const findAll = database?.findAll.bind(database) ?? ((options: HistoryQuery) => Match.findAll(options));

  return {
    async findFinishedForUser(userId, limit) {
      const rows = await findAll({
        where: { [Op.or]: [{ seatAUserId: userId }, { seatBUserId: userId }], phase: 'results' },
        order: [['finishedAt', 'DESC']],
        limit,
      });

      return rows.map((row) => ({
        id: row.id,
        code: row.code,
        sport: row.sport,
        phase: row.phase,
        winnerSeat: row.winnerSeat,
        scoreA: row.scoreA,
        scoreB: row.scoreB,
        seatAUserId: row.seatAUserId,
        seatBUserId: row.seatBUserId,
        finishedAt: row.finishedAt,
        createdAt: row.createdAt,
      }));
    },
  };
}
