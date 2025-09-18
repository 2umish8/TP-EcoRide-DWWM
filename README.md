# EcoRide - Application de Covoiturage Écologique

Application web de covoiturage axée sur la mobilité durable avec architecture complète frontend/backend et base de données containerisée.

## Déploiement Docker - Méthode Recommandée

**Lancez l'application complète en une seule commande !**

### Démarrage rapide avec Docker

```bash
# 1. Cloner le repository
git clone https://github.com/2umish8/TP-EcoRide-DWWM.git
cd TP-EcoRide-DWWM

# 2. Copier le fichier d'environnement
cp .env.example .env

# 3. Lancer l'application complète
docker compose up --build

# Pour lancer en mode détaché (arrière-plan)
docker compose up --build -d
```

**Accès à l'application :**
- **Frontend** : http://localhost (port 80)
- **Backend API** : http://localhost:3000
- **Adminer (DB Admin)** : http://localhost:8080
- **Mongo Express** : http://localhost:8081

### Mode Développement avec Docker

```bash
# Lancer en mode développement avec hot reload
docker compose -f compose.yaml -f compose.dev.yaml up --build

# Ou via le profil de développement
COMPOSE_PROFILES=development docker compose up --build
```

### Gestion des services

```bash
# Arrêter les services
docker compose down

# Nettoyer les volumes (⚠️ supprime les données)
docker compose down -v

# Voir les logs
docker compose logs -f

# Redémarrer un service spécifique
docker compose restart backend
```

## Application Déployée - Accès Direct

** L'application EcoRide est également accessible en ligne !**

### Accès à l'application en ligne

**URL : https://ecoridetp.netlify.app/**

### Comptes de test prêts à utiliser

| Rôle               | Pseudo | Mot de passe | Accès            |
| ------------------ | ------ | ------------ | ---------------- |
| **Administrateur** | Admin  | Admin2025!   | Gestion système  |
| **Conducteur**     | test   | Test2025!    | Création trajets |

## Architecture & Technologies

### Stack Technique
- * Frontend** : Vue.js 3 + Vite + Bootstrap 5
- * Backend** : Node.js + Express.js + Prisma ORM
- * Bases de données** : 
  - MySQL 8.0 (données principales)
  - MongoDB 7.0 (avis et préférences)
  - Redis 7 (cache et sessions)
- * Containerisation** : Docker + Docker Compose
- * Sécurité** : JWT + bcrypt + Helmet
- * Proxy** : Nginx (production)

### Services Docker

| Service         | Description              | Port   | Accès                 |
| --------------- | ------------------------ | ------ | --------------------- |
| `frontend`      | Interface Vue.js + Nginx | 80/443 | http://localhost      |
| `backend`       | API Node.js/Express      | 3000   | http://localhost:3000 |
| `mysql`         | Base de données MySQL    | 3306   | localhost:3306        |
| `mongodb`       | Base de données MongoDB  | 27017  | localhost:27017       |
| `redis`         | Cache Redis              | 6379   | localhost:6379        |
| `adminer`       | Interface admin MySQL    | 8080   | http://localhost:8080 |
| `mongo-express` | Interface admin MongoDB  | 8081   | http://localhost:8081 |

## Démarrage local (développement natif)

Si vous préférez lancer l'application sans Docker :

## Démarrage local (développement natif)

Si vous préférez lancer l'application sans Docker :

### Prérequis
- Node.js 18+ et npm
- MySQL 8.0+
- MongoDB 4.4+
- Git

### Installation

```bash
# 1. Cloner le repository
git clone https://github.com/2umish8/TP-EcoRide-DWWM.git
cd TP-EcoRide-DWWM

# 2. Backend (Terminal 1)
cd Backend
npm install
cp .env.example .env  # Configurer vos variables locales
npx prisma generate    # Générer le client Prisma
npx prisma db push     # Appliquer le schéma Prisma à la base MySQL
npm run dev            # Démarrer le serveur en mode développement

# 3. Frontend (Terminal 2)
cd Frontend
npm install
npm run dev
```

**Accès local :**
- Frontend : http://localhost:5173
- Backend : http://localhost:3000

## Fonctionnalités

### Disponibles
- Authentification JWT sécurisée
- Gestion des utilisateurs (Admin, Conducteur, Passager)
- Création et gestion de trajets
- Recherche avancée de covoiturages
- Priorisation des véhicules électriques
- Système d'avis et évaluations
- Interface responsive (Bootstrap 5)

### En développement
- Système de crédits carbone
- Tableaux de bord administrateur
- Notifications en temps réel
- Intégration GPS temps réel

## Sécurité

- Authentification JWT avec rotation des tokens
- Hachage bcrypt des mots de passe (12 rounds)
- Validation Zod pour tous les inputs
- Protection CORS configurée
- Headers de sécurité (Helmet.js)
- Utilisateurs non-root dans les containers

## Documentation

- [Guide de développement](README-DEV.md)
- [Documentation sécurité](SECURITE.md)
- [Documentation API](Documentation/API_DOCUMENTATION.md)
- [Architecture technique](Documentation/Documentation-Technique.md)

## Contribution

Ce projet est développé dans le cadre d'une formation DWWM (Développeur Web et Web Mobile).

### Tests

```bash
# Tests backend
cd Backend && npm run test:full

# Tests frontend
cd Frontend && npm run test:unit

# Tests E2E
cd Frontend && npm run test:e2e
```

## Licence

Projet éducatif sous licence MIT.

---
