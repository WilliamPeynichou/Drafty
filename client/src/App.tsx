import { useEffect, useState } from 'react';
import { AuthPage, ProfilePage } from './components/AccountPages.js';
import { Draft } from './components/Draft.js';
import { Home } from './components/Home.js';
import { Lobby } from './components/Lobby.js';
import { Results } from './components/Results.js';
import { useMatchClient } from './state/useMatchClient.js';
import './styles.css';

type Page = 'home' | 'login' | 'register' | 'profile';
const pageFromPath = (path: string): Page => path === '/connexion' ? 'login' : path === '/inscription' ? 'register' : path === '/profil' ? 'profile' : 'home';

export function App() {
  const client = useMatchClient();
  const { view } = client;
  const [page, setPage] = useState<Page>(() => pageFromPath(window.location.pathname));

  useEffect(() => {
    const onPopState = () => setPage(pageFromPath(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (client.account && (page === 'login' || page === 'register')) navigate('/profil');
  }, [client.account]);

  function navigate(path: string) {
    window.history.pushState({}, '', path);
    setPage(pageFromPath(path));
  }

  async function continueGuest(displayName: string) {
    client.authenticate(displayName);
    navigate('/');
  }

  const accountPage = view === null && (page === 'login' || page === 'register' || page === 'profile');
  const fullCanvas = view === null && (page === 'login' || page === 'register');

  return (
    <div className={`shell${view === null && page === 'home' ? ' shell--home' : ''}${fullCanvas ? ' shell--account' : ''}`}>
      <nav className="topbar">
        <button className="topbar__brand" type="button" onClick={() => navigate('/')} aria-label="DRAFTY · Accueil"><span className="topbar__mark">DRAFTY</span></button>
        {view === null && <div className="topbar__nav"><button className={page === 'home' ? 'topbar__link topbar__link--active' : 'topbar__link'} type="button" onClick={() => navigate('/')}>Jouer</button>{client.account ? <button className={page === 'profile' ? 'topbar__link topbar__link--active' : 'topbar__link'} type="button" onClick={() => navigate('/profil')}>Mon profil</button> : <button className={page === 'login' || page === 'register' ? 'topbar__link topbar__link--active' : 'topbar__link'} type="button" onClick={() => navigate('/connexion')}>Connexion</button>}</div>}
        <span className={`status status--${client.status}`}><span className="status__dot" />{client.status === 'open' ? 'Temps réel connecté' : client.status === 'connecting' ? 'Connexion…' : 'Hors ligne'}</span>
      </nav>

      <main className={accountPage ? 'account-content' : 'content'}>
        {view === null && page === 'home' && <Home connected={client.status === 'open'} displayName={client.identity?.displayName ?? null} onAuthenticate={client.authenticate} onCreate={client.createMatch} onCreateBot={client.createBotMatch} onJoin={client.joinMatch} onNavigate={navigate} />}
        {view === null && (page === 'login' || page === 'register') && <AuthPage mode={page} busy={client.status !== 'open'} error={client.notices[0]?.message ?? null} onLogin={async (email, password) => { await client.login(email, password); navigate('/profil'); }} onRegister={async (name, email, password) => { await client.register(name, email, password); navigate('/profil'); }} onContinueGuest={continueGuest} />}
        {view === null && page === 'profile' && client.account && <ProfilePage account={client.account} history={client.matchHistory} busy={client.status !== 'open'} onLogout={async () => { await client.logout(); navigate('/'); }} onPlay={() => navigate('/')} />}
        {view === null && page === 'profile' && !client.account && <AuthPage mode="login" busy={client.status !== 'open'} error={null} onLogin={async (email, password) => { await client.login(email, password); navigate('/profil'); }} onRegister={async (name, email, password) => { await client.register(name, email, password); navigate('/profil'); }} onContinueGuest={continueGuest} />}
        {view?.phase === 'lobby' && <Lobby view={view} onReady={client.ready} onLeave={client.leave} />}
        {view?.phase === 'draft' && <Draft view={view} lot={client.lot} history={client.history} onBid={client.bid} onPass={client.pass} onLeave={client.leave} />}
        {(view?.phase === 'reveal' || view?.phase === 'results') && <Results view={view} onLeave={client.leave} />}
        {view?.phase === 'cancelled' && <div className="cancelled"><p className="eyebrow">Partie interrompue</p><h2 className="display display--small">Aucun score n'est enregistré</h2><p className="lede">Votre compte reste connecté : vous pouvez relancer une partie.</p><button type="button" className="btn btn--accent" onClick={client.leave}>Retour à l'accueil</button></div>}
      </main>

      <div className="notices" role="status" aria-live="polite">{client.notices.map((notice) => <button key={notice.id} type="button" className="notice" onClick={() => client.dismiss(notice.id)}>{notice.message}</button>)}</div>
    </div>
  );
}
