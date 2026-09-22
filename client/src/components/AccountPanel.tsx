import { FormEvent, useState } from 'react';
import type { Account } from '../api.js';

interface AccountPanelProps {
  account: Account | null;
  busy: boolean;
  error: string | null;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (displayName: string, email: string, password: string) => Promise<void>;
  onLogout: () => Promise<void>;
}

export function AccountPanel({ account, busy, error, onLogin, onRegister, onLogout }: AccountPanelProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === 'login') await onLogin(email, password);
    else await onRegister(displayName, email, password);
  }

  if (account) {
    return (
      <section className="panel" aria-label="Votre compte">
        <h2 className="panel__title">Compte</h2>
        <div className="field-row">
          <p className="identified">Connecté en tant que <strong>{account.displayName}</strong> · {account.email}</p>
          <button type="button" className="btn btn--ghost" disabled={busy} onClick={() => void onLogout()}>
            Se déconnecter
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="panel" aria-label="Connexion ou création de compte">
      <h2 className="panel__title">Compte local</h2>
      <div className="choice-row" role="tablist" aria-label="Mode d'authentification">
        <button type="button" className={`choice ${mode === 'login' ? 'choice--active' : ''}`} onClick={() => setMode('login')}>
          Connexion
        </button>
        <button type="button" className={`choice ${mode === 'register' ? 'choice--active' : ''}`} onClick={() => setMode('register')}>
          Créer un compte
        </button>
      </div>
      <form onSubmit={(event) => void submit(event)}>
        {mode === 'register' && (
          <p className="field-row" style={{ marginTop: 10 }}>
            <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Pseudo" minLength={2} maxLength={24} required aria-label="Pseudo" />
          </p>
        )}
        <p className="field-row" style={{ marginTop: 10 }}>
          <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="adresse@email.fr" type="email" required aria-label="Adresse e-mail" autoComplete="email" />
          <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mot de passe" type="password" minLength={6} required aria-label="Mot de passe" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
          <button type="submit" className="btn btn--accent" disabled={busy || (mode === 'register' && displayName.trim().length < 2)}>
            {busy ? 'Patientez…' : mode === 'login' ? 'Se connecter' : 'Créer'}
          </button>
        </p>
      </form>
      {error && <p className="hint-text" role="alert">{error}</p>}
    </section>
  );
}
