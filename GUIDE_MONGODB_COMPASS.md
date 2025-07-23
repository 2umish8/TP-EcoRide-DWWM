# 🧭 Guide MongoDB Compass - Interface Visuelle EcoRide

## 🎯 MongoDB Compass vs HeidiSQL

**MongoDB Compass** est l'équivalent officiel de HeidiSQL pour MongoDB :

-   Interface graphique intuitive
-   Navigation dans les collections (équivalent des tables)
-   Visualisation des documents JSON
-   Requêtes visuelles et éditeur de requêtes
-   Outils d'analyse et de performance

## 🔌 Connexion à votre Base EcoRide

### 1. **Lancer MongoDB Compass**

-   Recherchez "MongoDB Compass" dans le menu Windows
-   Ou utilisez le raccourci sur le bureau

### 2. **Chaîne de Connexion MongoDB Atlas**

Votre projet utilise **MongoDB Atlas** (cloud). Voici votre chaîne de connexion :

```
mongodb+srv://umischael:MRdUvBHHHq6G0uec@ecoride-production.zar6iod.mongodb.net/ecoride_reviews?retryWrites=true&w=majority&appName=EcoRide-Production
```

### 3. **Étapes de Connexion**

1. **Ouvrir MongoDB Compass**
2. **Coller l'URI de connexion** dans le champ "Connection String"
3. **Cliquer sur "Connect"**
4. **Naviguer vers la base `ecoride_reviews`**

## 📊 Structure de votre Base MongoDB EcoRide

### Collections Disponibles

#### 🌟 **reviews**

-   **Description** : Avis des passagers sur les chauffeurs
-   **Documents** :
    ```json
    {
      "_id": ObjectId("..."),
      "reviewerId": 123,
      "reviewedUserId": 456,
      "carpoolingId": 789,
      "rating": 5,
      "comment": "Excellent chauffeur !",
      "isReported": false,
      "reportReason": "",
      "validationStatus": "pending",
      "createdAt": "2025-07-24T00:30:00.000Z"
    }
    ```

#### 🚗 **driverpreferences**

-   **Description** : Préférences des chauffeurs
-   **Documents** :
    ```json
    {
      "_id": ObjectId("..."),
      "userId": 123,
      "musicPreference": "Aucune musique",
      "smokingAllowed": false,
      "petsAllowed": true,
      "conversationLevel": "Modérée",
      "temperaturePreference": 20,
      "createdAt": "2025-07-24T00:30:00.000Z"
    }
    ```

## 🔍 Fonctionnalités MongoDB Compass

### 1. **Exploration des Documents**

-   **Collections** : Équivalent des "tables" MySQL
-   **Documents** : Équivalent des "lignes" MySQL (format JSON)
-   **Champs** : Équivalent des "colonnes" MySQL

### 2. **Requêtes Visuelles**

```javascript
// Exemple : Trouver tous les avis avec 5 étoiles
{ "rating": 5 }

// Exemple : Avis en attente de validation
{ "validationStatus": "pending" }

// Exemple : Avis signalés
{ "isReported": true }
```

### 3. **Outils d'Analyse**

-   **Schema** : Analyse automatique de la structure
-   **Explain Plan** : Performance des requêtes
-   **Indexes** : Gestion des index (comme MySQL)

## 🛠️ Opérations Courantes

### Visualiser les Avis Récents

```javascript
// Dans le Query Bar de Compass
{ "createdAt": { "$gte": new Date("2025-07-24") } }
```

### Compter les Avis par Note

```javascript
// Aggregation Pipeline
[
    {
        $group: {
            _id: "$rating",
            count: { $sum: 1 },
        },
    },
];
```

### Trouver les Signalements

```javascript
{ "isReported": true, "validationStatus": "pending" }
```

## 🔧 Alternatives à MongoDB Compass

### 1. **Studio 3T** (Payant mais puissant)

-   Interface très complète
-   Générateur de requêtes SQL vers MongoDB
-   Outils d'import/export avancés

### 2. **Robo 3T** (Gratuit)

-   Interface simple et légère
-   Shell MongoDB intégré
-   Bon pour les développeurs

### 3. **MongoDB Atlas UI** (Web)

-   Interface web directement dans MongoDB Atlas
-   Accessible via : https://cloud.mongodb.com/
-   Fonctionnalités de base incluses

## 📱 Accès Web MongoDB Atlas

Vous pouvez aussi accéder à votre base via l'interface web :

1. **Aller sur** : https://cloud.mongodb.com/
2. **Se connecter** avec vos identifiants Atlas
3. **Sélectionner** votre cluster "EcoRide-Production"
4. **Cliquer** sur "Browse Collections"

## 🎯 Équivalences MongoDB vs MySQL

| MySQL (HeidiSQL) | MongoDB (Compass) |
| ---------------- | ----------------- |
| Base de données  | Database          |
| Table            | Collection        |
| Ligne            | Document          |
| Colonne          | Field             |
| Index            | Index             |
| JOIN             | $lookup           |
| WHERE            | Query Filter      |
| SELECT           | find()            |

## 🚀 Commandes Rapides

### Dans MongoDB Compass - Query Bar :

```javascript
// Tous les avis
{}

// Avis 5 étoiles
{ "rating": 5 }

// Avis d'un chauffeur spécifique
{ "reviewedUserId": 123 }

// Avis récents (dernières 24h)
{ "createdAt": { "$gte": new Date(Date.now() - 24*60*60*1000) } }

// Avis avec commentaire long
{ "comment": { "$regex": ".{50,}" } }
```

## 💡 Conseils d'Utilisation

1. **Utilisez l'onglet "Schema"** pour comprendre la structure de vos données
2. **L'onglet "Explain"** vous aide à optimiser les requêtes
3. **Les "Indexes"** améliorent les performances (comme MySQL)
4. **L'onglet "Validation"** définit les règles de validation JSON Schema

---

🎉 **MongoDB Compass est maintenant votre "HeidiSQL pour MongoDB" !**

Vous avez maintenant une interface graphique complète pour explorer et gérer vos données MongoDB EcoRide !
