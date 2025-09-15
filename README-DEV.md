# Configuration Environnement de Développement

## 🚀 Démarrage Rapide

### 1. Prérequis
- Node.js (v18+)
- MongoDB (local ou Atlas)
- MySQL (géré via Prisma ORM)

### 2. Installation
```bash
# Backend
cd Backend # Aller dans le dossier Backend
npm install # Installer les dépendances
cp .env.example .env  # Configurer vos variables locales
npx prisma generate    # Générer le client Prisma
npx prisma db push     # Appliquer le schéma à la base MySQL
npm run dev            # Démarrer le serveur en mode développement

# Frontend (terminal séparé)
cd Frontend # Aller dans le dossier Frontend
npm install # Installer les dépendances
npm run dev # Démarrer le serveur en mode développement
```

### 3. Variables d'environnement

#### Développement Local (`.env`)
```bash
# Base de données
# Bien évidemment, changez ces valeurs selon votre configuration locale
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
VITE_API_URL=http://localhost:3000/api # Ou l'URL de votre API backend

# MongoDB
MONGODB_URI=mongodb://localhost:27017/ecoride_reviews # Ou peu importe est votre URI MongoDB
```

#### Production (Railway/Render/etc.)
Les variables sont automatiquement chargées depuis l'environnement du serveur.

### 4. Bases de données

#### MongoDB (Recommandé)
- **Local**: `mongodb://localhost:27017/ecoride_reviews`
- **Atlas**: `mongodb+srv://user:pass@cluster.mongodb.net/db`

#### MySQL (Gestion via Prisma)
- Installer MySQL local ou utiliser un service cloud
- Créer la base `ecoride_db` (si non existante)
- Configurer la connexion dans `.env` (voir exemple ci-dessus)
- Utiliser Prisma pour la gestion du schéma et des migrations :
	- `npx prisma generate` pour générer le client
	- `npx prisma db push` pour appliquer le schéma
	- Les scripts SQL dans `Backend/Database/` sont optionnels pour l'initialisation manuelle

## 🔧 Commandes Utiles

```bash
# Backend
npm start              # Démarrage production
npm run dev            # Démarrage développement (avec nodemon)
npm test               # Tests
npx prisma generate    # Générer le client Prisma
npx prisma db push     # Appliquer le schéma Prisma

# Frontend
npm run dev            # Développement
npm run build          # Build production
npm run preview        # Preview build
```

## 🌐 URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **MongoDB Studio**: http://localhost:27017 (si local, et si ça marche pas, il faudra utiliser http://127.0.0.1:27017 (version IPV4))

## 📝 Notes

- Le `.env` local n'est jamais commité (dans .gitignore)
- Pour le déploiement, configurez les variables dans votre plateforme (Railway, Render, etc.)
- MongoDB Atlas fonctionne à la fois en local et en production, lien non fourni ici pour des raisons de sécurité.
