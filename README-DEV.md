# Guide de Développement EcoRide

Configuration complète de l'environnement de développement avec Docker et développement natif.

## Développement avec Docker (Recommandé)de de Développement EcoRide 🚀

Configuration complète de l'environnement de développement avec Docker et développement natif.

## Développement avec Docker (Recommandé)

### Démarrage rapide avec Docker Compose

```bash
# Cloner le projet
git clone https://github.com/2umish8/TP-EcoRide-DWWM.git
cd TP-EcoRide-DWWM

# Copier le fichier d'environnement
cp .env.example .env

# Lancer l'environnement complet
docker compose up --build

# Mode développement avec hot reload
docker compose -f compose.yaml -f compose.dev.yaml up --build
```

### Accès aux services

| Service       | URL                   | Description             |
| ------------- | --------------------- | ----------------------- |
| Frontend      | http://localhost      | Interface utilisateur   |
| Backend API   | http://localhost:3000 | API REST                |
| Adminer       | http://localhost:8080 | Interface admin MySQL   |
| Mongo Express | http://localhost:8081 | Interface admin MongoDB |

### Gestion des containers

```bash
# Voir les logs en temps réel
docker compose logs -f

# Logs d'un service spécifique
docker compose logs -f backend

# Arrêter les services
docker compose down

# Redémarrer un service
docker compose restart backend

# Nettoyer (⚠️ supprime les données)
docker compose down -v

# Mode développement avec profils
COMPOSE_PROFILES=development docker compose up --build
```

### Développement avec volumes montés

En mode développement, les dossiers source sont montés dans les containers :

```yaml
# Frontend - Hot reload activé
volumes:
  - ./Frontend/src:/usr/src/app/src:ro
  - ./Frontend/public:/usr/src/app/public:ro

# Backend - Nodemon pour le rechargement auto
volumes:
  - ./Backend:/usr/src/app:delegated
  - /usr/src/app/node_modules
```

## Développement Natif (Alternative)

### Prérequis

- **Node.js** 18+ et npm
- **MySQL** 8.0+
- **MongoDB** 4.4+
- **Redis** 7+ (optionnel)
- **Git**

### Installation

```bash
# 1. Cloner et naviguer
git clone https://github.com/2umish8/TP-EcoRide-DWWM.git
cd TP-EcoRide-DWWM

# 2. Backend (Terminal 1)
cd Backend
npm install
cp .env.example .env  # Configurer vos variables
npx prisma generate    # Générer le client Prisma
npx prisma db push     # Appliquer le schéma MySQL
npm run dev           # Serveur avec hot reload

# 3. Frontend (Terminal 2)
cd Frontend
npm install
cp .env.example .env.local  # Variables frontend
npm run dev           # Serveur Vite avec HMR
```

### Configuration des bases de données locales

#### MySQL avec Prisma

```bash
# 1. Créer la base de données
mysql -u root -p
CREATE DATABASE ecoride_db;

# 2. Configurer Prisma (.env)
DATABASE_URL="mysql://root:password@localhost:3306/ecoride_db"

# 3. Appliquer le schéma
npx prisma db push

# 4. (Optionnel) Données de test
mysql -u root -p ecoride_db < Database/insertion_donnees.sql
```

#### MongoDB

```bash
# Démarrer MongoDB local
mongod

# Ou utiliser MongoDB Atlas (cloud)
MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/ecoride_db"
```

## Variables d'Environnement

### Backend (.env)

```env
# === Base de données ===
DATABASE_URL="mysql://root:password@localhost:3306/ecoride_db"
MONGODB_URI="mongodb://localhost:27017/ecoride_db"

# === Sécurité ===
JWT_SECRET="development-secret-key-change-in-production"
JWT_EXPIRATION="24h"
BCRYPT_SALT_ROUNDS=10

# === Serveur ===
PORT=3000
NODE_ENV=development

# === CORS ===
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000"

# === Logs ===
LOG_LEVEL="debug"
```

### Frontend (.env.local)

```env
# === API ===
VITE_API_URL=http://localhost:3000/api

# === Application ===
VITE_APP_NAME="EcoRide Dev"
VITE_APP_VERSION="1.0.0-dev"

# === Développement ===
VITE_DEBUG=true
```

### Docker (.env)

```env
# === Projet ===
COMPOSE_PROJECT_NAME=ecoride

# === Base de données ===
MYSQL_ROOT_PASSWORD=dev_root_password
MYSQL_DATABASE=ecoride_db
MYSQL_USER=ecoride_user
MYSQL_PASSWORD=dev_user_password

MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=dev_mongo_password

# === Sécurité ===
JWT_SECRET=development-docker-secret
```

## Tests & Validation

### Tests Backend

```bash
cd Backend

# Tests API complets
npm run test:full

# Tests MongoDB
npm run mongo:test

# Tests de recherche
npm run test:advanced

# Diagnostic système
npm run check
```

### Tests Frontend

```bash
cd Frontend

# Tests unitaires (Vitest)
npm run test:unit

# Tests E2E (Playwright)
npm run test:e2e

# Linting
npm run lint
```

### Tests avec Docker

```bash
# Lancer les tests dans les containers
docker compose exec backend npm run test:full
docker compose exec frontend npm run test:unit
```

## Commandes de Développement

### Backend

```bash
# Développement
npm run dev              # Hot reload avec nodemon
npm start                # Production

# Base de données
npm run db:create        # Info création DB
npm run db:clean         # Nettoyer les données
npm run db:reset         # Reset complet

# Prisma
npx prisma generate      # Générer le client
npx prisma db push       # Appliquer le schéma
npx prisma studio        # Interface graphique

# MongoDB
npm run mongo:check      # Vérifier la connexion
npm run mongo:quick      # Test rapide

# TypeScript
npm run ts:check         # Vérification types
npm run ts:demo          # Build démo TS
```

### Frontend

```bash
# Développement
npm run dev              # Serveur Vite avec HMR
npm run build            # Build production
npm run preview          # Preview du build

# Tests
npm run test:unit        # Tests Vitest
npm run test:e2e         # Tests Playwright
npm run test:unit -- --watch  # Mode watch

# Qualité
npm run lint             # ESLint
npm run format           # Prettier
```

## Architecture de Développement

### Structure des projets

```
TP-EcoRide-DWWM/
├── 🐳 compose.yaml           # Docker Compose principal
├── 🐳 compose.dev.yaml       # Override développement
├── 📄 .env.example           # Template variables
├── 📁 Backend/               # API Node.js
│   ├── 📄 Dockerfile
│   ├── 📄 .env.example
│   └── 📁 [code source]
├── 📁 Frontend/              # Interface Vue.js
│   ├── 📄 Dockerfile
│   ├── 📄 nginx.conf
│   └── 📁 [code source]
└── 📁 Documentation/         # Docs techniques
```

### Workflow de développement

```mermaid
graph TD
    A[Git Clone] --> B[Docker Compose Up]
    B --> C[Développement]
    C --> D[Tests Locaux]
    D --> E[Commit & Push]
    
    C --> F[Hot Reload Frontend]
    C --> G[Hot Reload Backend]
    C --> H[DB Changes via Prisma]
```

### Ports utilisés

| Service       | Port Local | Port Docker | Description       |
| ------------- | ---------- | ----------- | ----------------- |
| Frontend Dev  | 5173       | 5173        | Vite dev server   |
| Frontend Prod | 80         | 80          | Nginx             |
| Backend       | 3000       | 3000        | Express API       |
| MySQL         | 3306       | 3306        | Base de données   |
| MongoDB       | 27017      | 27017       | Base NoSQL        |
| Redis         | 6379       | 6379        | Cache             |
| Adminer       | 8080       | 8080        | Interface MySQL   |
| Mongo Express | 8081       | 8081        | Interface MongoDB |

## Workflow Git

### Branches recommandées

```bash
# Branche principale
main

# Développement
development

# Features
feature/nom-feature

# Corrections
hotfix/nom-correction
```

### Commits conventionnels

```bash
# Types de commits
feat:     # Nouvelle fonctionnalité
fix:      # Correction de bug
docs:     # Documentation
style:    # Formatage, style
refactor: # Refactoring
test:     # Tests
chore:    # Maintenance

# Exemples
git commit -m "feat(auth): add JWT token rotation"
git commit -m "fix(docker): correct nginx configuration"
git commit -m "docs(api): update endpoint documentation"
```

## Debugging

### Logs Docker

```bash
# Tous les services
docker compose logs -f

# Service spécifique
docker compose logs -f backend

# Dernières lignes
docker compose logs --tail=50 backend
```

### Debug Node.js dans Docker

```yaml
# compose.dev.yaml
services:
  backend:
    ports:
      - "3000:3000"
      - "9229:9229"  # Port debug
    environment:
      - NODE_OPTIONS=--inspect=0.0.0.0:9229
```

### Debug Frontend

```bash
# Vue DevTools (extension navigateur)
# Sources disponibles via Source Maps

# Debug Vite
DEBUG=vite:* npm run dev
```

## Optimisations Performance

### Développement

```bash
# Cache npm pour builds plus rapides
npm ci --cache /tmp/.npm

# Parallel builds
docker compose up --build --parallel

# Volumes pour éviter rebuilds
volumes:
  - node_modules:/usr/src/app/node_modules
```

### Monitoring local

```bash
# Performance backend
npm run dev -- --inspect

# Analyse bundle frontend
npm run build -- --report

# Memory usage
docker stats
```

## Ressources

### Documentation officielle
- [Vue.js 3](https://vuejs.org/)
- [Express.js](https://expressjs.com/)
- [Prisma](https://www.prisma.io/)
- [Docker Compose](https://docs.docker.com/compose/)

### Outils recommandés
- **IDE** : VSCode + extensions Vue/Docker
- **Database** : MySQL Workbench, MongoDB Compass
- **API Testing** : Postman, Insomnia
- **Git** : GitKraken, SourceTree

---

**Happy Coding! Développement EcoRide simplifié avec Docker**
