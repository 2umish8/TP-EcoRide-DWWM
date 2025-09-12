# Scripts de Test - EcoRide Backend 🧪

## Scripts de test disponibles

Ce dossier contient 3 scripts de test pour valider le fonctionnement du backend EcoRide.

### `testAPI.js` - Tests des endpoints principaux

Tests automatisés des principales routes API :

-   Authentification (login/register)
-   Recherche de covoiturages
-   Gestion des utilisateurs
-   Validation des réponses

**Usage :**

```bash
node scripts/testAPI.js
```

### 1. Script principal - Tous les tests

```bash
node scripts/runAllTests.js
```

**Fonction**: Exécute séquentiellement tous les tests backend
**Contenu**:

-   Tests API de base (utilisateurs, véhicules, covoiturages, crédits)
-   Tests de recherche d'itinéraires basique
-   Tests de recherche avancée avec pagination et tri
-   Tests de performance comparative

### 2. Tests API de base

```bash
node scripts/testAPI.js
```

**Fonction**: Teste les fonctionnalités de base de l'API
**Contenu**:

-   Inscription et connexion utilisateur
-   Gestion des véhicules
-   Création de covoiturages
-   Système de crédits
-   Gestion des rôles (chauffeur/passager)

### 3. Tests de recherche d'itinéraires

```bash
node scripts/testSearchItinerary.js
```

**Fonction**: Teste spécifiquement la recherche d'itinéraires basique
**Contenu**:

-   Recherche par ville de départ/arrivée
-   Filtres par prix, durée, type de véhicule
-   Tests de cas limites
-   Validation des résultats

### 4. Tests de recherche avancée

```bash
node scripts/testAdvancedSearch.js
```

**Fonction**: Teste les fonctionnalités avancées de recherche
**Contenu**:

-   Pagination des résultats
-   Tri multi-critères (prix, durée, note chauffeur)
-   Filtres combinés complexes
-   Statistiques de recherche
-   Suggestions intelligentes
-   Tests de performance

### 5. Gestion de la base de données

```bash
# Nettoyer les données de test
node scripts/cleanDatabase.js clean

# Réinitialiser complètement la base
node scripts/cleanDatabase.js reset

# Vérifier l'état de la base
node scripts/cleanDatabase.js status
```

## 🎯 Focus : Recherche d'itinéraires

### Fonctionnalités testées

> Pour la liste complète des endpoints testés, voir le dictionnaire canonique : `01-Documentation/Dictionnaire de routes.md`

### Améliorations implémentées

1. **Recherche flexible**: Variantes de casse pour les villes
2. **Suggestions intelligentes**: Propositions quand aucun résultat
3. **Performance optimisée**: Requêtes SQL optimisées
4. **Pagination complète**: Navigation par pages
5. **Tri avancé**: Multi-critères avec direction
6. **Métadonnées riches**: Informations contextuelles
7. **Gestion d'erreurs robuste**: Validation des paramètres

## 🚀 Comment utiliser

### Prérequis

1. Serveur backend démarré (`npm start` ou `node server.js`)
2. MySQL accessible et configuré
3. MongoDB accessible et configuré
4. Dépendances installées (`npm install`)

### Workflow recommandé

1. **Démarrer le serveur**:

    ```bash
    cd Backend
    npm start
    ```

2. **Vérifier l'état de la base**:

    ```bash
    node scripts/cleanDatabase.js status
    ```

3. **Exécuter tous les tests**:

    ```bash
    node scripts/runAllTests.js
    ```

4. **Nettoyer après les tests** (optionnel):
    ```bash
    node scripts/cleanDatabase.js clean
    ```

### Tests spécialisés

Pour tester uniquement la recherche d'itinéraires :

```bash
# Recherche basique seulement
node scripts/testSearchItinerary.js

# Recherche avancée seulement
node scripts/testAdvancedSearch.js
```

## 📊 Résultats attendus

### Succès ✅


### Échecs possibles ❌


## 🔧 Dépannage

### Erreur de connexion base de données

```bash
# Vérifier la configuration dans .env
# Vérifier que MySQL/MongoDB sont démarrés
# Tester la connexion manuellement
```

### Erreur "Cannot find module"

```bash
npm install
```

### Timeout des tests

```bash
# Le serveur backend est-il démarré ?
# Y a-t-il des processus bloquants ?
```

### Données incohérentes

```bash
# Nettoyer et recommencer
node scripts/cleanDatabase.js clean
node scripts/runAllTests.js
```

## 📈 Métriques de performance

Les tests mesurent automatiquement :


## 🎉 Résultat final

Une fois tous les tests passés avec succès, vous devriez avoir :

1. ✅ **API complète et fonctionnelle**
2. ✅ **Recherche d'itinéraires robuste et performante**
3. ✅ **Fonctionnalités avancées (pagination, tri, statistiques)**
4. ✅ **Gestion d'erreurs appropriée**
5. ✅ **Base de données cohérente**
6. ✅ **Backend prêt pour le développement frontend**

Le backend EcoRide sera alors complètement solidifié et prêt pour l'intégration avec le frontend !
