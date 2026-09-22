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
  | { type: 'match:create-bot'; sport: Sport; profile?: 'prudent' | 'aggressive' }
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

/** Intitulés d'actions acceptés du client. Toute autre valeur est rejetée. */
const CLIENT_MESSAGE_TYPES = [
  'auth',
  'match:create',
  'match:create-bot',
  'match:join',
  'match:ready',
  'match:leave',
  'bid',
  'pass',
  'ping',
] as const;

/** Forme minimale reconnue avant toute interprétation du message. */
interface RawMessage {
  type?: unknown;
}

function hasKnownType(value: RawMessage): boolean {
  return CLIENT_MESSAGE_TYPES.some((known) => known === value.type);
}

/**
 * Frontière d'entrée du serveur : le texte reçu devient une action du domaine,
 * ou rien. Le moteur de règles revalide ensuite chaque action.
 */
export function parseClientMessage(raw: string): ClientMessage | null {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (parsed === null || Array.isArray(parsed) || !(parsed instanceof Object)) {
    return null;
  }

  // SAFETY : un objet JSON non nul expose au moins un champ `type` optionnel.
  const record = parsed as RawMessage;

  if (!hasKnownType(record)) {
    return null;
  }

  // SAFETY : le champ `type` appartient à la liste close ci-dessus ; les
  // champs restants sont revérifiés par le moteur avant toute application.
  return record as ClientMessage;
}

export function encode(message: ServerMessage | ClientMessage): string {
  return JSON.stringify(message);
}
