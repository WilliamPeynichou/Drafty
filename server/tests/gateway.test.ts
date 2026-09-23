import { createServer, type Server } from 'node:http';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import WebSocket from 'ws';
import type { Lot, RealPlayer, ServerMessage } from '@draft/shared';
import { createMatch } from '@draft/shared';
import { LiveMatch } from '../src/game/match-runtime.js';
import { RealtimeGateway, type MatchPersistenceStore } from '../src/realtime/gateway.js';

const { authenticatedIdentity } = vi.hoisted(() => ({ authenticatedIdentity: vi.fn().mockResolvedValue(null) }));
vi.mock('../src/http/routes/auth.js', () => ({ authenticatedIdentity }));

let server: Server;
let gateway: RealtimeGateway;
let wsUrl: string;

function exchange(messages: unknown[], expected: number): Promise<ServerMessage[]> {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(wsUrl);
    const received: ServerMessage[] = [];
    const timer = setTimeout(() => { socket.close(); reject(new Error('Délai dépassé.')); }, 3_000);
    socket.on('open', () => { for (const message of messages) socket.send(JSON.stringify(message)); });
    socket.on('message', (data) => {
      received.push(JSON.parse(data.toString()) as ServerMessage);
      if (received.length === expected) { clearTimeout(timer); socket.close(); resolve(received); }
    });
    socket.on('error', reject);
  });
}

beforeAll(async () => {
  server = createServer();
  gateway = new RealtimeGateway(server);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  if (address === null || typeof address === 'string') throw new Error('Adresse de test indisponible.');
  wsUrl = `ws://127.0.0.1:${address.port}/ws`;
});

afterAll(async () => {
  await gateway.close();
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

describe('passerelle temps réel', () => {
  it('déclenche le journal d’événements et le stockage du résultat final', async () => {
    const lots: Lot[] = [
      { lotId: 'lot-a', round: 1, position: 'FWD', hint: 'Indice suffisamment long pour test.' },
      { lotId: 'lot-b', round: 2, position: 'MID', hint: 'Second indice suffisamment long.' },
    ];
    const identities = new Map<string, RealPlayer>([
      ['lot-a', { id: 1, sport: 'football', name: 'Joueur A', position: 'FWD', club: 'Club', country: 'FR', rating: 80, tier: 2 }],
      ['lot-b', { id: 2, sport: 'football', name: 'Joueur B', position: 'MID', club: 'Club', country: 'FR', rating: 81, tier: 2 }],
    ]);
    const match = new LiveMatch(createMatch({ matchId: 'test-match', code: 'ABCDE', sport: 'football', firstOpener: 'A', lots }), identities);
    const recordEvents = vi.fn(async () => {});
    const recordFinishedMatch = vi.fn(async () => {});
    const store: MatchPersistenceStore = { ensureMatch: vi.fn(async () => {}), recordEvents, recordFinishedMatch };
    match.setPersistence({
      onEvents: (events) => { void store.ensureMatch(match).then(() => store.recordEvents(match, events)); },
      onFinished: (finished) => { void store.recordFinishedMatch(finished); },
    });
    match.join({ userId: 'user-a', displayName: 'A' });
    match.join({ userId: 'user-b', displayName: 'B' });
    match.ready('A');
    match.ready('B');
    const firstTurn = match.state.auction?.turn;
    if (!firstTurn) throw new Error('Enchère manquante');
    match.pass(firstTurn);
    const secondTurn = match.state.auction?.turn;
    if (!secondTurn) throw new Error('Deuxième enchère manquante');
    match.pass(secondTurn);
    await Promise.resolve();
    await Promise.resolve();
    expect(recordEvents).toHaveBeenCalled();
    expect(recordFinishedMatch).toHaveBeenCalledWith(match);
    match.dispose();
  });

  it('authentifie un socket depuis le cookie et bloque une usurpation de pseudo', async () => {
    authenticatedIdentity.mockResolvedValueOnce({ userId: 'persistent-user', displayName: 'Compte' });
    const socket = new WebSocket(wsUrl, { headers: { Cookie: 'drafty_session=session-token' } });
    const messages: ServerMessage[] = [];
    socket.on('message', (data) => messages.push(JSON.parse(data.toString()) as ServerMessage));
    const deadline = Date.now() + 1_000;
    while (!messages.some((message) => message.type === 'authenticated') && Date.now() < deadline) await new Promise((resolve) => setTimeout(resolve, 10));
    expect(messages.find((message) => message.type === 'authenticated')).toMatchObject({ userId: 'persistent-user', displayName: 'Compte' });
    socket.send(JSON.stringify({ type: 'auth', displayName: 'Usurpateur' }));
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(messages.filter((message) => message.type === 'authenticated').at(-1)).toMatchObject({ userId: 'persistent-user', displayName: 'Compte' });
    socket.close();
  });

  it('répond au ping', async () => {
    const [message] = await exchange([{ type: 'ping' }], 1);
    expect(message?.type).toBe('pong');
  });

  it('authentifie un invité et lui attribue un identifiant', async () => {
    const [message] = await exchange([{ type: 'auth', displayName: 'Marguerite' }], 1);
    expect(message).toMatchObject({ type: 'authenticated', displayName: 'Marguerite' });
  });

  it('refuse un pseudo trop court', async () => {
    const [message] = await exchange([{ type: 'auth', displayName: 'a' }], 1);
    expect(message).toMatchObject({ type: 'error', code: 'invalid_name' });
  });

  it('rejette un message illisible sans rompre la connexion', async () => {
    const socket = new WebSocket(wsUrl);
    const message = await new Promise<ServerMessage>((resolve, reject) => {
      socket.on('open', () => socket.send('ceci n\'est pas du JSON'));
      socket.on('message', (data) => { resolve(JSON.parse(data.toString()) as ServerMessage); socket.close(); });
      socket.on('error', reject);
    });
    expect(message).toMatchObject({ type: 'error', code: 'bad_message' });
  });
});
