# Frontend - EcoRide (Vue 3 + Vite)

## Description

Interface utilisateur développée avec Vue 3, Vite, Pinia et Bootstrap 5.

## Installation et développement

```powershell
cd Frontend
npm install
copy .env.example .env.local
npm run dev
```

## Build production

```powershell
npm run build
npm run preview
```

## Variables d'environnement

- `VITE_API_URL` : URL de l'API backend (ex. `https://api.mondomaine.com/api`)

## Stack de déploiement

- Hébergement frontend recommandé : Netlify
- Backend : Render
- MySQL : Aiven (MySQL managé)
- MongoDB : MongoDB Atlas

Assurez-vous que `VITE_API_URL` et les autres variables nécessaires sont configurées dans Netlify avant la compilation.

### Note de configuration pour Netlify

Le dépôt inclut un fichier `netlify.toml` à la racine du projet qui configure Netlify pour construire l'application frontend à partir du répertoire `Frontend`. Si vous configurez Netlify manuellement dans l'interface web, réglez :

- Répertoire de base (Base directory) : `Frontend`
- Commande de build (Build command) : `npm ci && npm run build`
- Répertoire de publication (Publish directory) : `dist`

Conserver `netlify.toml` dans le dépôt permet à Netlify de détecter le bon répertoire de base et d'éviter des erreurs telles que « Base directory does not exist: /opt/build ».

## Tests et qualité

- Tests unitaires : `npm run test:unit`
- Tests E2E : `npm run test:e2e`
- Lint : `npm run lint`

### Security: audit & remediation

Following an `npm audit`, you may encounter transitive vulnerabilities (e.g., json5). Recommended steps:

```powershell
cd Frontend
# Refresh lockfile
rm -r node_modules package-lock.json
npm ci

# Try the automatic fixes for compatible updates
npm run audit:fix

# If some vulnerabilities remain (no fix available), you can attempt to force safe versions
# - We added an `overrides` entry in package.json to force `json5` to 2.2.3, which should remove the high vulnerability
# - After edits, regenerate lock and run audit again
npm ci
npm run audit
```

If you still see high or critical vulnerabilities, inspect the package tree to find the responsible package and either update or replace it:

```powershell
# Find the package pulling the vulnerable dependency
npm ls json5

# Find who depends on loader-utils or callback-loader
npm ls loader-utils
npm ls callback-loader
```

If the dependency is unused (like `vue-icons` in older branches), we remove it from `package.json` to avoid transitive vulnerabilities; otherwise consider replacing it by an actively maintained alternative (e.g., `@heroicons/vue`, Font Awesome, or custom SVG components).

Note: We removed `vite-plugin-vue-devtools` from devDependencies because it depended on `vite-plugin-inspect` with a peer requiring Vite <= 6, creating peer conflicts with Vite 7. If you used the devtools plugin, you can re-add a compatible alternative or update the plugin once a Vite 7-compatible version is available.

### Playwright E2E

- Lancer les tests E2E (nécessite le backend en cours d'exécution) :

```powershell
# 1. Démarrer le backend (dans un terminal séparé) :
cd Backend
npm run dev

# 2. Dans le frontend, installer les dépendances et lancer les tests :
cd Frontend
npm ci
npm run test:e2e
```

- En CI (GitHub Actions) une workflow `playwright-e2e.yml` est inclus au chemin `.github/workflows/playwright-e2e.yml`.

Si vous voulez re-seeder la base avant de lancer les tests localement, utilisez:

```powershell
cd Frontend
npm run playwright:seed
```

Note: Assurez-vous que le backend est en cours d'exécution sur `http://localhost:3000` avant de lancer le script de seed et/ou les tests Playwright.

## Documentation

Consultez `../Documentation/API_DOCUMENTATION.md` et `../README.md` pour la documentation générale du projet.
