# Documentation Technique - EcoRide

## Application Déployée - Accès Direct

**L'application EcoRide est maintenant déployée et accessible en ligne !**

### Accès à l'application
**URL : https://ecoridetp.netlify.app/**

Cette documentation technique décrit l'architecture et les technologies utilisées dans l'application déployée.

### Comptes de test prêts à utiliser

| Rôle               | Pseudo         | Mot de passe | Accès         |
| --------------------- | ----------------- | --------------- | ---------------- |
| **Administrateur** | Admin             | Admin2025!       | Gestion système  |
| **Utilisateur**    | test              | Test2025!        | Participation&Création trajets    |

*Vous pouvez créer un compte utilisateur allant sur le bouton "Inscription" et en renseignant les champs requis. Vous serez par défaut passager, mais vous pouvez devenir conducteur en renseignant les champs requis.*
---

## Architecture générale

### Vue d'ensemble

EcoRide est une application web full-stack composée de :

-   **Frontend** : Vue.js 3 avec Composition API
-   **Backend** : Node.js avec Express.js
-   **Base de données** : MySQL (principale, gérée via Prisma ORM) + MongoDB (avis et notes)
-   **ORM** : Prisma pour la gestion du schéma MySQL
-   **Authentification** : JWT avec bcrypt

### Diagramme d'architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Databases     │
│   Vue.js 3      │◄──►│   Express.js    │◄──►│   MySQL +       │
│   Bootstrap 5   │    │   Node.js       │    │   MongoDB       │
│   Port: 5173    │    │   Port: 3000    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```
PS: Les ports sont pour l'accès local, l'application est déployée sur Netlify et est accessible à l'adresse https://ecoridetp.netlify.app/

## Structure des dossiers

### Backend (`/Backend/`)

```
Backend/
├── Config/                 # Configuration base de données
│   ├── db.js              # Connexion MySQL via Prisma
│   └── mongodb.js         # Connexion MongoDB
├── controllers/           # Logique métier
│   ├── adminController.js
│   ├── carpoolingController.js
│   ├── creditsController.js
│   ├── participationController.js
│   ├── preferencesController.js
│   ├── reviewController.js
│   └── searchAdvanced.js
├── models/               # Modèles de données
├── prisma/               # Schéma Prisma (schema.prisma)
├── routes/               # Routes API
├── scripts/              # Scripts de test et utilitaires
├── utils/                # Fonctions utilitaires
├── authMiddleware.js     # Middleware d'authentification
├── server.js             # Point d'entrée
└── package.json          # Dépendances
```

### Frontend (`/Frontend/`)

```
Frontend/
├── src/
│   ├── components/       # Composants Vue réutilisables
│   ├── views/           # Pages de l'application
│   ├── router/          # Configuration des routes
│   ├── services/        # Services API
│   └── assets/          # Ressources statiques
├── public/              # Fichiers publics
├── e2e/                 # Tests end-to-end
├── index.html           # Point d'entrée HTML
├── vite.config.js       # Configuration Vite
└── package.json         # Dépendances
```

## Base de données

### MySQL - Données principales (gérées via Prisma)

**Tables principales (modélisées dans `prisma/schema.prisma`) :**

-   `users` - Utilisateurs de la plateforme
-   `vehicles` - Véhicules des conducteurs
-   `carpools` - Trajets de covoiturage
-   `participations` - Réservations des passagers
-   `credits` - Système de crédits
-   `preferences` - Préférences utilisateurs

**Relations clés :**

```prisma
model User {
    id           Int      @id @default(autoincrement())
    vehicles     Vehicle[]
    driverTrips  Carpool[] @relation("DriverTrips")
    participations Participation[]
    preferences  Preferences?
}
// ...voir schema.prisma pour la modélisation complète
```

### MongoDB - Système d'avis

**Collections :**

-   `reviews` - Avis et notes des utilisateurs
-   `driver_ratings` - Moyennes des notes par conducteur

**Structure d'un avis :**

```json
{
    "_id": "ObjectId",
    "reviewerId": "number",
    "reviewedUserId": "number",
    "carpoolId": "number",
    "rating": "number (1-5)",
    "comment": "string",
    "createdAt": "Date"
}
```

## API Endpoints

### Authentification

La liste canonique des endpoints API (authentification, covoiturage, participations, etc.) est maintenue dans le dictionnaire des routes :

`01-Documentation/Dictionnaire de routes.md`

### Recherche et covoiturage

Consultez le dictionnaire centralisé des routes pour la liste complète et à jour : `01-Documentation/Dictionnaire de routes.md`

### Participation

Voir le dictionnaire centralisé : `01-Documentation/Dictionnaire de routes.md`

### Avis et notes

Voir le dictionnaire centralisé : `01-Documentation/Dictionnaire de routes.md`

### Administration

Voir le dictionnaire centralisé : `01-Documentation/Dictionnaire de routes.md`

## Technologies et dépendances

### Backend

```json
{
    "express": "^4.18.2",
    "@prisma/client": "^5.x.x",
    "prisma": "^5.x.x",
    "mysql2": "^3.6.0",
    "mongodb": "^5.7.0",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "helmet": "^7.0.0"
}
```

### Frontend

```json
{
    "vue": "^3.3.4",
    "vue-router": "^4.2.4",
    "axios": "^1.4.0",
    "bootstrap": "^5.3.0",
    "vite": "^4.4.5",
    "vitest": "^0.34.1",
    "playwright": "^1.36.2"
}
```

## Sécurité

### Authentification JWT

```javascript
// Structure du token
{
  "userId": 123,
  "email": "user@example.com",
  "role": "user",
  "iat": 1642777200,
  "exp": 1642863600
}
```

### Protection des mots de passe

-   Hachage avec bcrypt (salt rounds: 12)
-   Validation côté client et serveur
-   Politique de mot de passe robuste

### Sécurisation des endpoints

-   Middleware d'authentification
-   Validation des paramètres
-   Protection CORS
-   Headers de sécurité avec Helmet

### Variables d'environnement

```env
# Base de données MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ecoride

# MongoDB
MONGODB_URI=mongodb://localhost:27017/ecoride_reviews

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# Application
PORT=3000
NODE_ENV=development
```

## Tests

### Tests unitaires (Vitest)

```bash
cd Frontend
npm test
```

### Tests end-to-end (Playwright)

```bash
cd Frontend
npm run test:e2e
```

### Tests API

Scripts de test disponibles dans `/Backend/scripts/` :

-   `testAPI.js` - Tests des endpoints
-   `testAdmin.js` - Tests fonctions admin
-   `testCarpooling.js` - Tests covoiturage
-   `testEmailValidation.js` - Tests validation email

## Déploiement

### Prérequis

-   Node.js 18+
-   MySQL 8+
-   MongoDB 4.4+

### Installation locale

```bash
# 1. Cloner le repository
git clone https://github.com/2umish8/TP-EcoRide-DWWM.git
cd TP-EcoRide-DWWM

# 2. Backend
cd Backend
npm install
cp .env.example .env
# Configurer .env
npx prisma generate    # Générer le client Prisma
npx prisma db push     # Appliquer le schéma Prisma à la base MySQL
npm start

# 3. Frontend
cd ../Frontend
npm install
npm run dev
```

### Configuration base de données MySQL

```sql
-- Création de la base (si non existante)
CREATE DATABASE ecoride CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

La gestion du schéma et des migrations se fait via Prisma :

```bash
npx prisma generate    # Générer le client Prisma
npx prisma db push     # Appliquer le schéma défini dans prisma/schema.prisma
```

Les scripts SQL dans `Backend/Database/` sont optionnels pour l'initialisation manuelle ou le peuplement de données de test.

## Performance et optimisation

### Frontend

-   Lazy loading des composants
-   Code splitting automatique avec Vite
-   Optimisation des images
-   Cache des requêtes API

### Backend

-   Pool de connexions MySQL
-   Indexation optimisée des tables
-   Pagination des résultats
-   Cache Redis (à implémenter)

### Base de données

-   Index sur les colonnes de recherche fréquente
-   Requêtes optimisées avec EXPLAIN
-   Nettoyage périodique des données obsolètes

## Monitoring et logs

### Logs applicatifs

```javascript
// Format des logs
console.log(`[${new Date().toISOString()}] ${level}: ${message}`);
```

### Métriques importantes

-   Temps de réponse API
-   Utilisation mémoire
-   Connexions actives
-   Erreurs 5xx

## Maintenance

### Sauvegarde base de données

```bash
# MySQL
mysqldump -u root -p ecoride > backup_$(date +%Y%m%d).sql

# MongoDB
mongodump --db ecoride_reviews --out ./backup_mongo_$(date +%Y%m%d)
```

### Mise à jour des dépendances

```bash
# Backend
cd Backend && npm audit && npm update

# Frontend
cd Frontend && npm audit && npm update
```
---

**Projet** : EcoRide - Application de Covoiturage Écologique  
**Version** : 1.0  
**Dernière mise à jour** : Juillet 2025
