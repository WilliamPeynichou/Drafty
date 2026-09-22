import type {
  AuctionState,
  Position,
  RosterSlot,
  SeatId,
} from '../types/domain.js';
import type { SportRules } from './rules.js';
import { MIN_OPENING_BID } from './rules.js';

/** Motifs de refus d'une mise. */
export type BidRejection =
  | 'not_your_turn'
  | 'below_minimum'
  | 'not_enough_budget'
  | 'position_limit_reached';

export type BidCheck =
  | { ok: true }
  | { ok: false; reason: BidRejection };

export function otherSeat(seat: SeatId): SeatId {
  return seat === 'A' ? 'B' : 'A';
}

/** Mise minimale acceptable pour l'état d'enchère courant. */
export function minimumAcceptableBid(auction: AuctionState): number {
  return auction.highBidder === null
    ? MIN_OPENING_BID
    : auction.currentBid + 1;
}

/** Nombre de joueurs déjà détenus à un poste donné. */
export function countAtPosition(roster: RosterSlot[], position: Position): number {
  return roster.filter((slot) => slot.position === position).length;
}

/** Le siège a-t-il encore le droit d'acquérir un joueur à ce poste ? */
export function canAcquirePosition(
  roster: RosterSlot[],
  position: Position,
  rules: SportRules,
): boolean {
  const limit = rules.positionLimits[position];

  if (limit === undefined) return true;

  return countAtPosition(roster, position) < limit;
}

/** Validation complète d'une mise avant application. */
export function checkBid(params: {
  auction: AuctionState;
  seat: SeatId;
  amount: number;
  budget: number;
  roster: RosterSlot[];
  position: Position;
  rules: SportRules;
}): BidCheck {
  const { auction, seat, amount, budget, roster, position, rules } = params;

  if (auction.turn !== seat) return { ok: false, reason: 'not_your_turn' };

  if (!canAcquirePosition(roster, position, rules)) {
    return { ok: false, reason: 'position_limit_reached' };
  }

  if (!Number.isInteger(amount) || amount < minimumAcceptableBid(auction)) {
    return { ok: false, reason: 'below_minimum' };
  }

  if (amount > budget) return { ok: false, reason: 'not_enough_budget' };

  return { ok: true };
}

/**
 * Un siège peut-il encore surenchérir ?
 * Sert à détecter le blocage naturel par budget insuffisant
 * ou par limite de poste atteinte.
 */
export function canStillBid(params: {
  auction: AuctionState;
  budget: number;
  roster: RosterSlot[];
  position: Position;
  rules: SportRules;
}): boolean {
  const { auction, budget, roster, position, rules } = params;

  if (!canAcquirePosition(roster, position, rules)) return false;

  return budget >= minimumAcceptableBid(auction);
}

/** Applique une mise valide et rend la main à l'adversaire. */
export function applyBid(
  auction: AuctionState,
  seat: SeatId,
  amount: number,
  now: number,
  turnDurationMs: number,
): AuctionState {
  return {
    ...auction,
    currentBid: amount,
    highBidder: seat,
    turn: otherSeat(seat),
    history: [...auction.history, { seat, amount, at: now }],
    deadline: now + turnDurationMs,
  };
}

/** Issue d'une enchère terminée. */
export interface AuctionOutcome {
  /** Null si les deux joueurs ont passé d'entrée : le lot n'est pas attribué. */
  winner: SeatId | null;
  pricePaid: number;
}

/**
 * Résout l'enchère lorsqu'un siège passe ou dépasse le délai.
 * Le dernier enchérisseur remporte le lot et est le seul à payer.
 */
export function resolveOnPass(auction: AuctionState): AuctionOutcome {
  if (auction.highBidder === null) {
    return { winner: null, pricePaid: 0 };
  }

  return { winner: auction.highBidder, pricePaid: auction.currentBid };
}

/** Crée l'état d'enchère initial d'un tour. */
export function startAuction(params: {
  lotId: string;
  round: number;
  opener: SeatId;
  now: number;
  turnDurationMs: number;
}): AuctionState {
  const { lotId, round, opener, now, turnDurationMs } = params;

  return {
    lotId,
    round,
    turn: opener,
    currentBid: 0,
    highBidder: null,
    history: [],
    deadline: now + turnDurationMs,
  };
}

/** Le siège qui ouvre le tour demandé, l'ouverture alternant à chaque tour. */
export function openerForRound(firstOpener: SeatId, round: number): SeatId {
  const shift = (round - 1) % 2;

  return shift === 0 ? firstOpener : otherSeat(firstOpener);
}
