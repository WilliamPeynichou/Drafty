import { randomUUID } from 'node:crypto';
import type { MatchEngineEvent } from '@draft/shared';
import type { IncomingMessage, Server } from 'node:http';
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
import { authenticatedIdentity } from '../http/routes/auth.js';
import { Match, MatchEvent } from '../models/index.js';

const REJECTION_MESSAGES = {
  not_your_turn: "Ce n'est pas à vous d'agir.",
  below_minimum: "La mise doit être strictement supérieure à l'offre courante.",
  not_enough_budget: 'Budget insuffisant pour cette mise.',
  position_limit_reached: 'Limite de deux gardiens atteinte.',
  match_not_running: "La partie n'est pas en cours.",
  unknown_seat: 'Siège inconnu.',
  no_auction: "Aucune enchère en cours.",
} satisfies Record<string, string>;

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function rejectionMessage(code: string): string {
  return Object.hasOwn(REJECTION_MESSAGES, code)
    ? // SAFETY : la clé vient d'être trouvée dans la table ci-dessus.
      REJECTION_MESSAGES[code as keyof typeof REJECTION_MESSAGES]
    : 'Action refusée.';
}

export interface Session {
  id: string;
  socket: WebSocket;
  userId: string | null;
  displayName: string | null;
  matchId: string | null;
  seat: SeatId | null;
  alive: boolean;
  authResolved: boolean;
}

const HEARTBEAT_MS = 30_000;

export interface MatchPersistenceStore {
  ensureMatch: (match: LiveMatch) => Promise<void>;
  recordEvents: (match: LiveMatch, events: MatchEngineEvent[]) => Promise<void>;
  recordFinishedMatch: (match: LiveMatch) => Promise<void>;
}

export interface MatchRegistryPort {
  create(sport: Sport, botProfile?: 'prudent' | 'aggressive' | null): Promise<LiveMatch>;
  byMatchId(matchId: string): LiveMatch | undefined;
  byJoinCode(code: string): LiveMatch | undefined;
  remove(match: LiveMatch): void;
  clear(): void;
  readonly size: number;
}

export const databaseMatchPersistence: MatchPersistenceStore = {
  async ensureMatch(match) {
    const state = match.state;
    const a = state.seats.A;
    const b = state.seats.B;
    const existing = await Match.findByPk(match.matchId);
    const values = {
      code: match.code,
      sport: state.sport,
      phase: state.phase,
      seatAUserId: a?.userId ?? null,
      seatBUserId: b?.isBot ? null : b?.userId ?? null,
      seatBIsBot: b?.isBot ?? false,
    };
    if (existing) await existing.update(values);
    else await Match.upsert({ id: match.matchId, ...values });
  },
  async recordEvents(match, events) {
    const rows: Array<{
      matchId: string;
      round: number;
      kind: 'lot_opened' | 'bid' | 'pass' | 'timeout' | 'awarded' | 'unsold';
      seat: SeatId | null;
      amount: number | null;
    }> = [];

    for (const event of events) {
      if (event.type === 'lot_opened') rows.push({ matchId: match.matchId, round: event.round, kind: 'lot_opened', seat: null, amount: null });
      if (event.type === 'bid') rows.push({ matchId: match.matchId, round: match.state.round, kind: 'bid', seat: event.seat, amount: event.amount });
      if (event.type === 'pass' || event.type === 'timeout') rows.push({ matchId: match.matchId, round: match.state.round, kind: event.type, seat: event.seat, amount: null });
      if (event.type === 'awarded') rows.push({ matchId: match.matchId, round: event.round, kind: 'awarded', seat: event.winner, amount: event.pricePaid });
      if (event.type === 'unsold') rows.push({ matchId: match.matchId, round: event.round, kind: 'unsold', seat: null, amount: null });
    }

    if (rows.length > 0) await MatchEvent.bulkCreate(rows);
  },
  async recordFinishedMatch(match) {
    const { state } = match;
    const result = state.result;
    if (!result) return;
    const scoreA = result.scores.find((score) => score.seat === 'A')?.total ?? 0;
    const scoreB = result.scores.find((score) => score.seat === 'B')?.total ?? 0;
    await Match.upsert({
      id: match.matchId,
      code: match.code,
      sport: state.sport,
      phase: state.phase,
      seatAUserId: state.seats.A?.userId ?? null,
      seatBUserId: state.seats.B?.userId ?? null,
      seatBIsBot: false,
      winnerSeat: result.winner,
      scoreA,
      scoreB,
      finishedAt: new Date(),
    });
  },
};

export class RealtimeGateway {
  private readonly wss: WebSocketServer;
  private readonly sessions = new Map<string, Session>();
  private readonly registry: MatchRegistryPort;
  private readonly persistence: MatchPersistenceStore;
  private heartbeat: NodeJS.Timeout | null = null;

  constructor(
    server: Server,
    registry: MatchRegistryPort = new MatchRegistry(),
    persistence: MatchPersistenceStore = databaseMatchPersistence,
  ) {
    this.registry = registry;
    this.persistence = persistence;
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.wss.on('connection', (socket, request) => this.onConnection(socket, request));
    this.startHeartbeat();
  }

  private onConnection(socket: WebSocket, request: IncomingMessage): void {
    const session: Session = {
      id: randomUUID(), socket, userId: null, displayName: null,
      matchId: null, seat: null, alive: true, authResolved: false,
    };
    this.sessions.set(session.id, session);

    void authenticatedIdentity(request)
      .then((identity) => {
        if (!identity || socket.readyState !== socket.OPEN) return;
        session.userId = identity.userId;
        session.displayName = identity.displayName;
        this.send(session, { type: 'authenticated', userId: identity.userId, displayName: identity.displayName });
      })
      .catch(() => {
        // Une session HTTP indisponible ne bloque pas le mode invité.
      })
      .finally(() => {
        session.authResolved = true;
      });

    socket.on('pong', () => { session.alive = true; });
    socket.on('message', (raw) => {
      const message = parseClientMessage(raw.toString());
      if (message === null) {
        this.send(session, { type: 'error', code: 'bad_message', message: 'Message illisible.' });
        return;
      }
      this.handle(session, message);
    });
    socket.on('close', () => {
      this.handleDisconnect(session);
      this.sessions.delete(session.id);
    });
  }

  private handle(session: Session, message: ClientMessage): void {
    if (!session.authResolved && message.type !== 'ping') {
      setTimeout(() => this.handle(session, message), 10);
      return;
    }

    switch (message.type) {
      case 'ping':
        this.send(session, { type: 'pong', at: Date.now() });
        return;
      case 'auth': {
        if (session.userId !== null) {
          this.send(session, { type: 'authenticated', userId: session.userId, displayName: session.displayName ?? message.displayName });
          return;
        }
        const displayName = message.displayName.trim().slice(0, 24);
        if (displayName.length < 2) {
          this.send(session, { type: 'error', code: 'invalid_name', message: 'Le pseudo doit comporter au moins deux caractères.' });
          return;
        }
        session.userId = randomUUID();
        session.displayName = displayName;
        this.send(session, { type: 'authenticated', userId: session.userId, displayName });
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
        this.send(session, { type: 'error', code: 'not_implemented', message: 'Action inconnue.' });
    }
  }

  private reject(session: Session, reason: string | undefined): void {
    const code = reason ?? 'rejected';
    this.send(session, { type: 'error', code, message: rejectionMessage(code) });
  }

  private requireAuth(session: Session): boolean {
    if (session.userId === null) {
      this.send(session, { type: 'error', code: 'not_authenticated', message: 'Choisir un pseudo avant de jouer.' });
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
      this.send(session, { type: 'error', code: 'draw_failed', message: 'Catalogue indisponible : impossible de composer les lots.' });
    }
  }

  private async createBotMatch(session: Session, sport: Sport, profile: 'prudent' | 'aggressive'): Promise<void> {
    if (!this.requireAuth(session)) return;
    try {
      const match = await this.registry.create(sport, profile);
      this.attach(match);
      this.sit(session, match);
      match.addBot(profile);
      match.broadcastState();
    } catch {
      this.send(session, { type: 'error', code: 'draw_failed', message: 'Catalogue indisponible : impossible de composer les lots.' });
    }
  }

  private joinMatch(session: Session, code: string): void {
    if (!this.requireAuth(session)) return;
    const match = this.registry.byJoinCode(code);
    if (match === undefined) {
      this.send(session, { type: 'error', code: 'unknown_code', message: 'Aucun salon pour ce code.' });
      return;
    }
    this.attach(match);
    this.sit(session, match);
  }

  private sit(session: Session, match: LiveMatch): void {
    const seat = match.join({ userId: session.userId ?? '', displayName: session.displayName ?? 'Invité' });
    if (seat === null) {
      this.send(session, { type: 'error', code: 'match_full', message: 'Cette partie est déjà complète. Aucun spectateur admis.' });
      return;
    }
    if (match.state.seats.A && match.state.seats.B) this.attach(match);
    session.matchId = match.matchId;
    session.seat = seat;
    match.broadcastState();
  }

  private attach(match: LiveMatch): void {
    match.setPersistence({
      onEvents: (events) => {
        const seatA = match.state.seats.A;
        const seatB = match.state.seats.B;
        const rows: Array<{ matchId: string; round: number; kind: 'lot_opened' | 'bid' | 'pass' | 'timeout' | 'awarded' | 'unsold'; seat: SeatId | null; amount: number | null }> = [];
        for (const event of events) {
          if (event.type === 'lot_opened') rows.push({ matchId: match.matchId, round: event.round, kind: 'lot_opened', seat: null, amount: null });
          else if (event.type === 'bid') rows.push({ matchId: match.matchId, round: match.state.round, kind: 'bid', seat: event.seat, amount: event.amount });
          else if (event.type === 'pass' || event.type === 'timeout') rows.push({ matchId: match.matchId, round: match.state.round, kind: event.type, seat: event.seat, amount: null });
          else if (event.type === 'awarded') rows.push({ matchId: match.matchId, round: event.round, kind: 'awarded', seat: event.winner, amount: event.pricePaid });
          else if (event.type === 'unsold') rows.push({ matchId: match.matchId, round: event.round, kind: 'unsold', seat: null, amount: null });
        }
        if (!seatA || !seatB || seatA.isBot || seatB.isBot || !isUuid(seatA.userId) || !isUuid(seatB.userId)) return;
        void this.persistence.ensureMatch(match)
          .then(() => this.persistence.recordEvents(match, events))
          .catch((error) => console.error('Échec de journalisation du match :', error));
      },
      onFinished: (finished) => {
        const a = finished.state.seats.A;
        const b = finished.state.seats.B;
        if (!a || !b || a.isBot || b.isBot || !isUuid(a.userId) || !isUuid(b.userId)) return;
        void this.persistence.recordFinishedMatch(finished).catch((error) => console.error('Échec de persistance du résultat :', error));
      },
    });
    match.setEmitter((seat, message) => {
      for (const session of this.sessions.values()) {
        if (session.matchId === match.matchId && session.seat === seat) this.send(session, message);
      }
    });
  }

  private withSeat(session: Session, action: (match: LiveMatch, seat: SeatId) => void): void {
    if (session.matchId === null || session.seat === null) {
      this.send(session, { type: 'error', code: 'not_in_match', message: 'Aucune partie en cours.' });
      return;
    }
    const match = this.registry.byMatchId(session.matchId);
    if (match === undefined) {
      this.send(session, { type: 'error', code: 'unknown_match', message: 'Partie introuvable.' });
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

  private handleDisconnect(session: Session): void {
    if (session.matchId === null || session.seat === null) return;
    this.registry.byMatchId(session.matchId)?.setConnected(session.seat, false);
  }

  private send(session: Session, message: ServerMessage): void {
    if (session.socket.readyState === session.socket.OPEN) session.socket.send(encode(message));
  }

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
