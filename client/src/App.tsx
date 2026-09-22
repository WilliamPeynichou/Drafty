import { useEffect, useState } from 'react';
import { getRules, type Sport } from '@draft/shared';
import { useRealtime } from './hooks/useRealtime.js';

interface Health {
  status: string;
  database: string;
  uptime: number;
}

const WS_URL = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`;

export function App() {
  const [sport, setSport] = useState<Sport>('football');
  const [pseudo, setPseudo] = useState('');
  const [health, setHealth] = useState<Health | null>(null);
  const { status, messages, send } = useRealtime(WS_URL);

  useEffect(() => {
    fetch('/api/health')
      .then((response) => response.json() as Promise<Health>)
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  const rules = getRules(sport);
  const lastMessage = messages[messages.length - 1];

  return (
    <main className="page">
      <header className="page__header">
        <h1>Draft aux enchères</h1>
        <p className="tagline">
          Deviner qui se cache derrière l'indice, évaluer ce qu'il vaut,
          savoir renoncer à temps.
        </p>
      </header>

      <section className="card">
        <h2>Choisir un sport</h2>
        <div className="sports">
          {(['football', 'basketball'] as const).map((value) => (
            <button
              key={value}
              type="button"
              className={`sport ${sport === value ? 'sport--active' : ''}`}
              onClick={() => setSport(value)}
            >
              {value === 'football' ? 'Football' : 'Basket'}
            </button>
          ))}
        </div>
        <p className="rules">
          {rules.totalRounds} tours · budget de départ {rules.startingBudget} €
          {rules.positionLimits.GK ? ` · ${rules.positionLimits.GK} gardiens maximum` : ''}
        </p>
      </section>

      <section className="card">
        <h2>Entrer en mode invité</h2>
        <div className="row">
          <input
            value={pseudo}
            onChange={(event) => setPseudo(event.target.value)}
            placeholder="Votre pseudo"
            maxLength={24}
          />
          <button
            type="button"
            disabled={status !== 'open' || pseudo.trim().length < 2}
            onClick={() => send({ type: 'auth', displayName: pseudo })}
          >
            Valider
          </button>
        </div>
      </section>

      <footer className="status">
        <span className={`dot dot--${status}`} />
        Temps réel : {status === 'open' ? 'connecté' : status === 'connecting' ? 'connexion...' : 'déconnecté'}
        {' · '}
        API : {health ? health.status : 'injoignable'}
        {' · '}
        Base : {health ? health.database : 'inconnue'}
        {lastMessage ? ` · dernier message : ${lastMessage.type}` : ''}
      </footer>
    </main>
  );
}
