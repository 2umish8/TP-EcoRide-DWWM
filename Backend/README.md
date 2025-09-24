# Backend - EcoRide (Node.js + Express)

## Description
-----------

API REST implémentée avec Node.js, Express, Prisma (MySQL) et Mongoose (MongoDB).

## Installation et développement
-----------------------------

```powershell
cd Backend
npm install
copy .env.example .env
npx prisma generate
npx prisma db push
npm run dev
```

## Points importants
-----------------

- Les bases de données sont attendues comme fournies par des services externes (DBaaS) dans la configuration de production.
- Pour des tests locaux, configurez MySQL et MongoDB sur votre machine et adaptez `Backend/.env`.

## Stack de déploiement
--------------------

- Backend : Render
- MySQL : Aiven (MySQL managé)
- MongoDB : MongoDB Atlas

Avant de déployer sur Render, définissez les variables d'environnement nécessaires : `DATABASE_URL`, `MONGODB_URI`, `JWT_SECRET`, `BCRYPT_SALT_ROUNDS`, `PORT`.

## Tests
-----

- Exécuter la suite complète : `npm run test:full`
- Vérifier la connexion MongoDB : `npm run mongo:check`

## Documentation
-------------

- API : `../Documentation/API_DOCUMENTATION.md`
- Sécurité : `../SECURITE.md`
