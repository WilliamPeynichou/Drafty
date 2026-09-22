# Draft aux enchères

Jeu de draft aux enchères 1v1, en temps réel. Voir [docs/PLAN.md](docs/PLAN.md)
pour le plan produit complet.

## Organisation

| Espace | Rôle |
|---|---|
| `shared/` | Socle commun : types du domaine, moteur de règles, protocole temps réel |
| `server/` | Node + Express + Sequelize (MySQL) + WebSocket. Seule autorité sur l'état de jeu |
| `client/` | React + Vite + TypeScript, desktop, en français |

## Prérequis

- Node 20 ou plus, pnpm 11
- MySQL local (MAMP, XAMPP ou serveur système), administré via phpMyAdmin

## Installation

Le projet est configuré pour **MAMP sur macOS** : MySQL écoute généralement
sur le port `8889`, avec l'utilisateur `root` et le mot de passe `root`.
Démarrer les serveurs Apache/MySQL dans MAMP, puis :

```bash
pnpm install
cp server/.env.example server/.env
```

Si ta configuration MAMP utilise d'autres identifiants, modifier `server/.env`.
Créer ensuite la base `draft_auction` dans phpMyAdmin (port habituel
`8888` pour phpMyAdmin), avec l'interclassement `utf8mb4_unicode_ci`, puis :

```bash
pnpm db:sync    # crée ou met à jour les tables
pnpm db:seed    # charge le catalogue initial de joueurs et d'indices
```

## Développement

```bash
pnpm dev        # shared en watch + API sur :3001 + client sur :5173
```

Le client appelle l'API et le WebSocket via le proxy Vite : aucune URL
d'API n'est codée en dur côté navigateur.

## Qualité

```bash
pnpm typecheck  # vérification des types sur les trois espaces
pnpm test       # moteur de règles, API HTTP, passerelle temps réel
pnpm build      # build de production
```

## État d'avancement

- **F1 · Socle technique** : en place (monorepo, MySQL/Sequelize, WebSocket, tests).
- **F2 · Données joueurs** : amorcée, catalogue réduit à étendre.
- **F3 · Moteur de règles** : validation des mises, résolution, limites de poste
  et score final couverts par les tests. Reste l'orchestration complète d'une partie.
- **F4 et suivantes** : à faire.

## Points d'attention

Le serveur ne transmet jamais l'identité d'un joueur caché avant la phase de
révélation : seuls le poste, l'anecdote et une référence opaque circulent.
Le minuteur de 20 secondes et la détection d'inactivité sont décidés par le
serveur seul.
