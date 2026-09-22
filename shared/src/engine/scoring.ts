import type {
  MatchResult,
  PlayerScore,
  RosterSlot,
  SeatId,
} from '../types/domain.js';
import { BUDGET_POINTS_PER_EURO } from './rules.js';

/**
 * Score d'un effectif : somme des notes des joueurs révélés,
 * plus un point par euro non dépensé.
 * Un emplacement vide, ou non encore révélé, vaut zéro point.
 */
export function scoreSeat(
  seat: SeatId,
  roster: RosterSlot[],
  remainingBudget: number,
): PlayerScore {
  const ratingTotal = roster.reduce(
    (sum, slot) => sum + (slot.player?.rating ?? 0),
    0,
  );
  const budgetBonus = remainingBudget * BUDGET_POINTS_PER_EURO;

  return {
    seat,
    ratingTotal,
    budgetBonus,
    total: ratingTotal + budgetBonus,
  };
}

/** Résultat final : le total le plus élevé l'emporte, null en cas d'égalité. */
export function computeResult(
  seats: { seat: SeatId; roster: RosterSlot[]; budget: number }[],
): MatchResult {
  const scores = seats.map((s) => scoreSeat(s.seat, s.roster, s.budget));
  const best = Math.max(...scores.map((s) => s.total));
  const leaders = scores.filter((s) => s.total === best);

  return {
    scores,
    winner: leaders.length === 1 ? (leaders[0]?.seat ?? null) : null,
  };
}
