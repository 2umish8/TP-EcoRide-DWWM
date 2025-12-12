# Setup Développement LOCAL - Guide Simple

## ✅ Approche Recommandée: Local (Pas Docker)

Tu as raison! Pour la phase de **nettoyage du code**, développer en local est:
- ✅ Plus simple à comprendre
- ✅ Plus facile à déboguer
- ✅ Plus rapide (pas overhead Docker)
- ✅ Mieux pour nettoyer le code sans distractions
- ✅ Docker peut attendre après le nettoyage

**Plan**: Nettoyage local d'abord → Docker/production après

---

## 🚀 Démarrage Rapide (2 Terminaux)

### Prérequis (À vérifier AVANT de commencer)

Utilise le script de vérification:
```powershell
.\verify-setup.ps1
```

Ce script checke:
- ✅ Node.js v18+ installé
- ✅ npm installé
- ✅ Fichier .env existe
- ✅ MySQL accessible (localhost:3306)
- ✅ MongoDB accessible (localhost:27017)
- ✅ node_modules installés

### Étape 1: Assurer que les Bases de Données tournent

**MySQL Windows**:
1. Ouvrir `Services` (services.msc)
2. Chercher "MySQL80" (ou MySQL57, MySQL84, etc.)
3. Right-click → Start (si pas déjà running)

**MongoDB Windows**:
1. Ouvrir `Services` (services.msc)
2. Chercher "MongoDB"
3. Right-click → Start (si pas déjà running)

**Vérification**:
```powershell
# Test MySQL
Test-NetConnection -ComputerName localhost -Port 3306

# Test MongoDB
Test-NetConnection -ComputerName localhost -Port 27017
```

Dois voir: `TcpTestSucceeded : True`

### Étape 2: Terminal 1 - Backend

```powershell
cd Backend
npm run dev
```

**Résultat attendu**:
```
Serveur en écoute sur le port 3000
```

**Si erreur MySQL**: Vérifier que MySQL tourne et credentials dans .env sont corrects
**Si erreur MongoDB**: C'est ok - le backend fonctionne quand même (reviews optionnelles)

### Étape 3: Terminal 2 - Frontend

```powershell
cd Frontend
npm run dev
```

**Résultat attendu**:
```
VITE v7.0.0 ready in XXX ms

➜  Local:   http://localhost:5173/
```

### Étape 4: Tester dans le Navigateur

1. Ouvrir: http://localhost:5173
2. Page d'accueil doit charger
3. Cliquer sur "Login" ou "Search"
4. Login avec:
   - Username: `test`
   - Password: `Test2025!`

Si tu vois le dashboard → **Tout fonctionne! ✅**

---

## 📁 Structure Fichiers Importants

```
TP-EcoRide-DWWM/
├── .env                    ← Variables d'environnement (global)
├── Backend/
│   ├── server.js          ← Point d'entrée Backend
│   ├── Config/
│   │   ├── db.js          ← Prisma (MySQL)
│   │   └── mongodb.js     ← MongoDB config
│   ├── package.json       ← Scripts npm
│   └── node_modules/      ← Dépendances (npm install)
├── Frontend/
│   ├── src/
│   │   ├── main.js        ← Point d'entrée
│   │   ├── services/
│   │   │   └── api.js     ← Config API (http://localhost:3000/api)
│   │   └── stores/        ← Pinia stores
│   ├── vite.config.js     ← Vite config
│   ├── package.json       ← Scripts npm
│   └── node_modules/      ← Dépendances (npm install)
└── verify-setup.ps1       ← Script vérification (À UTILISER!)
```

---

## 🔧 Variables d'Environnement Critiques

### Backend (.env dans Backend/)

```bash
# Backend DOIT avoir ces variables pour trouver MySQL/MongoDB:
NODE_ENV=development
PORT=3000

DATABASE_URL="mysql://avnadmin:password@host:12966/defaultdb?ssl-mode=REQUIRED"

# Important: Use 127.0.0.1 instead of localhost on Windows for MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/ecoride_reviews

JWT_SECRET=your_secret_here
JWT_EXPIRATION=1h
BCRYPT_SALT_ROUNDS=10
```

### Frontend (.env.local dans Frontend/)

```bash
# Frontend DOIT avoir:
VITE_API_URL=http://localhost:3000/api
```
JWT_SECRET=super-secret-jwt-key-change-this-in-production-256-bits-minimum
PORT=3000
NODE_ENV=development
```

---

## ⚡ Hot Reload (Modification du Code)

### Backend (Nodemon)
- Modifie un fichier dans `Backend/` → Redémarrage automatique
- Terminal Backend affichera: "Restarting due to changes..."
- **Attendre 2-3 secondes** avant de retester

### Frontend (Vite)
- Modifie un fichier dans `Frontend/src/` → Rechargement instantané
- Page refresh automatique dans le navigateur
- **Aucune attente** - c'est instantané

---

## 🚨 Troubleshooting

### ❌ "Cannot find module 'dotenv'"
```powershell
cd Backend
npm install
```

### ❌ "Port 3000 already in use"
```powershell
# Option 1: Tuer le processus
Get-Process | Where-Object {$_.Port -eq 3000}  # Trouver le processus
Stop-Process -Name "node" -Force               # Tuer tous les Node

# Option 2: Utiliser port différent
# Modifier PORT=3001 dans .env, puis redémarrer Backend
```

### ❌ "Cannot connect to MySQL"
1. Vérifier MySQL tourne: `Test-NetConnection -ComputerName localhost -Port 3306`
2. Vérifier credentials dans .env
3. Si problème de credentials:
   ```sql
   -- Resetter via MySQL client
   ALTER USER 'ecoride_user'@'localhost' IDENTIFIED BY 'ecoride_password';
   FLUSH PRIVILEGES;
   ```

### ❌ "Cannot connect to MongoDB"
1. Vérifier MongoDB tourne: `Test-NetConnection -ComputerName localhost -Port 27017`
2. Si local MongoDB:
   ```bash
   # Windows: Services (services.msc) → MongoDB → Start
   ```
3. Note: Backend peut tourner sans MongoDB (reviews optionnelles)

### ❌ Frontend cannot reach Backend
1. Vérifier Backend tourne sur port 3000
2. Vérifier `.env` contient: `VITE_API_URL=http://localhost:3000/api`
3. Vérifier pas de CORS errors dans DevTools (F12 → Console)

### ❌ "EACCES: permission denied"
```powershell
# Sur Windows, habituellement pas ce problème
# Si ça arrive, tenter:
npm cache clean --force
rm -r node_modules package-lock.json
npm install
```

---

## 📊 Vérification Post-Setup

Après lancement des deux terminaux, tester:

```powershell
# Test Backend API (depuis n'importe quel terminal)
Invoke-WebRequest -Uri "http://localhost:3000/api" -ErrorAction SilentlyContinue
```

Devrait retourner une réponse (pas une erreur)

```powershell
# Test Frontend (ouvrir dans navigateur)
http://localhost:5173
```

Devrait voir la page d'accueil

---

## 🎯 Commandes Utiles

```powershell
# Arrêter services (Ctrl+C dans les terminaux)
# Puis relancer quand besoin

# Nettoyer et réinstaller (si problèmes)
cd Backend
rm -r node_modules package-lock.json
npm install

cd ../Frontend
rm -r node_modules package-lock.json
npm install

# Vérifier que tout est bon
.\verify-setup.ps1
```

---

## ✅ Checklist Avant Nettoyage

Une fois qu'on a:
- [ ] Backend tourne: `npm run dev` → affiche "Serveur en écoute sur le port 3000"
- [ ] Frontend tourne: `npm run dev` → affiche "VITE vX.X.X ready"
- [ ] Navigateur accessible: http://localhost:5173
- [ ] Login fonctionne: test/Test2025!
- [ ] Pas d'erreurs console

**ALORS**: Vous pouvez commencer le nettoyage! 🧹

---

## 🚀 Prochaines Étapes (Après Setup)

1. **Vérifier que tout marche localement**
2. **Commencer nettoyage CSS** (`src/assets/main.css` → `eco-variables.css`)
3. **Nettoyer `services/api.js`** (supprimer console.log)
4. **Supprimer composants inutiles** (HelloWorld, etc.)
5. **Tester après CHAQUE changement** pour s'assurer que ça marche
6. **Commit souvent** pour sauvegarder vos progrès

**Après nettoyage complet**: Docker peut être nettoyé/testé aussi

---

## 💡 Philosophie du Cleanup Local

> "Gardez les choses simples pendant le nettoyage"

- ✅ Un terminal Backend, un terminal Frontend
- ✅ Voir exactement ce qu'il se passe
- ✅ Modification = test immédiat
- ✅ Pas de complexité Docker supplémentaire
- ✅ Vous êtes en contrôle total

**Quand nettoyage sera fait** → Docker sera plus facile à refaire si besoin

---

Bon développement! 🚀
