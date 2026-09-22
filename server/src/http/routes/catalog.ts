import { Router } from 'express';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../../db/sequelize.js';

export const catalogRouter: Router = Router();

interface StatRow {
  sport: string;
  tier: number;
  total: number;
}

/**
 * Statistiques du catalogue.
 * On n'expose délibérément aucune fiche joueur : la liste des identités
 * disponibles est une information de jeu, elle reste côté serveur.
 */
catalogRouter.get('/stats', async (_req, res) => {
  try {
    const rows = await sequelize.query<StatRow>(
      'SELECT sport, tier, COUNT(*) AS total FROM players WHERE active = true GROUP BY sport, tier ORDER BY sport, tier',
      { type: QueryTypes.SELECT },
    );

    res.json({ stats: rows });
  } catch {
    res.status(503).json({ error: 'database_unavailable' });
  }
});
