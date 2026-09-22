import { Sequelize } from 'sequelize';
import { env } from '../config/env.js';

/** Connexion unique à la base MySQL de l'application. */
export const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
  host: env.DB_HOST,
  port: env.DB_PORT,
  dialect: 'mysql',
  logging: env.DB_LOGGING ? console.log : false,
  define: {
    underscored: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
  },
  pool: { max: 10, min: 0, idle: 10_000 },
});

export async function assertDatabaseConnection(): Promise<void> {
  await sequelize.authenticate();
}
