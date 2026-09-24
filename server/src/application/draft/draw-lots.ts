import { randomUUID } from 'node:crypto';
import type { Lot, RealPlayer, Sport } from '@draft/shared';
import { getRules } from '@draft/shared';
import type { DrawablePlayer, DrawablePlayerRepository } from './drawable-player-repository.js';

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

const hintBags = new Map<number, string[]>();

function nextHint(playerId: number, hints: DrawablePlayer['hints']): DrawablePlayer['hints'][number] | undefined {
  if (hints.length === 0) return undefined;
  let bag = hintBags.get(playerId);

  if (!bag || bag.length === 0) {
    bag = shuffle(hints.map((hint) => String(hint.id)));
    hintBags.set(playerId, bag);
  }

  const selectedId = bag.pop();

  return hints.find((hint) => String(hint.id) === selectedId) ?? hints[0];
}

/**
 * Compose les lots d'une partie : un joueur par tour, réparti par paliers,
 * chacun accompagné d'une anecdote. Pour chaque joueur, les indices sont
 * tirés en sac mélangé : aucun indice ne revient avant épuisement du sac.
 */
export async function drawLotsWithRepository(sport: Sport, repository: DrawablePlayerRepository): Promise<DrawnLots> {
  const rules = getRules(sport);
  const plan = tierPlan(rules.totalRounds);

  const candidates = await repository.findActiveWithHints(sport);

  const byTier = new Map<number, DrawablePlayer[]>();

  for (const player of candidates) {
    const bucket = byTier.get(player.tier) ?? [];
    bucket.push(player);
    byTier.set(player.tier, bucket);
  }

  for (const [tier, bucket] of byTier) byTier.set(tier, shuffle(bucket));

  const lots: Lot[] = [];
  const identities = new Map<string, RealPlayer>();
  const used = new Set<number>();

  const takeFromTier = (tier: number): DrawablePlayer | undefined => {
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

    const hints = player.hints;
    const hint = nextHint(player.id, hints);
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
export function countDrawablePlayersWithRepository(sport: Sport, repository: DrawablePlayerRepository): Promise<number> {
  return repository.countActiveWithHints(sport);
}
