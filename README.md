# EcoRide - Application de Covoiturage Écologique 🌱🚗

Application web de covoiturage axée sur la mobilité durable.

## 📋 Description du projet

EcoRide est une plateforme de covoiturage qui encourage les déplacements écologiques en## 📋 Documents projet fournis

| Document                       | Contenu                        | Objectif                  |
| ------------------------------ | ------------------------------ | ------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 📖 **Manuel Utilisateur**      | Guide complet d'utilisation    | Documentation utilisateur |
| 🔧 **Documentation Technique** | Architecture, API, déploiement | Détails techniques        |
| 📊 **Gestion de Projet**       | Méthodologie, planning, tests  | Approche projet           |
| 🎨 **Charte Graphique**        | Design system complet          | Guide visuel              | ant les véhicules électriques et en proposant un système de crédits pour récompenser les conducteurs responsables. |

### 🎯 Fonctionnalités principales

-   ✅ Développement d'une application web full-stack
-   ✅ Interface Vue.js 3 moderne et responsive
-   ✅ API REST avec Node.js/Express
-   ✅ Gestion de bases de données relationnelles (MySQL) et NoSQL (MongoDB)
-   ✅ Authentification sécurisée (JWT)
-   ✅ Tests automatisés et documentation technique

## 🚀 Déploiement rapide

### ⚡ Démarrage express

```bash
# 1. Cloner le repository
git clone https://github.com/2umish8/TP-EcoRide-DWWM.git
cd TP-EcoRide-DWWM

# 2. Backend (Terminal 1)
cd Back-end
npm install
# Configurer .env avec vos paramètres MySQL
npm start

# 3. Frontend (Terminal 2)
cd Front-end
npm install
npm run dev
```

**Accès :**

-   **Application** : http://localhost:5173
-   **API** : http://localhost:3000

### 🔑 Comptes de test (prêts à utiliser)

| Rôle               | Email             | Mot de passe | Fonctionnalités  |
| ------------------ | ----------------- | ------------ | ---------------- |
| **Administrateur** | admin@ecoride.fr  | Admin123!    | Gestion système  |
| **Conducteur**     | driver@ecoride.fr | Driver123!   | Création trajets |
| **Utilisateur**    | user@ecoride.fr   | User123!     | Participation    |

````

### 🗄️ Configuration base de données (si nécessaire)

<details>
<summary><strong>📊 Setup MySQL complet</strong></summary>

```bash
# Se connecter à MySQL
mysql -u root -p

# Créer la base de données
CREATE DATABASE ecoride CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ecoride;

# Importer le schéma et les données
source Back-end/Database/schema.sql;
source Back-end/Database/seed.sql;
````

**Variables d'environnement (.env) :**

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=ecoride
JWT_SECRET=votre_jwt_secret
MONGODB_URI=mongodb://localhost:27017/ecoride_reviews
```

</details>

## 🏆 Fonctionnalités démonstrées

### ✅ Parcours de test recommandé

1. **Visiteur non connecté**

    - Recherche de trajets par destination
    - Filtrage avancé (prix, durée, écologique)
    - Consultation détaillée des covoiturages

2. **Utilisateur connecté** (user@ecoride.fr)

    - Inscription avec 20 crédits offerts
    - Participation à un covoiturage
    - Historique des trajets
    - Système d'avis et notes

3. **Conducteur** (driver@ecoride.fr)

    - Ajout de véhicules (marquer comme électrique)
    - Création de trajets avec gestion des prix
    - Gestion des réservations
    - Consultation des avis reçus

4. **Administrateur** (admin@ecoride.fr)
    - Tableau de bord avec statistiques
    - Gestion des utilisateurs
    - Modération des avis
    - Vue d'ensemble de la plateforme

## 🏗️ Architecture et technologies

### Stack technique maîtrisé

**Frontend :**

-   **Vue.js 3** avec Composition API - Framework moderne
-   **Vite** - Build tool performant
-   **Bootstrap 5** - Design responsive
-   **Axios** - Client HTTP pour API

**Backend :**

-   **Node.js + Express.js** - Serveur API REST
-   **MySQL** - Base de données relationnelle (pool de connexions)
-   **MongoDB** - Base NoSQL pour avis et notes
-   **JWT + bcrypt** - Authentification sécurisée

**DevOps & Tests :**

-   **Git** avec workflow GitFlow
-   **Vitest** - Tests unitaires
-   **Playwright** - Tests end-to-end

## 📊 Fonctionnalités principales réalisées

### 🌐 Côté visiteur (non connecté)

-   ✅ **Recherche intuitive** : Barre de recherche avec destination
-   ✅ **Filtrage avancé** : Prix, durée, note conducteur, aspect écologique
-   ✅ **Consultation détaillée** : Informations complètes sur trajets et conducteurs
-   ✅ **Interface responsive** : Compatible mobile, tablette, desktop

### 👤 Côté utilisateur connecté

-   ✅ **Inscription sécurisée** : Validation email + 20 crédits offerts
-   ✅ **Profil personnalisable** : Passager, conducteur, ou mixte
-   ✅ **Participation trajets** : Réservation avec système de crédits
-   ✅ **Historique complet** : Trajets passés et à venir
-   ✅ **Système d'avis** : Notes et commentaires bidirectionnels

### 🚗 Côté conducteur

-   ✅ **Gestion véhicules** : Ajout avec type (électrique valorisé)
-   ✅ **Création trajets** : Planning, prix, places, préférences
-   ✅ **Gestion réservations** : Acceptation/refus passagers
-   ✅ **Revenus en crédits** : Monétisation des trajets proposés

### ⚙️ Côté administration

-   ✅ **Dashboard analytique** : Statistiques temps réel
-   ✅ **Gestion utilisateurs** : CRUD complet avec modération
-   ✅ **Supervision avis** : Modération contenus inappropriés
-   ✅ **Vue globale** : Monitoring activité plateforme

## 🧪 Tests et validation

### Suite de tests complète

```bash
# Tests unitaires Frontend
cd Front-end && npm test

# Tests End-to-End
cd Front-end && npm run test:e2e

# Tests Backend (API)
cd Back-end && npm test
```

**Résultats obtenus :**

-   ✅ **Bonne couverture de code**
-   ✅ **Performance API correcte**
-   ✅ **Scénarios E2E validés**
-   ✅ **Sécurité : Vulnérabilités traitées**

## 📁 Structure projet optimisée

```
TP-EcoRide-DWWM/
├── 📋 Documentation/          # 🎓 Documents projet
│   ├── Manuel-Utilisateur.md       # Guide complet utilisateur
│   ├── Documentation-Technique.md  # Architecture & API
│   ├── Gestion-de-Projet.md       # Méthodologie & planning
│   └── Charte Graphique_finale.pdf # Design system
├── 🔙 Back-end/               # API Node.js/Express
│   ├── controllers/             # Logique métier
│   ├── routes/                  # Endpoints API
│   ├── Config/                  # Base de données
│   ├── Database/                # Scripts SQL
│   └── scripts/                 # Tests et utilitaires
├── 🎨 Front-end/              # Application Vue.js
│   ├── src/components/          # Composants réutilisables
│   ├── src/views/              # Pages application
│   ├── src/services/           # Services API
│   └── e2e/                    # Tests end-to-end
└── 📖 README.md               # Ce fichier
```

## 🎓 Compétences techniques démontrées

### Développement Frontend

-   **Vue.js 3** : Composition API, réactivité, composants
-   **Responsive Design** : Bootstrap 5, mobile-first
-   **SPA moderne** : Router, état global, optimisations
-   **Tests Frontend** : Vitest unitaires + Playwright E2E

### Développement Backend

-   **API REST** : Express.js, middleware, architecture MVC
-   **Bases de données** : MySQL relationnel + MongoDB NoSQL
-   **Sécurité** : JWT authentification, bcrypt, validation
-   **Tests API** : Scripts automatisés, couverture étendue

### Gestion de projet

-   **Git avancé** : GitFlow, branches, merge, tags
-   **Documentation** : Technique, utilisateur, projet
-   **Méthodologie** : Agile, user stories, sprints
-   **Déploiement** : Configuration, environnements, CI/CD

## � Sécurité implémentée

-   ✅ **Authentification JWT** avec refresh tokens
-   ✅ **Hachage bcrypt** des mots de passe (12 rounds)
-   ✅ **Validation stricte** des entrées utilisateur
-   ✅ **Protection CORS** configurée
-   ✅ **Headers sécurité** avec Helmet
-   ✅ **Variables d'environnement** pour secrets

## 🌱 Innovation écologique

### Fonctionnalités vertes intégrées

-   🔋 **Badge véhicules électriques** : Valorisation visuelle
-   🌿 **Filtres écologiques** : Recherche trajets verts uniquement
-   📊 **Impact environnemental** : Calcul économies CO2
-   💚 **Incitations durables** : Bonus crédits pour conduite écologique

### Système de crédits innovant

-   **20 crédits offerts** à l'inscription (encouragement)
-   **2 crédits générés** par trajet réalisé
-   **Économie circulaire** : Redistribution équitable
-   **Motivation écologique** : Récompenses comportements verts

## � Documents d'évaluation fournis

| Document                       | Contenu                        | Objectif pédagogique                |
| ------------------------------ | ------------------------------ | ----------------------------------- |
| 📖 **Manuel Utilisateur**      | Guide complet d'utilisation    | Rédaction documentation utilisateur |
| 🔧 **Documentation Technique** | Architecture, API, déploiement | Maîtrise technique approfondie      |
| 📊 **Gestion de Projet**       | Méthodologie, planning, tests  | Compétences chef de projet          |
| 🎨 **Charte Graphique**        | Design system complet          | Sens esthétique et UX               |

## 🚀 Points forts du projet

### Technique

-   ✅ **Architecture organisée** : Séparation front/back, APIs RESTful
-   ✅ **Code structuré** : Linting, formatting, bonnes pratiques
-   ✅ **Performance travaillée** : Lazy loading, cache, index DB
-   ✅ **Tests implémentés** : Couverture étendue

### Fonctionnel

-   ✅ **UX travaillée** : Interface intuitive, responsive design
-   ✅ **Fonctionnalités développées** : Rôles utilisateur couverts
-   ✅ **Sécurité implémentée** : Authentification, validation, protection
-   ✅ **Aspect écologique** : Fonctionnalités vertes intégrées

## 📝 Informations projet

### Contexte

-   **Type** : Application web de covoiturage écologique
-   **Durée de développement** : 10 semaines
-   **Méthodologie** : Agile avec sprints de 2 semaines

### Technologies utilisées

**Frontend** : Vue.js 3, Bootstrap 5, Vite, Axios  
**Backend** : Node.js, Express.js, MySQL, MongoDB  
**DevOps** : Git, GitHub, Tests automatisés, Documentation

---

## 🎯 À propos

Cette application présente une **approche moderne du développement web** avec :

✅ **Architecture structurée** avec séparation front/back  
✅ **Sécurité implémentée** (JWT, bcrypt, validation)  
✅ **Tests automatisés** (couverture étendue)  
✅ **Documentation fournie** (technique + utilisateur)  
✅ **Fonctionnalités innovantes** (système crédits, écologie)

Un exemple de développement **full-stack** moderne avec Vue.js et Node.js.

**Temps de découverte** : 30-45 minutes pour test complet

---

**Pour toute question technique ou fonctionnelle, consultez la Documentation/**
