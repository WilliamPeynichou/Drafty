import type { Sport } from '@draft/shared';
import {
  countDrawablePlayersWithRepository,
  drawLotsWithRepository,
  type DrawnLots,
} from '../application/draft/draw-lots.js';
import { sequelizeDrawablePlayerRepository } from '../infrastructure/draft/sequelize-drawable-player-repository.js';

export type { DrawnLots } from '../application/draft/draw-lots.js';

/** Point de composition : conserve l'API utilisée par le moteur de partie. */
export function drawLots(sport: Sport): Promise<DrawnLots> {
  return drawLotsWithRepository(sport, sequelizeDrawablePlayerRepository);
}

export function countDrawablePlayers(sport: Sport): Promise<number> {
  return countDrawablePlayersWithRepository(sport, sequelizeDrawablePlayerRepository);
}
