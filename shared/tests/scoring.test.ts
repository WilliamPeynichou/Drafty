import { describe, expect, it } from 'vitest';
import { computeResult, scoreSeat } from '../src/engine/scoring.js';
import type { RealPlayer, RosterSlot } from '../src/types/domain.js';

const player = (rating: number): RealPlayer => ({
  id: rating,
  sport: 'football',
  name: 'X',
  position: 'FWD',
  club: 'Y',
  country: 'FR',
  rating,
  tier: 1,
});

const slot = (rating: number | null): RosterSlot => ({
  lotId: 'l',
  round: 1,
  position: 'FWD',
  hint: '',
  pricePaid: 5,
  player: rating === null ? null : player(rating),
});

describe('score final', () => {
  it('additionne les notes et un point par euro restant', () => {
    expect(scoreSeat('A', [slot(88), slot(80)], 6)).toEqual({
      seat: 'A',
      ratingTotal: 168,
      budgetBonus: 6,
      total: 174,
    });
  });

  it('compte un emplacement vide pour zéro', () => {
    expect(scoreSeat('B', [slot(90), slot(null)], 0).total).toBe(90);
  });

  it('désigne le total le plus élevé', () => {
    const result = computeResult([
      { seat: 'A', roster: [slot(80)], budget: 2 },
      { seat: 'B', roster: [slot(85)], budget: 0 },
    ]);
    expect(result.winner).toBe('B');
  });

  it('ne désigne aucun vainqueur en cas d’égalité', () => {
    const result = computeResult([
      { seat: 'A', roster: [slot(80)], budget: 5 },
      { seat: 'B', roster: [slot(85)], budget: 0 },
    ]);
    expect(result.winner).toBeNull();
  });
});
