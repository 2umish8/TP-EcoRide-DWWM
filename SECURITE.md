# 🔒 Sécurité EcoRide - Guide Complet

Configuration sécurisée pour l'application EcoRide avec Docker et développement natif.

## 🐳 Sécurité avec Docker (Recommandé)

### Configuration sécurisée avec Docker Compose

```bash
# 1. Cloner et configurer
git clone https://github.com/2umish8/TP-EcoRide-DWWM.git
cd TP-EcoRide-DWWM

# 2. Configuration sécurisée des variables
cp .env.example .env
chmod 600 .env  # Permissions restrictives

# 3. Modifier les secrets par défaut
nano .env  # Changez TOUS les mots de passe!
```

### Variables d'environnement sécurisées

#### Environnement de production (.env)

```env
# === SÉCURITÉ CRITIQUE - CHANGEZ CES VALEURS ===
# Base de données MySQL
MYSQL_ROOT_PASSWORD=CHANGEZ_CE_MOT_DE_PASSE_TRÈS_COMPLEXE
MYSQL_USER=ecoride_user
MYSQL_PASSWORD=CHANGEZ_CE_MOT_DE_PASSE_AUSSI

# MongoDB
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=CHANGEZ_CE_MOT_DE_PASSE_MONGODB

# Redis
REDIS_PASSWORD=CHANGEZ_CE_MOT_DE_PASSE_REDIS

# JWT - OBLIGATOIRE de changer en production
JWT_SECRET=GÉNÉREZ_UNE_CLÉ_SECRÈTE_DE_256_BITS_ICI
JWT_EXPIRATION=24h
BCRYPT_SALT_ROUNDS=12

# === SÉCURITÉ RÉSEAU ===
# CORS - Limitez aux domaines autorisés
ALLOWED_ORIGINS=https://votre-domaine.com,https://autre-domaine.com

# Environnement
NODE_ENV=production
```

#### Génération de secrets sécurisés

```bash
# Générer des mots de passe sécurisés
openssl rand -hex 32  # Pour JWT_SECRET
openssl rand -base64 32  # Pour mots de passe DB

# Ou avec Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Mesures de sécurité Docker

#### 1. Utilisateurs non-root

```dockerfile
# Backend Dockerfile - Utilisateur non-privilégié
RUN addgroup -S appgroup \
    && adduser -S appuser -G appgroup
USER appuser

# Frontend Dockerfile - Nginx non-root
USER nginx
```

#### 2. Images de base sécurisées

```dockerfile
# Utilisation d'images Alpine (plus petites, moins d'attaque surface)
FROM node:22.12.0-alpine AS base
FROM nginx:stable-alpine AS production
```

#### 3. Secrets Docker

```yaml
# compose.yaml - Gestion des secrets
secrets:
  mysql_password:
    file: ./secrets/mysql_password.txt
  jwt_secret:
    file: ./secrets/jwt_secret.txt

services:
  backend:
    secrets:
      - mysql_password
      - jwt_secret
```

#### 4. Réseaux isolés

```yaml
# Réseau Docker isolé
networks:
  ecoride-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

## 🛡️ Sécurité Application

### 1. Authentification & Autorisation

#### JWT sécurisé

```javascript
// Backend - Configuration JWT
const jwt = require('jsonwebtoken');

// Token avec expiration
const token = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET,
  { 
    expiresIn: process.env.JWT_EXPIRATION,
    issuer: 'ecoride-api',
    audience: 'ecoride-client'
  }
);

// Validation stricte
const decoded = jwt.verify(token, process.env.JWT_SECRET, {
  issuer: 'ecoride-api',
  audience: 'ecoride-client'
});
```

#### Mots de passe bcrypt

```javascript
// Hachage sécurisé (12 rounds minimum)
const bcrypt = require('bcrypt');
const saltRounds = 12;

const hashedPassword = await bcrypt.hash(password, saltRounds);
const isValid = await bcrypt.compare(password, hashedPassword);
```

### 2. Validation & Sanitisation

#### Schemas Zod

```javascript
// Validation stricte des inputs
const userSchema = z.object({
  email: z.string().email().max(255),
  password: z.string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/),
  pseudo: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/)
});
```

#### Middleware de validation

```javascript
// Protection contre les injections
const validateBody = (schema) => (req, res, next) => {
  try {
    req.validatedBody = schema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({ 
      message: "Données invalides",
      errors: error.errors 
    });
  }
};
```

### 3. Headers de sécurité

#### Configuration Helmet

```javascript
// Backend - Headers de sécurité
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

#### Configuration Nginx

```nginx
# Frontend nginx.conf - Headers sécurisés
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

### 4. Protection CORS

```javascript
// Configuration CORS stricte
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

## 🔍 Audit de Sécurité

### Outils d'analyse

```bash
# Audit des dépendances npm
npm audit
npm audit fix

# Scan de sécurité Docker
docker scan ecoride-backend
docker scan ecoride-frontend

# Analyse statique
npm install -g eslint-plugin-security
eslint --ext .js,.vue . --config .eslintrc-security.js
```

### Tests de sécurité

```bash
# Test des endpoints sensibles
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"WeakPass"}'

# Test d'injection SQL (doit être bloqué)
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin'\'' OR 1=1 --","password":"anything"}'
```

## � Checklist Sécurité

### Configuration initiale

- [ ] **Secrets changés** - Tous les mots de passe par défaut modifiés
- [ ] **Fichier .env sécurisé** - Permissions 600, non versionné
- [ ] **JWT secret** - Clé de 256 bits générée aléatoirement
- [ ] **Base de données** - Utilisateurs dédiés avec permissions minimales
- [ ] **CORS configuré** - Origines autorisées uniquement

### Docker sécurisé

- [ ] **Images à jour** - Dernières versions stables
- [ ] **Utilisateurs non-root** - Containers avec utilisateurs dédiés
- [ ] **Réseaux isolés** - Communications internes uniquement
- [ ] **Volumes sécurisés** - Données persistées correctement
- [ ] **Secrets Docker** - Mots de passe via secrets manager

### Application sécurisée

- [ ] **Validation stricte** - Tous les inputs validés avec Zod
- [ ] **Authentification forte** - JWT + mots de passe complexes
- [ ] **Headers sécurisés** - Helmet + Nginx configurés
- [ ] **Audit dépendances** - npm audit sans vulnérabilités
- [ ] **Logs sécurisés** - Pas de données sensibles loggées

### Monitoring

- [ ] **Health checks** - Endpoints de santé configurés
- [ ] **Logs structurés** - Monitoring des accès et erreurs
- [ ] **Alertes** - Notifications sur tentatives d'intrusion
- [ ] **Backups** - Sauvegardes régulières des données
- [ ] **Recovery** - Plan de récupération testé

## 📊 Niveaux de Sécurité

### Développement

```env
# Configuration minimale pour le développement
NODE_ENV=development
JWT_SECRET=development-secret-change-in-production
BCRYPT_SALT_ROUNDS=10
```

### Test/Staging

```env
# Configuration intermédiaire
NODE_ENV=staging
JWT_SECRET=staging-secret-different-from-prod
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_ENABLED=true
```

### Production

```env
# Configuration maximale
NODE_ENV=production
JWT_SECRET=production-ultra-secure-256-bit-key
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_ENABLED=true
SSL_ENABLED=true
CSP_STRICT=true
```

## 🔗 Ressources Sécurité

### Standards & Guides

- **OWASP Top 10** - [owasp.org/www-project-top-ten/](https://owasp.org/www-project-top-ten/)
- **NIST Cybersecurity** - Framework de sécurité
- **Docker Security** - [docs.docker.com/engine/security/](https://docs.docker.com/engine/security/)

### Outils recommandés

- **Snyk** - Scan de vulnérabilités
- **ESLint Security** - Analyse statique JavaScript
- **Trivy** - Scanner de sécurité containers
- **OWASP ZAP** - Tests de pénétration web

## 🆘 En cas d'incident

### Procédure d'urgence

1. **Isolation** - Couper l'accès réseau suspect
2. **Investigation** - Analyser les logs d'accès
3. **Containement** - Limiter la propagation
4. **Éradication** - Corriger la vulnérabilité
5. **Recovery** - Restaurer le service sécurisé
6. **Lessons learned** - Documenter et améliorer

### Contacts d'urgence

```bash
# Arrêt d'urgence
docker compose down --remove-orphans

# Sauvegarde rapide
docker compose exec mysql mysqldump -u root -p ecoride_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Logs d'incident
docker compose logs --since="1h" > incident_logs_$(date +%Y%m%d_%H%M%S).log
```

---

**🛡️ La sécurité est un processus continu, pas un état final**

*Mise à jour régulière de cette documentation recommandée*
