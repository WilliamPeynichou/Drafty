import path from 'node:path';
import cors from 'cors';
import express, { type Request, type Response, type NextFunction } from 'express';
import { env } from '../config/env.js';
import { healthRouter } from './routes/health.js';
import { catalogRouter } from './routes/catalog.js';
import { authRouter } from './routes/auth.js';
import { historyRouter } from './routes/history.js';

export function createApp() {
  const app = express();

  if (env.TRUST_PROXY > 0) app.set('trust proxy', env.TRUST_PROXY);

  app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '100kb' }));

  app.use('/api/health', healthRouter);
  app.use('/api/catalog', catalogRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/history', historyRouter);

  if (env.PUBLIC_DIR) {
    const publicDir = path.resolve(env.PUBLIC_DIR);
    app.use(express.static(publicDir, { index: false, maxAge: '7d' }));
    // Routes du client (SPA) : tout GET hors /api renvoie index.html.
    app.get(/^(?!\/api\/).*/, (_req: Request, res: Response) => {
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(path.join(publicDir, 'index.html'));
    });
  }

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'not_found' });
  });

  app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Erreur non interceptée :', error);
    res.status(500).json({ error: 'internal_error' });
  });

  return app;
}
