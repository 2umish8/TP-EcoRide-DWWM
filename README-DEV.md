# Configuration Environnement de Développement

## 🚀 Démarrage Rapide

### 1. Prérequis
- Node.js (v18+)
- MongoDB (local ou Atlas)
- MySQL (optionnel pour certaines fonctionnalités)

### 2. Installation
```bash
# Backend
cd Backend
npm install
cp .env.example .env  # Configurer vos variables locales
npm start

# Frontend (terminal séparé)
cd Frontend
npm install
npm run dev
```

### 3. Variables d'environnement

#### Développement Local (`.env`)
```bash
# Base de données
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_password
DB_NAME=ecoride_db

# Sécurité
JWT_SECRET=votre_secret_jwt
JWT_EXPIRATION=1h
BCRYPT_SALT_ROUNDS=10

# API
PORT=3000
VITE_API_URL=http://localhost:3000/api

# MongoDB
MONGODB_URI=mongodb://localhost:27017/ecoride_reviews
```

#### Production (Railway/Render/etc.)
Les variables sont automatiquement chargées depuis l'environnement du serveur.

### 4. Bases de données

#### MongoDB (Recommandé)
- **Local**: `mongodb://localhost:27017/ecoride_reviews`
- **Atlas**: `mongodb+srv://user:pass@cluster.mongodb.net/db`

#### MySQL (Optionnel)
- Installer MySQL local ou utiliser un service cloud
- Créer la base `ecoride_db`
- Importer les scripts SQL depuis `Backend/Database/`

## 🔧 Commandes Utiles

```bash
# Backend
npm start          # Démarrage production
npm run dev        # Démarrage développement (avec nodemon)
npm test           # Tests

# Frontend
npm run dev        # Développement
npm run build      # Build production
npm run preview    # Preview build
```

## 🌐 URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **MongoDB Studio**: http://localhost:27017 (si local)

## 📝 Notes

- Le `.env` local n'est jamais commité (dans .gitignore)
- Pour le déploiement, configurez les variables dans votre plateforme (Railway, Render, etc.)
- MongoDB Atlas fonctionne à la fois en local et en production
