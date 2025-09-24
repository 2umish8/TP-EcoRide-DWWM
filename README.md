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
    copy .env.example .env
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

Documentation supplémentaire
---------------------------

- Guide de développement : `README-DEV.md`
- Documentation API : `Documentation/API_DOCUMENTATION.md`
- Sécurité : `SECURITE.md`

Licence
-------

Ce projet est fourni à titre éducatif et est sous licence MIT.
