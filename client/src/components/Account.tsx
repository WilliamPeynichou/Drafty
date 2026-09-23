import { useEffect, useState } from 'react';

interface Profile { id: string; displayName: string; email: string | null; createdAt: string; }
interface HistoryMatch { id: string; sport: string; scoreA: number | null; scoreB: number | null; finishedAt: string | null; }

export function Account() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [history, setHistory] = useState<HistoryMatch[]>([]);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ displayName: '', email: '', password: '' });
  const [error, setError] = useState('');

  const refresh = async () => {
    const response = await fetch('/api/auth/me', { credentials: 'include' });
    if (!response.ok) return;
    const data = await response.json() as { user: Profile };
    setProfile(data.user);
    const historyResponse = await fetch('/api/history', { credentials: 'include' });
    if (historyResponse.ok) {
      const historyData = await historyResponse.json() as { matches: HistoryMatch[] };
      setHistory(historyData.matches);
    }
  };

  useEffect(() => { void refresh(); }, []);

  if (profile) return <section className="account"><p className="eyebrow">Profil</p><h2>{profile.displayName}</h2><p>{profile.email}</p><h3>Historique</h3>{history.length ? <ul>{history.map((match) => <li key={match.id}>{match.sport} · {match.scoreA ?? '—'} / {match.scoreB ?? '—'}</li>)}</ul> : <p>Aucune partie terminée.</p>}</section>;

  const submit = async () => {
    setError('');
    const body = mode === 'register' ? form : { email: form.email, password: form.password };
    const response = await fetch(`/api/auth/${mode === 'register' ? 'register' : 'login'}`, { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    if (!response.ok) { setError('Connexion impossible. Vérifie tes informations.'); return; }
    await refresh();
  };

  return <section className="account"><p className="eyebrow">Compte</p><h2>{mode === 'login' ? 'Connexion' : 'Créer un compte'}</h2>{mode === 'register' && <input placeholder="Pseudo" value={form.displayName} onChange={(event) => setForm({ ...form, displayName: event.target.value })} />}<input placeholder="E-mail" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /><input type="password" placeholder="Mot de passe" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /><button className="btn btn--accent" type="button" onClick={() => void submit()}>{mode === 'login' ? 'Se connecter' : 'Créer le compte'}</button><button className="btn btn--ghost" type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Créer un compte' : 'J’ai déjà un compte'}</button>{error && <p>{error}</p>}</section>;
}
