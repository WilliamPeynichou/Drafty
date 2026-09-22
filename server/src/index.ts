import { createServer } from 'node:http';
import { env } from './config/env.js';
import { assertDatabaseConnection } from './db/sequelize.js';
import { createApp } from './http/app.js';
import { RealtimeGateway } from './realtime/gateway.js';
import './models/index.js';

const app = createApp();

const server = createServer(app);

const gateway = new RealtimeGateway(server);

try {
  await assertDatabaseConnection();
  console.log(`Base MySQL connectée : ${env.DB_NAME}@${env.DB_HOST}:${env.DB_PORT}`);
} catch (error) {
  // Le service démarre quand même : /api/health signalera la base indisponible.
  console.warn(
    'Base MySQL injoignable au démarrage.',
    error instanceof Error ? error.message : error,
  );
}

server.listen(env.PORT, () => {
  console.log(`API prête sur http://localhost:${env.PORT}`);
  console.log(`WebSocket prêt sur ws://localhost:${env.PORT}/ws`);
});

const shutdown = async (signal: string): Promise<void> => {
  console.log(`\n${signal} reçu, arrêt en cours...`);
  await gateway.close();
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5_000).unref();
};

process.on('SIGINT', () => void shutdown('SIGINT'));

process.on('SIGTERM', () => void shutdown('SIGTERM'));
