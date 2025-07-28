# EcoRide - Application de Covoiturage Écologique 🌱🚗

Application web de covoiturage axée sur la mobilité durable.

## 🌐 Application Déployée - Accès Direct

**🎉 L'application EcoRide est maintenant déployée et accessible en ligne !**

### 📱 Accès à l'application
**URL : https://ecoridetp.netlify.app/**

Vous pouvez tester toutes les fonctionnalités directement sur le site déployé :
- ✅ Recherche de covoiturages
- ✅ Inscription et connexion
- ✅ Création de trajets
- ✅ Système de crédits
- ✅ Gestion des avis
- ✅ Interface d'administration

### 🔑 Comptes de test prêts à utiliser

| 👤 Rôle               | 📧 Email          | 🔐 Mot de passe | ⚡ Accès         |
| --------------------- | ----------------- | --------------- | ---------------- |
| 🛡️ **Administrateur** | admin@ecoride.fr  | Admin123!       | Gestion système  |
| 🚗 **Conducteur**     | driver@ecoride.fr | Driver123!      | Création trajets |
| 👥 **Utilisateur**    | user@ecoride.fr   | User123!        | Participation    |

---

## 🚀 Déploiement local (optionnel)

Si vous souhaitez lancer l'application en local pour le développement ou les tests :

### ⚡ Démarrage express

```bash
# 1. Cloner le repository
git clone https://github.com/2umish8/TP-EcoRide-DWWM.git
cd TP-EcoRide-DWWM

# 2. Backend (Terminal 1)
cd Back-end
npm install
npm start

# 3. Frontend (Terminal 2)
cd Front-end
npm install
npm run dev
```

**Accès local :**
- Frontend : http://localhost:5173
- Backend : http://localhost:3000

## 📋 Description du projet

EcoRide est une plateforme de covoiturage qui encourage les déplacements écologiques en valorisant les véhicules électriques et en proposant un système de crédits pour récompenser les conducteurs responsables.

### 🎯 Fonctionnalités principales

-   ✅ Développement d'une application web full-stack
-   ✅ Interface Vue.js 3 moderne et responsive
-   ✅ API REST avec Node.js/Express
-   ✅ Gestion de bases de données relationnelles (MySQL) et NoSQL (MongoDB)
-   ✅ Authentification sécurisée (JWT)
-   ✅ Tests automatisés et documentation technique

## 🚀 Déploiement rapide

### ⚡ Démarrage express

````bash
# 1. Cloner le repository
git clone https://github.com/2umish8/TP-EcoRide-DWWM.git
cd TP-EcoRide-DWWM

  - Inscription avec 20 crédits offerts
  - Participation à un covoiturage
  - Historique des trajets
  - Système d'avis et notes
npm start

# 3. Frontend (Terminal 2)
  - Ajout de véhicules (marquer comme électrique)
  - Création de trajets avec gestion des prix
  - Gestion des réservations
  - Consultation des avis reçus

**Accès :**
  - Tableau de bord avec statistiques
  - Gestion des utilisateurs
  - Modération des avis
  - Vue d'ensemble de la plateforme
### 🔑 Comptes de test prêts à utiliser

| 👤 Rôle               | 📧 Email          | 🔐 Mot de passe | ⚡ Accès         |
| --------------------- | ----------------- | --------------- | ---------------- |
| 🛡️ **Administrateur** | admin@ecoride.fr  | Admin123!       | Gestion système  |
| 🚗 **Conducteur**     | driver@ecoride.fr | Driver123!      | Création trajets |
| 👥 **Utilisateur**    | user@ecoride.fr   | User123!        | Participation    |
<summary><strong>📊 Setup MySQL complet</strong></summary>

```bash
CREATE DATABASE ecoride CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ecoride;

````

**Variables d'environnement (.env) :**

```env
JWT_SECRET=votre_jwt_secret
MONGODB_URI=mongodb://localhost:27017/ecoride_reviews
```

### ✅ Parcours de test recommandé

1. **Visiteur non connecté**

2. **Utilisateur connecté** (user@ecoride.fr)

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

### 🚗 Côté conducteur

### ⚙️ Côté administration

## 🧪 Tests et validation

# Tests End-to-End

cd Front-end && npm run test:e2e

# Tests Backend (API)

cd Back-end && npm test

-   ✅ **Bonne couverture de code**
-   ✅ **Performance API correcte**
-   ✅ **Scénarios E2E validés**

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
└── 📖 README.md               # Ce fichier
```

-   **Vue.js 3** : Composition API, réactivité, composants
-   **Responsive Design** : Bootstrap 5, mobile-first
-   **SPA moderne** : Router, état global, optimisations
-   **Tests Frontend** : Vitest unitaires + Playwright E2E

-   **Bases de données** : MySQL relationnel + MongoDB NoSQL
-   **Sécurité** : JWT authentification, bcrypt, validation
-   **Tests API** : Scripts automatisés, couverture étendue

### Gestion de projet

-   **Git avancé** : GitFlow, branches, merge, tags
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

## 📋 Documentation fournie

| 📄 Document                    | 🎯 Contenu                     | 💡 Utilité                |
| ------------------------------ | ------------------------------ | ------------------------- |
| 📖 **Manuel Utilisateur**      | Guide complet d'utilisation    | Prise en main rapide      |
| 🔧 **Documentation Technique** | Architecture, API, déploiement | Compréhension technique   |
| 📊 **Gestion de Projet**       | Méthodologie, planning, tests  | Approche de développement |
| 🎨 **Charte Graphique**        | Design system complet          | Guide visuel et UX        |

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
