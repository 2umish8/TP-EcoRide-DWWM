# 🚨 URGENT - Installation MongoDB pour déploiement ce soir

## ⚡ Installation rapide MongoDB (Windows)

### Option 1 : MongoDB Community Server (Recommandé)

```powershell
# Télécharger et installer MongoDB Community Server
# URL: https://www.mongodb.com/try/download/community
# Sélectionner : Windows x64, MSI
```

### Option 2 : Via Chocolatey (Si installé)

```powershell
choco install mongodb
```

### Option 3 : Via Winget (Windows 10+)

```powershell
winget install MongoDB.Server
```

## 🔧 Configuration après installation

### 1. Créer les dossiers de données

```powershell
mkdir C:\data\db
```

### 2. Démarrer MongoDB

```powershell
# Méthode 1: Service Windows (si installé comme service)
net start MongoDB

# Méthode 2: Manuel (si installé manuellement)
mongod --dbpath C:\data\db
```

### 3. Vérifier l'installation

```powershell
mongo --version
# ou
mongod --version
```

## ⚡ SOLUTION TEMPORAIRE - MongoDB Atlas (Cloud)

Si l'installation locale prend trop de temps, utiliser MongoDB Atlas :

### 1. Créer un compte gratuit

-   https://cloud.mongodb.com/
-   Cluster gratuit 512MB suffisant pour les tests

### 2. Obtenir la chaîne de connexion

```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ecoride_reviews
```

### 3. Modifier le .env

```env
# Remplacer par l'URL Atlas
MONGODB_URI=mongodb+srv://votre_username:votre_password@cluster0.xxxxx.mongodb.net/ecoride_reviews
```

## 🚀 Tests après installation

```bash
# Tester la connexion
cd Back-end
node scripts/testMongoDB.js

# Démarrer l'application
npm run dev
```

## 📋 Checklist de déploiement

-   [ ] MongoDB installé et démarré
-   [ ] Base de données accessible
-   [ ] Tests MongoDB passés
-   [ ] Application démarre sans erreur
-   [ ] Endpoints MongoDB fonctionnels

**Temps estimé**: 15-30 minutes selon la méthode choisie

**URGENT**: Choisir la méthode Atlas si l'installation locale pose problème !
