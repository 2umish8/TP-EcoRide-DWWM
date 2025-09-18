# EcoRide - Backend API 🌱⚙️

API REST pour la plateforme de covoiturage EcoRide développée avec Node.js, Express, MySQL et MongoDB.

## 🐳 Déploiement avec Docker (Recommandé)

### 🚀 Démarrage rapide avec Docker Compose

```bash
# Depuis la racine du projet
docker compose up --build

# Mode développement avec hot reload
docker compose -f compose.yaml -f compose.dev.yaml up --build
```

### 🔧 Build et run du backend seul

```bash
# Build l'image Docker
docker build -t ecoride-backend .

# Run le container (nécessite MySQL et MongoDB)
docker run -p 3000:3000 \
  -e DATABASE_URL="mysql://user:pass@mysql:3306/ecoride_db" \
  -e MONGODB_URI="mongodb://admin:pass@mongodb:27017/ecoride_db?authSource=admin" \
  ecoride-backend
```

### 📊 Health Check

Le backend inclut un endpoint de santé :
```bash
curl http://localhost:3000/api/health
```

## 🌐 Application Déployée - Accès Direct

**🎉 L'application EcoRide est également accessible en ligne !**

### 📱 Accès à l'application

**URL Frontend** : https://ecoridetp.netlify.app/  
**URL API** : Accessible via l'application frontend

### 🔑 Comptes de test prêts à utiliser

| 👤 Rôle               | 👤 Pseudo | 🔐 Mot de passe | ⚡ Accès                        |
| -------------------- | -------- | -------------- | ------------------------------ |
| 🛡️ **Administrateur** | Admin    | Admin2025!     | Gestion système                |
| 🧪 **Utilisateur**    | test     | Test2025!      | Participation&Création trajets |

## 🛠️ Technologies utilisées

### Core Stack
-   **Node.js 22** & **Express.js** - Serveur et framework web
-   **MySQL 8.0** - Base de données relationnelle (Prisma ORM)
-   **MongoDB 7.0** - Base de données NoSQL (avis, préférences)
-   **Redis 7** - Cache et gestion des sessions

### Sécurité & Validation
-   **JWT** - Authentification avec rotation des tokens
-   **Bcrypt** - Hachage sécurisé des mots de passe (12 rounds)
-   **Zod** - Validation et sanitisation des données
-   **Helmet** - Headers de sécurité HTTP
-   **CORS** - Gestion sécurisée des requêtes cross-origin

### DevOps & Monitoring
-   **Docker** - Containerisation multi-stage
-   **Prisma** - ORM moderne pour MySQL
-   **Mongoose** - ODM pour MongoDB
-   **Winston** - Logging structuré

## 📋 Prérequis (Développement Local)

-   Node.js 18+ et npm
-   MySQL Server 8.0+
-   MongoDB 4.4+
-   Redis (optionnel)

## ⚙️ Installation (Développement Local)

1. **Cloner le projet et naviguer dans le dossier backend**

```bash
cd Backend
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Configurer les variables d'environnement**

```bash
cp .env.example .env
```

Puis éditer le fichier `.env` avec vos paramètres :

```env
# Base de données
DATABASE_URL="mysql://user:password@localhost:3306/ecoride_db"
MONGODB_URI="mongodb://localhost:27017/ecoride_db"

# Sécurité
JWT_SECRET="votre-clé-secrète-jwt"
JWT_EXPIRATION="24h"
BCRYPT_SALT_ROUNDS=12

# Serveur
PORT=3000
NODE_ENV=development
```

4. **Configurer les bases de données**

```bash
# MySQL - Exécuter les scripts SQL
mysql -u root -p < Database/creation_base_de_donnees.sql
mysql -u root -p < Database/insertion_donnees.sql

# Générer le client Prisma
npx prisma generate
npx prisma db push

# MongoDB - Démarrer le service
mongod
```

5. **Tests de connectivité**

```bash
# Vérifier la connexion MySQL via Prisma
npm run check

# Vérifier la connexion MongoDB
npm run mongo:check
```

## 🚀 Démarrage

### Mode développement (avec rechargement automatique)

```bash
npm run dev
```

### Mode production

```bash
npm start
```

Le serveur démarre sur `http://localhost:3000`

### Variables d'environnement importantes

```env
# Production
NODE_ENV=production
PORT=3000

# Base de données (ajustez selon votre configuration)
DATABASE_URL="mysql://ecoride_user:password@mysql:3306/ecoride_db"
MONGODB_URI="mongodb://admin:password@mongodb:27017/ecoride_db?authSource=admin"

# Sécurité (utilisez des valeurs sécurisées en production)
JWT_SECRET="clé-super-secrète-256-bits"
BCRYPT_SALT_ROUNDS=12

# CORS (ajustez selon vos domaines)
ALLOWED_ORIGINS="http://localhost,https://votre-domaine.com"
```

## 🧪 Tests & Validation

### Suite de tests complète

```bash
# Tests complets (API + connexions DB)
npm run test:full

# Tests API uniquement
npm test

# Vérification MongoDB
npm run mongo:test
npm run mongo:quick

# Tests de recherche avancée
npm run test:advanced
npm run test:search

# Diagnostic complet du système
npm run check
```

### Outils de développement

```bash
# Générer les hash de mots de passe
npm run setup

# Nettoyer la base de données
npm run db:clean

# Réinitialiser les données
npm run db:reset

# Vérifier le statut des bases
npm run db:status
```

### Développement TypeScript

```bash
# Vérification TypeScript
npm run ts:check

# Build démo TypeScript
npm run ts:demo
```

## API Documentation

### Endpoints principaux

| Méthode | Endpoint                           | Description             | Auth |
| ------- | ---------------------------------- | ----------------------- | ---- |
| `POST`  | `/api/users/register`              | Inscription utilisateur | ❌    |
| `POST`  | `/api/users/login`                 | Connexion utilisateur   | ❌    |
| `GET`   | `/api/users/profile`               | Profil utilisateur      | ✅    |
| `GET`   | `/api/carpoolings`                 | Liste des trajets       | ❌    |
| `POST`  | `/api/carpoolings`                 | Créer un trajet         | ✅    |
| `POST`  | `/api/carpoolings/:id/participate` | Participer à un trajet  | ✅    |
| `GET`   | `/api/search/advanced`             | Recherche avancée       | ❌    |
| `POST`  | `/api/reviews`                     | Créer un avis           | ✅    |
| `GET`   | `/api/health`                      | Health check            | ❌    |

### Authentification

L'API utilise JWT Bearer tokens :

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/users/profile
```

### Exemples de requêtes

#### Inscription

```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "pseudo": "john_doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

#### Recherche de trajets

```bash
curl "http://localhost:3000/api/search/advanced?departure=Paris&destination=Lyon&date=2025-01-15"
```

## 📊 Monitoring & Logs

### Health Check

```bash
# Vérifier l'état du service
curl http://localhost:3000/api/health

# Réponse attendue :
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "database": "connected",
  "mongodb": "connected"
}
```

### Logs

Les logs sont structurés et disponibles via :

```bash
# Logs Docker
docker compose logs -f backend

# Logs locaux (si configuré avec Winston)
tail -f logs/combined.log
```

## 🏗️ Architecture & Structure

### Structure du projet

```
Backend/
├── 📁 Config/           # Configuration des bases de données
├── 📁 controllers/      # Logique métier des routes
├── 📁 routes/          # Définition des endpoints API
├── 📁 middlewares/     # Middlewares personnalisés
├── 📁 validators/      # Schémas de validation Zod
├── 📁 models/          # Modèles MongoDB (Mongoose)
├── 📁 utils/           # Fonctions utilitaires
├── 📁 scripts/         # Scripts de test et maintenance
├── 📁 prisma/          # Schéma et migrations Prisma
├── 📄 server.js        # Point d'entrée de l'application
└── 📄 Dockerfile       # Configuration Docker
```

### Bases de données

#### MySQL (Prisma)
- **Utilisateurs** et authentification
- **Trajets** de covoiturage
- **Véhicules** et informations techniques
- **Participations** aux trajets
- **Crédits** carbone

#### MongoDB (Mongoose)
- **Avis** et évaluations
- **Préférences** utilisateur
- **Données** non-relationnelles

### Sécurité

- 🔐 **JWT** avec expiration et rotation
- 🛡️ **Bcrypt** (12 rounds) pour les mots de passe
- ✅ **Validation Zod** sur tous les inputs
- 🚫 **CORS** configuré pour les origines autorisées
- 🔒 **Headers de sécurité** avec Helmet
- 👤 **Container non-root** en production

## 👤 Comptes de test

Les comptes suivants sont disponibles pour les tests :

| Rôle           | Pseudo | Mot de passe | Description                     |
| -------------- | ------ | ------------ | ------------------------------- |
| Administrateur | Admin  | Admin2025!   | Accès complet au système        |
| Conducteur     | test   | Test2025!    | Peut créer et gérer des trajets |
| Passager       | user   | User2025!    | Peut participer aux trajets     |

## 🔗 Documentation complète

- 📖 [Documentation API](../Documentation/API_DOCUMENTATION.md)
- 🏗️ [Architecture technique](../Documentation/Documentation-Technique.md)
- 🔒 [Sécurité](../SECURITE.md)
- 🐳 [Guide Docker](README.Docker.md)

## 🤝 Contribution

Ce projet utilise :
- **ESLint** + **Prettier** pour la qualité du code
- **Tests automatisés** avec scripts dédiés
- **Validation TypeScript** optionnelle
- **Docker** pour la containerisation

```bash
# Lancer tous les tests avant un commit
npm run test:full

# Vérifier la qualité du code (si configuré)
npm run lint
```

---

**Développé avec ❤️ pour EcoRide - API Backend sécurisée et scalable**
| -------------- | ----------------- | ------------------ |
| Administrateur | admin@ecoride.com | admin_password     |
| Employé        | jose@ecoride.com  | employe_password   |
| Chauffeur      | lila@test.com     | driver_password    |
| Passager       | tom@test.com      | passenger_password |

## 🏗️ Structure du projet

```
Backend/
├── Config/
│   └── db.js                 # Configuration base de données
├── controllers/
│   ├── userController.js     # Gestion des utilisateurs
│   ├── vehicleController.js  # Gestion des véhicules
│   ├── carpoolingController.js # Gestion des covoiturages
│   ├── participationController.js # Gestion des participations
│   ├── creditsController.js  # Gestion des crédits
│   └── adminController.js    # Administration
├── routes/
│   ├── userRoutes.js         # Routes utilisateurs
│   ├── vehicleRoutes.js      # Routes véhicules
│   ├── carpoolingRoutes.js   # Routes covoiturages
│   ├── participationRoutes.js # Routes participations
│   ├── creditsRoutes.js      # Routes crédits
│   └── adminRoutes.js        # Routes administration
├── scripts/
│   ├── generatePasswords.js # Génération hash mots de passe
│   └── testAPI.js           # Tests automatisés
├── Commandes SQL/
│   ├── creation_base_de_donnees.sql # Structure BDD
│   └── insertion_donnees.sql        # Données de test
├── authMiddleware.js         # Middleware d'authentification
├── server.js                # Point d'entrée principal
└── package.json             # Dépendances et scripts
```

## 🔐 Sécurité

-   Mots de passe hachés avec bcrypt (salt rounds: 10)
-   Authentification JWT avec expiration (1 heure)
-   Validation des données d'entrée
-   Gestion des rôles et permissions
-   Protection contre les injections SQL

## 🌟 Fonctionnalités implémentées

✅ **Système d'authentification complet**

-   Inscription, connexion, gestion des profils
-   Système de rôles (admin, employé, chauffeur, passager)
-   JWT avec middleware de protection

✅ **Gestion des véhicules**

-   CRUD complet des véhicules
-   Gestion des marques et couleurs
-   Validation de propriété

✅ **Système de covoiturage**

-   Création, modification, annulation de trajets
-   Recherche avec filtres
-   Gestion des statuts (prévu, démarré, terminé, annulé)

✅ **Système de participations**

-   Réservation de places
-   Annulation avec politique de remboursement
-   Validation des trajets

✅ **Système de crédits**

-   Gestion des transactions
-   Historique complet
-   Transferts entre utilisateurs
-   Commission plateforme

✅ **Interface d'administration**

-   Statistiques globales
-   Gestion des utilisateurs
-   Modération des covoiturages

## 🚧 Améliorations futures

-   Système de notifications (emails)
-   Intégration MongoDB pour les avis
-   API de géolocalisation
-   Système de paiement réel
-   Upload d'images
-   Cache Redis

## 🤝 Contribution

Ce projet fait partie d'un exercice de formation. Pour toute suggestion ou amélioration, n'hésitez pas à ouvrir une issue.

## 📄 Licence

Ce projet est sous licence MIT.
