import { describe, expect, it } from 'vitest';
import { countDrawablePlayersWithRepository, drawLotsWithRepository } from '../src/application/draft/draw-lots.js';
import type { DrawablePlayer, DrawablePlayerRepository } from '../src/application/draft/drawable-player-repository.js';
import { getRules } from '@draft/shared';

function player(id: number, tier: 1 | 2 | 3 = 3): DrawablePlayer {
  return {
    id, tier, sport: 'football', name: `Joueur ${id}`, position: 'MID',
    club: 'Club', country: 'France', rating: 70, primeRating: id === 1 ? 90 : null,
    hints: [{ id: id * 10, text: `Indice A ${id}` }, { id: id * 10 + 1, text: `Indice B ${id}` }],
  };
}

describe('tirage sans dépendance à Sequelize', () => {
  it('répartit les paliers, garde les identités privées et utilise la note de prime', async () => {
    const tiers = [1, 2, 3] as const;
    const players = Array.from({ length: 60 }, (_, index) => player(index + 1, tiers[index % tiers.length] ?? 3));

    const repository: DrawablePlayerRepository = {
      findActiveWithHints: async () => players,
      countActiveWithHints: async () => players.length,
    };

    const result = await drawLotsWithRepository('football', repository);
    expect(result.lots).toHaveLength(getRules('football').totalRounds);
    expect(new Set(result.lots.map((lot) => lot.lotId)).size).toBe(result.lots.length);
    expect(new Set([...result.identities.values()].map((identity) => identity.id)).size).toBe(result.lots.length);
    expect(result.lots.every((lot) => !JSON.stringify(lot).includes('Joueur'))).toBe(true);
    expect([...result.identities.values()].every((identity) => identity.rating === (identity.id === 1 ? 90 : 70))).toBe(true);
    expect(await countDrawablePlayersWithRepository('football', repository)).toBe(players.length);
  });

  it('ne répète pas un indice avant épuisement du sac pour un même joueur', async () => {
    const repository: DrawablePlayerRepository = {
      findActiveWithHints: async () => [player(999, 1)],
      countActiveWithHints: async () => 1,
    };

    const first = await drawLotsWithRepository('football', repository);
    const second = await drawLotsWithRepository('football', repository);
    expect(first.lots).toHaveLength(1);
    expect([...first.identities.values()][0]?.rating).toBe(70);
    expect(second.lots).toHaveLength(1);
    expect(first.lots[0]?.hint).not.toBe(second.lots[0]?.hint);
  });
});
