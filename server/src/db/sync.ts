/**
 * Synchronisation du schéma MySQL.
 * Usage : pnpm db:sync [--force]
 * --force supprime et recrée les tables (développement uniquement).
 */
import { env } from '../config/env.js';
import { sequelize } from './sequelize.js';
import '../models/index.js';

const force = process.argv.includes('--force');

if (force && env.NODE_ENV === 'production') {
  console.error('Refus : --force est interdit en production.');
  process.exit(1);
}

try {
  await sequelize.authenticate();
  await sequelize.sync({ force, alter: !force });
  console.log(
    `Schéma synchronisé sur ${env.DB_NAME}@${env.DB_HOST}:${env.DB_PORT}${force ? ' (recréé)' : ''}.`,
  );
} catch (error) {
  console.error('Échec de la synchronisation :', error);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
