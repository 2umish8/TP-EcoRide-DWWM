# 🚀 EcoRide Backend - Tests et Recherche d'Itinéraires

## 📦 Nouvelles commandes npm disponibles

### 🧪 Tests

```bash
# Test complet du backend (recommandé)
npm run test:all

# Tests API de base uniquement
npm test

# Tests de recherche d'itinéraires basique
npm run test:search

# Tests de recherche avancée avec pagination/tri
npm run test:advanced

# Tests complets avec vérifications préalables
npm run test:full
```

### 🗃️ Base de données

```bash
# Voir l'état actuel de la base
npm run db:status

# Nettoyer les données de test
npm run db:clean

# Réinitialiser complètement la base
npm run db:reset
```

### 🔧 Développement

```bash
# Démarrer le serveur
npm start

# Démarrer en mode développement (avec rechargement auto)
npm run dev

# Vérifier la configuration du projet
npm run check

# Tester MongoDB uniquement
npm run mongo:quick
```

## 🎯 Workflow recommandé pour tester la recherche d'itinéraires

1. **Démarrer le serveur** :

    ```bash
    npm start
    ```

2. **Vérifier l'état de la base** :

    ```bash
    npm run db:status
    ```

3. **Exécuter tous les tests** :

    ```bash
    npm run test:all
    ```

4. **Nettoyer après les tests** (optionnel) :
    ```bash
    npm run db:clean
    ```

## 📊 Ce qui est testé

### ✅ Fonctionnalités de base

-   Inscription/connexion utilisateur
-   Gestion des véhicules
-   Création de covoiturages
-   Système de crédits
-   Rôles chauffeur/passager

### ✅ Recherche d'itinéraires basique

-   Filtres par ville départ/arrivée
-   Filtres par prix, durée, type véhicule
-   Gestion des cas sans résultats
-   Suggestions de dates alternatives

### ✅ Recherche avancée

-   Pagination des résultats
-   Tri multi-critères (prix, durée, note)
-   Filtres combinés complexes
-   Statistiques enrichies
-   Tests de performance

## 🏆 Objectif

**Solidifier complètement le backend avant de poursuivre le frontend**

Une fois tous les tests passés, vous aurez :

-   ✅ API complète et robuste
-   ✅ Recherche d'itinéraires performante
-   ✅ Fonctionnalités avancées opérationnelles
-   ✅ Base de données cohérente
-   ✅ Backend prêt pour l'intégration frontend

---

_Développé pour valider la logique métier EcoRide_
