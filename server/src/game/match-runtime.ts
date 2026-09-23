import { randomUUID } from 'node:crypto';
import type {
  CancelReason,
  MatchEngineEvent,
  MatchState,
  RealPlayer,
  SeatId,
  ServerMessage,
  Sport,
} from '@draft/shared';
import {
  TURN_DURATION_MS,
  bothIdle,
  cancel,
  createMatch,
  markReady,
  pass,
  placeBid,
  reveal,
  seatOfUser,
  seatPlayer,
  timeout,
  toView,
} from '@draft/shared';
import { decideBotAction, type BotProfile } from './bot.js';
import { drawLots } from './lot-draw.js';

export interface MatchPersistence {
  onEvents: (events: MatchEngineEvent[]) => void;
  onFinished: (match: LiveMatch) => void;
}

type Emit = (seat: SeatId, message: ServerMessage) => void;

/** Réponse à une action de jeu, acceptée ou refusée avec son motif. */
export interface ActionResult {
  ok: boolean;
  reason?: string;
}

/** Génère un code court de salon, lisible et sans caractères ambigus. */
function makeCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';

  for (let i = 0; i < 5; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return code;
}

/**
 * Une partie vivante : son état, son minuteur, ses deux joueurs.
 * Plusieurs instances coexistent sans interférence.
 */
export class LiveMatch {
  readonly state: MatchState;
  private readonly identities: Map<string, RealPlayer>;
  private turnTimer: NodeJS.Timeout | null = null;
  private botTimer: NodeJS.Timeout | null = null;
  private emit: Emit = () => {};
  private persistence: MatchPersistence | null = null;
  private persistedEventCount = 0;
  private completionPersisted = false;
  private readonly botProfile: BotProfile | null;

  constructor(
    state: MatchState,
    identities: Map<string, RealPlayer>,
    botProfile: BotProfile | null = null,
  ) {
    this.state = state;
    this.identities = identities;
    this.botProfile = botProfile;
  }

  get code(): string {
    return this.state.code;
  }

  get matchId(): string {
    return this.state.matchId;
  }

  get finished(): boolean {
    return this.state.phase === 'results' || this.state.phase === 'cancelled';
  }

  setEmitter(emit: Emit): void {
    this.emit = emit;
  }

  setPersistence(persistence: MatchPersistence): void {
    this.persistence = persistence;
  }

  join(user: { userId: string; displayName: string; isBot?: boolean }): SeatId | null {
    const existing = seatOfUser(this.state, user.userId);

    if (existing !== null) {
      const seat = this.state.seats[existing];

      if (seat) seat.connected = true;

      return existing;
    }

    return seatPlayer(this.state, user);
  }

  ready(seat: SeatId): void {
    this.dispatch(markReady(this.state, seat, Date.now()));
  }

  /** Adds the server-owned opponent. It has no websocket session. */
  addBot(profile: BotProfile): SeatId | null {
    const seat = this.join({
      userId: `bot:${this.matchId}`,
      displayName: profile === 'aggressive' ? 'IA offensive' : 'IA prudente',
      isBot: true,
    });

    if (seat !== null) this.ready(seat);

    return seat;
  }

  bid(seat: SeatId, amount: number): ActionResult {
    const outcome = placeBid(this.state, seat, amount, Date.now());

    if (!outcome.ok) return { ok: false, reason: outcome.reason };
    this.dispatch(outcome.events);

    return { ok: true };
  }

  pass(seat: SeatId): ActionResult {
    const outcome = pass(this.state, seat, Date.now());

    if (!outcome.ok) return { ok: false, reason: outcome.reason };
    this.dispatch(outcome.events);

    return { ok: true };
  }

  /** Coupure réseau : ne doit jamais être confondue avec de l'inactivité. */
  setConnected(seat: SeatId, connected: boolean): void {
    const seatState = this.state.seats[seat];

    if (seatState) seatState.connected = connected;
    this.broadcastState();
  }

  abandon(seat: SeatId): void {
    const seatState = this.state.seats[seat];

    if (seatState) seatState.connected = false;
    this.dispatch(cancel(this.state, 'opponent_left'));
  }

  /** Diffuse les évènements, en filtrant l'information par destinataire. */
  private dispatch(events: MatchEngineEvent[]): void {
    const persistentEvents = events.filter((event) => ['lot_opened', 'bid', 'pass', 'timeout', 'awarded', 'unsold'].includes(event.type));
    if (persistentEvents.length > 0) this.persistence?.onEvents(persistentEvents);

    for (const event of events) {
      switch (event.type) {
        case 'lot_opened':
          this.armTimer(event.deadline);
          this.broadcast({
            type: 'match:lot',
            round: event.round,
            lotId: event.lot.lotId,
            hint: event.lot.hint,
            position: event.lot.position,
          });
          break;

        case 'bid':
          this.armTimer(event.deadline);
          this.broadcast({
            type: 'auction:bid',
            seat: event.seat,
            amount: event.amount,
            deadline: event.deadline,
          });
          break;

        case 'pass':
        case 'timeout':
          this.broadcast({ type: 'auction:pass', seat: event.seat });
          break;

        case 'awarded':
          this.broadcast({
            type: 'auction:resolved',
            lotId: event.lotId,
            winner: event.winner,
            pricePaid: event.pricePaid,
          });
          break;

        case 'unsold':
          this.broadcast({
            type: 'auction:resolved',
            lotId: event.lotId,
            winner: null,
            pricePaid: 0,
          });
          break;

        case 'phase':
          if (event.phase === 'reveal') this.startReveal();
          break;

        case 'cancelled':
          this.clearTimer();
          this.broadcast({ type: 'match:cancelled', reason: event.reason });
          break;
      }
    }

    this.broadcastState();
    this.scheduleBotTurn();
    if (this.state.phase === 'results' && !this.completionPersisted) {
      this.completionPersisted = true;
      this.persistence?.onFinished(this);
    }
  }
  private startReveal(): void {
    this.clearTimer();
    this.dispatchReveal();
  }

  private dispatchReveal(): void {
    reveal(this.state, this.identities);

    for (const seat of ['A', 'B'] as const) {
      if (this.state.seats[seat] === null) continue;
      this.emit(seat, { type: 'match:reveal', view: toView(this.state, seat) });

      if (this.state.result) {
        this.emit(seat, { type: 'match:result', result: this.state.result });
      }
    }
  }

  /** Minuteur de 20 secondes, décidé par le serveur seul. */
  private armTimer(deadline: number): void {
    this.clearTimer();
    const delay = Math.max(0, deadline - Date.now());
    this.turnTimer = setTimeout(() => {
      this.turnTimer = null;
      const events = timeout(this.state, Date.now());
      const idle = bothIdle(this.state);
      this.dispatch([...events, ...idle]);
    }, delay);
    this.turnTimer.unref?.();
  }

  private clearTimer(): void {
    if (this.turnTimer) clearTimeout(this.turnTimer);
    this.turnTimer = null;
  }

  /** The bot acts asynchronously through the same public match methods. */
  private scheduleBotTurn(): void {
    if (this.botTimer) clearTimeout(this.botTimer);
    this.botTimer = null;
    const auction = this.state.auction;
    const profile = this.botProfile;

    if (auction === null || profile === null || !this.state.seats[auction.turn]?.isBot) return;

    this.botTimer = setTimeout(() => {
      this.botTimer = null;
      const current = this.state.auction;

      if (current === null || current.turn !== auction.turn) return;

      const action = decideBotAction(this.state, auction.turn, this.identities, profile);

      const outcome = action.type === 'bid'
        ? this.bid(auction.turn, action.amount)
        : this.pass(auction.turn);
      // Rejections are impossible after the turn check, but are intentionally
      // ignored: the authoritative engine remains the final rule arbiter.

      void outcome;
    }, 450);
    this.botTimer.unref?.();
  }

  private clearBotTimer(): void {
    if (this.botTimer) clearTimeout(this.botTimer);
    this.botTimer = null;
  }

  private broadcast(message: ServerMessage): void {
    for (const seat of ['A', 'B'] as const) {
      if (this.state.seats[seat] !== null) this.emit(seat, message);
    }
  }

  broadcastState(): void {
    for (const seat of ['A', 'B'] as const) {
      if (this.state.seats[seat] === null) continue;
      this.emit(seat, { type: 'match:state', view: toView(this.state, seat) });
    }
  }

  dispose(reason?: CancelReason): void {
    if (reason) this.dispatch(cancel(this.state, reason));
    this.clearTimer();
    this.clearBotTimer();
  }
}

/** Registre des parties en cours, une instance par partie. */
export class MatchRegistry {
  private readonly byId = new Map<string, LiveMatch>();
  private readonly byCode = new Map<string, LiveMatch>();

  async create(sport: Sport, botProfile: BotProfile | null = null): Promise<LiveMatch> {
    const { lots, identities } = await drawLots(sport);

    let code = makeCode();

    while (this.byCode.has(code)) code = makeCode();

    const state = createMatch({
      matchId: randomUUID(),
      code,
      sport,
      // Le premier ouvreur est tiré au sort.
      firstOpener: Math.random() < 0.5 ? 'A' : 'B',
      lots,
    });

    const match = new LiveMatch(state, identities, botProfile);
    this.byId.set(match.matchId, match);
    this.byCode.set(code, match);

    return match;
  }

  byMatchId(matchId: string): LiveMatch | undefined {
    return this.byId.get(matchId);
  }

  byJoinCode(code: string): LiveMatch | undefined {
    return this.byCode.get(code.trim().toUpperCase());
  }

  /** Nettoyage des parties terminées ou abandonnées. */
  remove(match: LiveMatch): void {
    match.dispose();
    this.byId.delete(match.matchId);
    this.byCode.delete(match.code);
  }

  get size(): number {
    return this.byId.size;
  }

  clear(): void {
    for (const match of this.byId.values()) match.dispose();
    this.byId.clear();
    this.byCode.clear();
  }
}

export const TURN_MS = TURN_DURATION_MS;
