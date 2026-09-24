import { Router, type Request } from 'express';
import { getUserHistory, type HistoryRepository } from '../../application/history/get-user-history.js';
import { createSequelizeHistoryRepository, type HistoryDatabase } from '../../infrastructure/history/sequelize-history-repository.js';
import { authenticatedUser } from './auth.js';

export type { HistoryDatabase } from '../../infrastructure/history/sequelize-history-repository.js';

export interface HistoryRouteOptions {
  /** Ancienne interface d'injection conservée pour les clients et tests existants. */
  database?: HistoryDatabase;
  repository?: HistoryRepository;
  authenticatedUser?: (request: Request) => Promise<{ id: string } | null>;
}

export function createHistoryRouter(options: HistoryRouteOptions = {}): Router {
  const repository = options.repository ?? createSequelizeHistoryRepository(options.database);
  const router: Router = Router();
  const authenticatedUserLookup = options.authenticatedUser ?? authenticatedUser;

  router.get('/', async (req, res) => {
    const user = await authenticatedUserLookup(req);

    if (!user) return res.status(401).json({ error: 'unauthenticated' });

    return res.json(await getUserHistory(repository, user.id));
  });

  return router;
}

export const historyRouter = createHistoryRouter();
