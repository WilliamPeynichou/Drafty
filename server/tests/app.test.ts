import { createServer, type Server } from 'node:http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/http/app.js';

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  server = createServer(createApp());
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  if (address === null || typeof address === 'string') {
    throw new Error('Adresse de test indisponible.');
  }
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

describe('application HTTP', () => {
  it('répond 404 en JSON sur une route inconnue', async () => {
    const response = await fetch(`${baseUrl}/api/inexistant`);
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: 'not_found' });
  });

  it('expose un point de santé', async () => {
    const response = await fetch(`${baseUrl}/api/health`);
    expect(response.status).toBe(200);
    const body = (await response.json()) as { status: string; database: string };
    // La base peut être absente en environnement de test : le service répond tout de même.
    expect(['ok', 'degraded']).toContain(body.status);
    expect(['up', 'down']).toContain(body.database);
  });
});
