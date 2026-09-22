import { createServer, type Server } from 'node:http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import WebSocket from 'ws';
import type { ServerMessage } from '@draft/shared';
import { RealtimeGateway } from '../src/realtime/gateway.js';

let server: Server;
let gateway: RealtimeGateway;
let wsUrl: string;

/** Ouvre une connexion et collecte les réponses du serveur. */
function exchange(messages: unknown[], expected: number): Promise<ServerMessage[]> {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(wsUrl);
    const received: ServerMessage[] = [];
    const timer = setTimeout(() => {
      socket.close();
      reject(new Error('Délai dépassé.'));
    }, 3_000);

    socket.on('open', () => {
      for (const message of messages) socket.send(JSON.stringify(message));
    });
    socket.on('message', (data) => {
      received.push(JSON.parse(data.toString()) as ServerMessage);
      if (received.length === expected) {
        clearTimeout(timer);
        socket.close();
        resolve(received);
      }
    });
    socket.on('error', reject);
  });
}

beforeAll(async () => {
  server = createServer();
  gateway = new RealtimeGateway(server);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  if (address === null || typeof address === 'string') {
    throw new Error('Adresse de test indisponible.');
  }
  wsUrl = `ws://127.0.0.1:${address.port}/ws`;
});

afterAll(async () => {
  await gateway.close();
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

describe('passerelle temps réel', () => {
  it('répond au ping', async () => {
    const [message] = await exchange([{ type: 'ping' }], 1);
    expect(message?.type).toBe('pong');
  });

  it('authentifie un invité et lui attribue un identifiant', async () => {
    const [message] = await exchange(
      [{ type: 'auth', displayName: 'Marguerite' }],
      1,
    );
    expect(message).toMatchObject({
      type: 'authenticated',
      displayName: 'Marguerite',
    });
  });

  it('refuse un pseudo trop court', async () => {
    const [message] = await exchange([{ type: 'auth', displayName: 'a' }], 1);
    expect(message).toMatchObject({ type: 'error', code: 'invalid_name' });
  });

  it('rejette un message illisible sans rompre la connexion', async () => {
    const socket = new WebSocket(wsUrl);
    const message = await new Promise<ServerMessage>((resolve, reject) => {
      socket.on('open', () => socket.send('ceci n\'est pas du JSON'));
      socket.on('message', (data) => {
        resolve(JSON.parse(data.toString()) as ServerMessage);
        socket.close();
      });
      socket.on('error', reject);
    });
    expect(message).toMatchObject({ type: 'error', code: 'bad_message' });
  });
});
