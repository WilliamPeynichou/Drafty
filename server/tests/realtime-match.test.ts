import { createServer, type Server } from 'node:http';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import WebSocket from 'ws';
import type { Lot, RealPlayer, ServerMessage } from '@draft/shared';

/**
 * Le tirage des lots est la seule dépendance base de ce parcours.
 * On le remplace pour tester la mécanique temps réel sans MySQL.
 */
const LOTS: Lot[] = [
  { lotId: 'lot-1', round: 1, position: 'FWD', hint: 'Triplé en finale de Coupe du monde.' },
  { lotId: 'lot-2', round: 2, position: 'GK', hint: 'Élu meilleur joueur d’un Euro.' },
];

const IDENTITIES = new Map<string, RealPlayer>([
  [
    'lot-1',
    {
      id: 1,
      sport: 'football',
      name: 'Kylian Mbappé',
      position: 'FWD',
      club: 'Real Madrid',
      country: 'France',
      rating: 91,
      tier: 1,
    },
  ],
  [
    'lot-2',
    {
      id: 2,
      sport: 'football',
      name: 'Gianluigi Donnarumma',
      position: 'GK',
      club: 'Paris Saint-Germain',
      country: 'Italie',
      rating: 88,
      tier: 1,
    },
  ],
]);

vi.mock('../src/game/lot-draw.js', () => ({
  drawLots: async () => ({ lots: LOTS, identities: IDENTITIES }),
  countDrawablePlayers: async () => 2,
}));

const { RealtimeGateway } = await import('../src/realtime/gateway.js');

let server: Server;
let gateway: InstanceType<typeof RealtimeGateway>;
let wsUrl: string;

/** Client de test : envoie des intentions, collecte les messages serveur. */
class TestClient {
  readonly received: ServerMessage[] = [];
  readonly raw: string[] = [];
  private socket!: WebSocket;

  async connect(): Promise<void> {
    this.socket = new WebSocket(wsUrl);
    this.socket.on('message', (data) => {
      const text = data.toString();
      this.raw.push(text);
      this.received.push(JSON.parse(text) as ServerMessage);
    });
    await new Promise<void>((resolve, reject) => {
      this.socket.on('open', () => resolve());
      this.socket.on('error', reject);
    });
  }

  send(message: unknown): void {
    this.socket.send(JSON.stringify(message));
  }

  /** Attend le premier message d'un type donné. */
  async waitFor<T extends ServerMessage['type']>(
    type: T,
    timeoutMs = 2_000,
  ): Promise<Extract<ServerMessage, { type: T }>> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const found = this.received.find((m) => m.type === type);
      if (found) return found as Extract<ServerMessage, { type: T }>;
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    throw new Error(`Message « ${type} » non reçu.`);
  }

  last<T extends ServerMessage['type']>(type: T): Extract<ServerMessage, { type: T }> | undefined {
    const matches = this.received.filter((m) => m.type === type);
    return matches[matches.length - 1] as Extract<ServerMessage, { type: T }> | undefined;
  }

  clear(): void {
    this.received.length = 0;
  }

  close(): void {
    this.socket.close();
  }
}

async function authenticated(name: string): Promise<TestClient> {
  const client = new TestClient();
  await client.connect();
  client.send({ type: 'auth', displayName: name });
  await client.waitFor('authenticated');
  return client;
}

beforeAll(async () => {
  server = createServer();
  gateway = new RealtimeGateway(server);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  if (address === null || typeof address === 'string') throw new Error('Adresse indisponible.');
  wsUrl = `ws://127.0.0.1:${address.port}/ws`;
});

afterAll(async () => {
  await gateway.close();
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

describe('partie temps réel', () => {
  it('joue une partie complète à deux et ne révèle rien avant la fin', async () => {
    const anna = await authenticated('Anna');
    const bruno = await authenticated('Bruno');

    anna.send({ type: 'match:create', sport: 'football' });
    const created = await anna.waitFor('match:state');
    const code = created.view.code;
    expect(code).toHaveLength(5);

    bruno.send({ type: 'match:join', code });
    await bruno.waitFor('match:state');

    anna.send({ type: 'match:ready' });
    bruno.send({ type: 'match:ready' });

    const lot = await anna.waitFor('match:lot');
    expect(lot.round).toBe(1);
    expect(lot.hint).toContain('finale');
    // L'indice circule, jamais l'identité.
    expect(JSON.stringify(lot)).not.toContain('Mbappé');

    // Tour 1 : l'ouvreur mise, l'autre passe.
    const state = anna.last('match:state');
    const opener = state?.view.auction?.turn ?? 'A';
    const openerClient = opener === (created.view.you as string) ? anna : bruno;
    const otherClient = openerClient === anna ? bruno : anna;

    openerClient.send({ type: 'bid', amount: 5 });
    await openerClient.waitFor('auction:bid');
    otherClient.send({ type: 'pass' });

    const resolved = await openerClient.waitFor('auction:resolved');
    expect(resolved.pricePaid).toBe(5);

    // Aucune identité n'a circulé pendant toute la draft.
    const trafficBeforeReveal = [...anna.raw, ...bruno.raw].join('');
    expect(trafficBeforeReveal).not.toContain('Mbappé');
    expect(trafficBeforeReveal).not.toContain('Donnarumma');

    // Tour 2 : les deux passent, le lot reste non attribué.
    const secondState = anna.last('match:state');
    const secondTurn = secondState?.view.auction?.turn;
    const secondOpener = secondTurn === (created.view.you as string) ? anna : bruno;
    const secondOther = secondOpener === anna ? bruno : anna;

    secondOpener.send({ type: 'pass' });
    await new Promise((resolve) => setTimeout(resolve, 50));
    secondOther.send({ type: 'pass' });

    const reveal = await anna.waitFor('match:reveal', 3_000);
    const names = reveal.view.players
      .flatMap((player) => player.roster)
      .map((slot) => slot.player?.name);
    expect(names).toContain('Kylian Mbappé');

    const result = await anna.waitFor('match:result');
    expect(result.result.scores).toHaveLength(2);

    anna.close();
    bruno.close();
  }, 15_000);

  it('refuse une mise hors tour', async () => {
    const anna = await authenticated('Anna');
    const bruno = await authenticated('Bruno');

    anna.send({ type: 'match:create', sport: 'football' });
    const created = await anna.waitFor('match:state');
    bruno.send({ type: 'match:join', code: created.view.code });
    await bruno.waitFor('match:state');

    anna.send({ type: 'match:ready' });
    bruno.send({ type: 'match:ready' });
    await anna.waitFor('match:lot');

    const state = anna.last('match:state');
    const turn = state?.view.auction?.turn;
    const wrongClient = turn === 'A' ? bruno : anna;
    wrongClient.clear();
    wrongClient.send({ type: 'bid', amount: 3 });

    const error = await wrongClient.waitFor('error');
    expect(error.code).toBe('not_your_turn');

    anna.close();
    bruno.close();
  }, 15_000);

  it('refuse un troisième joueur : aucun spectateur admis', async () => {
    const anna = await authenticated('Anna');
    const bruno = await authenticated('Bruno');
    const curieux = await authenticated('Curieux');

    anna.send({ type: 'match:create', sport: 'football' });
    const created = await anna.waitFor('match:state');
    bruno.send({ type: 'match:join', code: created.view.code });
    await bruno.waitFor('match:state');

    curieux.send({ type: 'match:join', code: created.view.code });
    const error = await curieux.waitFor('error');
    expect(error.code).toBe('match_full');

    anna.close();
    bruno.close();
    curieux.close();
  }, 15_000);

  it('refuse de jouer sans pseudo', async () => {
    const client = new TestClient();
    await client.connect();
    client.send({ type: 'match:create', sport: 'football' });

    const error = await client.waitFor('error');
    expect(error.code).toBe('not_authenticated');
    client.close();
  });

  it('refuse un code de salon inconnu', async () => {
    const client = await authenticated('Anna');
    client.send({ type: 'match:join', code: 'ZZZZZ' });

    const error = await client.waitFor('error');
    expect(error.code).toBe('unknown_code');
    client.close();
  });
});
