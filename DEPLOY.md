# Déploiement sur o2switch

Une seule app Node sert l'API (`/api`), le WebSocket (`/ws`) et le client React.

## 1. Construire le paquet (en local)

```bash
pnpm build:prod
```

Produit `deploy/` et `drafty-prod.zip` (sans `node_modules`).

## 2. Préparer cPanel (une seule fois)

1. **Domaines** : créer le sous-domaine (ex. `drafty.mondomaine.fr`), puis activer le SSL (Let's Encrypt / AutoSSL).
2. **Bases de données MySQL** : créer la base `cpaneluser_drafty` et l'utilisateur, avec tous les privilèges.
3. **Setup Node.js App** → *Create Application* :
   - Node.js version : 20 ou plus récent
   - Application mode : `Production`
   - Application root : `drafty` (dossier dans votre home)
   - Application URL : le sous-domaine
   - Application startup file : `app.js`
4. Ajouter les variables d'environnement (modèle : `server/.env.production.example`) :
   `NODE_ENV=production`, `PUBLIC_DIR=public`, `TRUST_PROXY=1`, `CLIENT_ORIGIN`, `DB_*` et `GOOGLE_*`.
   Ne pas définir `PORT`, car Passenger le fournit.

## 3. Envoyer le code

1. **Gestionnaire de fichiers** : envoyer `drafty-prod.zip` dans `~/drafty`, puis l'extraire.
2. **Setup Node.js App** : cliquer sur *Run NPM Install*.

## 4. Initialiser la base (terminal SSH ou « Terminal » cPanel)

```bash
source ~/nodevenv/drafty/20/bin/activate && cd ~/drafty
npm run db:sync
npm run db:seed
```

Sans SSH, vous pouvez aussi exporter la base locale depuis phpMyAdmin, puis l'importer dans le phpMyAdmin d'o2switch.

## 5. Démarrer et vérifier

- *Setup Node.js App* → **Restart**
- `https://drafty.mondomaine.fr/api/health` doit renvoyer `"database":"up"`.
- Ouvrir le site, créer une partie : si le lobby se met à jour, le WebSocket fonctionne.
- Google OAuth : ajouter `https://drafty.mondomaine.fr/api/auth/google/callback` dans les URI de redirection autorisées.

## Mises à jour

```bash
pnpm build:prod
```

Envoyer et extraire le zip en écrasant les fichiers, puis *Run NPM Install* si les dépendances ont changé, puis **Restart**.
Relancer `npm run db:sync` si les modèles ont changé.

## Dépannage

- Logs : `~/drafty/stderr.log` (Passenger), ou *Setup Node.js App* → logs.
- Page blanche : vérifier que `PUBLIC_DIR=public` est bien défini.
- Cookies de session perdus : vérifier `TRUST_PROXY=1` et l'accès en HTTPS.
