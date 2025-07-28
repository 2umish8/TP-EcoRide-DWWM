# Guide de Test - EcoRide

## 🌐 Application Déployée - Accès Direct

**🎉 L'application EcoRide est maintenant déployée et accessible en ligne !**

### 📱 Accès à l'application
**URL : https://ecoridetp.netlify.app/**

Vous pouvez tester toutes les fonctionnalités décrites dans ce guide directement sur le site déployé.

### 🔑 Comptes de test prêts à utiliser

| 👤 Rôle               | 👤 Pseudo         | 🔐 Mot de passe | ⚡ Accès         |
| --------------------- | ----------------- | --------------- | ---------------- |
| 🛡️ **Administrateur** | Admin             | Admin2025!       | Gestion système  |
| 🧪 **Utilisateur**    | test              | Test2025!        | Participation&Création trajets    |

---

# ✅ GUIDE DE TEST - EcoRide

## 📋 Vérification de la livraison

### Documents fournis ✅

-   [x] **README.md** - Documentation principale et démarrage
-   [x] **SECURITE.md** - Instructions de configuration sécurisée
-   [x] **Documentation/Manuel-Utilisateur.md** - Guide complet d'utilisation
-   [x] **Documentation/Documentation-Technique.md** - Architecture et API
-   [x] **Documentation/Gestion-de-Projet.md** - Méthodologie et planning
-   [x] **Documentation/Charte Graphique_finale.pdf** - Design system

### Code source ✅

-   [x] **Front-end/** - Application Vue.js 3 complète
-   [x] **Back-end/** - API Node.js/Express avec base de données
-   [x] **Tests** - Scripts de validation et tests automatisés
-   [x] **.gitignore** - Fichiers sensibles exclus correctement

## 🚀 Procédure de test recommandée (30-45 min)

### 1. Configuration initiale (5 min)

```bash
git clone https://github.com/2umish8/TP-EcoRide-DWWM.git
cd TP-EcoRide-DWWM
# Suivre SECURITE.md pour créer .env
```

### 2. Lancement de l'application (5 min)

```bash
# Terminal 1 - Backend
cd Back-end && npm install && npm start

# Terminal 2 - Frontend
cd Front-end && npm install && npm run dev
```

### 3. Tests fonctionnels (20-30 min)

#### A. Visiteur non connecté (5 min)

-   [ ] Page d'accueil avec présentation EcoRide
-   [ ] Recherche de trajets par destination
-   [ ] Filtres avancés (prix, durée, écologique)
-   [ ] Consultation détaillée d'un trajet

#### B. Utilisateur connecté (10 min)

Utiliser : **test** / **Test2025!**

-   [ ] Inscription (bonus 20 crédits)
-   [ ] Connexion sécurisée
-   [ ] Profil utilisateur personnalisable
-   [ ] Participation à un covoiturage
-   [ ] Historique des trajets

#### C. Conducteur (10 min)

Utiliser : **test** / **Test2025!**

-   [ ] Ajout de véhicule (marquer comme électrique)
-   [ ] Création d'un nouveau trajet
-   [ ] Gestion des réservations
-   [ ] Consultation des avis reçus

#### D. Administrateur (5 min)

Utiliser : **Admin** / **Admin2025!**

-   [ ] Dashboard avec statistiques
-   [ ] Gestion des utilisateurs (CRUD)
-   [ ] Modération des avis
-   [ ] Vue globale de la plateforme

### 4. Tests techniques (5 min)

```bash
# Tests unitaires
cd Front-end && npm test

# Tests API (optionnel)
cd Back-end && node scripts/testAPI.js
```

## 🎯 Points d'évaluation à observer

### Compétences Frontend

-   **Vue.js 3** : Composition API, réactivité, composants
-   **Responsive Design** : Mobile, tablette, desktop
-   **UX/UI** : Interface intuitive et esthétique
-   **Intégration API** : Appels REST, gestion erreurs

### Compétences Backend

-   **API REST** : Architecture MVC, endpoints structurés
-   **Bases de données** : MySQL relationnel + MongoDB NoSQL
-   **Sécurité** : JWT, bcrypt, validation des entrées
-   **Gestion d'erreurs** : Codes de statut appropriés

### Gestion de projet

-   **Git** : Historique de commits, structure de branches
-   **Documentation** : Complète et professionnelle
-   **Tests** : Unitaires et d'intégration
-   **Bonnes pratiques** : Code propre, sécurité

### Innovation fonctionnelle

-   **Système de crédits** : Économie virtuelle fonctionnelle
-   **Aspect écologique** : Valorisation véhicules électriques
-   **Expérience utilisateur** : Parcours fluides et intuitifs

## 🎯 Points d'attention

1. **Configuration requise** : Suivre SECURITE.md obligatoirement
2. **Base de données** : Scripts SQL fournis dans Back-end/Database/
3. **Comptes de test** : Identifiants fournis dans README.md
4. **Support** : Documentation technique détaillée disponible

## 🏆 Résultats attendus

À la fin du test, vous aurez pu constater :

✅ **Application web full-stack fonctionnelle**  
✅ **Utilisation des technologies modernes** (Vue.js 3, Node.js, MySQL)  
✅ **Sécurité implémentée** (JWT, bcrypt, validation)  
✅ **Tests automatisés** et documentation fournie  
✅ **Fonctionnalités écologiques** avec aspect concret  
✅ **Gestion de projet** méthodique

---

**Projet** : EcoRide - Covoiturage Écologique  
**Repository** : GitHub Public  
**Support** : Documentation disponible dans /Documentation/
