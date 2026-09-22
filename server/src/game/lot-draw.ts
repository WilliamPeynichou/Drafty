import { randomUUID } from 'node:crypto';
import { Op } from 'sequelize';
import type { Lot, RealPlayer, Sport } from '@draft/shared';
import { getRules } from '@draft/shared';
import { Hint, Player } from '../models/index.js';

/**
 * Tirage d'un lot de draft.
 * La référence `lotId` est opaque et régénérée à chaque partie : elle ne
 * permet pas de remonter à l'identité du joueur réel.
 */
export interface DrawnLots {
  lots: Lot[];
  /** Table des identités, conservée exclusivement côté serveur. */
  identities: Map<string, RealPlayer>;
}

/** Répartition par paliers, pour éviter une partie déséquilibrée. */
function tierPlan(totalRounds: number): (1 | 2 | 3)[] {
  const plan: (1 | 2 | 3)[] = [];
  const topCount = Math.max(1, Math.round(totalRounds * 0.25));
  const midCount = Math.max(1, Math.round(totalRounds * 0.4));

  for (let i = 0; i < topCount; i += 1) plan.push(1);

  for (let i = 0; i < midCount; i += 1) plan.push(2);

  while (plan.length < totalRounds) plan.push(3);

  return plan.slice(0, totalRounds);
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = copy[i];
    const b = copy[j];

    if (a !== undefined && b !== undefined) {
      copy[i] = b;
      copy[j] = a;
    }
  }

  return copy;
}

interface PlayerWithHints extends Player {
  hints?: Hint[];
}

/**
 * Compose les lots d'une partie : un joueur par tour, réparti par paliers,
 * chacun accompagné d'une de ses anecdotes.
 */
export async function drawLots(sport: Sport): Promise<DrawnLots> {
  const rules = getRules(sport);
  const plan = tierPlan(rules.totalRounds);

  // SAFETY : l'inclusion `hints` est obligatoire ci-dessous, chaque instance
  // porte donc la collection d'indices déclarée par `PlayerWithHints`.
  const candidates = (await Player.findAll({
    where: { sport, active: true },
    include: [{ model: Hint, as: 'hints', required: true }],
  })) as PlayerWithHints[];

  const byTier = new Map<number, PlayerWithHints[]>();

  for (const player of candidates) {
    const bucket = byTier.get(player.tier) ?? [];
    bucket.push(player);
    byTier.set(player.tier, bucket);
  }

  for (const [tier, bucket] of byTier) byTier.set(tier, shuffle(bucket));

  const lots: Lot[] = [];
  const identities = new Map<string, RealPlayer>();
  const used = new Set<number>();

  const takeFromTier = (tier: number): PlayerWithHints | undefined => {
    const bucket = byTier.get(tier);

    while (bucket && bucket.length > 0) {
      const player = bucket.pop();

      if (player && !used.has(player.id)) return player;
    }

    // Palier épuisé : on retombe sur le palier le plus proche disponible.
    for (const fallback of [2, 3, 1]) {
      const other = byTier.get(fallback);

      while (other && other.length > 0) {
        const player = other.pop();

        if (player && !used.has(player.id)) return player;
      }
    }

    return undefined;
  };

  plan.forEach((tier, index) => {
    const player = takeFromTier(tier);

    if (player === undefined) return;
    used.add(player.id);

    const hints = player.hints ?? [];
    const hint = hints[Math.floor(Math.random() * hints.length)];
    const lotId = randomUUID();

    lots.push({
      lotId,
      round: index + 1,
      position: player.position,
      hint: hint?.text ?? 'Indice indisponible.',
    });
    identities.set(lotId, {
      id: player.id,
      sport: player.sport,
      name: player.name,
      position: player.position,
      club: player.club,
      country: player.country,
      // La note de prime sert de référence de score quand elle est renseignée.
      rating: player.primeRating ?? player.rating,
      tier: player.tier,
    });
  });

  return { lots, identities };
}

/** Le catalogue contient-il assez de joueurs jouables pour ce sport ? */
export async function countDrawablePlayers(sport: Sport): Promise<number> {
  return Player.count({
    where: { sport, active: true, id: { [Op.gt]: 0 } },
    include: [{ model: Hint, as: 'hints', required: true }],
    distinct: true,
  });
}
