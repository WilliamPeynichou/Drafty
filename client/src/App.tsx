import { Draft } from './components/Draft.js';
import { Home } from './components/Home.js';
import { Lobby } from './components/Lobby.js';
import { Results } from './components/Results.js';
import { useMatchClient } from './state/useMatchClient.js';
import './styles.css';

export function App() {
  const client = useMatchClient();
  const { view } = client;

  return (
    <div className={`shell${view === null ? ' shell--home' : ''}`}>
      <nav className="topbar">
        <span className="topbar__mark">DRAFTY</span>
        <span className={`status status--${client.status}`}>
          <span className="status__dot" />
          {client.status === 'open'
            ? 'Temps réel connecté'
            : client.status === 'connecting'
              ? 'Connexion…'
              : 'Hors ligne'}
        </span>
      </nav>

      <main className="content">
        {view === null && (
          <Home
            connected={client.status === 'open'}
            displayName={client.identity?.displayName ?? null}
            onAuthenticate={client.authenticate}
            onCreate={client.createMatch}
            onCreateBot={client.createBotMatch}
            onJoin={client.joinMatch}
          />
        )}

        {view?.phase === 'lobby' && (
          <Lobby view={view} onReady={client.ready} onLeave={client.leave} />
        )}

        {view?.phase === 'draft' && (
          <Draft
            view={view}
            lot={client.lot}
            history={client.history}
            onBid={client.bid}
            onPass={client.pass}
            onLeave={client.leave}
          />
        )}

        {(view?.phase === 'reveal' || view?.phase === 'results') && (
          <Results view={view} onLeave={client.leave} />
        )}

        {view?.phase === 'cancelled' && (
          <div className="cancelled">
            <p className="eyebrow">Partie interrompue</p>
            <h2 className="display display--small">Aucun score n'est enregistré</h2>
            <p className="lede">Votre compte reste connecté : vous pouvez relancer une partie.</p>
            <button type="button" className="btn btn--accent" onClick={client.leave}>
              Retour à l'accueil
            </button>
          </div>
        )}
      </main>

      <div className="notices" role="status" aria-live="polite">
        {client.notices.map((notice) => (
          <button
            key={notice.id}
            type="button"
            className="notice"
            onClick={() => client.dismiss(notice.id)}
          >
            {notice.message}
          </button>
        ))}
      </div>
    </div>
  );
}
