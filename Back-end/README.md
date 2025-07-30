# EcoRide - Back-end

API REST pour la plateforme de covoiturage EcoRide développée avec Node.js, Express et MySQL.

## 🌐 Application Déployée - Accès Direct

**🎉 L'application EcoRide est maintenant déployée et accessible en ligne !**

### 📱 Accès à l'application

**URL : https://ecoridetp.netlify.app/**

L'API backend est également déployée et accessible via l'application frontend déployée.

### 🔑 Comptes de test prêts à utiliser

| 👤 Rôle               | 👤 Pseudo | 🔐 Mot de passe | ⚡ Accès                       |
| --------------------- | --------- | --------------- | ------------------------------ |
| 🛡️ **Administrateur** | Admin     | Admin2025!      | Gestion système                |
| 🧪 **Utilisateur**    | test      | Test2025!       | Participation&Création trajets |

---

## 🛠️ Technologies utilisées

-   **Node.js** & **Express.js** - Serveur et framework web
-   **MySQL** - Base de données relationnelle
-   **JWT** - Authentification
-   **Bcrypt** - Hachage des mots de passe
-   **CORS** - Gestion des requêtes cross-origin

## 📋 Prérequis

-   Node.js (version 16 ou supérieure)
-   MySQL Server
-   npm ou yarn

## ⚙️ Installation

1. **Cloner le projet et naviguer dans le dossier back-end**

```bash
cd Back-end
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

-   Configuration de la base de données MySQL
-   Secret JWT
-   Port du serveur

4. **Configurer la base de données**

```bash
# Se connecter à MySQL et exécuter les scripts dans l'ordre :
mysql -u root -p
source Commandes\ SQL/creation_base_de_donnees.sql
source Commandes\ SQL/insertion_donnees.sql
```

5. **Installer axios pour les tests (optionnel)**

```bash
npm install axios --save-dev
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

Le serveur démarre par défaut sur `http://localhost:3000`

## 🧪 Tests

### Générer les hash de mots de passe

```bash
npm run setup
```

### Tester l'API

```bash
npm test
```

## 📚 Documentation API

La documentation complète de l'API est disponible dans le fichier `API_DOCUMENTATION.md`.

### Endpoints principaux

-   `POST /api/users/register` - Inscription
-   `POST /api/users/login` - Connexion
-   `GET /api/users/profile` - Profil utilisateur
-   `POST /api/vehicles` - Ajouter un véhicule
-   `GET /api/carpoolings/available` - Rechercher des covoiturages
-   `POST /api/carpoolings` - Créer un covoiturage
-   `POST /api/participations/:id/join` - Rejoindre un covoiturage
-   `GET /api/credits/balance` - Consulter ses crédits

## 👤 Comptes de test

Les comptes suivants sont créés automatiquement avec le script `insertion_donnees.sql` :

| Rôle           | Email             | Mot de passe       |
| -------------- | ----------------- | ------------------ |
| Administrateur | admin@ecoride.com | admin_password     |
| Employé        | jose@ecoride.com  | employe_password   |
| Chauffeur      | lila@test.com     | driver_password    |
| Passager       | tom@test.com      | passenger_password |

## 🏗️ Structure du projet

```
Back-end/
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
