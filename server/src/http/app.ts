import cors from 'cors';
import express, { type Request, type Response, type NextFunction } from 'express';
import { env } from '../config/env.js';
import { healthRouter } from './routes/health.js';
import { catalogRouter } from './routes/catalog.js';
import { authRouter } from './routes/auth.js';
import { historyRouter } from './routes/history.js';

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '100kb' }));

  app.use('/api/health', healthRouter);
  app.use('/api/catalog', catalogRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/history', historyRouter);

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'not_found' });
  });

  app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Erreur non interceptée :', error);
    res.status(500).json({ error: 'internal_error' });
  });

  return app;
}
