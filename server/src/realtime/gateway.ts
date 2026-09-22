import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { WebSocketServer, type WebSocket } from 'ws';
import {
  encode,
  parseClientMessage,
  type ClientMessage,
  type SeatId,
  type ServerMessage,
  type Sport,
} from '@draft/shared';
import { MatchRegistry, type LiveMatch } from '../game/match-runtime.js';

/** Messages d'erreur rendus lisibles pour le joueur. */
const REJECTION_MESSAGES = {
  not_your_turn: "Ce n'est pas à vous d'agir.",
  below_minimum: "La mise doit être strictement supérieure à l'offre courante.",
  not_enough_budget: 'Budget insuffisant pour cette mise.',
  position_limit_reached: 'Limite de deux gardiens atteinte.',
  match_not_running: "La partie n'est pas en cours.",
  unknown_seat: 'Siège inconnu.',
  no_auction: "Aucune enchère en cours.",
} satisfies Record<string, string>;

function rejectionMessage(code: string): string {
  return Object.hasOwn(REJECTION_MESSAGES, code)
    ? // SAFETY : la clé vient d'être trouvée dans la table ci-dessus.
      REJECTION_MESSAGES[code as keyof typeof REJECTION_MESSAGES]
    : 'Action refusée.';
}

/** Session d'un client connecté en temps réel. */
export interface Session {
  id: string;
  socket: WebSocket;
  userId: string | null;
  displayName: string | null;
  matchId: string | null;
  seat: SeatId | null;
  alive: boolean;
}

const HEARTBEAT_MS = 30_000;

export class RealtimeGateway {
  private readonly wss: WebSocketServer;
  private readonly sessions = new Map<string, Session>();
  private readonly registry = new MatchRegistry();
  private heartbeat: NodeJS.Timeout | null = null;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.wss.on('connection', (socket) => this.onConnection(socket));
    this.startHeartbeat();
  }

  private onConnection(socket: WebSocket): void {
    const session: Session = {
      id: randomUUID(),
      socket,
      userId: null,
      displayName: null,
      matchId: null,
      seat: null,
      alive: true,
    };

    this.sessions.set(session.id, session);

    socket.on('pong', () => {
      session.alive = true;
    });

    socket.on('message', (raw) => {
      const message = parseClientMessage(raw.toString());

      if (message === null) {
        this.send(session, {
          type: 'error',
          code: 'bad_message',
          message: 'Message illisible.',
        });

        return;
      }

      this.handle(session, message);
    });

    socket.on('close', () => {
      this.handleDisconnect(session);
      this.sessions.delete(session.id);
    });
  }

  /**
   * Routage des intentions du client.
   * Le serveur ne fait jamais confiance au client : chaque action de jeu passe
   * par le moteur de règles, qui seul décide de son acceptation.
   */
  private handle(session: Session, message: ClientMessage): void {
    switch (message.type) {
      case 'ping':
        this.send(session, { type: 'pong', at: Date.now() });

        return;

      case 'auth': {
        const displayName = message.displayName.trim().slice(0, 24);

        if (displayName.length < 2) {
          this.send(session, {
            type: 'error',
            code: 'invalid_name',
            message: 'Le pseudo doit comporter au moins deux caractères.',
          });

          return;
        }

        session.userId = randomUUID();
        session.displayName = displayName;
        this.send(session, {
          type: 'authenticated',
          userId: session.userId,
          displayName,
        });

        return;
      }

      case 'match:create':
        void this.createMatch(session, message.sport);

        return;

      case 'match:create-bot':
        void this.createBotMatch(session, message.sport, message.profile ?? 'prudent');

        return;

      case 'match:join':
        this.joinMatch(session, message.code);

        return;

      case 'match:ready':
        this.withSeat(session, (match, seat) => match.ready(seat));

        return;

      case 'bid':
        this.withSeat(session, (match, seat) => {
          const result = match.bid(seat, message.amount);

          if (!result.ok) this.reject(session, result.reason);
        });

        return;

      case 'pass':
        this.withSeat(session, (match, seat) => {
          const result = match.pass(seat);

          if (!result.ok) this.reject(session, result.reason);
        });

        return;

      case 'match:leave':
        this.leaveMatch(session);

        return;

      default:
        this.send(session, {
          type: 'error',
          code: 'not_implemented',
          message: 'Action inconnue.',
        });
    }
  }

  private reject(session: Session, reason: string | undefined): void {
    const code = reason ?? 'rejected';
    this.send(session, {
      type: 'error',
      code,
      message: rejectionMessage(code),
    });
  }

  private requireAuth(session: Session): boolean {
    if (session.userId === null) {
      this.send(session, {
        type: 'error',
        code: 'not_authenticated',
        message: 'Choisir un pseudo avant de jouer.',
      });

      return false;
    }

    return true;
  }

  private async createMatch(session: Session, sport: Sport): Promise<void> {
    if (!this.requireAuth(session)) return;

    try {
      const match = await this.registry.create(sport);
      this.attach(match);
      this.sit(session, match);
    } catch {
      this.send(session, {
        type: 'error',
        code: 'draw_failed',
        message: 'Catalogue indisponible : impossible de composer les lots.',
      });
    }
  }

  private async createBotMatch(
    session: Session,
    sport: Sport,
    profile: 'prudent' | 'aggressive',
  ): Promise<void> {
    if (!this.requireAuth(session)) return;

    try {
      const match = await this.registry.create(sport, profile);
      this.attach(match);
      this.sit(session, match);
      match.addBot(profile);
      match.broadcastState();
    } catch {
      this.send(session, {
        type: 'error',
        code: 'draw_failed',
        message: 'Catalogue indisponible : impossible de composer les lots.',
      });
    }
  }
  private joinMatch(session: Session, code: string): void {
    if (!this.requireAuth(session)) return;
    const match = this.registry.byJoinCode(code);

    if (match === undefined) {
      this.send(session, {
        type: 'error',
        code: 'unknown_code',
        message: 'Aucun salon pour ce code.',
      });

      return;
    }

    this.attach(match);
    this.sit(session, match);
  }

  /** Assied la session, ou refuse si la partie est déjà complète. */
  private sit(session: Session, match: LiveMatch): void {
    const seat = match.join({
      userId: session.userId ?? '',
      displayName: session.displayName ?? 'Invité',
    });

    if (seat === null) {
      this.send(session, {
        type: 'error',
        code: 'match_full',
        message: 'Cette partie est déjà complète. Aucun spectateur admis.',
      });

      return;
    }

    session.matchId = match.matchId;
    session.seat = seat;
    match.broadcastState();
  }

  /** Relie la partie aux sessions de ses deux sièges. */
  private attach(match: LiveMatch): void {
    match.setEmitter((seat, message) => {
      for (const session of this.sessions.values()) {
        if (session.matchId === match.matchId && session.seat === seat) {
          this.send(session, message);
        }
      }
    });
  }

  private withSeat(
    session: Session,
    action: (match: LiveMatch, seat: SeatId) => void,
  ): void {
    if (session.matchId === null || session.seat === null) {
      this.send(session, {
        type: 'error',
        code: 'not_in_match',
        message: 'Aucune partie en cours.',
      });

      return;
    }

    const match = this.registry.byMatchId(session.matchId);

    if (match === undefined) {
      this.send(session, {
        type: 'error',
        code: 'unknown_match',
        message: 'Partie introuvable.',
      });

      return;
    }

    action(match, session.seat);
  }

  private leaveMatch(session: Session): void {
    if (session.matchId === null || session.seat === null) return;
    const match = this.registry.byMatchId(session.matchId);

    if (match !== undefined) {
      match.abandon(session.seat);
      this.registry.remove(match);
    }

    session.matchId = null;
    session.seat = null;
  }

  /** Coupure réseau : l'adversaire est prévenu, la partie n'est pas annulée. */
  private handleDisconnect(session: Session): void {
    if (session.matchId === null || session.seat === null) return;
    const match = this.registry.byMatchId(session.matchId);
    match?.setConnected(session.seat, false);
  }

  private send(session: Session, message: ServerMessage): void {
    if (session.socket.readyState === session.socket.OPEN) {
      session.socket.send(encode(message));
    }
  }

  /** Détecte les connexions mortes sans les confondre avec de l'inactivité de jeu. */
  private startHeartbeat(): void {
    this.heartbeat = setInterval(() => {
      for (const session of this.sessions.values()) {
        if (!session.alive) {
          session.socket.terminate();
          this.sessions.delete(session.id);
          continue;
        }

        session.alive = false;
        session.socket.ping();
      }
    }, HEARTBEAT_MS);
  }

  get connectionCount(): number {
    return this.sessions.size;
  }

  async close(): Promise<void> {
    if (this.heartbeat) clearInterval(this.heartbeat);

    for (const session of this.sessions.values()) session.socket.close();
    await new Promise<void>((resolve) => this.wss.close(() => resolve()));
  }
}
