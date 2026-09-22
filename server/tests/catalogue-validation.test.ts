import { describe, expect, it } from 'vitest';
import { validateCatalogue, type CatalogueEntry } from '../src/data/catalogue-validation.js';

const validEntry: CatalogueEntry = {
  sport: 'football',
  name: 'Joueur Exemple',
  position: 'MID',
  club: 'Club Exemple',
  country: 'France',
  rating: 80,
  tier: 2,
  hints: ['Il a remporté un trophée dans deux pays différents.'],
};

describe('validation du catalogue F2', () => {
  it('accepte une entrée importable avec un indice manuel', () => {
    expect(() => validateCatalogue([validEntry])).not.toThrow();
  });

  it('refuse les postes incohérents, notes hors bornes et entrées inexploitables', () => {
    expect(() => validateCatalogue([
      { ...validEntry, position: 'PG', rating: 100, hints: [] },
    ])).toThrow(/poste PG incompatible[\s\S]*note entière[\s\S]*au moins un indice/);
  });

  it('requires locally authored French prime/history context when requested', () => {
    const footballContext = {
      primeRating: 87,
      primePeriod: '2021–2023',
      history: {
        text: 'Il a remporté un trophée continental avec son club formateur.',
        provenance: 'hand-authored' as const,
        language: 'fr' as const,
      },
    };
    expect(() => validateCatalogue([{ ...validEntry, footballContext }], {
      requireFootballGameContext: true,
    })).not.toThrow();
    expect(() => validateCatalogue([validEntry], {
      requireFootballGameContext: true,
    })).toThrow(/contexte de pic et historique français/);
    expect(() => validateCatalogue([{ ...validEntry, footballContext: {
      ...footballContext,
      history: { ...footballContext.history, provenance: 'remote' as 'hand-authored' },
    } }], { requireFootballGameContext: true })).toThrow(/provenance/);
  });

  it('valide le catalogue F2 complet avec le contexte de jeu football local', async () => {
    const [
      { FOOTBALL_PLAYERS },
      { FOOTBALL_PREMIER_LIGA_EXPANSION },
      { FOOTBALL_SERIE_A_BUNDESLIGA_EXPANSION },
      { FOOTBALL_LIGUE1_PLAYERS },
      { BASKETBALL_PLAYERS },
    ] = await Promise.all([
      import('../src/data/football-players.js'),
      import('../src/data/football-premier-liga-expansion.js'),
      import('../src/data/football-serie-a-bundesliga-expansion.js'),
      import('../src/data/football-players-ligue1.js'),
      import('../src/data/nba-catalogue.js'),
    ]);
    const footballEntries = [
      ...FOOTBALL_PLAYERS,
      ...FOOTBALL_PREMIER_LIGA_EXPANSION,
      ...FOOTBALL_SERIE_A_BUNDESLIGA_EXPANSION,
      ...FOOTBALL_LIGUE1_PLAYERS,
    ].map((entry) => ({
      ...entry,
      footballContext: entry.footballContext ?? {
        primeRating: entry.rating,
        primePeriod: 'pic de carrière',
        history: { text: entry.hints[0] ?? 'Indice historique éditorial local.', provenance: 'hand-authored' as const, language: 'fr' as const },
      },
    }));
    expect(footballEntries).toHaveLength(450);
    expect(() => validateCatalogue([...footballEntries, ...BASKETBALL_PLAYERS], {
      requireLaunchReady: true,
      requireFootballGameContext: true,
    })).not.toThrow();
  });

  it('contrôle les doublons et la capacité de tirage au lancement', () => {
    expect(() => validateCatalogue([validEntry, validEntry], {
      requireLaunchReady: true,
      minPlayersPerSport: 2,
    })).toThrow(/joueur dupliqué[\s\S]*basketball : 2 joueurs actifs minimum/);
  });
});
