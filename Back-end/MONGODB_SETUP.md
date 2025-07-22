# Guide de démarrage MongoDB - EcoRide

## 🚀 Installation et démarrage MongoDB

### Windows (Recommandé pour votre environnement)

#### 1. **Installation MongoDB Community**

```bash
# Télécharger depuis: https://www.mongodb.com/try/download/community
# Ou via Chocolatey:
choco install mongodb

# Ou via winget:
winget install MongoDB.Server
```

#### 2. **Démarrer MongoDB**

```bash
# Option 1: Service Windows (recommandé)
net start MongoDB

# Option 2: Manuellement
mongod --dbpath C:\data\db

# Option 3: Avec le service par défaut
mongod
```

#### 3. **Vérifier la connexion**

```bash
# Dans un nouveau terminal:
mongosh
# Ou
mongo
```

### Avec Docker (Alternative)

```bash
# Démarrer MongoDB avec Docker
docker run -d --name ecoride-mongo -p 27017:27017 mongo:latest

# Vérifier que ça tourne
docker ps
```

## 🧪 Tests MongoDB EcoRide

### 1. **Test de connexion simple**

```bash
npm run test:mongo
```

### 2. **Test complet avec données**

```bash
node scripts/testMongoDB.js
```

### 3. **Démarrer l'application avec MongoDB**

```bash
npm run dev
```

## 📝 Endpoints à tester

### Reviews (Avis)

-   `POST /api/reviews` - Créer un avis
-   `GET /api/reviews/driver/1` - Voir avis d'un chauffeur
-   `GET /api/reviews/pending` - Avis en attente (employé)

### Préférences

-   `POST /api/preferences` - Créer préférences chauffeur
-   `GET /api/preferences/driver/1` - Voir préférences chauffeur

## 🔧 Configuration

MongoDB URI dans `.env`:

```env
MONGODB_URI=mongodb://localhost:27017/ecoride_reviews
```

## ❗ Dépannage

### Erreur "ECONNREFUSED"

-   MongoDB n'est pas démarré
-   Vérifier le port 27017
-   Démarrer le service MongoDB

### Erreur "MongoNetworkError"

-   Vérifier la variable MONGODB_URI
-   Tester la connexion avec mongosh

### Base de données non créée

-   Normal au premier démarrage
-   MongoDB crée automatiquement lors du premier insert

---

**🎯 Pour votre déploiement ce soir:**

1. Démarrer MongoDB en local
2. Tester les endpoints avec Postman
3. Intégrer dans le front-end si nécessaire
