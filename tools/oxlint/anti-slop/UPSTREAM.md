# Provenance du plugin anti-slop

| Élément | Valeur |
|---|---|
| Source | `dmmulroy/anti-slop`, installé via `npx skills add dmmulroy/anti-slop` |
| Copie effectuée par | `.agents/skills/install-anti-slop/scripts/install.mjs` |
| Révision exacte de la source | inconnue : le script d'installation ne publie pas le commit d'origine |
| Chemin installé | `tools/oxlint/anti-slop/` |
| Point d'entrée | `tools/oxlint/anti-slop/index.ts` |
| Dépendances | `oxlint@1.85.0`, `@oxlint/plugins@1.85.0` (versions épinglées, identiques) |
| Configuration | `oxlint.config.ts` à la racine |

## Écarts assumés

- Le plugin Effect n'est pas activé : `effect` n'est déclaré dans aucun manifeste
  du dépôt.
- `**/dist/**` et `**/node_modules/**` ont été ajoutés aux motifs ignorés, en
  plus des répertoires d'outillage d'agents listés par la procédure.

## Constats non résolus

`server/src/data/catalogue-validation.ts` conserve six constats
(`no-runtime-typeof`, `require-safety-comment-for-type-assertion`). Ce fichier
est précisément le point de contrôle des données sources du catalogue : ses
vérifications `typeof` valident des entrées rédigées à la main avant tout
import en base. Les règles n'ont pas été désactivées et aucun type n'a été
affaibli pour les faire taire ; le nettoyage de ce fichier reste à arbitrer.

Le reste du dépôt est conforme : 186 constats initiaux, 180 corrigés.
