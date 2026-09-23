import { randomBytes, timingSafeEqual } from 'node:crypto';
import { Router } from 'express';
import { Op } from 'sequelize';
import { env } from '../../config/env.js';
import { hashPassword, hashSessionToken, createSessionToken, verifyPassword } from '../../auth/password.js';
import { Session, User } from '../../models/index.js';

export const authRouter: Router = Router();
export const SESSION_COOKIE = 'drafty_session';
const OAUTH_STATE_COOKIE = 'drafty_google_state';
const SESSION_DAYS = 30;
const GOOGLE_STATE_TTL_MS = 10 * 60_000;

interface AuthRequest {
  headers: { cookie?: string };
}

export interface SessionIdentity {
  id: string;
  displayName: string;
}

export type SessionLookup = (token: string) => Promise<SessionIdentity | null>;
let sessionLookup: SessionLookup = async (token) => {
  const session = await Session.findOne({ where: { tokenHash: hashSessionToken(token), expiresAt: { [Op.gt]: new Date() } }, include: [{ model: User, as: 'user' }] });
  return session?.user ? { id: session.user.id, displayName: session.user.displayName } : null;
};

export function setSessionLookup(lookup: SessionLookup): void {
  sessionLookup = lookup;
}

function tokenFrom(request: AuthRequest): string | null {
  const raw = request.headers.cookie?.split(';').map((entry) => entry.trim()).find((entry) => entry.startsWith(`${SESSION_COOKIE}=`));
  if (!raw) return null;
  try {
    return decodeURIComponent(raw.slice(SESSION_COOKIE.length + 1));
  } catch {
    return null;
  }
}

function safeUser(user: User) {
  return { id: user.id, displayName: user.displayName, email: user.email, provider: user.provider, createdAt: user.createdAt };
}

async function currentUser(request: AuthRequest): Promise<SessionIdentity | null> {
  const token = tokenFrom(request);
  if (!token) return null;
  return sessionLookup(token);
}

function writeSession(res: { cookie: Function }, token: string): void {
  res.cookie(SESSION_COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: env.NODE_ENV === 'production', maxAge: SESSION_DAYS * 86_400_000, path: '/' });
}

async function openSession(userId: string, res: { cookie: Function }): Promise<void> {
  const token = createSessionToken();
  await Session.create({ userId, tokenHash: hashSessionToken(token), expiresAt: new Date(Date.now() + SESSION_DAYS * 86_400_000) });
  writeSession(res, token);
}

function stateCookieOptions() {
  return { httpOnly: true, sameSite: 'lax' as const, secure: env.NODE_ENV === 'production', maxAge: GOOGLE_STATE_TTL_MS, path: '/api/auth/google' };
}

function stateFrom(request: AuthRequest): string | null {
  const raw = request.headers.cookie?.split(';').map((entry) => entry.trim()).find((entry) => entry.startsWith(`${OAUTH_STATE_COOKIE}=`));
  if (!raw) return null;
  try {
    return decodeURIComponent(raw.slice(OAUTH_STATE_COOKIE.length + 1));
  } catch {
    return null;
  }
}

function safeStateEqual(expected: string, actual: string): boolean {
  const left = Buffer.from(expected);
  const right = Buffer.from(actual);
  return left.length === right.length && timingSafeEqual(left, right);
}

function googleConfigured(): boolean {
  return env.GOOGLE_ID.length > 0 && env.GOOGLE_SECRET_KEY.length > 0;
}

function providerErrorUrl(code: string): string {
  const target = new URL('/', env.CLIENT_ORIGIN);
  target.searchParams.set('auth', code);
  return target.toString();
}

authRouter.get('/google', (_req, res) => {
  if (!googleConfigured()) return res.redirect(providerErrorUrl('google_not_configured'));
  const authorization = googleAuthorizationUrl(randomBytes(32).toString('base64url'));
  res.cookie(OAUTH_STATE_COOKIE, new URL(authorization).searchParams.get('state') ?? '', stateCookieOptions());
  return res.redirect(authorization);
});

export function googleAuthorizationUrl(state: string): string {
  const authorization = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authorization.searchParams.set('client_id', env.GOOGLE_ID);
  authorization.searchParams.set('redirect_uri', env.GOOGLE_CALLBACK_URL);
  authorization.searchParams.set('response_type', 'code');
  authorization.searchParams.set('scope', 'openid email profile');
  authorization.searchParams.set('state', state);
  authorization.searchParams.set('prompt', 'select_account');
  return authorization.toString();
}

authRouter.get('/google/callback', async (req, res) => {
  const clearStateCookie = () => res.clearCookie(OAUTH_STATE_COOKIE, { path: '/api/auth/google' });
  const state = stateFrom(req);
  const queryState = typeof req.query.state === 'string' ? req.query.state : '';
  if (!state || !queryState || !safeStateEqual(state, queryState)) {
    clearStateCookie();
    return res.redirect(providerErrorUrl('google_state_invalid'));
  }
  clearStateCookie();
  if (!googleConfigured()) return res.redirect(providerErrorUrl('google_not_configured'));
  if (req.query.error || typeof req.query.code !== 'string') return res.redirect(providerErrorUrl('google_denied'));

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: req.query.code,
        client_id: env.GOOGLE_ID,
        client_secret: env.GOOGLE_SECRET_KEY,
        redirect_uri: env.GOOGLE_CALLBACK_URL,
        grant_type: 'authorization_code',
      }),
    });
    if (!tokenResponse.ok) return res.redirect(providerErrorUrl('google_token_failed'));
    const tokens = await tokenResponse.json() as { access_token?: string; id_token?: string };
    if (!tokens.access_token && !tokens.id_token) return res.redirect(providerErrorUrl('google_token_invalid'));

    const profileResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { authorization: `Bearer ${tokens.access_token ?? tokens.id_token}` },
    });
    if (!profileResponse.ok) return res.redirect(providerErrorUrl('google_profile_failed'));
    const profile = await profileResponse.json() as { sub?: string; email?: string; email_verified?: boolean; name?: string };
    if (!profile.sub || !profile.email || profile.email_verified !== true) return res.redirect(providerErrorUrl('google_profile_invalid'));

    let user = await User.findOne({ where: { googleId: profile.sub } });
    if (!user) {
      const email = profile.email.trim().toLowerCase();
      user = await User.findOne({ where: { email } });
      if (user) {
        if (user.provider !== 'google') return res.redirect(providerErrorUrl('google_account_conflict'));
        user.googleId = profile.sub;
        await user.save();
      } else {
        user = await User.create({
          displayName: profile.name?.trim().slice(0, 40) || email.split('@')[0] || 'Joueur',
          email,
          provider: 'google',
          googleId: profile.sub,
          passwordHash: null,
        });
      }
    }

    await openSession(user.id, res);
    return res.redirect(env.CLIENT_ORIGIN);
  } catch (error) {
    console.error('Échec du callback Google OAuth :', error instanceof Error ? error.message : 'erreur inconnue');
    return res.redirect(providerErrorUrl('google_failed'));
  }
});

authRouter.post('/register', async (req, res) => {
  const { displayName, email, password } = req.body as { displayName?: string; email?: string; password?: string };
  if (!displayName?.trim() || !email?.trim() || !password || password.length < 8) return res.status(400).json({ error: 'invalid_input', message: 'Pseudo, e-mail et mot de passe de 8 caractères minimum requis.' });
  const normalizedEmail = email.trim().toLowerCase();
  if (await User.findOne({ where: { email: normalizedEmail } })) return res.status(409).json({ error: 'email_taken' });
  const user = await User.create({ displayName: displayName.trim().slice(0, 40), email: normalizedEmail, provider: 'local', passwordHash: await hashPassword(password) });
  await openSession(user.id, res);
  return res.status(201).json({ user: safeUser(user) });
});

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  const user = email ? await User.findOne({ where: { email: email.trim().toLowerCase(), provider: 'local' } }) : null;
  if (!user?.passwordHash || !password || !(await verifyPassword(password, user.passwordHash))) return res.status(401).json({ error: 'invalid_credentials' });
  await openSession(user.id, res);
  return res.json({ user: safeUser(user) });
});

authRouter.post('/logout', async (req, res) => {
  const token = tokenFrom(req);
  if (token) await Session.destroy({ where: { tokenHash: hashSessionToken(token) } });
  res.clearCookie(SESSION_COOKIE, { path: '/' });
  return res.status(204).end();
});

authRouter.get('/me', async (req, res) => {
  const identity = await currentUser(req);
  if (!identity) return res.status(401).json({ error: 'unauthenticated' });
  const user = await User.findByPk(identity.id);
  return user ? res.json({ user: safeUser(user) }) : res.status(401).json({ error: 'unauthenticated' });
});

export async function authenticatedUser(request: AuthRequest): Promise<SessionIdentity | null> {
  return currentUser(request);
}

export async function authenticatedIdentity(request: AuthRequest): Promise<{ userId: string; displayName: string } | null> {
  const user = await currentUser(request);
  return user ? { userId: user.id, displayName: user.displayName } : null;
}
