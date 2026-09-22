import type { FootballGameContext, Position, Sport } from '@draft/shared';

export type CatalogueHistory = FootballGameContext['history'];

export type FootballCatalogueContext = FootballGameContext;

/**
 * Shape accepted by the catalogue importer.  The source stays deliberately
 * local: ratings and manually written hints are available without an external
 * API when a match is running.
 */
export interface CatalogueEntry {
  sport: Sport;
  name: string;
  position: Position;
  club: string;
  country: string;
  rating: number;
  tier: 1 | 2 | 3;
  /**
   * Contexte F2 optionnel pendant la migration des entrées historiques.
   * Les nouvelles fiches football doivent le renseigner et le validateur peut
   * l'imposer avec `requireFootballGameContext`.
   */
  footballContext?: FootballCatalogueContext;
  hints: readonly string[];
}

const positionsBySport: Record<Sport, readonly Position[]> = {
  football: ['GK', 'DEF', 'MID', 'FWD'],
  basketball: ['PG', 'SG', 'SF', 'PF', 'C'],
};

export interface CatalogueValidationOptions {
  /** Enable F2 launch-size and drawability checks (not required for fixtures). */
  requireLaunchReady?: boolean;
  minPlayersPerSport?: number;
  /** Exige une note de pic et un indice historique français pour chaque footballeur. */
  requireFootballGameContext?: boolean;
}

/** Reports all source-data faults at once so catalogue edits are quick to fix. */
export function validateCatalogue(
  entries: readonly CatalogueEntry[],
  options: CatalogueValidationOptions = {},
): void {
  const errors: string[] = [];
  const playerKeys = new Set<string>();
  const totals: Record<Sport, number> = { football: 0, basketball: 0 };
  const tiers: Record<Sport, Set<number>> = { football: new Set(), basketball: new Set() };

  const positions: Record<Sport, Set<Position>> = {
    football: new Set(),
    basketball: new Set(),
  };

  entries.forEach((entry, index) => {
    const label = `Entrée ${index + 1}`;

    if (!entry || typeof entry !== 'object') {
      errors.push(`${label} : entrée invalide.`);

      return;
    }

    if (entry.sport !== 'football' && entry.sport !== 'basketball') {
      errors.push(`${label} : sport invalide.`);

      return;
    }

    totals[entry.sport] += 1;

    const requiredText = [
      ['nom', entry.name],
      ['club', entry.club],
      ['nationalité', entry.country],
    ] as const;

    for (const [field, value] of requiredText) {
      if (typeof value !== 'string' || value.trim().length === 0 || value !== value.trim()) {
        errors.push(`${label} : ${field} obligatoire, sans espaces superflus.`);
      }
    }

    const key = `${entry.sport}:${entry.name.trim().toLocaleLowerCase('fr-FR')}`;

    if (playerKeys.has(key)) errors.push(`${label} : joueur dupliqué (${entry.name}).`);
    playerKeys.add(key);

    if (!positionsBySport[entry.sport].includes(entry.position)) {
      errors.push(`${label} : poste ${entry.position} incompatible avec ${entry.sport}.`);
    } else {
      positions[entry.sport].add(entry.position);
    }

    if (!Number.isInteger(entry.rating) || entry.rating < 1 || entry.rating > 99) {
      errors.push(`${label} : note entière attendue entre 1 et 99.`);
    }

    if (!Number.isInteger(entry.tier) || entry.tier < 1 || entry.tier > 3) {
      errors.push(`${label} : palier attendu entre 1 et 3.`);
    } else {
      tiers[entry.sport].add(entry.tier);
    }

    if (entry.sport === 'football') {
      const context = entry.footballContext;

      if (options.requireFootballGameContext && !context) {
        errors.push(`${label} : contexte de pic et historique français obligatoires pour le football.`);
      }

      if (context) {
        if (!Number.isInteger(context.primeRating) || context.primeRating < 1 || context.primeRating > 99) {
          errors.push(`${label} : note de pic entière attendue entre 1 et 99.`);
        }

        if (typeof context.primePeriod !== 'string' || context.primePeriod.trim().length < 4 || context.primePeriod !== context.primePeriod.trim()) {
          errors.push(`${label} : période de pic exploitable requise.`);
        }

        const history = context.history;

        if (!history || typeof history.text !== 'string' || history.text.trim().length < 12 || history.text !== history.text.trim()) {
          errors.push(`${label} : indice historique français exploitable requis.`);
        } else if (history.text.length > 400) {
          errors.push(`${label} : indice historique de 400 caractères maximum.`);
        }

        if (!history || history.provenance !== 'hand-authored') {
          errors.push(`${label} : provenance « hand-authored » requise pour l'indice historique.`);
        }

        if (!history || history.language !== 'fr') {
          errors.push(`${label} : langue « fr » requise pour l'indice historique.`);
        }
      }
    }

    if (!Array.isArray(entry.hints) || entry.hints.length === 0) {
      errors.push(`${label} : au moins un indice rédigé manuellement est requis.`);
    } else {
      const seenHints = new Set<string>();
      entry.hints.forEach((hint, hintIndex) => {
        if (typeof hint !== 'string' || hint.trim().length < 12 || hint !== hint.trim()) {
          errors.push(`${label}, indice ${hintIndex + 1} : texte exploitable (12 caractères minimum) requis.`);
        }

        if (hint.length > 400) errors.push(`${label}, indice ${hintIndex + 1} : 400 caractères maximum.`);
        const normalized = hint.toLocaleLowerCase('fr-FR');

        if (seenHints.has(normalized)) errors.push(`${label}, indice ${hintIndex + 1} : indice dupliqué.`);
        seenHints.add(normalized);
      });
    }
  });

  if (options.requireLaunchReady) {
    const minimum = options.minPlayersPerSport ?? 150;
    (Object.keys(totals) as Sport[]).forEach((sport) => {
      if (totals[sport] < minimum) errors.push(`${sport} : ${minimum} joueurs actifs minimum requis (${totals[sport]} fournis).`);

      if (tiers[sport].size !== 3) errors.push(`${sport} : les trois paliers doivent être représentés.`);
      const expected = positionsBySport[sport];
      const missing = expected.filter((position) => !positions[sport].has(position));

      if (missing.length) errors.push(`${sport} : postes manquants (${missing.join(', ')}).`);
    });
  }

  if (errors.length) {
    throw new Error(`Catalogue invalide :\n- ${errors.join('\n- ')}`);
  }
}
