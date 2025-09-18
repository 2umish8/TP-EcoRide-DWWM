# Manuel Utilisateur - EcoRide

## Application Déployée - Accès Direct

**L'application EcoRide est maintenant déployée et accessible en ligne !**

### Accès à l'application
**URL : https://ecoridetp.netlify.app/**

Ce manuel utilisateur décrit toutes les fonctionnalités que vous pouvez tester directement sur le site déployé.

### Comptes de test prêts à utiliser

**IMPORTANT : Ces comptes de test ne fonctionnent QUE sur le site déployé en ligne, pas en local !**

| Rôle               | Pseudo         | Mot de passe | Accès         |
| --------------------- | ----------------- | --------------- | ---------------- |
| **Administrateur** | Admin             | Admin2025!       | Gestion système  |
| **Utilisateur**    | test              | Test2025!        | Participation&Création trajets    |

*Pour tester en local, vous devrez créer vos propres comptes via l'inscription.*

---

## Introduction

EcoRide est une application web de covoiturage écologique qui permet aux utilisateurs de partager leurs trajets en voiture, avec un accent particulier sur la mobilité durable.
La gestion des données principales (utilisateurs, trajets, véhicules, crédits) se fait via MySQL et Prisma ORM pour une sécurité et une évolutivité accrues.

## Démarrage rapide

### Accès à l'application

**Site déployé (recommandé pour les tests) :**
- **URL de l'application** : https://ecoridetp.netlify.app/

**Développement local (optionnel) :**
- **URL de l'application** : http://localhost:5173
- **API Backend** : http://localhost:3000
- **Base de données MySQL gérée via Prisma ORM**

## Comptes de test disponibles

**Ces comptes fonctionnent uniquement sur le site déployé : https://ecoridetp.netlify.app/**

### Administrateur

-   **Pseudo** : Admin
-   **Mot de passe** : Admin2025!
-   **Fonctionnalités** : Gestion complète de la plateforme

### Utilisateur standard

-   **Pseudo** : test
-   **Mot de passe** : Test2025!
-   **Fonctionnalités** : Recherche et participation aux covoiturages

### Conducteur

-   **Pseudo** : test (même compte que utilisateur)
-   **Mot de passe** : Test2025!
-   **Fonctionnalités** : Création et gestion de trajets

**Pour tester en local :**
- Créez vos propres comptes via l'inscription sur http://localhost:5173 une fois le serveur lancé (`npm run dev`).
- Assurez-vous d'avoir configuré la base MySQL et lancé les commandes Prisma :
    - `npx prisma generate` pour générer le client Prisma
    - `npx prisma db push` pour appliquer le schéma à la base MySQL

## Guide d'utilisation

### Pour les visiteurs (non connectés)

#### 1. Rechercher un covoiturage

1. Sur la page d'accueil, saisissez votre destination dans la barre de recherche
2. Cliquez sur "Trouver un itinéraire"
3. Complétez les critères de recherche :
    - Ville de départ
    - Ville d'arrivée
    - Date souhaitée
4. Consultez les résultats disponibles

#### 2. Filtrer les résultats

Utilisez les filtres disponibles pour affiner votre recherche :

-   **Aspect écologique** : Véhicules électriques uniquement
-   **Prix maximum** : Définir un budget
-   **Durée maximale** : Limiter le temps de trajet
-   **Note minimale** : Choisir des conducteurs bien notés

#### 3. Voir les détails d'un trajet

Cliquez sur "Détails" pour accéder aux informations complètes :

-   Informations du conducteur
-   Avis et notes
-   Détails du véhicule
-   Préférences de voyage

### Pour les utilisateurs connectés

#### 1. Inscription/Connexion

1. Cliquez sur "Se connecter" dans le menu
2. Pour créer un compte :
    - Choisissez un pseudo unique
    - Renseignez votre email
    - Créez un mot de passe sécurisé
    - Validez votre inscription
3. **Bonus** : 20 crédits offerts à l'inscription !

#### 2. Gestion du profil

-   Complétez vos informations personnelles
-   Définissez vos préférences de voyage
-   Choisissez votre rôle : Passager, Conducteur, ou les deux

#### 3. Participer à un covoiturage

1. Recherchez un trajet qui vous convient
2. Cliquez sur "Participer"
3. Confirmez votre réservation
4. Le coût en crédits sera déduit automatiquement

#### 4. Consulter l'historique

-   Accédez à vos trajets passés
-   Consultez vos trajets à venir
-   Gérez vos réservations

### Pour les conducteurs

#### 1. Ajouter un véhicule

1. Accédez à votre profil conducteur
2. Cliquez sur "Ajouter un véhicule"
3. Renseignez :
    - Marque et modèle
    - Nombre de places
    - Type de carburant (spécialement les véhicules électriques)
    - Préférences (fumeurs, animaux, etc.)

#### 2. Créer un trajet

1. Cliquez sur "Proposer un trajet"
2. Définissez :
    - Ville de départ et d'arrivée
    - Date et heure
    - Nombre de places disponibles
    - Prix en crédits
    - Points de rendez-vous
3. Publiez votre annonce

#### 3. Gérer les réservations

-   Consultez les demandes de participation
-   Acceptez ou refusez les passagers
-   Communiquez avec les participants

### Pour les administrateurs

#### 1. Tableau de bord

-   Consultez les statistiques de la plateforme
-   Visualisez l'activité en temps réel
-   Accédez aux graphiques d'utilisation

#### 2. Gestion des utilisateurs

-   Modérez les comptes utilisateurs
-   Gérez les signalements
-   Suspendez ou activez des comptes

#### 3. Modération du contenu

-   Supervisez les avis et commentaires
-   Gérez les conflits entre utilisateurs
-   Maintenir la qualité de service

## Système de crédits

### Fonctionnement

-   **Unité** : Les crédits sont la monnaie virtuelle d'EcoRide
-   **Génération** : 2 crédits générés par trajet effectué
-   **Distribution** : Répartis entre les participants du covoiturage
-   **Bonus inscription** : 20 crédits offerts aux nouveaux utilisateurs

### Utilisation

-   **Paiement** : Les trajets se paient en crédits
-   **Gains** : Les conducteurs gagnent des crédits en proposant des trajets
-   **Écologie** : Bonus pour les véhicules électriques

## Fonctionnalités écologiques

### Priorité aux véhicules électriques

-   Badge "Voyage écologique" pour les véhicules électriques
-   Filtre dédié pour rechercher uniquement les trajets verts
-   Incitations supplémentaires pour les conducteurs éco-responsables

### Réduction de l'empreinte carbone

-   Calcul automatique des économies de CO2
-   Statistiques environnementales personnelles
-   Sensibilisation aux enjeux écologiques

## Support et aide

### Résolution de problèmes

1. **Problème de connexion** :

    - Vérifiez vos identifiants
    - Réinitialisez votre mot de passe si nécessaire

2. **Problème de paiement en crédits** :

    - Vérifiez votre solde
    - Contactez le support si nécessaire

3. **Problème technique** :
    - Actualisez la page
    - Vérifiez votre connexion internet
    - Contactez l'administrateur

### Contact

-   **Email support** : support@ecoride.fr
-   **Pseudo administrateur** : Admin

## Mentions légales et sécurité

### Protection des données

-   Toutes les données personnelles sont protégées
-   Mots de passe chiffrés avec bcrypt
-   Authentification sécurisée par JWT

### Conditions d'utilisation

-   Respectez les autres utilisateurs
-   Soyez ponctuel pour vos trajets
-   Signalez tout comportement inapproprié

---

**Version** : 1.0  
**Dernière mise à jour** : Juillet 2025  
**Projet** : EcoRide - Covoiturage Écologique
