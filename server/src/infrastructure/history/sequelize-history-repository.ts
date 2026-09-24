import { Op } from 'sequelize';
import type { HistoryRepository, HistoryRow } from '../../application/history/get-user-history.js';
import { Match } from '../../models/index.js';

/** Adaptateur de persistance : Sequelize ne traverse pas la frontière application. */
export interface HistoryDatabase {
  findAll: (options: Record<string | symbol, unknown>) => Promise<HistoryRow[]>;
}

export function createSequelizeHistoryRepository(database: HistoryDatabase = Match as unknown as HistoryDatabase): HistoryRepository {
  return {
    findFinishedForUser(userId, limit) {
      return database.findAll({
        where: { [Op.or]: [{ seatAUserId: userId }, { seatBUserId: userId }], phase: 'results' },
        order: [['finishedAt', 'DESC']],
        limit,
      });
    },
  };
}
