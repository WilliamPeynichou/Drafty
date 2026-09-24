import type { Sport } from '@draft/shared';

/** Contract implemented by infrastructure; application logic does not depend on SQL. */
export interface CatalogStatsRepository {
  findActiveCounts(): Promise<readonly { sport: Sport; tier: number; total: number }[]>;
}

export async function getCatalogStats(repository: CatalogStatsRepository) {
  return { stats: await repository.findActiveCounts() };
}
