import { useEffect, useState, type FormEvent } from 'react';
import type { Account, MatchHistoryItem } from '../api.js';
import { GoogleMark } from './GoogleMark.js';

interface AuthPageProps {
  mode: 'login' | 'register';
  busy: boolean;
  error: string | null;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (displayName: string, email: string, password: string) => Promise<void>;
  onContinueGuest: (displayName: string) => void;
}

const PAGE_COPY = {
  login: { eyebrow: 'Bon retour', title: 'Reprenez la partie.', description: 'Connectez-vous pour retrouver votre profil et vos résultats.', submit: 'Se connecter' },
  register: { eyebrow: 'Créer votre compte', title: 'Gardez vos victoires.', description: 'Un profil pour conserver vos parties et retrouver votre parcours.', submit: 'Créer mon compte' },
};

export function AuthPage({ mode, busy, error, onLogin, onRegister, onContinueGuest }: AuthPageProps) {
  const copy = PAGE_COPY[mode];
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [guestName, setGuestName] = useState('');
  const [googleError, setGoogleError] = useState<string | null>(null);

  useEffect(() => {
    const errorCode = new URLSearchParams(window.location.search).get('auth');
    if (!errorCode) return;
    const errors: Record<string, string> = {
      google_not_configured: 'La connexion Google n’est pas encore configurée sur ce serveur.',
      google_state_invalid: 'La demande de connexion a expiré. Réessayez.',
      google_denied: 'La connexion Google a été annulée.',
      google_account_conflict: 'Cette adresse correspond à un compte local. Connectez-vous avec votre mot de passe.',
      google_token_failed: 'Google n’a pas accepté la demande de connexion. Réessayez.',
    };
    setGoogleError(errors[errorCode] ?? 'La connexion Google a échoué. Réessayez.');
    window.history.replaceState({}, '', window.location.pathname);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === 'login') await onLogin(email.trim(), password);
    else await onRegister(displayName.trim(), email.trim(), password);
  }

  return (
    <main className="account-page auth-page">
      <aside className="auth-aside">
        <button type="button" className="auth-aside__brand" onClick={() => { window.history.pushState({}, '', '/'); window.dispatchEvent(new PopStateEvent('popstate')); }}><span className="brand-glyph">D</span><span>DRAFTY</span></button>
        <div className="auth-aside__story"><p className="eyebrow">Draft aux enchères · 1 contre 1</p><h1 className="auth-aside__headline">Devinez juste.<br />Enchérissez mieux.</h1><p className="auth-aside__copy">Des joueurs masqués, des indices à décrypter et un budget que vous partagez à chaque tour.</p><div className="auth-aside__stats"><div><strong>20 s</strong><span>pour décider</span></div><div><strong>1v1</strong><span>face à face</span></div><div><strong>44 €</strong><span>budget de départ</span></div></div></div>
        <p className="auth-aside__foot">Le flair fait le match.</p>
      </aside>

      <section className="auth-main"><div className="auth-card">
        <div className="auth-card__mobile-brand"><span className="brand-glyph">D</span><span>DRAFTY</span></div>
        <header className="auth-heading"><p className="eyebrow">{copy.eyebrow}</p><h2>{copy.title}</h2><p>{copy.description}</p></header>
        <a className="google-button" href="/api/auth/google"><GoogleMark /><span>Continuer avec Google</span></a>
        <div className="auth-divider"><span>ou avec votre e-mail</span></div>

        <form className="auth-form" onSubmit={(event) => void submit(event)}>
          {mode === 'register' && <label className="auth-field"><span>Pseudo</span><input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Votre nom de joueur" minLength={2} maxLength={40} autoComplete="nickname" required /></label>}
          <label className="auth-field"><span>Adresse e-mail</span><input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="vous@exemple.fr" type="email" autoComplete="email" required /></label>
          <label className="auth-field"><span>Mot de passe</span><input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="8 caractères minimum" type="password" minLength={8} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required /></label>
          {error && <p className="auth-message" role="alert">{error}</p>}{googleError && <p className="auth-message" role="alert">{googleError}</p>}
          <button className="auth-submit" type="submit" disabled={busy || (mode === 'register' && displayName.trim().length < 2)}>{busy ? 'Connexion en cours…' : copy.submit}<span aria-hidden="true">→</span></button>
        </form>

        <div className="auth-switch">{mode === 'login' ? <>Nouveau sur Drafty ? <a href="/inscription">Créer un compte</a></> : <>Vous avez déjà un compte ? <a href="/connexion">Se connecter</a></>}</div>
        <details className="guest-details"><summary>Continuer sans compte</summary><form className="guest-form" onSubmit={(event) => { event.preventDefault(); onContinueGuest(guestName.trim()); }}><label className="auth-field"><span>Pseudo de jeu</span><input value={guestName} onChange={(event) => setGuestName(event.target.value)} placeholder="2 caractères minimum" minLength={2} maxLength={24} required /></label><button type="submit" className="guest-submit" disabled={busy || guestName.trim().length < 2}>Jouer en invité</button></form></details>
      </div><footer className="auth-legal">En jouant, vous acceptez de garder vos enchères secrètes jusqu’au bon moment.</footer></section>
    </main>
  );
}

export interface ProfilePageProps {
  account: Account;
  history: MatchHistoryItem[];
  busy: boolean;
  onLogout: () => Promise<void>;
  onPlay: () => void;
}

export function ProfilePage({ account, history, busy, onLogout, onPlay }: ProfilePageProps) {
  const wins = history.filter((match) => match.result === 'win').length;
  const losses = history.filter((match) => match.result === 'loss').length;
  const draws = history.filter((match) => match.result === 'draw').length;
  return (
    <main className="account-page profile-page">
      <header className="profile-hero"><div className="profile-hero__top"><p className="eyebrow">Espace joueur · Profil</p><span className="profile-provider">{account.email ? 'COMPTE VÉRIFIÉ' : 'COMPTE DRAFTY'}</span></div><div className="profile-identity"><div className="profile-avatar" aria-hidden="true">{account.displayName.slice(0, 1).toUpperCase()}</div><div><h1>{account.displayName}</h1><p>{account.email}</p></div><button className="profile-play" type="button" onClick={onPlay}>Nouvelle partie <span>↗</span></button></div></header>
      <section className="profile-stats" aria-label="Statistiques de jeu"><div className="profile-stat"><span>Parties jouées</span><strong>{history.length}</strong></div><div className="profile-stat"><span>Victoires</span><strong>{String(wins).padStart(2, '0')}</strong></div><div className="profile-stat"><span>Défaites</span><strong>{String(losses).padStart(2, '0')}</strong></div><div className="profile-stat"><span>Égalités</span><strong>{String(draws).padStart(2, '0')}</strong></div></section>
      <section className="profile-history"><div className="profile-section-heading"><div><p className="eyebrow">Votre parcours</p><h2>Historique des parties</h2></div><span>{history.length} {history.length === 1 ? 'partie' : 'parties'}</span></div>
        {history.length === 0 ? <div className="profile-empty"><span className="profile-empty__mark">↗</span><h3>Votre première enchère vous attend.</h3><p>Jouez une partie pour commencer à construire votre historique.</p><button type="button" className="profile-play profile-play--small" onClick={onPlay}>Choisir une partie</button></div> : <div className="history-table-wrap"><table className="history-table"><thead><tr><th>Résultat</th><th>Sport</th><th>Score</th><th>Date</th></tr></thead><tbody>{history.map((match) => {
          const result = match.result ?? 'draw';
          const date = match.playedAt ? new Date(match.playedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
          return <tr key={match.id}><td><span className={`history-result history-result--${result}`}>{result === 'win' ? 'Victoire' : result === 'loss' ? 'Défaite' : 'Égalité'}</span></td><td>{match.sport === 'basketball' ? 'Basket' : 'Football'}</td><td className="history-score">{match.score ?? '—'} <span>—</span> {match.opponentScore ?? '—'}</td><td>{date}</td></tr>;
        })}</tbody></table></div>}
      </section>
      <footer className="profile-footer"><p>Une mauvaise enchère ne définit pas un joueur.</p><button type="button" className="profile-logout" disabled={busy} onClick={() => void onLogout()}>Se déconnecter</button></footer>
    </main>
  );
}
