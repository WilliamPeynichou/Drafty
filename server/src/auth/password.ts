import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: string,
  keyLength: number,
) => Promise<Buffer>;
const KEY_LENGTH = 64;

/** Hash de mot de passe avec sel aléatoire, au format `scrypt$sel$hash`. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('base64url');
  const derived = await scrypt(password, salt, KEY_LENGTH);
  return `scrypt$${salt}$${Buffer.from(derived).toString('base64url')}`;
}

/** Comparaison à temps constant d'un mot de passe avec son hash stocké. */
export async function verifyPassword(password: string, serialized: string): Promise<boolean> {
  const [algorithm, salt, expected] = serialized.split('$');
  if (algorithm !== 'scrypt' || !salt || !expected) return false;

  try {
    const actual = Buffer.from(await scrypt(password, salt, KEY_LENGTH));
    const expectedBuffer = Buffer.from(expected, 'base64url');
    return expectedBuffer.length === actual.length && timingSafeEqual(expectedBuffer, actual);
  } catch {
    return false;
  }
}

/** Les jetons bruts ne sont jamais persistés en base. */
export function createSessionToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
