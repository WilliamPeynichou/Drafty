import { useEffect, useState } from 'react';
import { TURN_DURATION_MS, minimumAcceptableBid, type MatchView } from '@draft/shared';
import type { BidLine, MatchClient } from '../state/useMatchClient.js';
import { RosterPanel, positionLabel } from './RosterPanel.js';
import { Timer } from './Timer.js';

interface DraftProps {
  view: MatchView;
  lot: MatchClient['lot'];
  history: BidLine[];
  onBid: (amount: number) => void;
  onPass: () => void;
  onLeave: () => void;
}

/** Écran de draft : tout l'état courant d'un coup d'œil. */
export function Draft({ view, lot, history, onBid, onPass, onLeave }: DraftProps) {
  const auction = view.auction;
  const yourTurn = auction?.turn === view.you;
  const you = view.players.find((player) => player.seat === view.you);
  const rival = view.players.find((player) => player.seat !== view.you);
  const minimum = auction ? minimumAcceptableBid(auction) : 1;
  const [amount, setAmount] = useState(minimum);

  // La mise proposée suit l'enchère courante, sans jamais passer sous le minimum.
  useEffect(() => {
    setAmount((current) => (current < minimum ? minimum : current));
  }, [minimum]);

  const budget = you?.budget ?? 0;
  const canBid = yourTurn && amount >= minimum && amount <= budget;

  return (
    <div className="draft">
      <header className="draft__top">
        <div>
          <p className="eyebrow">
            Tour {view.round} sur {view.totalRounds} · salon {view.code}
          </p>
          <h2 className="display display--small">
            {auction?.highBidder === null || auction === null
              ? 'Enchère ouverte'
              : `${auction.currentBid} € sur la table`}
          </h2>
        </div>
        {auction && (
          <Timer deadline={auction.deadline} durationMs={TURN_DURATION_MS} active={yourTurn} />
        )}
      </header>

      <div className="draft__grid">
        {you && (
          <RosterPanel
            player={you}
            viewer={view.you}
            totalRounds={view.totalRounds}
            revealed={false}
          />
        )}

        <main className="draft__center">
          <article className="lot-card">
            <span className="lot-card__position">{positionLabel(lot?.position ?? '')}</span>
            <p className="lot-card__hint">{lot?.hint ?? 'Lot en préparation…'}</p>
            <span className="lot-card__mask">Identité révélée en fin de partie</span>
          </article>

          <section className="bid-log">
            <h3 className="panel__title">Mises du tour</h3>
            {history.length === 0 ? (
              <p className="bid-log__empty">Personne n'a encore misé.</p>
            ) : (
              <ol className="bid-log__list">
                {history.map((line, index) => (
                  <li key={`${line.seat}-${line.amount}-${index}`}>
                    <span className={`chip chip--${line.seat === view.you ? 'you' : 'rival'}`}>
                      {line.seat === view.you ? 'Vous' : 'Adversaire'}
                    </span>
                    <strong>{line.amount} €</strong>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className={`controls ${yourTurn ? 'controls--active' : ''}`}>
            <div className="controls__row">
              <button
                type="button"
                className="stepper"
                disabled={!yourTurn || amount <= minimum}
                onClick={() => setAmount((value) => Math.max(minimum, value - 1))}
                aria-label="Diminuer la mise"
              >
                −
              </button>
              <div className="controls__amount">
                <span className="controls__value">{amount}</span>
                <span className="controls__unit">€</span>
              </div>
              <button
                type="button"
                className="stepper"
                disabled={!yourTurn || amount >= budget}
                onClick={() => setAmount((value) => Math.min(budget, value + 1))}
                aria-label="Augmenter la mise"
              >
                +
              </button>
            </div>

            <p className="controls__hint">
              Minimum {minimum} € · budget restant {budget} €
            </p>

            <div className="controls__row">
              <button
                type="button"
                className="btn btn--accent btn--wide"
                disabled={!canBid}
                onClick={() => onBid(amount)}
              >
                Enchérir
              </button>
              <button
                type="button"
                className="btn btn--ghost btn--wide"
                disabled={!yourTurn}
                onClick={onPass}
              >
                Passer
              </button>
            </div>

            {!yourTurn && <p className="controls__wait">Au tour de l'adversaire.</p>}
          </section>
        </main>

        {rival && (
          <RosterPanel
            player={rival}
            viewer={view.you}
            totalRounds={view.totalRounds}
            revealed={false}
          />
        )}
      </div>

      <footer className="draft__foot">
        <button type="button" className="btn btn--ghost" onClick={onLeave}>
          Abandonner la partie
        </button>
      </footer>
    </div>
  );
}
