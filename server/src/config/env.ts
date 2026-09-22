import 'dotenv/config';
import { z } from 'zod';

/**
 * Configuration par variables d'environnement.
 * Les valeurs par défaut visent l'environnement de développement local
 * (MySQL administré via phpMyAdmin).
 */
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),

  DB_HOST: z.string().default('127.0.0.1'),
  DB_PORT: z.coerce.number().int().positive().default(8889),
  DB_NAME: z.string().default('draft_auction'),
  DB_USER: z.string().default('root'),
  DB_PASSWORD: z.string().default('root'),
  DB_LOGGING: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    'Configuration invalide :',
    parsed.error.flatten().fieldErrors,
  );
  process.exit(1);
}

export const env = parsed.data;

export const isProduction = env.NODE_ENV === 'production';
