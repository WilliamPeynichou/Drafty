import { QueryTypes } from 'sequelize';
import type { Sport } from '@draft/shared';
import type { CatalogStatsRepository } from '../../application/catalog/get-catalog-stats.js';
import { sequelize } from '../../db/sequelize.js';

interface StatRow {
  sport: Sport;
  tier: number;
  total: number;
}

export const sequelizeCatalogStatsRepository: CatalogStatsRepository = {
  async findActiveCounts() {
    return sequelize.query<StatRow>(
      'SELECT sport, tier, COUNT(*) AS total FROM players WHERE active = true GROUP BY sport, tier ORDER BY sport, tier',
      { type: QueryTypes.SELECT },
    );
  },
};
