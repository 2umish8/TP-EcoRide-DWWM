Utilitaires - Backend EcoRide

Ce dossier contient les fonctions utilitaires : validation d'email, validation de mot de passe, services email, etc.

Usage
-----

Les modules exportent des fonctions documentées dans leurs JSDoc. Exemple d'utilisation :

```javascript
const { validateAndNormalizeEmail } = require('../utils/emailValidator');
```

Stack de déploiement
--------------------

Ce dossier fait partie d'un projet déployé avec la configuration suivante :

- Backend : Render
- MySQL : Aiven (MySQL managé)
- MongoDB : MongoDB Atlas
- Frontend : Netlify

Les informations sensibles (URLs de connexion, secrets) doivent être stockées dans les variables d'environnement du fournisseur d'hébergement.
