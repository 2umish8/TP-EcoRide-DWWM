# Frontend - Docker

Ce fichier explique comment construire et exécuter l'image Docker du frontend.

## Build image (production)

```powershell
cd Frontend
docker build -t ecoride-frontend .
```

## Exécuter le conteneur

```powershell
docker run -p 80:80 ecoride-frontend
```

## Stack de déploiement

- Hébergement recommandé : Netlify (pour les sites statiques)
- Backend : Render
- MySQL : Aiven (MySQL managé)
- MongoDB : MongoDB Atlas

Si vous déployez un conteneur sur une autre plateforme, assurez-vous de configurer les mêmes variables d'environnement que pour Netlify.