export interface Account {
  id: number | string;
  email: string;
  displayName: string;
  createdAt?: string;
}

export interface MatchHistoryItem {
  id: number | string;
  sport?: string;
  opponent?: string;
  result?: 'win' | 'loss' | 'draw' | string;
  score?: number | string;
  opponentScore?: number | string;
  playedAt?: string;
  userSeat?: 'A' | 'B';
  won?: boolean | null;
}

interface ApiEnvelope<T> {
  data?: T;
  user?: T;
  account?: T;
  history?: T;
  matches?: T;
  message?: string;
  error?: string;
}

function messageFrom(body: unknown, fallback: string): string {
  if (body && typeof body === 'object') {
    const value = body as { message?: unknown; error?: unknown };
    if (typeof value.message === 'string') return value.message;
    if (typeof value.error === 'string') return value.error;
  }
  return fallback;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...init?.headers },
      ...init,
    });
  } catch {
    throw new Error('Le serveur est inaccessible. Réessayez dans un instant.');
  }

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error(messageFrom(body, 'Une erreur est survenue.'));
  return body as T;
}

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function text(value: unknown): string | undefined {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : undefined;
}

function accountFrom(value: unknown): Account | null {
  const item = record(value);
  if (!item) return null;
  const id = item.id ?? item.userId;
  const email = text(item.email);
  const displayName = text(item.displayName ?? item.pseudo ?? item.username ?? item.name);
  if ((typeof id !== 'number' && typeof id !== 'string') || !email || !displayName) return null;
  return { id, email, displayName, createdAt: text(item.createdAt) };
}

function unwrapAccount(body: ApiEnvelope<unknown>): Account | null {
  return accountFrom(body.data) ?? accountFrom(body.user) ?? accountFrom(body.account) ?? accountFrom(body);
}

export async function getCurrentAccount(): Promise<Account | null> {
  try {
    const response = await fetch('/api/auth/me', { credentials: 'include' });
    if (response.status === 401) return null;
    if (!response.ok) throw new Error('Chargement du compte impossible.');
    const body = await response.json() as { user: Account };
    return body.user;
  } catch (error) {
    if (error instanceof Error && /authentifi|connect|unauthoriz|401/i.test(error.message)) return null;
    throw error;
  }
}

export async function login(email: string, password: string): Promise<Account> {
  const body = await request<ApiEnvelope<unknown>>('/api/auth/login', {
    method: 'POST', body: JSON.stringify({ email, password }),
  });
  const account = unwrapAccount(body);
  if (!account) throw new Error('Réponse de connexion invalide.');
  return account;
}

export async function register(displayName: string, email: string, password: string): Promise<Account> {
  const body = await request<ApiEnvelope<unknown>>('/api/auth/register', {
    method: 'POST', body: JSON.stringify({ displayName, pseudo: displayName, email, password }),
  });
  const account = unwrapAccount(body);
  if (!account) throw new Error('Réponse de création de compte invalide.');
  return account;
}

export async function logout(): Promise<void> {
  await request<unknown>('/api/auth/logout', { method: 'POST' });
}

function historyItem(value: unknown): MatchHistoryItem | null {
  const item = record(value);
  if (!item) return null;
  const id = item.id ?? item.matchId;
  if (typeof id !== 'string' && typeof id !== 'number') return null;
  return {
    id,
    sport: text(item.sport),
    opponent: text(item.opponent ?? item.opponentName),
    score: text(item.userSeat === 'B' ? item.scoreB : item.scoreA),
    opponentScore: text(item.userSeat === 'B' ? item.scoreA : item.scoreB),
    result: item.won === null ? 'draw' : item.won === true ? 'win' : item.won === false ? 'loss' : text(item.result ?? item.outcome),
    playedAt: text(item.playedAt ?? item.createdAt ?? item.finishedAt),
  };
}

export async function getHistory(): Promise<MatchHistoryItem[]> {
  const body = await request<ApiEnvelope<unknown>>('/api/history');
  const raw = Array.isArray(body) ? body : body.history ?? body.matches ?? body.data;
  return Array.isArray(raw) ? raw.map(historyItem).filter((item): item is MatchHistoryItem => item !== null) : [];
}
