/**
 * Protocole temps réel client <-> serveur.
 * Le serveur est seul détenteur de la vérité : le client n'émet que des intentions.
 * Aucune identité de joueur caché ne transite avant la phase de révélation.
 */

import type {
  CancelReason,
  MatchResult,
  MatchView,
  SeatId,
  Sport,
} from '../types/domain.js';

/** Messages émis par le client. */
export type ClientMessage =
  | { type: 'auth'; displayName: string }
  | { type: 'match:create'; sport: Sport }
  | { type: 'match:join'; code: string }
  | { type: 'match:ready' }
  | { type: 'match:leave' }
  | { type: 'bid'; amount: number }
  | { type: 'pass' }
  | { type: 'ping' };

/** Messages émis par le serveur. */
export type ServerMessage =
  | { type: 'authenticated'; userId: string; displayName: string }
  | { type: 'match:state'; view: MatchView }
  | { type: 'match:lot'; round: number; lotId: string; hint: string; position: string }
  | { type: 'auction:bid'; seat: SeatId; amount: number; deadline: number }
  | { type: 'auction:pass'; seat: SeatId }
  | { type: 'auction:resolved'; lotId: string; winner: SeatId | null; pricePaid: number }
  | { type: 'match:reveal'; view: MatchView }
  | { type: 'match:result'; result: MatchResult }
  | { type: 'match:cancelled'; reason: CancelReason }
  | { type: 'error'; code: string; message: string }
  | { type: 'pong'; at: number };

export function parseClientMessage(raw: string): ClientMessage | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof (parsed as { type?: unknown }).type === 'string'
    ) {
      return parsed as ClientMessage;
    }
    return null;
  } catch {
    return null;
  }
}

export function encode(message: ServerMessage | ClientMessage): string {
  return JSON.stringify(message);
}
