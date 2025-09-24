Backend - Docker

Construire et exécuter l'image Docker du backend.

Build

```powershell
cd Backend
docker build -t ecoride-backend .
```

Exécution (exemple avec variables d'environnement)

```powershell
docker run -p 3000:3000 \
  -e DATABASE_URL="mysql://user:pass@mysql-host:3306/ecoride_db" \
  -e MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/ecoride_db" \
  ecoride-backend
```

Stack de déploiement
--------------------

- Backend : Render
- MySQL : Aiven (MySQL managé)
- MongoDB : MongoDB Atlas
- Frontend : Netlify

Si vous utilisez des images Docker sur d'autres plateformes, préférez des bases de données managées (Aiven/Atlas) et évitez d'embarquer des secrets dans l'image.