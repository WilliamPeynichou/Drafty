import { useState } from 'react';
import type { Account, MatchHistoryItem } from '../api.js';
import { GoogleMark } from './GoogleMark.js';

interface AccountPanelProps {
  account: Account | null;
  history: MatchHistoryItem[];
  busy: boolean;
  error: string | null;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (displayName: string, email: string, password: string) => Promise<void>;
  onLogout: () => Promise<void>;
}

export function AccountPanel({ account, history, busy, error, onLogin, onRegister, onLogout }: AccountPanelProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (account) return <section className="panel" aria-label="Votre compte"><h2 className="panel__title">Compte</h2><p className="identified">Connecté en tant que <strong>{account.displayName}</strong></p><button type="button" className="btn btn--ghost" disabled={busy} onClick={() => void onLogout()}>Se déconnecter</button><h3>Historique des parties</h3>{history.length === 0 ? <p className="hint-text">Aucune partie terminée.</p> : <ul>{history.map((match) => <li key={match.id}>{match.sport} · {match.result ?? 'résultat indisponible'} · {match.score ?? '—'} / {match.opponentScore ?? '—'}</li>)}</ul>}</section>;

  return (
    <section className="legacy-account" aria-label="Compte joueur">
      <div className="legacy-account__switch"><button type="button" onClick={() => setMode('login')} className={mode === 'login' ? 'is-active' : ''}>Connexion</button><button type="button" onClick={() => setMode('register')} className={mode === 'register' ? 'is-active' : ''}>Inscription</button></div>
      <a className="google-button google-button--compact" href="/api/auth/google"><GoogleMark /><span>Continuer avec Google</span></a>
      <p className="hint-text">{error}</p>
      {mode === 'login' ? <LoginForm email={email} password={password} setEmail={setEmail} setPassword={setPassword} busy={busy} onLogin={onLogin} /> : <RegisterForm displayName={displayName} email={email} password={password} setDisplayName={setDisplayName} setEmail={setEmail} setPassword={setPassword} busy={busy} onRegister={onRegister} />}
    </section>
  );
}

function LoginForm({ email, password, setEmail, setPassword, busy, onLogin }: { email: string; password: string; setEmail: (value: string) => void; setPassword: (value: string) => void; busy: boolean; onLogin: AccountPanelProps['onLogin'] }) {
  return <form className="legacy-account__form" onSubmit={(event) => { event.preventDefault(); void onLogin(email, password); }}><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" placeholder="E-mail" required /><input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" placeholder="Mot de passe" required /><button className="btn" type="submit" disabled={busy}>Connexion</button></form>;
}

function RegisterForm({ displayName, email, password, setDisplayName, setEmail, setPassword, busy, onRegister }: { displayName: string; email: string; password: string; setDisplayName: (value: string) => void; setEmail: (value: string) => void; setPassword: (value: string) => void; busy: boolean; onRegister: AccountPanelProps['onRegister'] }) {
  return <form className="legacy-account__form" onSubmit={(event) => { event.preventDefault(); void onRegister(displayName, email, password); }}><input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Pseudo" minLength={2} maxLength={40} required /><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" placeholder="E-mail" required /><input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="new-password" placeholder="8 caractères minimum" minLength={8} required /><button className="btn" type="submit" disabled={busy}>Créer un compte</button></form>;
}
