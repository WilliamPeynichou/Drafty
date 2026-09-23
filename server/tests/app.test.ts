import { createServer, type Server } from 'node:http';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import express, { type Router } from 'express';
import { createApp } from '../src/http/app.js';
import { createHistoryRouter } from '../src/http/routes/history.js';
import { googleAuthorizationUrl } from '../src/http/routes/auth.js';

function createAppWithHistory(historyRouter: Router) {
  const app = express();
  app.use(express.json());
  app.use('/api/history', historyRouter);
  return app;
}

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  server = createServer(createApp());
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  if (address === null || typeof address === 'string') throw new Error('Adresse de test indisponible.');
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

describe('application HTTP', () => {
  it('retourne aussi les matchs où le compte occupait le siège B', async () => {
    const record = {
      id: 'match-1', code: 'ABCDE', sport: 'football', phase: 'results', winnerSeat: 'B',
      scoreA: 40, scoreB: 55, seatAUserId: 'opponent', seatBUserId: 'test-user',
      finishedAt: new Date('2025-01-01T00:00:00Z'), createdAt: new Date('2025-01-01T00:00:00Z'),
    };
    const findAll = vi.fn().mockResolvedValue([record]);
    const router = createHistoryRouter({ database: { findAll }, authenticatedUser: async () => ({ id: 'test-user' }) });
    const historyServer = createServer(createAppWithHistory(router));
    await new Promise<void>((resolve) => historyServer.listen(0, resolve));
    const address = historyServer.address();
    if (!address || typeof address === 'string') throw new Error('Adresse indisponible');

    const response = await fetch(`http://127.0.0.1:${address.port}/api/history`, { headers: { cookie: 'drafty_session=valid' } });
    expect(response.status).toBe(200);
    expect(findAll).toHaveBeenCalled();
    const query = findAll.mock.calls[0]?.[0];
    expect(query?.where).toMatchObject({ phase: 'results' });
    const body = await response.json() as { matches: Array<{ userSeat: string; won: boolean | null }> };
    expect(body.matches[0]).toMatchObject({ userSeat: 'B', won: true });
    await new Promise<void>((resolve) => historyServer.close(() => resolve()));
  });

  it('commence Google OAuth avec state CSRF et redirection officielle', async () => {
    const state = 'state-test-123';
    const destination = new URL(googleAuthorizationUrl(state));
    expect(destination.origin).toBe('https://accounts.google.com');
    expect(destination.searchParams.get('state')).toBe(state);
    expect(destination.searchParams.get('scope')).toBe('openid email profile');
  });

  it('rejette un callback sans cookie state correspondant', async () => {
    const response = await fetch(`${baseUrl}/api/auth/google/callback?code=fake&state=wrong`, { redirect: 'manual' });
    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toContain('google_state_invalid');
  });

  it('répond 404 en JSON sur une route inconnue', async () => {
    const response = await fetch(`${baseUrl}/api/inexistant`);
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: 'not_found' });
  });

  it('expose un point de santé', async () => {
    const response = await fetch(`${baseUrl}/api/health`);
    expect(response.status).toBe(200);
    const body = await response.json() as { status: string; database: string };
    expect(['ok', 'degraded']).toContain(body.status);
    expect(['up', 'down']).toContain(body.database);
  });
});
