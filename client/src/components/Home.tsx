import { useState } from 'react';
import { getRules, type Sport } from '@draft/shared';

interface HomeProps {
  connected: boolean;
  displayName: string | null;
  onAuthenticate: (pseudo: string) => void;
  onCreate: (sport: Sport) => void;
  onCreateBot: (sport: Sport, profile: 'prudent' | 'aggressive') => void;
  onJoin: (code: string) => void;
}

const SPORT_LABELS: Record<Sport, string> = {
  football: 'Football',
  basketball: 'Basket',
};

/** Les deux sports proposés au lancement, dans l'ordre d'affichage. */
const SPORTS: readonly Sport[] = ['football', 'basketball'];

/** Écran d'accueil : pseudo, choix du sport, création ou jonction d'un salon. */
export function Home({ connected, displayName, onAuthenticate, onCreate, onCreateBot, onJoin }: HomeProps) {
  const [pseudo, setPseudo] = useState('');
  const [sport, setSport] = useState<Sport>('football');
  const [botProfile, setBotProfile] = useState<'prudent' | 'aggressive'>('prudent');
  const [code, setCode] = useState('');

  const rules = getRules(sport);
  const identified = displayName !== null;

  return (
    <div className="home">
      <header className="home__hero">
        <p className="eyebrow">Draft aux enchères · 1 contre 1</p>
        <h1 className="display">
          Devinez.
          <br />
          Enchérissez.
          <br />
          <span className="display--accent">Renoncez à temps.</span>
        </h1>
        <p className="lede">
          Onze joueurs masqués, un indice chacun, un budget visible de tous.
          Le meilleur effectif l'emporte.
        </p>
      </header>

      <section className="panel">
        <h2 className="panel__title">01 · Votre pseudo</h2>
        {identified ? (
          <p className="identified">
            Connecté en tant que <strong>{displayName}</strong>
          </p>
        ) : (
          <div className="field-row">
            <input
              value={pseudo}
              onChange={(event) => setPseudo(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && pseudo.trim().length >= 2) onAuthenticate(pseudo);
              }}
              placeholder="Deux caractères minimum"
              maxLength={24}
              aria-label="Pseudo"
            />
            <button
              type="button"
              className="btn btn--accent"
              disabled={!connected || pseudo.trim().length < 2}
              onClick={() => onAuthenticate(pseudo)}
            >
              Valider
            </button>
          </div>
        )}
      </section>

      <section className="panel">
        <h2 className="panel__title">02 · Le sport</h2>
        <div className="choice-row">
          {SPORTS.map((value) => (
            <button
              key={value}
              type="button"
              className={`choice ${sport === value ? 'choice--active' : ''}`}
              onClick={() => setSport(value)}
            >
              <span className="choice__label">{SPORT_LABELS[value]}</span>
              <span className="choice__meta">
                {getRules(value).totalRounds} tours · {getRules(value).startingBudget} €
              </span>
            </button>
          ))}
        </div>
        <p className="hint-text">
          {rules.totalRounds} enchères, budget de {rules.startingBudget} €, un point par euro non dépensé
          {rules.positionLimits.GK ? ` · ${rules.positionLimits.GK} gardiens au maximum` : ''}.
        </p>
      </section>

      <section className="panel">
        <h2 className="panel__title">03 · La partie</h2>
        <div className="start-grid">
          <div className="start-card">
            <h3>Créer un salon</h3>
            <p>Vous recevez un code à partager avec votre adversaire.</p>
            <button
              type="button"
              className="btn btn--accent"
              disabled={!identified}
              onClick={() => onCreate(sport)}
            >
              Créer la partie
            </button>
          </div>
          <div className="start-card">
            <h3>Jouer contre IA</h3>
            <p>Adversaire serveur. Il respecte les mêmes règles et budgets.</p>
            <div className="bot-options" role="group" aria-label="Niveau de l'intelligence artificielle">
              <button
                type="button"
                className={`bot-option ${botProfile === 'prudent' ? 'bot-option--active' : ''}`}
                onClick={() => setBotProfile('prudent')}
              >
                Prudent
              </button>
              <button
                type="button"
                className={`bot-option ${botProfile === 'aggressive' ? 'bot-option--active' : ''}`}
                onClick={() => setBotProfile('aggressive')}
              >
                Agressif
              </button>
            </div>
            <button
              type="button"
              className="btn btn--accent"
              disabled={!identified}
              onClick={() => onCreateBot(sport, botProfile)}
            >
              Lancer contre IA
            </button>
          </div>
          <div className="start-card">
            <h3>Rejoindre un salon</h3>
            <div className="field-row">
              <input
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                placeholder="Code à 5 lettres"
                maxLength={5}
                aria-label="Code du salon"
              />
              <button
                type="button"
                className="btn"
                disabled={!identified || code.trim().length < 5}
                onClick={() => onJoin(code)}
              >
                Rejoindre
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
