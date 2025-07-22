# MongoDB Integration Guide - EcoRide

## 🎯 Intégration MongoDB complète

Cette intégration ajoute MongoDB à EcoRide pour gérer les **avis/notes** et **préférences des chauffeurs** selon les exigences ECF.

## 📋 Nouvelles fonctionnalités ajoutées

### 🌟 Système d'avis (Reviews)

-   **POST** `/api/reviews` - Créer un avis (passager authentifié)
-   **GET** `/api/reviews/driver/:driverId` - Voir les avis d'un chauffeur (public)
-   **GET** `/api/reviews/pending` - Avis en attente (employé/admin)
-   **PUT** `/api/reviews/:id/validate` - Valider/rejeter un avis (employé/admin)
-   **GET** `/api/reviews/reported` - Signalements (employé/admin)

### 🚗 Préférences chauffeur (Driver Preferences)

-   **GET** `/api/preferences/my-preferences` - Mes préférences (chauffeur)
-   **POST** `/api/preferences` - Créer/modifier préférences (chauffeur)
-   **GET** `/api/preferences/driver/:driverId` - Préférences d'un chauffeur (public)
-   **POST** `/api/preferences/custom` - Ajouter préférence personnalisée (chauffeur)
-   **DELETE** `/api/preferences/custom/:id` - Supprimer préférence (chauffeur)

## 🔧 Configuration

### Variables d'environnement (.env)

```env
MONGODB_URI=mongodb://localhost:27017/ecoride_reviews
```

### Installation

```bash
npm install mongoose
```

## 🗃️ Structure des données

### Collection Reviews

```javascript
{
  reviewerId: Number,          // ID passager (MySQL)
  reviewedUserId: Number,      // ID chauffeur (MySQL)
  carpoolingId: Number,        // ID covoiturage (MySQL)
  rating: Number,              // Note 1-5 (demi-points autorisés)
  comment: String,             // Commentaire optionnel
  validationStatus: String,    // "pending", "approved", "rejected"
  isReported: Boolean,         // Signalement de problème
  reportReason: String,        // Raison du signalement
  createdAt: Date,
  validatedBy: Number,         // ID employé validateur
  validatedAt: Date
}
```

### Collection DriverPreferences

```javascript
{
  driverId: Number,            // ID chauffeur (MySQL)
  allowsSmoking: Boolean,      // Accepte fumeurs
  allowsPets: Boolean,         // Accepte animaux
  conversationLevel: String,   // "silent", "minimal", "friendly", "chatty"
  preferredMusicGenre: String, // Genre musical préféré
  specialRules: String,        // Règles spéciales
  customPreferences: [{        // Préférences personnalisées
    type: String,              // "music", "conversation", "silence", "other"
    value: String,
    description: String
  }]
}
```

## 🔗 Intégration avec MySQL

### Dans getAvailableCarpoolings()

-   Enrichit automatiquement avec `driver_rating` depuis MongoDB
-   Filtre par note minimale fonctionnel

### Dans getCarpoolingById()

-   Ajoute `driver_rating` et `total_reviews`
-   Inclut `driver_preferences` complètes
-   Affiche `recent_reviews` (3 derniers avis)

## 🎯 Conformité ECF

### US5 - Vue Détaillée ✅

-   ✅ Avis laissés sur le conducteur
-   ✅ Note du chauffeur (NoSQL)
-   ✅ Préférences du conducteur

### US11 - Fin de Trajet ✅

-   ✅ Passager peut laisser avis et note
-   ✅ Soumis à validation employé
-   ✅ Signalement si problème

### US12 - Espace Employé ✅

-   ✅ Validation des avis
-   ✅ Gestion des signalements
-   ✅ Accès détails trajets litigieux

## 🚀 Utilisation

### Créer un avis (passager)

```javascript
POST /api/reviews
{
  "carpoolingId": 1,
  "reviewedUserId": 2,
  "rating": 4.5,
  "comment": "Très bon chauffeur !",
  "isReported": false
}
```

### Définir préférences (chauffeur)

```javascript
POST /api/preferences
{
  "allowsSmoking": false,
  "allowsPets": true,
  "conversationLevel": "friendly",
  "preferredMusicGenre": "Jazz",
  "specialRules": "Pas de nourriture dans la voiture"
}
```

## ⚠️ Important

1. **MongoDB doit être démarré** avant le serveur Node.js
2. **Authentification requise** pour la plupart des endpoints
3. **Validation automatique** des données d'entrée
4. **Index MongoDB** optimisés pour les performances

## 🐛 Debugging

Logs MongoDB dans la console :

-   ✅ Connexion établie
-   🔗 État de connexion
-   🚨 Erreurs de connexion
-   🔒 Fermeture propre

---

**🎉 MongoDB est maintenant pleinement intégré à EcoRide !**
