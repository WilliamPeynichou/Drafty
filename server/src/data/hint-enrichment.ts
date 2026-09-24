import type { CatalogueEntry } from './catalogue-validation.js';
import { VERIFIED_HINTS } from './verified-hints.js';
import { VERIFIED_HINTS_TIER2 } from './verified-hints-tier2.js';
import { VERIFIED_HINTS_EXTRA } from './verified-hints-extra.js';

/**
 * Élargit le catalogue d'indices de chaque joueur avec des indices factuels
 * dérivés de sa fiche (poste, club, sélection, nom). L'indice rédigé à la main
 * reste en première position (il sert de trace historique), les indices
 * dérivés s'y ajoutent pour que le tirage varie d'une partie à l'autre.
 */
const POSITION_LABELS: Record<CatalogueEntry['position'], string> = {
  GK: 'Gardien de but',
  DEF: 'Défenseur',
  MID: 'Milieu de terrain',
  FWD: 'Attaquant',
  PG: 'Meneur',
  SG: 'Arrière',
  SF: 'Ailier',
  PF: 'Ailier fort',
  C: 'Pivot',
};

const letters = (value: string) => value.replace(/[^\p{L}]/gu, '');

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter((part) => letters(part).length > 0)
    .map((part) => `${letters(part)[0]!.toLocaleUpperCase('fr-FR')}.`)
    .join(' ');
}

function lastName(name: string): string {
  const parts = name.split(/\s+/).filter((part) => !/^(jr\.?|ii|iii|iv)$/i.test(part));
  return parts[parts.length - 1] ?? name;
}

function derivedHints(entry: CatalogueEntry): string[] {
  const role = POSITION_LABELS[entry.position];
  const family = lastName(entry.name);
  const familyLetters = letters(family);
  const firstLetter = familyLetters[0]?.toLocaleUpperCase('fr-FR') ?? '?';
  const single = !entry.name.trim().includes(' ');
  const nameHint = single
    ? `Connu sous un nom unique de ${familyLetters.length} lettres, commençant par ${firstLetter}, il joue à ${entry.club}.`
    : `Son nom de famille commence par la lettre ${firstLetter} et compte ${familyLetters.length} lettres ; il évolue à ${entry.club} (${role.toLocaleLowerCase('fr-FR')}).`;

  return [
    `${role} sélectionnable pour : ${entry.country}. Club actuel : ${entry.club}.`,
    `Ses initiales sont ${initials(entry.name)} et il représente la sélection suivante : ${entry.country} ; poste : ${role.toLocaleLowerCase('fr-FR')} à ${entry.club}.`,
    nameHint,
    single
      ? `${role} (${entry.country}) : son surnom de ${familyLetters.length} lettres se termine par « ${familyLetters.slice(-1)} ».`
      : `Son prénom commence par ${letters(entry.name)[0]!.toLocaleUpperCase('fr-FR')} et compte ${letters(entry.name.split(/\s+/)[0]!).length} lettres ; nationalité sportive : ${entry.country}, club : ${entry.club}.`,
  ];
}

export function enrichCatalogueHints<T extends CatalogueEntry>(entries: readonly T[]): T[] {
  const seen = new Set<string>();
  entries.forEach((entry) => entry.hints.forEach((hint) => seen.add(hint.toLocaleLowerCase('fr-FR'))));

  return entries.map((entry) => {
    const extra = [...(VERIFIED_HINTS[entry.name] ?? []), ...(VERIFIED_HINTS_TIER2[entry.name] ?? []), ...(VERIFIED_HINTS_EXTRA[entry.name] ?? []), ...derivedHints(entry)].filter((hint) => {
      const key = hint.toLocaleLowerCase('fr-FR');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return { ...entry, hints: [...entry.hints, ...extra] };
  });
}
