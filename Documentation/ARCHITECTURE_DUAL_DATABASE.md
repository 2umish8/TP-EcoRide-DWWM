# Architecture Dual Database : MySQL + MongoDB

## 🎯 Comprendre l'Architecture Hybride

Ce projet utilise **deux bases de données complémentaires** :
- **MySQL** (via Prisma) : données structurées et transactionnelles
- **MongoDB** (via Mongoose) : données flexibles et non-structurées

### Pourquoi Deux Bases ?

| Aspect              | MySQL                                 | MongoDB                        |
| ------------------- | ------------------------------------- | ------------------------------ |
| **Type de données** | Structurées, relationnelles           | Flexibles, documents imbriqués |
| **Transactions**    | ACID, forte intégrité                 | Moins strict (plus rapide)     |
| **Cas d'usage**     | Utilisateurs, trajets, crédits        | Avis, préférences, annotations |
| **Avantages**       | Données critiques, intégrité garantie | Scalabilité, schéma flexible   |

---

## 📊 Structure des Données

### MySQL (Prisma Schema)

**Entités principales :**

```
User (ID auto-incrémenté)
├── pseudo, email, password_hash
├── credits (nombre de crédits)
├── roles (relation many-to-many)
├── vehicles (ses véhicules)
├── driverTrips (trajets créés)
├── participations (trajets auxquels il a participé)
└── creditTransactions (historique des crédits)

Carpooling (trajet)
├── id, status, departure/arrival_address
├── departure_datetime, arrival_datetime
├── price_per_passenger, seats_remaining
├── driver_id (clé étrangère → User)
└── vehicle_id (clé étrangère → Vehicle)

Participation (passager dans un trajet)
├── passenger_id (clé étrangère → User)
├── carpooling_id (clé étrangère → Carpooling)
├── credits_paid
└── cancellation_date (nullable)
```

**Exemple Prisma :**
```prisma
model User {
  id        Int      @id @default(autoincrement())
  pseudo    String   @unique
  email     String   @unique
  credits   Int      @default(20)
  
  roles              User_Role[]
  driverTrips        Carpooling[]        @relation("DriverTrips")
  participations     Participation[]
  creditTransactions CreditTransaction[]
}

model Carpooling {
  id               Int      @id @default(autoincrement())
  driver_id        Int
  vehicle_id       Int
  departure_datetime DateTime
  
  driver   User       @relation("DriverTrips", fields: [driver_id])
  vehicle  Vehicle    @relation(fields: [vehicle_id])
  participations Participation[]
}
```

---

### MongoDB (Collections)

**Collections principales :**

#### 1️⃣ **Review Collection** (Avis des passagers)

```javascript
{
  _id: ObjectId("..."),                    // ID MongoDB (unique)
  
  // CLÉS COMMUNES (références vers MySQL User)
  reviewerId: 5,                           // ID de l'utilisateur qui a laissé l'avis
  reviewedUserId: 8,                       // ID du chauffeur évalué
  carpoolingId: 42,                        // ID du trajet (MySQL)
  
  // Contenu de l'avis
  rating: 4.5,                             // Note 1-5
  comment: "Bon chauffeur, trajet agréable",
  
  // Statut de modération
  validationStatus: "approved",            // pending, approved, rejected
  validatedBy: 1,                          // ID de l'employé qui a modéré
  validatedAt: ISODate("2025-01-15T10:30:00Z"),
  
  // Signalement
  isReported: false,
  reportReason: null,
  
  // Métadonnées
  createdAt: ISODate("2025-01-14T14:22:00Z"),
  updatedAt: ISODate("2025-01-14T14:22:00Z")
}
```

**Index importants :**
```javascript
// Empêcher les doublons : un utilisateur = un avis par trajet
db.reviews.createIndex({ reviewerId: 1, carpoolingId: 1 }, { unique: true })

// Requêtes fréquentes
db.reviews.createIndex({ reviewedUserId: 1, validationStatus: 1 })
db.reviews.createIndex({ createdAt: -1 })
```

#### 2️⃣ **DriverPreferences Collection** (Préférences des chauffeurs)

```javascript
{
  _id: ObjectId("..."),
  
  // CLÉ COMMUNE (référence unique vers MySQL User)
  driverId: 8,                             // ID du chauffeur (UNIQUE)
  
  // Préférences de base
  allowsSmoking: false,
  allowsPets: true,
  
  // Préférences personnalisées (flexibilité MongoDB)
  customPreferences: [
    {
      type: "music",
      value: "Musique classique",
      description: "Détente avec Mozart"
    },
    {
      type: "conversation",
      value: "Friendly",
      description: "J'aime discuter"
    }
  ],
  
  // Voyages
  preferredMusicGenre: "Classical",
  conversationLevel: "friendly",           // silent, minimal, friendly, chatty
  specialRules: "Pas de parfum fort",
  
  // Métadonnées
  createdAt: ISODate("2025-01-01T08:00:00Z"),
  updatedAt: ISODate("2025-01-14T15:45:00Z")
}
```

**Index :**
```javascript
// Recherche rapide par chauffeur
db.driverpreferences.createIndex({ driverId: 1 }, { unique: true })
```

---

## 🔑 Les Clés Communes : Comment Ça Marche

### Le Concept

**IL N'Y A PAS DE CLÉ ÉTRANGÈRE TRADITIONNELLE** entre MySQL et MongoDB.

À la place, on utilise des **références ID simples** :

```
User (MySQL, id: 5)
    ↓
    ├─→ Review (MongoDB, reviewerId: 5)
    ├─→ Review (MongoDB, reviewerId: 5)
    └─→ DriverPreferences (MongoDB, driverId: 5)
```

**L'ID de l'utilisateur MySQL devient un champ Number dans MongoDB.**

### Exemple Concret

**Scénario : Un utilisateur crée un avis**

#### Étape 1 : Vérification dans MySQL (Prisma)

```javascript
// Backend : reviewController.js
const createReview = async (req, res) => {
    const reviewerId = req.user.id;  // Par exemple : 5
    const { carpoolingId, reviewedUserId, rating, comment } = req.body;

    // ✅ Vérifier dans MySQL que le trajet existe ET que l'utilisateur y a participé
    const participation = await prisma.participation.findFirst({
        where: {
            passenger_id: reviewerId,      // 5
            carpooling_id: parseInt(carpoolingId),  // 42
        },
        include: {
            carpooling: { select: { driver_id: true } }
        }
    });

    if (!participation) {
        return res.status(403).json({
            message: "Vous ne pouvez laisser un avis que sur les trajets auxquels vous avez participé."
        });
    }

    // ✅ Vérifier que c'est bien le chauffeur qu'on évalue
    if (participation.carpooling.driver_id !== reviewedUserId) {
        return res.status(400).json({
            message: "Vous ne pouvez évaluer que le chauffeur du trajet."
        });
    }
```

#### Étape 2 : Création dans MongoDB

```javascript
    // ✅ Créer l'avis dans MongoDB
    const review = new Review({
        reviewerId: reviewerId,           // 5 (vient du token, vérifier dans MySQL)
        reviewedUserId: reviewedUserId,   // 8 (chauffeur)
        carpoolingId: carpoolingId,       // 42 (lien vers Carpooling MySQL)
        rating: rating,
        comment: comment,
        validationStatus: "pending"
    });

    await review.save();

    res.status(201).json({ message: "Avis créé", review });
};
```

---

## 📝 Cas d'Usage Réels

### Cas 1 : Afficher les Avis d'un Chauffeur

```javascript
// Frontend : demande les avis du chauffeur avec ID 8

// Backend (carpoolingController.js)
const ratingStats = await Review.getAverageRating(8);  // ← MongoDB

// Méthode MongoDB (Review.js)
reviewSchema.statics.getAverageRating = async function (userId) {
    const result = await this.aggregate([
        {
            $match: {
                reviewedUserId: userId,        // 8 ← Clé commune
                validationStatus: "approved"
            }
        },
        {
            $group: {
                _id: null,
                averageRating: { $avg: "$rating" },
                totalReviews: { $sum: 1 }
            }
        }
    ]);
    return result[0] || { average: 0, total: 0 };
};

// Résultat
{
    average: 4.3,
    total: 15
}
```

### Cas 2 : Récupérer les Préférences d'un Chauffeur

```javascript
// Frontend : demande les préférences du chauffeur 8

// Backend (preferencesController.js)
const preferences = await DriverPreferences.findByDriverId(8);

// Résultat
{
    driverId: 8,
    allowsSmoking: false,
    allowsPets: true,
    customPreferences: [...],
    conversationLevel: "friendly"
}
```

### Cas 3 : Vérifier l'Intégrité au Moment de Créer un Avis

```javascript
// On DOIT vérifier dans MySQL d'abord
const participation = await prisma.participation.findFirst({
    where: {
        passenger_id: reviewerId,          // ← Vérification MySQL
        carpooling_id: parseInt(carpoolingId)
    }
});

// Puis on sauvegarde dans MongoDB
const review = new Review({
    reviewerId: reviewerId,
    reviewedUserId: reviewedUserId,
    carpoolingId: carpoolingId,            // ← Référence vers MySQL
    rating: rating
});
await review.save();
```

---

## 🏗️ Architecture Résumée

```
┌─────────────────────────────────────────────────────────────────┐
│                         APPLICATION                              │
│                    (Frontend Vue.js)                              │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ HTTP/REST
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (Node.js)                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          Controllers (businessLogic)                      │  │
│  │  - userController                                         │  │
│  │  - carpoolingController                                   │  │
│  │  - reviewController (MongoDB + MySQL)                     │  │
│  │  - preferencesController (MongoDB)                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                      │
│              ┌────────────┴────────────┐                         │
│              ▼                         ▼                         │
│  ┌──────────────────────┐   ┌────────────────────────┐         │
│  │   Config/db.js       │   │ Config/mongodb.js      │         │
│  │   (Prisma ORM)       │   │ (Mongoose)             │         │
│  └──────────────────────┘   └────────────────────────┘         │
│              │                         │                        │
└──────────────┼─────────────────────────┼──────────────────────┘
               │                         │
         ┌─────▼─────┐           ┌──────▼────────┐
         │   MySQL   │           │    MongoDB    │
         │(Prisma)   │           │ (Mongoose)    │
         │           │           │               │
         │ Users     │           │ Reviews       │
         │ Vehicles  │           │ Preferences   │
         │ Trips     │           │               │
         │ Credits   │           │               │
         └───────────┘           └───────────────┘
```

---

## ✅ Règles d'Intégrité

### ✔️ Faire Confiance à MySQL
- **Source de vérité** pour les utilisateurs, trajets, crédits
- Données transactionnelles critiques
- Vérifications d'intégrité (clés étrangères)

### ✔️ MongoDB = Extension Flexible
- Préférences, avis, annotations
- **Jamais de création directe sans vérification MySQL**
- L'ID de l'utilisateur vient toujours de MySQL en amont

### ✔️ Principe du Contrôleur
```javascript
// Toujours :
// 1. Vérifier / Récupérer depuis MySQL
// 2. Utiliser les IDs pour interroger/créer dans MongoDB
// 3. Retourner les données combinées au frontend
```

---

## 🔍 Vérification Pratique

### Requête Combinée (Frontend demande le profil du chauffeur)

```javascript
// Frontend
GET /api/carpool/:carpoolingId

// Backend (carpoolingController.js)
const getCarpoolingDetails = async (req, res) => {
    // 1️⃣ Récupérer dans MySQL
    const carpooling = await prisma.carpooling.findUnique({
        where: { id: parseInt(req.params.carpoolingId) },
        include: {
            driver: { select: { id, pseudo, profile_picture_url } },
            vehicle: true,
            participations: { count: true }
        }
    });

    // 2️⃣ Enrichir avec MongoDB (avis du chauffeur)
    const ratingStats = await Review.getAverageRating(carpooling.driver_id);

    // 3️⃣ Récupérer les préférences du chauffeur depuis MongoDB
    const driverPrefs = await DriverPreferences.findByDriverId(carpooling.driver_id);

    // 4️⃣ Retourner le tout au frontend
    res.json({
        ...carpooling,
        driver_rating: ratingStats.average,
        driver_reviews_count: ratingStats.total,
        driver_preferences: driverPrefs
    });
};

// Réponse
{
    id: 42,
    departure_address: "Paris",
    arrival_address: "Lyon",
    driver: { id: 8, pseudo: "Alice", ... },
    driver_rating: 4.3,
    driver_reviews_count: 15,
    driver_preferences: {
        allowsSmoking: false,
        allowsPets: true,
        customPreferences: [...]
    }
}
```

---

## 🚀 Points Clés à Retenir

1. **MySQL = Structure + Transactions**
   - Utilisateurs, véhicules, trajets, crédits
   - Clés étrangères, contraintes

2. **MongoDB = Flexibilité + Scalabilité**
   - Avis, préférences, annotations
   - Pas de schéma rigide

3. **Clés Communes = ID Numbers**
   - `reviewerId: 5` (MongoDB) = `User.id: 5` (MySQL)
   - `driverId: 8` (MongoDB) = `User.id: 8` (MySQL)

4. **Pas de JOIN entre bases**
   - L'application fait les jointures en mémoire
   - Controllers orchestrent les deux bases

5. **Vérification Toujours en MySQL**
   - Avant de créer/modifier dans MongoDB
   - MySQL est la source de vérité

---

## 📚 Fichiers Importants à Consulter

| Fichier                                        | Rôle                       |
| ---------------------------------------------- | -------------------------- |
| `Backend/prisma/schema.prisma`                 | Schéma MySQL complet       |
| `Backend/Config/db.js`                         | Connexion Prisma           |
| `Backend/Config/mongodb.js`                    | Connexion Mongoose         |
| `Backend/models/Review.js`                     | Modèle Review MongoDB      |
| `Backend/models/DriverPreferences.js`          | Modèle Préférences MongoDB |
| `Backend/controllers/reviewController.js`      | Logique des avis           |
| `Backend/controllers/preferencesController.js` | Logique des préférences    |
