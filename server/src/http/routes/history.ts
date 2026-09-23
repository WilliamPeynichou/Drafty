import { Router, type Request } from 'express';
import { Op } from 'sequelize';
import { Match } from '../../models/index.js';
import { authenticatedUser } from './auth.js';

interface HistoryRow {
  id: string;
  code: string;
  sport: string;
  phase: string;
  winnerSeat: 'A' | 'B' | null;
  scoreA: number | null;
  scoreB: number | null;
  seatAUserId: string | null;
  seatBUserId: string | null;
  finishedAt: Date | null;
  createdAt: Date;
}

export interface HistoryDatabase {
  findAll: (options: Record<string | symbol, unknown>) => Promise<HistoryRow[]>;
}

export interface HistoryRouteOptions {
  database?: HistoryDatabase;
  authenticatedUser?: (request: Request) => Promise<{ id: string } | null>;
}

export function createHistoryRouter(options: HistoryRouteOptions = {}): Router {
  const model = options.database ?? Match as unknown as HistoryDatabase;
  const router: Router = Router();
  const authenticatedUserLookup = options.authenticatedUser ?? authenticatedUser;

  router.get('/', async (req, res) => {
    const user = await authenticatedUserLookup(req);
    if (!user) return res.status(401).json({ error: 'unauthenticated' });
    const matches = await model.findAll({
      where: { [Op.or]: [{ seatAUserId: user.id }, { seatBUserId: user.id }], phase: 'results' },
      order: [['finishedAt', 'DESC']],
      limit: 50,
    });
    return res.json({
      matches: matches.map((match) => {
        const userSeat = match.seatAUserId === user.id ? 'A' : 'B';
        return {
          id: match.id,
          code: match.code,
          sport: match.sport,
          phase: match.phase,
          winnerSeat: match.winnerSeat,
          scoreA: match.scoreA,
          scoreB: match.scoreB,
          userSeat,
          won: match.winnerSeat === null ? null : match.winnerSeat === userSeat,
          finishedAt: match.finishedAt,
          createdAt: match.createdAt,
        };
      }),
    });
  });

  return router;
}

export const historyRouter = createHistoryRouter();
