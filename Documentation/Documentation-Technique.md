# Documentation Technique - EcoRide 🚀

## 🌐 Application Déployée - Accès Direct

**🎉 L'application EcoRide est maintenant déployée et accessible en ligne !**

### 📱 Accès à l'application
**URL : https://ecoridetp.netlify.app/**

Cette documentation technique décrit l'architecture et les technologies utilisées dans l'application déployée.

### 🔑 Comptes de test prêts à utiliser

| 👤 Rôle               | 👤 Pseudo         | 🔐 Mot de passe | ⚡ Accès         |
| --------------------- | ----------------- | --------------- | ---------------- |
| 🛡️ **Administrateur** | Admin             | Admin2025!       | Gestion système  |
| 🧪 **Utilisateur**    | test              | Test2025!        | Participation&Création trajets    |

*Vous pouvez créer un compte utilisateur allant sur le bouton "Inscription" et en renseignant les champs requis. Vous serez par défaut passager, mais vous pouvez devenir conducteur en renseignant les champs requis.*
---

## Architecture générale

### Vue d'ensemble

EcoRide est une application web full-stack composée de :

-   **Frontend** : Vue.js 3 avec Composition API
-   **Backend** : Node.js avec Express.js
-   **Base de données** : MySQL (principale) + MongoDB (avis et notes)
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

### Backend (`/Back-end/`)

```
Back-end/
├── Config/                 # Configuration base de données
│   ├── db.js              # Pool MySQL
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
├── routes/               # Routes API
├── scripts/              # Scripts de test et utilitaires
├── utils/                # Fonctions utilitaires
├── authMiddleware.js     # Middleware d'authentification
├── server.js             # Point d'entrée
└── package.json          # Dépendances
```

### Frontend (`/Front-end/`)

```
Front-end/
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

### MySQL - Données principales

**Tables principales :**

-   `users` - Utilisateurs de la plateforme
-   `vehicles` - Véhicules des conducteurs
-   `carpools` - Trajets de covoiturage
-   `participations` - Réservations des passagers
-   `credits` - Système de crédits
-   `preferences` - Préférences utilisateurs

**Relations clés :**

```sql
users 1:N vehicles
users 1:N carpools (comme conducteur)
users N:M carpools (comme passager via participations)
users 1:1 preferences
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

```
POST /api/auth/register     # Inscription
POST /api/auth/login        # Connexion
POST /api/auth/logout       # Déconnexion
GET  /api/auth/profile      # Profil utilisateur
```

### Recherche et covoiturage

```
GET  /api/search/advanced              # Recherche avancée
GET  /api/carpools                     # Liste des covoiturages
POST /api/carpools                     # Créer un covoiturage
GET  /api/carpools/:id                 # Détails d'un covoiturage
PUT  /api/carpools/:id                 # Modifier un covoiturage
DELETE /api/carpools/:id               # Supprimer un covoiturage
```

### Participation

```
POST /api/participations               # Participer à un trajet
GET  /api/participations/user/:id      # Participations d'un utilisateur
PUT  /api/participations/:id           # Modifier une participation
DELETE /api/participations/:id         # Annuler une participation
```

### Avis et notes

```
POST /api/reviews                      # Laisser un avis
GET  /api/reviews/driver/:id           # Avis d'un conducteur
GET  /api/reviews/user/:id             # Avis reçus par un utilisateur
```

### Administration

```
GET  /api/admin/users                  # Liste des utilisateurs
PUT  /api/admin/users/:id              # Modifier un utilisateur
DELETE /api/admin/users/:id            # Supprimer un utilisateur
GET  /api/admin/stats                  # Statistiques plateforme
```

## Technologies et dépendances

### Backend

```json
{
    "express": "^4.18.2",
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
cd Front-end
npm test
```

### Tests end-to-end (Playwright)

```bash
cd Front-end
npm run test:e2e
```

### Tests API

Scripts de test disponibles dans `/Back-end/scripts/` :

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
cd Back-end
npm install
cp .env.example .env
# Configurer .env
npm start

# 3. Frontend
cd ../Front-end
npm install
npm run dev
```

### Configuration base de données MySQL

```sql
-- Création de la base
CREATE DATABASE ecoride CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Import des tables et données
SOURCE Back-end/Database/schema.sql;
SOURCE Back-end/Database/seed.sql;
```

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
cd Back-end && npm audit && npm update

# Frontend
cd Front-end && npm audit && npm update
```
---

**Projet** : EcoRide - Application de Covoiturage Écologique  
**Version** : 1.0  
**Dernière mise à jour** : Juillet 2025
