# Guide de déploiement - EcoRide

Ce document décrit les étapes pratiques pour déployer et vérifier l'application EcoRide en respectant la configuration actuelle du dépôt.

## Vue d'ensemble

EcoRide est une application full-stack composée de :
- Frontend : Vue 3 + Vite (dossier `Frontend`), déployé typiquement sur Netlify
- Backend : Node.js + Express (dossier `Backend`), déployé typiquement sur Render
- Bases de données : MySQL (service managé tel que Aiven) + MongoDB (Atlas)

La configuration du dépôt inclut un fichier `netlify.toml` qui indique à Netlify d'utiliser `Frontend` comme base directory, et le backend expose un endpoint de santé sur `/api/health`.

## Récapitulatif important vérifié dans le dépôt

- Le fichier `netlify.toml` à la racine configure Netlify : base = `Frontend`, build command = `npm ci && npm run build`, publish = `dist`.
- Le frontend a son `package.json` dans `Frontend` avec les scripts `build`, `dev` et `preview`.
- Le backend expose un endpoint health : `GET /api/health` et écoute par défaut sur le port `3000`.
- Les commandes Docker Compose sont fournies via `compose.yaml` et `compose.dev.yaml` pour un environnement local conteneurisé.

## Prérequis

Outils nécessaires :
- Node.js (v18+)
- npm
- Git
- Docker & Docker Compose (pour déploiement local avec containers)
- Compte Netlify (frontend)
- Compte Render (backend) ou autre plateforme de votre choix
- Compte MongoDB Atlas
- Accès à un service MySQL managé (Aiven, Railway, etc.) ou instance MySQL

## Variables d'environnement (exemples)

Backend (`Backend/.env` ou variables sur la plateforme d'hébergement) :
```bash
DATABASE_URL="mysql://username:password@host:port/database"
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/database"
JWT_SECRET="your-256-bit-secret-key"
JWT_EXPIRATION="24h"
BCRYPT_SALT_ROUNDS=12
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS="https://ecoridetp.netlify.app"
```

Frontend (`Frontend/.env.production` ou variables Netlify) :
```bash
VITE_API_URL=https://<your-backend-host>/api
VITE_APP_NAME="EcoRide"
VITE_APP_VERSION="1.0.0"
```

## Déploiement local (conteneurisé)

Utiliser les fichiers `compose.yaml` et `compose.dev.yaml` fournis pour démarrer l'ensemble (frontend + backend + bases) en local :

```powershell
# À la racine du dépôt
docker compose -f compose.yaml -f compose.dev.yaml up --build
# En détaché
docker compose -f compose.yaml -f compose.dev.yaml up --build -d
```

Vérifier les services :

```powershell
docker compose ps
docker compose logs -f
```

Accès local par défaut :

- Frontend : http://localhost:5173 (ou via le proxy nginx si vous utilisez la stack compose)
- Backend : http://localhost:3000

## Déploiement du frontend sur Netlify

1. Le dépôt contient `netlify.toml` configuré pour construire depuis `Frontend`. Si vous configurez Netlify manuellement, réglez :

   - Base directory : `Frontend`
   - Build command : `npm ci && npm run build`
   - Publish directory : `dist`

2. Variables d'environnement à définir dans l'interface Netlify :

   - `VITE_API_URL` : URL publique de l'API (par ex. `https://your-backend.onrender.com/api`)

3. Déployer via l'interface Git ou utiliser `netlify-cli` :

```powershell
npm install -g netlify-cli
netlify login
cd Frontend
netlify deploy --prod --dir=dist
```

## Déploiement du backend

Le dépôt indique Render comme plateforme recommandée dans la documentation interne. Principales étapes :

1. Sur la plateforme (Render, Heroku, Railway, etc.), créer un service Node.js et connecter le repository.
2. Définir les variables d'environnement (voir section Variables d'environnement ci-dessus).
3. Configurer la commande de démarrage : `npm start` (le `package.json` du backend définit `start` -> `node server.js`).
4. S'assurer que Build/Deploy exécute `npm install` et que `npx prisma generate` est exécuté (le dépôt a un `postinstall` qui lance `npx prisma generate`).

## Vérifications post-déploiement

1. Health check backend :

```powershell
curl -f https://<your-backend-host>/api/health
```

2. Tester un endpoint public (ex. route d'authentification) et tester l'authentification si pertinent.

## Tests

Backend - exécuter la suite :

```powershell
cd Backend
npm run test:full
```

Frontend :

```powershell
cd Frontend
npm install
npm run test:unit
npm run test:e2e
```

## Commandes utiles pour le développement sans Docker

Backend :

```powershell
cd Backend
npm install
copy .env.example .env
npx prisma generate
npx prisma db push
npm run dev
```

Frontend :

```powershell
cd Frontend
npm install
copy .env.example .env.local
npm run dev
```

## Sauvegardes et maintenance

- MySQL : `mysqldump -h [host] -u [user] -p[password] ecoride_db > backup.sql`
- MongoDB Atlas : utiliser les sauvegardes managées Atlas ou `mongodump` pour export manuel.

## Dépannage - points vérifiés dans le dépôt

- Si Netlify build échoue, vérifier que `Base directory` est `Frontend` ou que le `netlify.toml` est présent.
- Si backend retourne des erreurs de base de données, vérifier `DATABASE_URL` et la disponibilité du service MySQL.
- Pour les problèmes de CORS, vérifier `ALLOWED_ORIGINS` dans l'environnement backend ; le code du projet autorise `https://ecoridetp.netlify.app` par défaut.

## Checklist rapide avant production

- [ ] Variables d'environnement définies dans les plateformes
- [ ] Base MySQL migrée et peuplée si nécessaire
- [ ] MongoDB Atlas configurée et accessible
- [ ] Backend déployé et health endpoint OK
- [ ] Frontend déployé et VITE_API_URL correct
- [ ] HTTPS activé et domaines configurés
- [ ] Backups et monitoring en place

## Comptes de test (fournis pour le développement)

| Role          | Username | Password   |
| ------------- | -------- | ---------- |
| Administrator | Admin    | Admin2025! |
| Driver        | test     | Test2025!  |
| Passenger     | user     | User2025!  |

---

Si vous voulez, j'ajoute une version courte à coller dans la page d'administration ou dans la checklist de déploiement automatisé.
# Sécurité
JWT_SECRET="your-256-bit-secret-key"
JWT_EXPIRATION="24h"
BCRYPT_SALT_ROUNDS=12

# Serveur
PORT=3000
NODE_ENV="production"

# CORS
ALLOWED_ORIGINS="https://your-netlify-site.netlify.app"
```

#### Frontend (.env.production)
```bash
VITE_API_URL=https://your-railway-app.railway.app/api
VITE_APP_NAME="EcoRide"
VITE_APP_VERSION="1.0.0"
```

## Déploiement du Frontend (Netlify)

### 1. Préparation du code

```bash
# Depuis le répertoire Frontend
cd Frontend

# Installer les dépendances
npm install

# Build de production
npm run build

# Le build sera généré dans le dossier 'dist'
```

### 2. Configuration Netlify

#### Via l'interface web :
1. Se connecter à [Netlify](https://netlify.com)
2. Cliquer sur "New site from Git"
3. Sélectionner le repository GitHub
4. Configurer le build :
   - **Build command** : `npm run build`
   - **Publish directory** : `Frontend/dist`
5. Ajouter les variables d'environnement :
   - `VITE_API_URL` : URL de l'API Railway
6. Déployer

#### Via netlify-cli (optionnel) :
```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Se connecter
netlify login

# Déployer
netlify deploy --prod --dir=Frontend/dist
```

### 3. Configuration du domaine (optionnel)
- Dans les paramètres du site Netlify
- Ajouter un domaine personnalisé
- Configurer HTTPS automatique

## Déploiement du Backend (Railway)

### 1. Préparation du code

```bash
# Depuis le répertoire Backend
cd Backend

# Installer les dépendances
npm install

# Générer le client Prisma
npx prisma generate

# Créer le build de production
npm run build
```

### 2. Configuration Railway

#### Via l'interface web :
1. Se connecter à [Railway](https://railway.app)
2. Créer un nouveau projet
3. Ajouter un service "Empty Service"
4. Connecter le repository GitHub
5. Configurer les variables d'environnement (voir section ci-dessus)
6. Déployer automatiquement

#### Variables d'environnement dans Railway :
```
DATABASE_URL=mysql://...
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret
JWT_EXPIRATION=24h
BCRYPT_SALT_ROUNDS=12
NODE_ENV=production
ALLOWED_ORIGINS=https://your-netlify-site.netlify.app
```

### 3. Configuration de la base de données MySQL

#### Créer la base MySQL sur Railway :
1. Dans Railway, ajouter un service "MySQL"
2. Copier l'URL de connexion
3. Exécuter les scripts SQL :
```bash
# Appliquer le schéma de base de données
mysql -h [host] -u [user] -p[password] < Database/creation_base_de_donnees.sql

# Insérer les données de test
mysql -h [host] -u [user] -p[password] < Database/insertion_donnees_test.sql
```

#### Migration Prisma :
```bash
# Appliquer les migrations Prisma
npx prisma db push
```

## Configuration MongoDB Atlas

### 1. Créer un cluster MongoDB Atlas

1. Se connecter à [MongoDB Atlas](https://cloud.mongodb.com)
2. Créer un nouveau cluster (tier gratuit disponible)
3. Créer un utilisateur de base de données
4. Configurer l'accès réseau (IP whitelist ou 0.0.0.0/0 pour développement)
5. Obtenir la connection string

### 2. Configuration de la base de données

```javascript
// La connexion MongoDB est configurée automatiquement via MONGODB_URI
// Les collections seront créées automatiquement lors du premier démarrage
```

## Tests post-déploiement

### Tests automatisés

```bash
# Tests backend
cd Backend
npm run test:full

# Tests frontend
cd ../Frontend
npm run test:unit
npm run test:e2e
```

### Tests manuels

#### Vérification de l'API :
```bash
# Test endpoint santé
curl https://your-railway-app.railway.app/api/health

# Test connexion utilisateur
curl -X POST https://your-railway-app.railway.app/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

#### Vérification du frontend :
- Accéder à l'URL Netlify
- Tester l'inscription/connexion
- Vérifier les fonctionnalités principales

## Monitoring et maintenance

### Logs et monitoring

#### Railway (Backend) :
- Accès aux logs en temps réel via le dashboard
- Métriques de performance
- Alertes de disponibilité

#### Netlify (Frontend) :
- Logs de build et déploiement
- Analytics de trafic
- Monitoring des erreurs JavaScript

#### MongoDB Atlas :
- Métriques de performance
- Utilisation du stockage
- Logs de connexion

### Sauvegarde des données

#### MySQL (Railway) :
```bash
# Export de la base de données
mysqldump -h [host] -u [user] -p[password] ecoride_db > backup.sql
```

#### MongoDB Atlas :
- Sauvegarde automatique configurée dans Atlas
- Export manuel via MongoDB Compass

### Mises à jour

#### Processus de déploiement continu :
1. Push des changements sur la branche `main`
2. Railway rebuild automatiquement le backend
3. Netlify rebuild automatiquement le frontend
4. Tests automatisés s'exécutent
5. Validation manuelle si nécessaire

## Dépannage

### Problèmes courants

#### Erreur de connexion base de données :
- Vérifier les variables d'environnement
- Contrôler l'accès réseau dans Atlas/Railway
- Vérifier les credentials

#### Erreur CORS :
- Vérifier `ALLOWED_ORIGINS` dans le backend
- S'assurer que l'URL Netlify est correcte

#### Build frontend échoue :
- Vérifier les dépendances : `npm install`
- Contrôler les variables d'environnement Vite
- Vérifier la configuration Vite

#### API non accessible :
- Vérifier le statut du service Railway
- Contrôler les logs du backend
- Tester les endpoints individuellement

### Commandes de diagnostic

```bash
# Vérifier la santé du backend
curl https://your-railway-app.railway.app/api/health

# Tester la connexion MySQL
mysql -h [host] -u [user] -p[password] -e "SELECT 1"

# Tester la connexion MongoDB
mongosh "mongodb+srv://[connection-string]" --eval "db.runCommand('ping')"
```

## Support

Pour toute question concernant le déploiement :
- Consulter la documentation technique : `Documentation/Documentation-Technique.md`
- Vérifier les logs d'erreur détaillés
- Tester en environnement local avant le déploiement

---

## Checklist de déploiement

- [ ] Repository GitHub configuré
- [ ] Variables d'environnement définies
- [ ] Base MySQL créée et migrée
- [ ] Base MongoDB Atlas configurée
- [ ] Backend déployé sur Railway
- [ ] Frontend déployé sur Netlify
- [ ] Tests automatisés passés
- [ ] Tests manuels réussis
- [ ] Domaines configurés (optionnel)
- [ ] HTTPS activé
- [ ] Monitoring configuré
- [ ] Sauvegarde automatique activée

**URLs de production :**
- Frontend : https://ecoridetp.netlify.app
- Backend API : https://[your-railway-app].railway.app

## Comptes de test

| Role          | Username | Password   | Access Level              |
| ------------- | -------- | ---------- | ------------------------- |
| Administrator | Admin    | Admin2025! | Full system access        |
| Driver        | test     | Test2025!  | Create trips, participate |
| Passenger     | user     | User2025!  | Participate in trips      | </content> |
<parameter name="filePath">c:\Users\umisc\OneDrive\Documents\ECF\TP-EcoRide-DWWM\DEPLOYMENT.md