import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { WebSocketServer, type WebSocket } from 'ws';
import {
  encode,
  parseClientMessage,
  type ClientMessage,
  type ServerMessage,
} from '@draft/shared';

/** Session d'un client connecté en temps réel. */
export interface Session {
  id: string;
  socket: WebSocket;
  userId: string | null;
  displayName: string | null;
  matchId: string | null;
  alive: boolean;
}

const HEARTBEAT_MS = 30_000;

export class RealtimeGateway {
  private readonly wss: WebSocketServer;
  private readonly sessions = new Map<string, Session>();
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
      this.sessions.delete(session.id);
    });
  }

  /**
   * Routage des intentions du client.
   * Le serveur ne fait jamais confiance au client : toute action de jeu
   * sera validée par le moteur de règles (feature F4).
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

      default:
        // Les actions de partie arriveront avec la feature F4.
        this.send(session, {
          type: 'error',
          code: 'not_implemented',
          message: `Action « ${message.type} » pas encore disponible.`,
        });
    }
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
