import { Op } from 'sequelize';
import type { Sport } from '@draft/shared';
import type { DrawablePlayer, DrawablePlayerRepository } from '../../application/draft/drawable-player-repository.js';
import { Hint, Player } from '../../models/index.js';

interface PlayerWithHints extends Player {
  hints?: Hint[];
}

export const sequelizeDrawablePlayerRepository: DrawablePlayerRepository = {
  async findActiveWithHints(sport: Sport): Promise<DrawablePlayer[]> {
    // SAFETY: required association guarantees that each returned player has hints.
    const players = (await Player.findAll({
      where: { sport, active: true },
      include: [{ model: Hint, as: 'hints', required: true }],
    })) as PlayerWithHints[];

    return players.map((player) => ({
      id: player.id,
      sport: player.sport,
      name: player.name,
      position: player.position,
      club: player.club,
      country: player.country,
      rating: player.rating,
      primeRating: player.primeRating,
      tier: player.tier,
      hints: (player.hints ?? []).map((hint) => ({ id: hint.id, text: hint.text })),
    }));
  },

  countActiveWithHints(sport: Sport): Promise<number> {
    return Player.count({
      where: { sport, active: true, id: { [Op.gt]: 0 } },
      include: [{ model: Hint, as: 'hints', required: true }],
      distinct: true,
    });
  },
};
