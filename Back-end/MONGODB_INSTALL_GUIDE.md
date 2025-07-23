# Installation MongoDB - Guide Express ⚡

## 📥 Installation MongoDB

### Option 1 : MongoDB Community Server (Recommandé)

1. Aller sur : https://www.mongodb.com/try/download/community
2. Télécharger **MongoDB Community Server** pour Windows
3. Lancer l'installateur `.msi`
4. **IMPORTANT** : Cocher "Install MongoDB as a Service"
5. **IMPORTANT** : Cocher "Install MongoDB Compass" (interface graphique)

### Option 2 : Via Chocolatey (si installé)

```powershell
choco install mongodb
```

## 🚀 Vérification de l'installation

### 1. Vérifier que MongoDB est démarré

```powershell
# Vérifier le service
net start | findstr MongoDB

# Si pas démarré, le démarrer
net start MongoDB
```

### 2. Test rapide de connexion

```powershell
# Dans le dossier Back-end
cd c:\Users\umisc\OneDrive\Documents\ECF\TP-EcoRide-DWWM\Back-end
node scripts/quickTestMongo.js
```

### 3. Si problème de démarrage

```powershell
# Démarrer MongoDB manuellement
mongod --config "C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg"
```

## 🎯 Une fois MongoDB prêt

### 1. Tester l'intégration EcoRide

```powershell
# Test complet MongoDB + EcoRide
npm run mongo:test
```

### 2. Démarrer le serveur

```powershell
npm start
```

### 3. Vérifier les endpoints MongoDB

-   GET http://localhost:3000/api/reviews/driver/1
-   GET http://localhost:3000/api/preferences/driver/1

## 🔧 Configuration automatique

Le fichier `.env` est déjà configuré avec :

```env
MONGODB_URI=mongodb://localhost:27017/ecoride_reviews
```

## 📊 Interface graphique (MongoDB Compass)

Si MongoDB Compass est installé :

1. Ouvrir MongoDB Compass
2. Se connecter à : `mongodb://localhost:27017`
3. Tu verras la base `ecoride_reviews` avec les collections `reviews` et `driverpreferences`

## ⚠️ En cas de problème

### MongoDB ne démarre pas

1. Vérifier les logs : `C:\Program Files\MongoDB\Server\7.0\log\mongod.log`
2. Redémarrer le service : `net stop MongoDB && net start MongoDB`
3. Vérifier le port 27017 : `netstat -an | findstr 27017`

### Erreur de connexion

1. Utiliser le fallback Atlas Cloud (déjà configuré)
2. Ou installer MongoDB Atlas CLI

## 🎉 Validation finale

Une fois tout fonctionnel :

```powershell
# Test complet du système
npm run test:full
```

**MongoDB + EcoRide = Prêt pour l'ECF ! 🚀**
