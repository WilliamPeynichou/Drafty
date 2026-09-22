import { useState } from 'react';
import type { MatchView } from '@draft/shared';

interface LobbyProps {
  view: MatchView;
  onReady: () => void;
  onLeave: () => void;
}

/** Salon d'attente : les deux sièges et leur état de préparation. */
export function Lobby({ view, onReady, onLeave }: LobbyProps) {
  const [ready, setReady] = useState(false);
  const opponent = view.players.find((player) => player.seat !== view.you);

  return (
    <div className="lobby">
      <p className="eyebrow">Salon privé</p>
      <h2 className="display display--small">Code&nbsp;: <span className="display--accent">{view.code}</span></h2>
      <p className="lede">Partagez ce code. La partie démarre quand les deux joueurs sont prêts.</p>

      <div className="seats">
        {view.players.map((player) => (
          <article key={player.seat} className="seat-card">
            <span className="seat-card__badge">Siège {player.seat}</span>
            <h3>{player.displayName}</h3>
            <p className="seat-card__meta">
              {player.seat === view.you ? 'Vous' : 'Adversaire'} · {player.budget} € de budget
            </p>
          </article>
        ))}
        {opponent === undefined && (
          <article className="seat-card seat-card--empty">
            <span className="seat-card__badge">Siège libre</span>
            <h3>En attente…</h3>
            <p className="seat-card__meta">Aucun spectateur n'est admis.</p>
          </article>
        )}
      </div>

      <div className="lobby__actions">
        <button
          type="button"
          className="btn btn--accent"
          disabled={ready || opponent === undefined}
          onClick={() => {
            setReady(true);
            onReady();
          }}
        >
          {ready ? 'En attente de l’adversaire…' : 'Je suis prêt'}
        </button>
        <button type="button" className="btn btn--ghost" onClick={onLeave}>
          Quitter
        </button>
      </div>
    </div>
  );
}
