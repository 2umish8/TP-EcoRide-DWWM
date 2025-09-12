# ⚠️ SÉCURITÉ - Configuration requise

## Fichiers de configuration sensibles supprimés

Pour la sécurité, les fichiers suivants ont été **intentionnellement supprimés** du repository public :

### ❌ Fichiers supprimés

-   `Backend/.env` - Contenait des identifiants de base de données réels
-   `lancer-mongodb-compass.bat` - Contenait des chaînes de connexion MongoDB avec credentials

## ✅ Configuration requise pour faire fonctionner l'application localement
(Pour rappel, le site est deployé sur [ecoridetp.netlify.app](https://ecoridetp.netlify.app/))
### 1. Créer le fichier `.env` dans `/Backend/`

```bash
cd Backend
cp .env.example .env
```

### 2. Configurer les variables d'environnement

Éditer le fichier `.env` créé avec vos paramètres :

```env
# Configuration MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe_mysql
DB_NAME=ecoride

# JWT Secret (générer une chaîne aléatoire longue)
JWT_SECRET=votre_secret_jwt_tres_long_et_aleatoire_ici
JWT_EXPIRATION=24h

# Configuration serveur
PORT=3000
NODE_ENV=development

# Bcrypt
BCRYPT_SALT_ROUNDS=12

# MongoDB (optionnel pour les avis)
MONGODB_URI=mongodb://localhost:27017/ecoride_reviews
```

### 3. Alternative : Base de données simplifiée

Si vous n'avez pas MongoDB d'installé, l'application fonctionne avec MySQL uniquement :

-   Les avis seront simulés côté frontend
-   Toutes les autres fonctionnalités restent opérationnelles

## 🛡️ Bonnes pratiques de sécurité démontrées

1. **Variables d'environnement** : Secrets externalisés
2. **Fichier .gitignore** : Exclusion des fichiers sensibles
3. **JWT sécurisé** : Tokens avec expiration
4. **Mots de passe chiffrés** : bcrypt avec salt rounds élevés
5. **Validation des entrées** : Protection contre injections

## 📋 Checklist de configuration

-   [ ] Créer le fichier `.env` avec vos paramètres
-   [ ] Vérifier que MySQL est démarré
-   [ ] Importer la base de données si nécessaire
-   [ ] Lancer `npm install` dans Backend/
-   [ ] Lancer `npm start` dans Backend/
-   [ ] Lancer `npm install` dans Frontend/
-   [ ] Lancer `npm run dev` dans Frontend/

## ⏱️ Temps estimé de configuration

**Configuration complète** : 5-10 minutes  
**Configuration sans MongoDB** : 3-5 minutes

---

Cette approche de sécurité illustre la **prise en compte des risques** et l'application des **bonnes pratiques** de développement web.
