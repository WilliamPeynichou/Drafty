import { describe, expect, it } from 'vitest';
import {
  applyBid,
  canStillBid,
  checkBid,
  minimumAcceptableBid,
  openerForRound,
  otherSeat,
  resolveOnPass,
  startAuction,
} from '../src/engine/auction.js';
import { FOOTBALL_RULES, TURN_DURATION_MS } from '../src/engine/rules.js';
import type { RosterSlot } from '../src/types/domain.js';

const NOW = 1_000_000;

const auction = () =>
  startAuction({
    lotId: 'lot-1',
    round: 1,
    opener: 'A',
    now: NOW,
    turnDurationMs: TURN_DURATION_MS,
  });

const slot = (position: RosterSlot['position']): RosterSlot => ({
  lotId: 'x',
  round: 1,
  position,
  hint: '',
  pricePaid: 1,
  player: null,
});

describe('alternance et ouverture', () => {
  it('alterne le siège adverse', () => {
    expect(otherSeat('A')).toBe('B');
    expect(otherSeat('B')).toBe('A');
  });

  it("alterne l'ouverture à chaque tour", () => {
    expect(openerForRound('A', 1)).toBe('A');
    expect(openerForRound('A', 2)).toBe('B');
    expect(openerForRound('A', 3)).toBe('A');
  });
});

describe('validation des mises', () => {
  it("exige une mise d'ouverture d'au moins 1", () => {
    expect(minimumAcceptableBid(auction())).toBe(1);
  });

  it('refuse une mise hors tour', () => {
    const check = checkBid({
      auction: auction(),
      seat: 'B',
      amount: 5,
      budget: 44,
      roster: [],
      position: 'FWD',
      rules: FOOTBALL_RULES,
    });
    expect(check).toEqual({ ok: false, reason: 'not_your_turn' });
  });

  it("refuse une mise inférieure ou égale à l'offre courante", () => {
    const state = applyBid(auction(), 'A', 5, NOW, TURN_DURATION_MS);
    expect(minimumAcceptableBid(state)).toBe(6);
    const check = checkBid({
      auction: state,
      seat: 'B',
      amount: 5,
      budget: 44,
      roster: [],
      position: 'FWD',
      rules: FOOTBALL_RULES,
    });
    expect(check).toEqual({ ok: false, reason: 'below_minimum' });
  });

  it('refuse une mise supérieure au budget restant', () => {
    const check = checkBid({
      auction: auction(),
      seat: 'A',
      amount: 12,
      budget: 10,
      roster: [],
      position: 'FWD',
      rules: FOOTBALL_RULES,
    });
    expect(check).toEqual({ ok: false, reason: 'not_enough_budget' });
  });

  it('refuse une mise sur un troisième gardien en football', () => {
    const check = checkBid({
      auction: auction(),
      seat: 'A',
      amount: 2,
      budget: 44,
      roster: [slot('GK'), slot('GK')],
      position: 'GK',
      rules: FOOTBALL_RULES,
    });
    expect(check).toEqual({ ok: false, reason: 'position_limit_reached' });
  });

  it('accepte une mise valide et rend la main à l’adversaire', () => {
    const state = applyBid(auction(), 'A', 3, NOW, TURN_DURATION_MS);
    expect(state.currentBid).toBe(3);
    expect(state.highBidder).toBe('A');
    expect(state.turn).toBe('B');
    expect(state.deadline).toBe(NOW + TURN_DURATION_MS);
    expect(state.history).toHaveLength(1);
  });
});

describe('blocage par budget', () => {
  it('bloque le siège qui ne peut plus surenchérir', () => {
    const state = applyBid(auction(), 'A', 10, NOW, TURN_DURATION_MS);
    expect(
      canStillBid({
        auction: state,
        budget: 10,
        roster: [],
        position: 'FWD',
        rules: FOOTBALL_RULES,
      }),
    ).toBe(false);
  });
});

describe('résolution', () => {
  it('attribue le lot au dernier enchérisseur', () => {
    const state = applyBid(auction(), 'A', 7, NOW, TURN_DURATION_MS);
    expect(resolveOnPass(state)).toEqual({ winner: 'A', pricePaid: 7 });
  });

  it("n'attribue rien si les deux joueurs passent d'entrée", () => {
    expect(resolveOnPass(auction())).toEqual({ winner: null, pricePaid: 0 });
  });
});
