# Guide de développement - EcoRide

Ce document décrit la configuration de l'environnement de développement et les commandes courantes.

## Prérequis

- Node.js 18+ et npm
- MySQL (ou accès à une instance Aiven pour la production)
- MongoDB (ou accès à une instance Atlas pour la production)
- Git

## Démarrage rapide avec Docker

```powershell
git clone https://github.com/2umish8/TP-EcoRide-DWWM.git
cd TP-EcoRide-DWWM
copy .env.example .env
docker compose -f compose.yaml -f compose.dev.yaml up --build
```

## Démarrage sans Docker (local)

### Backend

```powershell
cd Backend
npm install
copy .env.example .env
npx prisma generate
npx prisma db push
npm run dev
```

### Frontend

```powershell
cd Frontend
npm install
copy .env.example .env.local
npm run dev
```

## Variables d'environnement importantes

### Backend (`Backend/.env`) :

```
DATABASE_URL="mysql://user:pass@host:3306/ecoride_db"
MONGODB_URI="mongodb://user:pass@host:27017/ecoride_db"
JWT_SECRET="votre-secret"
BCRYPT_SALT_ROUNDS=10
PORT=3000
```

### Frontend (`Frontend/.env.local`) :

```
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME="EcoRide"
```

## Stack de déploiement (production)

- Backend : Render
- Frontend : Netlify
- MySQL : Aiven (MySQL managé)
- MongoDB : MongoDB Atlas

Assurez-vous de renseigner les variables d'environnement de production dans les tableaux de bord des fournisseurs avant le déploiement.

## Commandes courantes

- `npm run dev` (backend) : démarrage en développement
- `npm run build` (frontend) : build de production
- `npm run test:full` (backend) : exécute la suite de tests complète

## Documentation connexe

- `Documentation/API_DOCUMENTATION.md`
- `SECURITE.md`
- `README.md` (racine)
