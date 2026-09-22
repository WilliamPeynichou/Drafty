import type { Sport } from '../types/domain.js';

/** Paramètres de jeu propres à chaque sport. */
export interface SportRules {
  sport: Sport;
  /** Nombre de lots mis aux enchères sur la partie. */
  totalRounds: number;
  /** Budget de départ, en euros fictifs. */
  startingBudget: number;
  /** Limite d'effectif par poste. Absente = aucune limite. */
  positionLimits: Partial<Record<string, number>>;
}

export const FOOTBALL_RULES: SportRules = {
  sport: 'football',
  totalRounds: 11,
  startingBudget: 44,
  positionLimits: { GK: 2 },
};

export const BASKETBALL_RULES: SportRules = {
  sport: 'basketball',
  totalRounds: 5,
  startingBudget: 20,
  positionLimits: {},
};

export const SPORT_RULES: Record<Sport, SportRules> = {
  football: FOOTBALL_RULES,
  basketball: BASKETBALL_RULES,
};

/** Délai de réflexion accordé à un joueur pour agir, en millisecondes. */
export const TURN_DURATION_MS = 20_000;

/** Nombre de dépassements de délai d'un même joueur entraînant l'annulation. */
export const MAX_TIMEOUTS_PER_PLAYER = 2;

/** Points accordés par euro non dépensé en fin de partie. */
export const BUDGET_POINTS_PER_EURO = 1;

/** Mise d'ouverture minimale d'une enchère. */
export const MIN_OPENING_BID = 1;

export function getRules(sport: Sport): SportRules {
  return SPORT_RULES[sport];
}
