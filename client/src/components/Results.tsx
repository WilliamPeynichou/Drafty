import { useEffect, useMemo, useState } from 'react';
import type { MatchView, RosterSlot, SeatId } from '@draft/shared';

interface ResultsProps {
  view: MatchView;
  onLeave: () => void;
}

interface RevealItem {
  seat: SeatId;
  slot: RosterSlot;
}

function dealLabel(slot: RosterSlot): { label: string; tone: 'value' | 'overpaid' | 'fair' } | null {
  const rating = slot.player?.rating;

  if (rating === undefined) return null;

  const expected = Math.max(1, Math.round((rating - 72) / 3));
  const difference = slot.pricePaid - expected;

  if (difference <= -3) return { label: 'Bonne affaire', tone: 'value' };
  if (difference >= 3) return { label: 'Surpayé', tone: 'overpaid' };

  return { label: 'Prix juste', tone: 'fair' };
}

function revealItems(view: MatchView): RevealItem[] {
  const items: RevealItem[] = [];

  for (const player of view.players) {
    for (const slot of player.roster) items.push({ seat: player.seat, slot });
  }

  return items.sort((first, second) => first.slot.round - second.slot.round);
}

interface TeamColumnProps {
  name: string;
  seat: SeatId;
  slots: RosterSlot[];
  revealedLotIds: ReadonlySet<string>;
  winner: SeatId | null;
}

/** Une colonne = une équipe. La comparaison reste lisible pendant la révélation. */
function TeamColumn({ name, seat, slots, revealedLotIds, winner }: TeamColumnProps) {
  return (
    <section className={`team-column ${seat === winner ? 'team-column--winner' : ''}`}>
      <header className="team-column__header">
        <div>
          <p className="team-column__eyebrow">{seat === winner ? 'Vainqueur' : 'Effectif'}</p>
          <h3>{name}</h3>
        </div>
        {seat === winner && <span className="winner-mark">✓</span>}
      </header>

      <ol className="reveal-list">
        {slots.map((slot) => {
          const open = revealedLotIds.has(slot.lotId);
          const deal = dealLabel(slot);
          const player = slot.player;

          return (
            <li key={slot.lotId} className={`reveal-row ${open ? 'reveal-row--open' : ''}`}>
              <span className="reveal-row__round">{slot.round}</span>
              {open && player ? (
                <div className="reveal-row__player">
                  <strong>{player.name}</strong>
                  <span>{slot.hint}</span>
                </div>
              ) : (
                <div className="reveal-row__player reveal-row__locked">
                  <strong>Joueur masqué</strong>
                  <span>Révélation en cours</span>
                </div>
              )}
              <div className="reveal-row__value">
                {open && player && <strong>{player.rating}</strong>}
                <span>{slot.pricePaid} €</span>
                {open && deal && <em className={`deal deal--${deal.tone}`}>{deal.label}</em>}
              </div>
            </li>
          );
        })}
        {slots.length === 0 && <li className="reveal-row reveal-row--empty">Aucun lot remporté</li>}
      </ol>
    </section>
  );
}

/** F6 : deux colonnes, révélation synchronisée, résultat final. */
export function Results({ view, onLeave }: ResultsProps) {
  const items = useMemo(() => revealItems(view), [view]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const result = view.result;

  useEffect(() => {
    setRevealedCount(0);
    setShowScore(false);

    if (items.length === 0) {
      setShowScore(true);
      return undefined;
    }

    const interval = setInterval(() => {
      setRevealedCount((current) => {
        const next = current + 1;

        if (next >= items.length) {
          clearInterval(interval);
          setTimeout(() => setShowScore(true), 350);
        }

        return Math.min(next, items.length);
      });
    }, 700);

    return () => clearInterval(interval);
  }, [items]);

  const revealedLotIds = new Set(items.slice(0, revealedCount).map((item) => item.slot.lotId));
  const youWon = result?.winner === view.you;
  const headline = result?.winner === null ? 'Égalité' : youWon ? 'Vous gagnez' : 'Vous perdez';

  return (
    <div className="results">
      <header className="results__hero">
        <p className="eyebrow">Partie terminée</p>
        <h2 className="result-title">{headline}</h2>
        <p className="results__progress">Révélation {revealedCount} / {items.length}</p>
      </header>

      <div className="teams-reveal">
        {view.players.map((player) => (
          <TeamColumn
            key={player.seat}
            name={player.displayName}
            seat={player.seat}
            slots={player.roster}
            revealedLotIds={revealedLotIds}
            winner={result?.winner ?? null}
          />
        ))}
      </div>

      {showScore && result && (
        <section className="final-score">
          <div className="final-score__label">Score final</div>
          {result.scores.map((score) => {
            const player = view.players.find((entry) => entry.seat === score.seat);

            return (
              <div key={score.seat} className={`score-line ${score.seat === result.winner ? 'score-line--winner' : ''}`}>
                <span>{player?.displayName ?? score.seat}</span>
                <span>{score.ratingTotal} + {score.budgetBonus}</span>
                <strong>{score.total}</strong>
              </div>
            );
          })}
        </section>
      )}

      {showScore && (
        <footer className="results__actions">
          <button type="button" className="btn btn--accent" onClick={onLeave}>Revanche</button>
          <button type="button" className="btn btn--ghost" onClick={onLeave}>Quitter</button>
        </footer>
      )}
    </div>
  );
}
