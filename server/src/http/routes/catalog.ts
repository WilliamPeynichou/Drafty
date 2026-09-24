import { Router } from 'express';
import { getCatalogStats, type CatalogStatsRepository } from '../../application/catalog/get-catalog-stats.js';
import { sequelizeCatalogStatsRepository } from '../../infrastructure/catalog/sequelize-catalog-stats-repository.js';

/** Only aggregate data is exposed: player identities must remain server-side. */
export function createCatalogRouter(repository: CatalogStatsRepository = sequelizeCatalogStatsRepository): Router {
  const router: Router = Router();
  router.get('/stats', async (_req, res) => {
    try {
      res.json(await getCatalogStats(repository));
    } catch {
      res.status(503).json({ error: 'database_unavailable' });
    }
  });

  return router;
}

export const catalogRouter = createCatalogRouter();
