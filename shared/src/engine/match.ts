/**
 * Moteur de partie : une partie est un objet autonome, sans réseau ni base.
 * Le serveur est seul détenteur de la vérité. Les identités cachées ne sont
 * jamais stockées ici : le moteur ne manipule que des lots opaques.
 */

import type {
  AuctionState,
  CancelReason,
  Lot,
  MatchPhase,
  MatchResult,
  MatchView,
  PlayerPublicState,
  RealPlayer,
  RosterSlot,
  SeatId,
  Sport,
} from '../types/domain.js';
import {
  applyBid,
  canStillBid,
  checkBid,
  openerForRound,
  otherSeat,
  resolveOnPass,
  startAuction,
  type BidRejection,
} from './auction.js';
import { computeResult } from './scoring.js';
import {
  MAX_TIMEOUTS_PER_PLAYER,
  TURN_DURATION_MS,
  getRules,
  type SportRules,
} from './rules.js';

/** État interne d'un siège. */
export interface SeatState {
  seat: SeatId;
  userId: string;
  displayName: string;
  isBot: boolean;
  connected: boolean;
  ready: boolean;
  budget: number;
  timeouts: number;
  roster: RosterSlot[];
}

/** État complet d'une partie, détenu par le serveur uniquement. */
export interface MatchState {
  matchId: string;
  code: string;
  sport: Sport;
  rules: SportRules;
  phase: MatchPhase;
  round: number;
  /** Lots du tirage, dans l'ordre des tours. Identités non incluses. */
  lots: Lot[];
  firstOpener: SeatId;
  seats: Record<SeatId, SeatState | null>;
  auction: AuctionState | null;
  result: MatchResult | null;
  cancelReason: CancelReason | null;
}

/** Évènements produits par le moteur, à diffuser par la couche temps réel. */
export type MatchEngineEvent =
  | { type: 'lot_opened'; round: number; lot: Lot; opener: SeatId; deadline: number }
  | { type: 'bid'; seat: SeatId; amount: number; deadline: number }
  | { type: 'pass'; seat: SeatId }
  | { type: 'timeout'; seat: SeatId }
  | { type: 'awarded'; lotId: string; round: number; winner: SeatId; pricePaid: number }
  | { type: 'unsold'; lotId: string; round: number }
  | { type: 'phase'; phase: MatchPhase }
  | { type: 'cancelled'; reason: CancelReason };

export type ActionRejection =
  | BidRejection
  | 'match_not_running'
  | 'unknown_seat'
  | 'no_auction';

export type MatchOutcome =
  | { ok: true; events: MatchEngineEvent[] }
  | { ok: false; reason: ActionRejection };

export function createMatch(params: {
  matchId: string;
  code: string;
  sport: Sport;
  firstOpener: SeatId;
  lots: Lot[];
}): MatchState {
  const rules = getRules(params.sport);

  return {
    matchId: params.matchId,
    code: params.code,
    sport: params.sport,
    rules,
    phase: 'lobby',
    round: 0,
    lots: params.lots.slice(0, rules.totalRounds),
    firstOpener: params.firstOpener,
    seats: { A: null, B: null },
    auction: null,
    result: null,
    cancelReason: null,
  };
}

/** Assied un joueur. Renvoie le siège occupé, ou null si la partie est pleine. */
export function seatPlayer(
  state: MatchState,
  player: { userId: string; displayName: string; isBot?: boolean },
): SeatId | null {
  const seat: SeatId | null = state.seats.A === null ? 'A' : state.seats.B === null ? 'B' : null;

  if (seat === null) return null;

  state.seats[seat] = {
    seat,
    userId: player.userId,
    displayName: player.displayName,
    isBot: player.isBot ?? false,
    connected: true,
    ready: false,
    budget: state.rules.startingBudget,
    timeouts: 0,
    roster: [],
  };

  return seat;
}

export function seatOfUser(state: MatchState, userId: string): SeatId | null {
  if (state.seats.A?.userId === userId) return 'A';

  if (state.seats.B?.userId === userId) return 'B';

  return null;
}

function requireSeat(state: MatchState, seat: SeatId): SeatState | null {
  return state.seats[seat];
}

/** Les deux joueurs sont prêts : la draft peut démarrer. */
export function markReady(state: MatchState, seat: SeatId, now: number): MatchEngineEvent[] {
  const seatState = requireSeat(state, seat);

  if (seatState === null || state.phase !== 'lobby') return [];
  seatState.ready = true;

  if (state.seats.A?.ready && state.seats.B?.ready) {
    state.phase = 'draft';

    return [{ type: 'phase', phase: 'draft' }, ...openRound(state, 1, now)];
  }

  return [];
}

/** Ouvre le tour demandé. L'ouverture alterne à chaque tour. */
function openRound(state: MatchState, round: number, now: number): MatchEngineEvent[] {
  const lot = state.lots[round - 1];

  if (lot === undefined) return finishDraft(state);

  const opener = openerForRound(state.firstOpener, round);
  state.round = round;
  state.auction = startAuction({
    lotId: lot.lotId,
    round,
    opener,
    now,
    turnDurationMs: TURN_DURATION_MS,
  });

  return [
    { type: 'lot_opened', round, lot, opener, deadline: state.auction.deadline },
  ];
}

function currentLot(state: MatchState): Lot | undefined {
  return state.lots[state.round - 1];
}

/** Applique une mise. Toute action hors tour ou invalide est refusée. */
export function placeBid(
  state: MatchState,
  seat: SeatId,
  amount: number,
  now: number,
): MatchOutcome {
  if (state.phase !== 'draft' || state.auction === null) {
    return { ok: false, reason: 'match_not_running' };
  }

  const seatState = requireSeat(state, seat);
  const lot = currentLot(state);

  if (seatState === null || lot === undefined) return { ok: false, reason: 'unknown_seat' };

  const check = checkBid({
    auction: state.auction,
    seat,
    amount,
    budget: seatState.budget,
    roster: seatState.roster,
    position: lot.position,
    rules: state.rules,
  });

  if (!check.ok) return { ok: false, reason: check.reason };

  state.auction = applyBid(state.auction, seat, amount, now, TURN_DURATION_MS);

  const events: MatchEngineEvent[] = [
    { type: 'bid', seat, amount, deadline: state.auction.deadline },
  ];

  // Blocage naturel : l'adversaire ne peut plus surenchérir.
  const rival = requireSeat(state, otherSeat(seat));

  if (
    rival !== null &&
    !canStillBid({
      auction: state.auction,
      budget: rival.budget,
      roster: rival.roster,
      position: lot.position,
      rules: state.rules,
    })
  ) {
    events.push(...resolveRound(state, now));
  }

  return { ok: true, events };
}

/** Un joueur passe : le dernier enchérisseur remporte le lot. */
export function pass(state: MatchState, seat: SeatId, now: number): MatchOutcome {
  if (state.phase !== 'draft' || state.auction === null) {
    return { ok: false, reason: 'match_not_running' };
  }

  if (state.auction.turn !== seat) return { ok: false, reason: 'not_your_turn' };

  return { ok: true, events: [{ type: 'pass', seat }, ...resolveRound(state, now)] };
}

/**
 * Dépassement du délai : compté comme un passe.
 * Deux dépassements du même joueur annulent la partie.
 */
export function timeout(state: MatchState, now: number): MatchEngineEvent[] {
  if (state.phase !== 'draft' || state.auction === null) return [];

  const seat = state.auction.turn;
  const seatState = requireSeat(state, seat);

  if (seatState === null) return [];

  seatState.timeouts += 1;
  const events: MatchEngineEvent[] = [{ type: 'timeout', seat }];

  if (seatState.timeouts >= MAX_TIMEOUTS_PER_PLAYER) {
    return [...events, ...cancel(state, 'double_timeout')];
  }

  return [...events, ...resolveRound(state, now)];
}

/** Attribue le lot courant puis enchaîne sur le tour suivant. */
function resolveRound(state: MatchState, now: number): MatchEngineEvent[] {
  if (state.auction === null) return [];
  const lot = currentLot(state);

  if (lot === undefined) return [];

  const outcome = resolveOnPass(state.auction);
  const events: MatchEngineEvent[] = [];

  if (outcome.winner === null) {
    events.push({ type: 'unsold', lotId: lot.lotId, round: state.round });
  } else {
    const winner = requireSeat(state, outcome.winner);

    if (winner !== null) {
      // Seul le gagnant paie.
      winner.budget -= outcome.pricePaid;
      winner.roster.push({
        lotId: lot.lotId,
        round: state.round,
        position: lot.position,
        hint: lot.hint,
        pricePaid: outcome.pricePaid,
        player: null,
      });
    }

    events.push({
      type: 'awarded',
      lotId: lot.lotId,
      round: state.round,
      winner: outcome.winner,
      pricePaid: outcome.pricePaid,
    });
  }

  state.auction = null;
  const nextRound = state.round + 1;

  if (nextRound > state.lots.length) return [...events, ...finishDraft(state)];

  return [...events, ...openRound(state, nextRound, now)];
}

/** Dernier tour joué : passage en révélation. */
function finishDraft(state: MatchState): MatchEngineEvent[] {
  state.auction = null;
  state.phase = 'reveal';

  return [{ type: 'phase', phase: 'reveal' }];
}

/** Les sièges effectivement occupés, dans l'ordre A puis B. */
function occupiedSeats(state: MatchState): SeatState[] {
  const seats: SeatState[] = [];

  for (const seat of ['A', 'B'] as const) {
    const seatState = state.seats[seat];

    if (seatState !== null) {
      seats.push(seatState);
    }
  }

  return seats;
}

/**
 * Révélation : les identités sont injectées au dernier moment, puis le score
 * est calculé. C'est le seul endroit où une identité rejoint l'état public.
 */
export function reveal(
  state: MatchState,
  identities: ReadonlyMap<string, RealPlayer>,
): MatchEngineEvent[] {
  if (state.phase !== 'reveal') return [];

  for (const seat of ['A', 'B'] as const) {
    const seatState = state.seats[seat];

    if (seatState === null) continue;
    seatState.roster = seatState.roster.map((slot) => ({
      ...slot,
      player: identities.get(slot.lotId) ?? null,
    }));
  }

  state.result = computeResult(
    occupiedSeats(state).map((s) => ({ seat: s.seat, roster: s.roster, budget: s.budget })),
  );
  state.phase = 'results';

  return [{ type: 'phase', phase: 'results' }];
}

export function cancel(state: MatchState, reason: CancelReason): MatchEngineEvent[] {
  if (state.phase === 'results' || state.phase === 'cancelled') return [];
  state.phase = 'cancelled';
  state.cancelReason = reason;
  state.auction = null;

  return [{ type: 'cancelled', reason }];
}

/** Les deux joueurs sont inactifs : la partie est annulée. */
export function bothIdle(state: MatchState): MatchEngineEvent[] {
  const a = state.seats.A;
  const b = state.seats.B;

  if (a === null || b === null) return [];

  if (a.timeouts > 0 && b.timeouts > 0) return cancel(state, 'both_idle');

  return [];
}

function publicState(seat: SeatState, revealed: boolean): PlayerPublicState {
  return {
    seat: seat.seat,
    userId: seat.userId,
    displayName: seat.displayName,
    isBot: seat.isBot,
    connected: seat.connected,
    budget: seat.budget,
    timeouts: seat.timeouts,
    // Prix payés visibles en permanence, identités masquées avant la révélation.
    roster: seat.roster.map((slot) => ({
      ...slot,
      player: revealed ? slot.player : null,
    })),
  };
}

/**
 * Vue destinée à un siège donné.
 * Filtrage par destinataire : aucune identité cachée ne sort avant la révélation.
 */
export function toView(state: MatchState, viewer: SeatId): MatchView {
  const revealed = state.phase === 'reveal' || state.phase === 'results';

  return {
    matchId: state.matchId,
    code: state.code,
    sport: state.sport,
    phase: state.phase,
    round: state.round,
    totalRounds: state.rules.totalRounds,
    you: viewer,
    players: occupiedSeats(state).map((s) => publicState(s, revealed)),
    auction: state.auction,
    result: state.result,
    cancelReason: state.cancelReason,
  };
}
