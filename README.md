# EcoRide - Application de covoiturage écologique

Présentation
------------

EcoRide est une application de covoiturage axée sur la mobilité durable. Ce dépôt contient le frontend (Vue 3 + Vite) et le backend (Node.js + Express + Prisma) ainsi que la documentation et les scripts d'administration.

Note importante
--------------

Démarrage rapide (Docker - recommandé pour le développement)
--------------------------------------------------------

1. Cloner le dépôt

    ```powershell
    git clone https://github.com/2umish8/TP-EcoRide-DWWM.git
    cd TP-EcoRide-DWWM
    ```

2. Copier les fichiers d'environnement

    ```powershell
    # Backend
    cd Backend
    copy .env.example .env
    
    # Frontend
    cd ../Frontend
    copy .env.example .env.local
    cd ..
    ```

3. Lancer les services (frontend + backend)

    ```powershell
    docker compose -f compose.yaml -f compose.dev.yaml up --build
    # Pour détaché : docker compose -f compose.yaml -f compose.dev.yaml up --build -d
    ```

Accès local par défaut

- Frontend : http://localhost:5173
- Backend API : http://localhost:3000

Mode développement sans Docker
------------------------------

Backend

```powershell
cd Backend
npm install
copy .env.example .env
npx prisma generate
npx prisma db push
npm run dev
```

Frontend (autre terminal)

```powershell
cd Frontend
npm install
copy .env.example .env.local
npm run dev
```

On Windows you can also start the frontend in background using the helper script:

```powershell
PowerShell -File .\scripts\start-frontend-dev.ps1
```

Tests
-----

```powershell
# Tests backend
cd Backend; npm run test:full

# Tests frontend
cd Frontend; npm run test:unit
```

Stack de déploiement (production)
---------------------------------

Configuration recommandée pour la production :

- Backend : Render
- Frontend : Netlify
- MySQL (relationnel) : Aiven (MySQL managé)
- MongoDB (NoSQL) : MongoDB Atlas

Avant le déploiement, configurez les variables d'environnement nécessaires sur la plateforme choisie (par exemple `DATABASE_URL`, `MONGODB_URI`, `JWT_SECRET`, `BCRYPT_SALT_ROUNDS`, `PORT`).

Documentation Complète
-----------------------

**Toute la documentation est organisée dans le dossier `Documentation/`** pour une meilleure lisibilité et navigation.

👉 **[Commencez par le Documentation/INDEX.md](./Documentation/INDEX.md)** pour un guide complet de navigation.

**Raccourcis rapides :**

Pour les **développeurs** voulant reproduire le projet :
- [RESUME_EXECUTIF.md](./Documentation/LEARNING/RESUME_EXECUTIF.md) - Plan de maîtrise (👈 COMMENCEZ ICI)
- [PATTERNS_CLÉS.md](./Documentation/LEARNING/PATTERNS_CLÉS.md) - Les 9 patterns essentiels
- [GUIDE_PRATIQUE_NOUVEAU_PROJET.md](./Documentation/GETTING-STARTED/GUIDE_PRATIQUE_NOUVEAU_PROJET.md) - Instructions pas à pas

Pour les **architects/DevOps** :
- [DEPLOYMENT-GUIDE.md](./Documentation/TECHNICAL/DEPLOYMENT-GUIDE.md) - Déploiement complet
- [SECURITE.md](./Documentation/TECHNICAL/SECURITE.md) - Sécurité et bonnes pratiques
- [API_DOCUMENTATION.md](./Documentation/TECHNICAL/API_DOCUMENTATION.md) - Spécification API

Pour les **utilisateurs finaux** :
- [Manuel-Utilisateur.md](./Documentation/USER/Manuel-Utilisateur.md) - Guide utilisateur

Licence
-------

Ce projet est fourni à titre éducatif et est sous licence MIT.
