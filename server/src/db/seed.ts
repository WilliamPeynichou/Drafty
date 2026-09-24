/**
 * Chargement initial du catalogue de joueurs et de leurs indices.
 * Idempotent : relancer le script ne crée pas de doublons.
 * Usage : pnpm db:seed
 */
import { validateCatalogue } from '../data/catalogue-validation.js';
import { FOOTBALL_PLAYERS } from '../data/football-players.js';
import { FOOTBALL_PREMIER_LIGA_EXPANSION } from '../data/football-premier-liga-expansion.js';
import { FOOTBALL_SERIE_A_BUNDESLIGA_EXPANSION } from '../data/football-serie-a-bundesliga-expansion.js';
import { FOOTBALL_LIGUE1_PLAYERS } from '../data/football-players-ligue1.js';
import type { SeedPlayer } from '../data/seed-players.js';
import { BASKETBALL_PLAYERS } from '../data/nba-catalogue.js';
import { enrichCatalogueHints } from '../data/hint-enrichment.js';
import { Hint, Player } from '../models/index.js';
import { Op, type CreationAttributes } from 'sequelize';
import { sequelize } from './sequelize.js';

const footballEntries: SeedPlayer[] = [
  ...FOOTBALL_PLAYERS,
  ...FOOTBALL_PREMIER_LIGA_EXPANSION,
  ...FOOTBALL_SERIE_A_BUNDESLIGA_EXPANSION,
  ...FOOTBALL_LIGUE1_PLAYERS,
].map((entry) => entry.footballContext
  ? entry
  : {
      ...entry,
      // Les catalogues F2 historiques utilisent la note comme évaluation de prime.
      // Leur indice local devient aussi la trace éditoriale affichable hors ligne.
      footballContext: {
        primeRating: entry.rating,
        primePeriod: 'pic de carrière',
        history: { text: entry.hints[0] ?? 'Indice historique éditorial local.', provenance: 'hand-authored', language: 'fr' },
      },
    });

try {
  await sequelize.authenticate();
  await sequelize.sync();
  const catalogue = enrichCatalogueHints([...footballEntries, ...BASKETBALL_PLAYERS]);
  validateCatalogue(catalogue, { requireLaunchReady: true, requireFootballGameContext: true });

  let created = 0;
  let hintsCreated = 0;
  let hintsRemoved = 0;

  for (const entry of catalogue) {
    const [player, isNew] = await Player.findOrCreate({
      where: { sport: entry.sport, name: entry.name },
      defaults: {
        sport: entry.sport,
        name: entry.name,
        position: entry.position,
        club: entry.club,
        country: entry.country,
        rating: entry.rating,
        primeRating: entry.footballContext?.primeRating ?? null,
        tier: entry.tier,
      },
    });

    if (isNew) created += 1;

    for (const text of entry.hints) {
      const defaults: CreationAttributes<Hint> = { playerId: player.id, text };
      const historique = entry.footballContext?.history;

      // L'indice historique porte sa provenance éditoriale ; les autres non.
      if (historique && historique.text === text) {
        defaults.provenance = historique.provenance;
        defaults.language = historique.language;
      }

      const [, hintIsNew] = await Hint.findOrCreate({
        where: { playerId: player.id, text },
        defaults,
      });

      if (hintIsNew) hintsCreated += 1;
    }

    // Retire les indices qui ne figurent plus dans le catalogue (texte corrigé ou supprimé).
    hintsRemoved += await Hint.destroy({
      where: { playerId: player.id, text: { [Op.notIn]: [...entry.hints] } },
    });
  }

  const total = await Player.count();
  console.log(
    `Catalogue chargé : ${created} joueur(s) et ${hintsCreated} indice(s) ajoutés, ${hintsRemoved} obsolète(s) supprimé(s), ${total} joueur(s) en base.`,
  );
} catch (error) {
  console.error('Échec du chargement initial :', error);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
