import type { PlayerPublicState, SeatId } from '@draft/shared';

const POSITION_LABELS = {
  GK: 'Gardien',
  DEF: 'Défenseur',
  MID: 'Milieu',
  FWD: 'Attaquant',
  PG: 'Meneur',
  SG: 'Arrière',
  SF: 'Ailier',
  PF: 'Ailier fort',
  C: 'Pivot',
} satisfies Record<string, string>;

export function positionLabel(position: string): string {
  return Object.hasOwn(POSITION_LABELS, position)
    ? // SAFETY : la clé vient d'être trouvée dans la table ci-dessus.
      POSITION_LABELS[position as keyof typeof POSITION_LABELS]
    : position;
}

interface RosterPanelProps {
  player: PlayerPublicState;
  viewer: SeatId;
  totalRounds: number;
  /** Les identités ne sont affichées qu'à partir de la révélation. */
  revealed: boolean;
}

/**
 * Effectif d'un joueur, visible en permanence.
 * Avant la révélation, les identités restent masquées ; les prix payés, eux,
 * sont publics.
 */
export function RosterPanel({ player, viewer, totalRounds, revealed }: RosterPanelProps) {
  const isYou = player.seat === viewer;
  const spent = player.roster.reduce((sum, slot) => sum + slot.pricePaid, 0);

  return (
    <aside className={`roster ${isYou ? 'roster--you' : ''}`}>
      <header className="roster__header">
        <div>
          <span className="roster__badge">{isYou ? 'Votre effectif' : 'Adversaire'}</span>
          <h3>{player.displayName}</h3>
        </div>
        <div className="roster__budget">
          <span className="roster__budget-value">{player.budget}</span>
          <span className="roster__budget-unit">€</span>
        </div>
      </header>

      <p className="roster__meta">
        {player.roster.length}/{totalRounds} lots · {spent} € dépensés
        {player.timeouts > 0 ? ` · ${player.timeouts} dépassement` : ''}
        {player.connected ? '' : ' · déconnecté'}
      </p>

      <ol className="roster__list">
        {player.roster.map((slot) => (
          <li key={slot.lotId} className="slot">
            <span className="slot__round">T{slot.round}</span>
            <div className="slot__body">
              <span className="slot__position">{positionLabel(slot.position)}</span>
              <span className="slot__identity">
                {revealed && slot.player ? slot.player.name : 'Identité masquée'}
              </span>
              {revealed && slot.player && (
                <span className="slot__rating">Note {slot.player.rating}</span>
              )}
            </div>
            <span className="slot__price">{slot.pricePaid} €</span>
          </li>
        ))}
        {player.roster.length === 0 && <li className="slot slot--empty">Aucun lot remporté</li>}
      </ol>
    </aside>
  );
}
