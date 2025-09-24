# Frontend - EcoRide (Vue 3 + Vite)

## Description

Interface utilisateur développée avec Vue 3, Vite, Pinia et Bootstrap 5.

## Installation et développement

```powershell
cd Frontend
npm install
copy .env.example .env.local
npm run dev
```

## Build production

```powershell
npm run build
npm run preview
```

## Variables d'environnement

- `VITE_API_URL` : URL de l'API backend (ex. `https://api.mondomaine.com/api`)

## Stack de déploiement

- Hébergement frontend recommandé : Netlify
- Backend : Render
- MySQL : Aiven (MySQL managé)
- MongoDB : MongoDB Atlas

Assurez-vous que `VITE_API_URL` et les autres variables nécessaires sont configurées dans Netlify avant la compilation.

## Tests et qualité

- Tests unitaires : `npm run test:unit`
- Tests E2E : `npm run test:e2e`
- Lint : `npm run lint`

## Documentation

Consultez `../Documentation/API_DOCUMENTATION.md` et `../README.md` pour la documentation générale du projet.
