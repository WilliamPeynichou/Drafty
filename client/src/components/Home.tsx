import { useState } from 'react';
import { getRules, type Sport } from '@draft/shared';

interface HomeProps {
  connected: boolean;
  displayName: string | null;
  onAuthenticate: (pseudo: string) => void;
  onCreate: (sport: Sport) => void;
  onCreateBot: (sport: Sport, profile: 'prudent' | 'aggressive') => void;
  onJoin: (code: string) => void;
  onNavigate: (path: string) => void;
}

const SPORTS: readonly Sport[] = ['football', 'basketball'];
const SPORT_NAMES: Record<Sport, string> = { football: 'Football', basketball: 'Basket' };

export function Home({ connected, displayName, onAuthenticate, onCreate, onCreateBot, onJoin, onNavigate }: HomeProps) {
  const [step, setStep] = useState(1);
  const [pseudo, setPseudo] = useState('');
  const [sport, setSport] = useState<Sport>('football');
  const [mode, setMode] = useState<'friend' | 'bot' | 'join'>('friend');
  const [botProfile, setBotProfile] = useState<'prudent' | 'aggressive'>('prudent');
  const [code, setCode] = useState('');
  const rules = getRules(sport);
  const identified = displayName !== null;

  function startGuest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = pseudo.trim();
    if (value.length >= 2) { onAuthenticate(value); setStep(2); }
  }

  function startGame() {
    if (!identified || !connected) return;
    if (mode === 'friend') onCreate(sport);
    if (mode === 'bot') onCreateBot(sport, botProfile);
    if (mode === 'join' && code.trim().length === 5) onJoin(code.trim());
  }

  return <div className="simple-home">
    <header className="simple-home__heading"><div><p className="simple-home__kicker"><span /> DRAFT AUX ENCHÈRES · 1 CONTRE 1</p><h1>Le joueur est masqué.<br /><em>À vous de miser.</em></h1><p className="simple-home__intro">Un indice, deux budgets, vingt secondes pour décider.</p></div><div className="simple-home__facts"><span><b>20</b> secondes / tour</span><span><b>{rules.startingBudget} €</b> de budget</span></div></header>
    <nav className="game-steps" aria-label="Étapes pour jouer">{[['1', 'Votre accès'], ['2', 'Votre jeu'], ['3', 'Lancer']].map(([number, label]) => <button key={number} type="button" className={`game-step${step === Number(number) ? ' game-step--active' : ''}${step > Number(number) ? ' game-step--done' : ''}`} onClick={() => { if (number === '1' || identified) setStep(Number(number)); }}><span>{step > Number(number) ? '✓' : number}</span>{label}</button>)}</nav>
    <main className="quick-game" aria-label="Parcours de création de partie">
      {step === 1 && <section className="game-panel"><p className="quick-game__label"><span>01</span></p><h2>Comment souhaitez-vous jouer ?</h2><p className="game-help">Jouez en invité ou connectez-vous à votre compte.</p>{identified ? <div className="game-signed"><span className="quick-signed-in__dot"/>Connecté en tant que <strong>{displayName}</strong><button type="button" className="btn btn--secondary" onClick={() => setStep(2)}>Continuer →</button></div> : <><form className="quick-guest" onSubmit={startGuest}><div className="quick-guest__prompt"><span className="quick-guest__avatar">👋</span><span><strong>Jouer en invité</strong><small>Choisissez un pseudo pour commencer.</small></span></div><label className="sr-only" htmlFor="quick-guest-name">Votre pseudo</label><input id="quick-guest-name" value={pseudo} onChange={event => setPseudo(event.target.value)} placeholder="Votre pseudo" minLength={2} maxLength={24} required/><button type="submit" disabled={!connected || pseudo.trim().length < 2}>Continuer <b>→</b></button></form><div className="game-account-links"><button type="button" onClick={() => onNavigate('/connexion')}>J’ai déjà un compte · Connexion →</button><button type="button" onClick={() => onNavigate('/inscription')}>Créer un compte</button></div></>}</section>}
      {step === 2 && <section className="game-panel"><p className="quick-game__label"><span>02</span></p><h2>Choisissez votre jeu</h2><p className="game-help">Sélectionnez un sport pour voir ses règles et son budget.</p><div className="quick-game__sports" role="group" aria-label="Choix du sport">{SPORTS.map(value => { const sportRules = getRules(value); return <button key={value} type="button" className={`quick-sport ${sport === value ? 'quick-sport--active' : ''}`} onClick={() => setSport(value)} aria-pressed={sport === value}><span className="quick-sport__radio"/><span><strong>{SPORT_NAMES[value]}</strong><small>{sportRules.totalRounds} tours · {sportRules.startingBudget} €</small></span></button>; })}</div><p className="quick-game__rule">{rules.totalRounds} tours <i>·</i> 1 point par euro restant{rules.positionLimits.GK ? <> <i>·</i> {rules.positionLimits.GK} gardiens maximum</> : null}</p><div className="game-panel__actions"><button type="button" className="btn btn--secondary" onClick={() => setStep(1)}>← Retour</button><button type="button" className="btn btn--primary" onClick={() => setStep(3)}>Choisir le mode →</button></div></section>}
      {step === 3 && <section className="game-panel"><p className="quick-game__label"><span>03</span></p><h2>Comment lancer la partie ?</h2><p className="game-help">{SPORT_NAMES[sport]} · {rules.totalRounds} tours · {rules.startingBudget} € de budget.</p><div className="game-modes" role="group" aria-label="Mode de jeu">{([['friend','Créer un salon','Inviter un adversaire avec un code'],['bot','Jouer contre l’IA','Une partie immédiate en solo'],['join','Rejoindre un salon','Vous avez déjà un code ?']] as const).map(([value,title,desc]) => <button key={value} type="button" className={`game-mode${mode === value ? ' game-mode--active' : ''}`} onClick={() => setMode(value)} aria-pressed={mode === value}><strong>{title}</strong><small>{desc}</small></button>)}</div>{mode === 'bot' && <div className="game-mode-detail"><span>Style de l’IA</span><div className="quick-ai"><button type="button" className={botProfile === 'prudent' ? 'quick-ai--selected' : ''} onClick={() => setBotProfile('prudent')}>Prudente</button><button type="button" className={botProfile === 'aggressive' ? 'quick-ai--selected' : ''} onClick={() => setBotProfile('aggressive')}>Agressive</button></div></div>}{mode === 'join' && <label className="game-code-label">Code du salon<input aria-label="Code du salon" value={code} onChange={event => setCode(event.target.value.toUpperCase())} placeholder="CODE" maxLength={5} autoComplete="off"/></label>}<div className="game-panel__actions"><button type="button" className="btn btn--secondary" onClick={() => setStep(2)}>← Changer de jeu</button><button type="button" className="btn btn--primary" disabled={!connected || (mode === 'join' && code.trim().length !== 5)} onClick={startGame}>{mode === 'friend' ? 'Créer le salon' : mode === 'bot' ? 'Lancer la partie' : 'Rejoindre'} →</button></div></section>}
    </main>
    <footer className="simple-home__footer"><span>Un indice. Une enchère. Votre intuition.</span><button type="button" onClick={() => onNavigate(identified ? '/profil' : '/inscription')}>{identified ? 'Mon profil' : 'Créer un compte'} ↗</button></footer>
  </div>;
}
