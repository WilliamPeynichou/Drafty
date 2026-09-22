import { describe, expect, it } from 'vitest';
import {
  bothIdle,
  cancel,
  createMatch,
  markReady,
  pass,
  placeBid,
  reveal,
  seatPlayer,
  timeout,
  toView,
  type MatchState,
} from '../src/engine/match.js';
import type { Lot, RealPlayer } from '../src/types/domain.js';

const NOW = 1_000_000;

const lots = (count: number): Lot[] =>
  Array.from({ length: count }, (_, index) => ({
    lotId: `lot-${index + 1}`,
    round: index + 1,
    position: index === 0 ? 'GK' : 'FWD',
    hint: `Indice ${index + 1}`,
  }));

function started(rounds = 11): MatchState {
  const state = createMatch({
    matchId: 'm1',
    code: 'ABCD',
    sport: 'football',
    firstOpener: 'A',
    lots: lots(rounds),
  });
  seatPlayer(state, { userId: 'u1', displayName: 'Anna' });
  seatPlayer(state, { userId: 'u2', displayName: 'Bruno' });
  markReady(state, 'A', NOW);
  markReady(state, 'B', NOW);
  return state;
}

describe('cycle de partie', () => {
  it('démarre la draft quand les deux joueurs sont prêts', () => {
    const state = started();
    expect(state.phase).toBe('draft');
    expect(state.round).toBe(1);
    expect(state.auction?.turn).toBe('A');
    expect(state.auction?.deadline).toBe(NOW + 20_000);
  });

  it('refuse toute mise avant le démarrage', () => {
    const state = createMatch({
      matchId: 'm',
      code: 'C',
      sport: 'football',
      firstOpener: 'A',
      lots: lots(11),
    });
    seatPlayer(state, { userId: 'u1', displayName: 'Anna' });
    expect(placeBid(state, 'A', 3, NOW)).toEqual({
      ok: false,
      reason: 'match_not_running',
    });
  });

  it('attribue le lot au dernier enchérisseur et ne débite que lui', () => {
    const state = started();
    placeBid(state, 'A', 5, NOW);
    pass(state, 'B', NOW);

    expect(state.seats.A?.budget).toBe(39);
    expect(state.seats.B?.budget).toBe(44);
    expect(state.seats.A?.roster).toHaveLength(1);
    expect(state.seats.A?.roster[0]?.pricePaid).toBe(5);
    expect(state.round).toBe(2);
  });

  it('laisse le lot non attribué si les deux passent d’entrée', () => {
    const state = started();
    const first = pass(state, 'A', NOW);
    expect(first.ok).toBe(true);
    expect(state.seats.A?.roster).toHaveLength(0);
    expect(state.seats.B?.roster).toHaveLength(0);
    expect(state.round).toBe(2);
  });

  it('alterne l’ouverture à chaque tour', () => {
    const state = started();
    pass(state, 'A', NOW);
    expect(state.auction?.turn).toBe('B');
  });

  it('résout l’enchère quand l’adversaire ne peut plus suivre', () => {
    const state = started();
    if (state.seats.B) state.seats.B.budget = 4;
    const result = placeBid(state, 'A', 5, NOW);

    expect(result.ok).toBe(true);
    expect(state.seats.A?.roster).toHaveLength(1);
    expect(state.round).toBe(2);
  });
});

describe('temps et abandon', () => {
  it('compte un dépassement comme un passe', () => {
    const state = started();
    timeout(state, NOW);
    expect(state.seats.A?.timeouts).toBe(1);
    expect(state.round).toBe(2);
    expect(state.phase).toBe('draft');
  });

  it('annule la partie après deux dépassements du même joueur', () => {
    const state = started();
    timeout(state, NOW); // A
    // Tour 2 : B ouvre, A doit reprendre la main après un passe de B.
    pass(state, 'B', NOW);
    timeout(state, NOW); // A de nouveau

    expect(state.phase).toBe('cancelled');
    expect(state.cancelReason).toBe('double_timeout');
  });

  it('annule quand les deux joueurs sont inactifs', () => {
    const state = started();
    if (state.seats.A) state.seats.A.timeouts = 1;
    if (state.seats.B) state.seats.B.timeouts = 1;
    bothIdle(state);
    expect(state.cancelReason).toBe('both_idle');
  });

  it('refuse une mise après annulation', () => {
    const state = started();
    cancel(state, 'opponent_left');
    expect(placeBid(state, 'A', 2, NOW).ok).toBe(false);
  });
});

describe('étanchéité des identités', () => {
  it('ne transmet aucune identité pendant la draft', () => {
    const state = started();
    placeBid(state, 'A', 3, NOW);
    pass(state, 'B', NOW);

    const view = toView(state, 'B');
    const slots = view.players.flatMap((player) => player.roster);
    expect(slots).toHaveLength(1);
    expect(slots[0]?.player).toBeNull();
    // Le prix payé, lui, reste public.
    expect(slots[0]?.pricePaid).toBe(3);
    expect(JSON.stringify(view)).not.toContain('Zidane');
  });

  it('dévoile les identités et calcule le score à la révélation', () => {
    const state = started(2);
    placeBid(state, 'A', 4, NOW);
    pass(state, 'B', NOW);
    placeBid(state, 'B', 2, NOW);
    pass(state, 'A', NOW);

    expect(state.phase).toBe('reveal');

    const zidane: RealPlayer = {
      id: 1,
      sport: 'football',
      name: 'Zidane',
      position: 'MID',
      club: 'Real Madrid',
      country: 'France',
      rating: 94,
      tier: 1,
    };
    reveal(state, new Map([['lot-1', zidane]]));

    expect(state.phase).toBe('results');
    // A : 94 de note + 40 € restants.
    expect(state.result?.scores.find((s) => s.seat === 'A')?.total).toBe(134);
    expect(state.result?.winner).toBe('A');
    expect(toView(state, 'B').players[0]?.roster[0]?.player?.name).toBe('Zidane');
  });
});
