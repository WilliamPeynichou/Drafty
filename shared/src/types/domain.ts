/**
 * Domaine du jeu : types partagés entre le client et le serveur.
 * Aucune dépendance technique ici (ni réseau, ni base de données).
 */

export type Sport = 'football' | 'basketball';

/** Contexte local permettant d'évaluer le meilleur niveau d'un footballeur. */
export interface FootballGameContext {
  /** Note de jeu au sommet de carrière (1–99), indépendante de la forme du jour. */
  primeRating: number;
  /** Période lisible du sommet, par exemple « 2021–2023 ». */
  primePeriod: string;
  /** Indice historique éditorial, conservé avec son origine plutôt que récupéré en match. */
  history: {
    text: string;
    provenance: 'hand-authored';
    language: 'fr';
  };
}

export type FootballPosition = 'GK' | 'DEF' | 'MID' | 'FWD';

export type BasketballPosition = 'PG' | 'SG' | 'SF' | 'PF' | 'C';

export type Position = FootballPosition | BasketballPosition;

/** Phases de la machine à états d'une partie. */
export type MatchPhase =
  | 'lobby'
  | 'draft'
  | 'reveal'
  | 'results'
  | 'cancelled';

/** Raisons d'annulation d'une partie. */
export type CancelReason =
  | 'double_timeout'      // un joueur a dépassé le délai deux fois
  | 'both_idle'           // les deux joueurs sont inactifs
  | 'opponent_left';      // abandon volontaire

/** Identifiant d'un des deux sièges de la partie. */
export type SeatId = 'A' | 'B';

/** Joueur réel masqué derrière un lot. Jamais envoyé au client avant la révélation. */
export interface RealPlayer {
  id: number;
  sport: Sport;
  name: string;
  position: Position;
  club: string;
  country: string;
  /** Note de 0 à 99, base du score final. */
  rating: number;
  /** Contexte de pic local, présent pour les entrées football F2 enrichies. */
  footballContext?: FootballGameContext;
  /** Palier de valeur, utilisé pour équilibrer le tirage des lots. */
  tier: 1 | 2 | 3;
}

/** Lot mis aux enchères : ce que le client a le droit de voir pendant la draft. */
export interface Lot {
  /** Référence opaque, sans lien déductible avec l'identité réelle. */
  lotId: string;
  round: number;
  position: Position;
  /** Anecdote servant d'indice, généralement liée au palmarès. */
  hint: string;
}

/** Une mise posée pendant une enchère. */
export interface Bid {
  seat: SeatId;
  amount: number;
  at: number;
}

/** État d'une enchère en cours. */
export interface AuctionState {
  lotId: string;
  round: number;
  /** Siège dont c'est le tour d'agir. */
  turn: SeatId;
  /** Montant courant, 0 si personne n'a encore misé. */
  currentBid: number;
  /** Dernier enchérisseur, null si l'enchère n'a pas démarré. */
  highBidder: SeatId | null;
  history: Bid[];
  /** Horodatage de fin du délai de réflexion. */
  deadline: number;
}

/** Emplacement d'effectif, masqué pendant la draft. */
export interface RosterSlot {
  lotId: string;
  round: number;
  position: Position;
  hint: string;
  pricePaid: number;
  /** Renseigné uniquement à partir de la phase de révélation. */
  player: RealPlayer | null;
}

/** État public d'un participant. */
export interface PlayerPublicState {
  seat: SeatId;
  userId: string;
  displayName: string;
  isBot: boolean;
  connected: boolean;
  /** Budget restant, toujours public. */
  budget: number;
  timeouts: number;
  roster: RosterSlot[];
}

/** Score détaillé d'un participant en fin de partie. */
export interface PlayerScore {
  seat: SeatId;
  ratingTotal: number;
  budgetBonus: number;
  total: number;
}

/** Résultat final d'une partie. */
export interface MatchResult {
  scores: PlayerScore[];
  /** Null en cas d'égalité parfaite. */
  winner: SeatId | null;
}

/** Vue d'une partie telle qu'envoyée à un joueur donné. */
export interface MatchView {
  matchId: string;
  code: string;
  sport: Sport;
  phase: MatchPhase;
  round: number;
  totalRounds: number;
  you: SeatId;
  players: PlayerPublicState[];
  auction: AuctionState | null;
  result: MatchResult | null;
  cancelReason: CancelReason | null;
}
