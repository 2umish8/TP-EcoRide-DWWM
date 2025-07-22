# 🚀 Solution URGENTE : MongoDB Atlas (Cloud)

## ⚡ Configuration Express MongoDB Atlas

### 1. Créer un compte gratuit (2 minutes)

-   Aller sur https://cloud.mongodb.com/
-   S'inscrire avec email
-   Sélectionner "Build a Database" → "M0 Sandbox" (GRATUIT)

### 2. Configuration cluster (1 minute)

-   Nom du cluster : `ecoride-cluster`
-   Provider : AWS
-   Région : `eu-west-3` (Paris) ou la plus proche

### 3. Sécurité (1 minute)

-   Username : `ecoride_user`
-   Password : `EcoRide2025!` (noter ce mot de passe)
-   Network Access : `0.0.0.0/0` (pour les tests)

### 4. Obtenir l'URL de connexion

Format : `mongodb+srv://ecoride_user:EcoRide2025!@ecoride-cluster.xxxxx.mongodb.net/ecoride_reviews`

## 🔧 Mise à jour rapide

### Modifier le .env

```env
# AVANT
MONGODB_URI=mongodb://localhost:27017/ecoride_reviews

# APRÈS
MONGODB_URI=mongodb+srv://ecoride_user:EcoRide2025!@ecoride-cluster.xxxxx.mongodb.net/ecoride_reviews
```

### Test immédiat

```bash
cd Back-end
node scripts/testMongoDB.js
npm run dev
```

## ✅ Avantages Atlas pour ce soir

-   ✅ Installation instantanée
-   ✅ Toujours disponible (cloud)
-   ✅ Gratuit jusqu'à 512MB
-   ✅ Interface graphique incluse
-   ✅ Backups automatiques
-   ✅ Pas de configuration système

## 🎯 Prêt en 5 minutes chrono !

**URGENT** : Cette solution te permet de déployer l'application CE SOIR sans installer MongoDB localement !
