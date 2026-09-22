import { useEffect, useState } from 'react';

interface TimerProps {
  deadline: number;
  /** Durée totale du tour, pour la jauge. */
  durationMs: number;
  active: boolean;
}

/**
 * Décompte purement visuel.
 * Le serveur reste seul juge du temps écoulé : cet affichage n'a aucune
 * autorité sur la partie.
 */
export function Timer({ deadline, durationMs, active }: TimerProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 100);

    return () => clearInterval(interval);
  }, []);

  const remaining = Math.max(0, deadline - now);
  const seconds = Math.ceil(remaining / 1000);
  const ratio = Math.max(0, Math.min(1, remaining / durationMs));
  const urgent = remaining <= 5_000;

  return (
    <div className={`timer ${urgent ? 'timer--urgent' : ''} ${active ? 'timer--active' : ''}`}>
      <div className="timer__value">
        {seconds}
        <span className="timer__unit">s</span>
      </div>
      <div className="timer__track">
        <div className="timer__fill" style={{ transform: `scaleX(${ratio})` }} />
      </div>
      <p className="timer__caption">{active ? 'À vous de jouer' : 'Tour de l’adversaire'}</p>
    </div>
  );
}
