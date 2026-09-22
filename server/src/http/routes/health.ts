import { Router } from 'express';
import { sequelize } from '../../db/sequelize.js';

export const healthRouter: Router = Router();

/** Suivi de l'état de santé du service et de sa base. */
healthRouter.get('/', async (_req, res) => {
  let database = 'up';
  try {
    await sequelize.authenticate();
  } catch {
    database = 'down';
  }

  res.json({
    status: database === 'up' ? 'ok' : 'degraded',
    database,
    uptime: Math.round(process.uptime()),
    at: Date.now(),
  });
});
