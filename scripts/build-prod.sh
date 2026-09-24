#!/usr/bin/env bash
# Construit un paquet autonome pour o2switch (cPanel « Setup Node.js App »).
# Résultat : deploy/ + drafty-prod.zip, installable avec un simple `npm install`.
set -euo pipefail
cd "$(dirname "$0")/.."

pnpm build

rm -rf deploy drafty-prod.zip
mkdir -p deploy/vendor/shared

cp -R server/dist deploy/dist
cp -R client/dist deploy/public
cp -R shared/dist deploy/vendor/shared/dist
node -e 'const p=require("./shared/package.json");delete p.scripts;delete p.devDependencies;require("fs").writeFileSync("deploy/vendor/shared/package.json",JSON.stringify(p,null,2))'

# dist/ est en ESM ; la racine reste CommonJS pour le point d'entrée Passenger.
echo '{ "type": "module" }' > deploy/dist/package.json

node -e '
const s = require("./server/package.json");
const deps = { ...s.dependencies };
deps["@draft/shared"] = "file:./vendor/shared";
const pkg = {
  name: "drafty",
  version: s.version,
  private: true,
  main: "app.js",
  engines: { node: ">=20" },
  scripts: {
    start: "node app.js",
    "db:sync": "node dist/db/sync.js",
    "db:seed": "node dist/db/seed.js"
  },
  dependencies: deps
};
require("fs").writeFileSync("deploy/package.json", JSON.stringify(pkg, null, 2) + "\n");
'

cat > deploy/app.js <<'JS'
// Point d'entrée Passenger (o2switch). Charge le serveur ESM compilé.
import('./dist/index.js').catch((error) => {
  console.error('Démarrage impossible :', error);
  process.exit(1);
});
JS

cp server/.env.production.example deploy/.env.example

(cd deploy && zip -qr ../drafty-prod.zip . -x 'node_modules/*')
echo "Paquet prêt : deploy/ et drafty-prod.zip"
