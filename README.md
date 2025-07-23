# EcoRide - Application de Covoiturage Écologique 🌱🚗

Application web de covoiturage axée sur la mobilité durable, développée dans le cadre du TP Développeur Web et Web Mobile.

## 📋 Description

EcoRide est une plateforme de covoiturage qui encourage les déplacements écologiques en valorisant les véhicules électriques et en proposant un système de crédits pour récompenser les conducteurs responsables.

## 🚀 Déploiement en local

### Prérequis

-   **Node.js** (version 18+)
-   **MySQL** (version 8+)
-   **Git**

### Installation

1. **Cloner le repository**

```bash
git clone https://github.com/2umish8/TP-EcoRide-DWWM.git
cd TP-EcoRide-DWWM
```

2. **Configurer la base de données**

```bash
# Se connecter à MySQL
mysql -u root -p

# Exécuter les scripts de création
source Back-end/Commandes SQL/creation_base_de_donnees.sql
source Back-end/Commandes SQL/insertion_donnees.sql
```

3. **Configurer le Back-end**

```bash
cd Back-end

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer le fichier .env avec vos paramètres de base de données

# Lancer le serveur
npm start
```

4. **Configurer le Front-end**

```bash
cd Front-end

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

### Accès à l'application

-   **Front-end** : http://localhost:5173
-   **Back-end API** : http://localhost:3000

## 🏗️ Architecture

### Technologies utilisées

**Front-end :**

-   Vue.js 3 avec Composition API
-   Vite (build tool)
-   Bootstrap 5 pour le design responsive
-   Axios pour les appels API

**Back-end :**

-   Node.js avec Express.js
-   MySQL avec pool de connexions
-   JWT pour l'authentification
-   Bcrypt pour le hachage des mots de passe

**DevOps :**

-   Git avec workflow GitFlow
-   Tests unitaires avec Vitest
-   Tests E2E avec Playwright

## 📊 Fonctionnalités principales

### Pour les visiteurs

-   ✅ Recherche de covoiturages par ville et date
-   ✅ Filtrage avancé (prix, durée, note, aspect écologique)
-   ✅ Consultation détaillée des trajets

### Pour les utilisateurs connectés

-   ✅ Inscription/Connexion sécurisée
-   ✅ Profil passager et/ou conducteur
-   ✅ Participation aux covoiturages
-   ✅ Historique des trajets
-   ✅ Système de crédits

### Pour les conducteurs

-   ✅ Ajout de véhicules
-   ✅ Création de trajets
-   ✅ Gestion des réservations

### Pour les administrateurs

-   ✅ Gestion des utilisateurs
-   ✅ Modération des avis
-   ✅ Statistiques et analytics

## 🔧 Scripts disponibles

### Back-end

```bash
npm start          # Démarrer le serveur
npm run dev        # Mode développement avec nodemon
npm test           # Lancer les tests
```

### Front-end

```bash
npm run dev        # Serveur de développement
npm run build      # Build de production
npm run preview    # Prévisualiser le build
npm test           # Tests unitaires
npm run test:e2e   # Tests end-to-end
```

## 🌟 Identifiants de test

### Compte Administrateur

-   **Email** : admin@ecoride.fr
-   **Mot de passe** : Admin123!

### Compte Utilisateur

-   **Email** : user@ecoride.fr
-   **Mot de passe** : User123!

### Compte Conducteur

-   **Email** : driver@ecoride.fr
-   **Mot de passe** : Driver123!

## 📁 Structure du projet

```
TP-EcoRide-DWWM/
├── Back-end/                 # API Node.js/Express
│   ├── controllers/          # Contrôleurs métier
│   ├── routes/               # Routes API
│   ├── Config/               # Configuration DB
│   ├── Commandes SQL/        # Scripts SQL
│   └── server.js            # Point d'entrée
├── Front-end/               # Application Vue.js
│   ├── src/
│   │   ├── components/      # Composants Vue
│   │   ├── views/           # Pages de l'application
│   │   ├── router/          # Configuration des routes
│   │   └── services/        # Services API
│   └── public/              # Assets statiques
└── Documentation/           # Documentation projet
```

## 🔄 Workflow Git

Ce projet suit les bonnes pratiques GitFlow :

1. **`main`** : Branche de production
2. **`development`** : Branche d'intégration
3. **`feature/*`** : Branches de fonctionnalités

### Processus de développement

```bash
# Créer une nouvelle fonctionnalité
git checkout development
git pull origin development
git checkout -b feature/nouvelle-fonctionnalite

# Développer et commiter
git add .
git commit -m "feat: ajouter nouvelle fonctionnalité"

# Merger vers development
git checkout development
git merge feature/nouvelle-fonctionnalite

# Tests puis merge vers main
git checkout main
git merge development
```

## 🛡️ Sécurité

-   Authentification JWT avec refresh tokens
-   Hachage des mots de passe avec bcrypt
-   Validation des entrées utilisateur
-   Protection CORS configurée
-   Variables d'environnement pour les secrets

## 🧪 Tests

### Lancer tous les tests

```bash
# Back-end
cd Back-end && npm test

# Front-end
cd Front-end && npm test
cd Front-end && npm run test:e2e
```

## 📖 Documentation

-   **Charte graphique** : `/Documentation/Charte-Graphique.pdf`
-   **Manuel utilisateur** : `/Documentation/Manuel-Utilisateur.pdf`
-   **Documentation technique** : `/Documentation/Documentation-Technique.pdf`
-   **Gestion de projet** : Voir le Kanban sur [lien-vers-outil]

## 🚀 Déploiement

L'application est déployée sur :

-   **Front-end** : [URL-de-production]
-   **Back-end** : [URL-API-production]

## 📝 Licence

Ce projet est développé dans le cadre éducatif du DWWM.

## 👥 Contributeurs

-   **Développeur** : Mischael RADABANORO
-   **Formation** : Développeur Web et Web Mobile
-   **Organisme** : [Nom de l'organisme]

---

Pour toute question concernant le déploiement ou l'utilisation, consultez la documentation technique ou contactez l'équipe de développement.
