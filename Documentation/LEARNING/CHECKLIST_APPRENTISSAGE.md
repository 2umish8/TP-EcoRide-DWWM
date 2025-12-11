# CHECKLIST D'APPRENTISSAGE : Tracker Votre Progression

Utilisez ce document pour tracker vos progrès phase par phase. Cochez chaque compétence au fur et à mesure que vous la maîtrisez.

---

## 📋 PHASE 1 : FONDAMENTAUX BACKEND (Semaines 1-2)

### Node.js Basics
- [ ] Comprendre le modèle événementiel de Node.js
- [ ] Utiliser `require()` et `module.exports`
- [ ] Comprendre la boucle d'événements (event loop)
- [ ] Implémenter des opérations asynchrones simples

### Express.js
- [ ] Créer une application Express basique
- [ ] Démarrer un serveur sur un port
- [ ] Implémenter des routes GET
- [ ] Implémenter des routes POST avec `req.body`
- [ ] Implémenter des routes PUT et DELETE
- [ ] Comprendre le chaînage de middleware
- [ ] Créer du middleware personnalisé
- [ ] Implémenter un middleware de logging

### HTTP et RESTful API
- [ ] Comprendre les méthodes HTTP (GET, POST, PUT, DELETE, PATCH)
- [ ] Comprendre les status codes (200, 201, 400, 403, 404, 500)
- [ ] Créer des endpoints RESTful
- [ ] Retourner du JSON
- [ ] Gérer les query parameters
- [ ] Gérer les route parameters (`:id`)

### Variables d'Environnement
- [ ] Installer et utiliser `dotenv`
- [ ] Créer un fichier `.env`
- [ ] Charger les variables dans le code
- [ ] Différencier `.env` et `.env.example`
- [ ] Ne jamais commiter `.env` en git

### Gestion des Erreurs Basique
- [ ] Utiliser `try/catch`
- [ ] Retourner les bonnes status codes
- [ ] Logger les erreurs en console
- [ ] Implémenter un error handling middleware

### Test de Phase 1
- [ ] Server répond sur `http://localhost:3000`
- [ ] GET /api/users retourne un JSON
- [ ] POST /api/users crée une ressource
- [ ] Erreurs sont gérées correctement

**Ressources à consulter** :
- Express.js Official Guide
- MDN Web Docs - HTTP Methods
- Node.js Official Documentation

---

## 📋 PHASE 2 : AUTHENTIFICATION & VALIDATION (Semaines 3-4)

### Bcrypt et Hachage de Mots de Passe
- [ ] Installer `bcrypt`
- [ ] Hasher un mot de passe
- [ ] Vérifier un mot de passe contre un hash
- [ ] Comprendre salt rounds (10 recommandé)
- [ ] Ne jamais stocker les mots de passe en clair

### JWT (JSON Web Tokens)
- [ ] Installer `jsonwebtoken`
- [ ] Générer un JWT lors du login
- [ ] Comprendre la structure d'un JWT (header.payload.signature)
- [ ] Vérifier un JWT
- [ ] Implémenter l'expiration (expiresIn)
- [ ] Extraire le token du header Authorization
- [ ] Gérer les tokens expirés

### Middleware d'Authentification
- [ ] Créer `authMiddleware`
- [ ] Extraire le token du header "Authorization: Bearer <token>"
- [ ] Vérifier la signature du token
- [ ] Attacher l'utilisateur à `req.user`
- [ ] Retourner 401 si pas de token
- [ ] Retourner 403 si token invalide

### Middleware de Rôles
- [ ] Créer `requireRole(roles)` middleware
- [ ] Vérifier les rôles de l'utilisateur
- [ ] Supporter plusieurs rôles (tableau)
- [ ] Retourner 403 si rôle insuffisant

### Zod - Schémas de Validation
- [ ] Installer `zod`
- [ ] Créer un schéma Zod pour registration
- [ ] Créer un schéma Zod pour login
- [ ] Valider email avec `.email()`
- [ ] Valider password avec `.regex()` pour majuscule, chiffre, symbole
- [ ] Ajouter des messages d'erreur personnalisés
- [ ] Comprendre la distinction parse() vs safeParse()

### Middleware de Validation
- [ ] Créer `validateBody(schema)` middleware
- [ ] Appliquer le middleware aux routes
- [ ] Attacher les données validées à `req.validatedBody`
- [ ] Retourner les erreurs Zod formatées

### Controllers - Authentification
- [ ] Créer `registerUser` controller
- [ ] Normaliser l'email (minuscules)
- [ ] Valider les formats
- [ ] Créer l'utilisateur en base
- [ ] Attribuer le rôle "user" par défaut
- [ ] Créer `loginUser` controller
- [ ] Générer un JWT après login réussi
- [ ] Gérer les erreurs (email non trouvé, password incorrect)

### Routes d'Authentification
- [ ] Créer `POST /api/users/register`
- [ ] Ajouter `validateBody(registerSchema)` middleware
- [ ] Créer `POST /api/users/login`
- [ ] Créer `GET /api/users/profile` (protégée)
- [ ] Tester avec curl ou Postman

### Test de Phase 2
- [ ] Registration avec données valides crée un utilisateur
- [ ] Registration avec email existant retourne 409
- [ ] Login avec credentials corrects retourne un token
- [ ] Login avec password incorrect retourne 401
- [ ] `/profile` sans token retourne 401
- [ ] `/profile` avec token retourne les données utilisateur

**Ressources à consulter** :
- jsonwebtoken NPM package
- bcrypt NPM package
- Zod official docs
- JWT.io pour décoder les tokens

---

## 📋 PHASE 3 : BASES DE DONNÉES (Semaines 5-6)

### SQL Basics (si nouveau)
- [ ] Comprendre SELECT, INSERT, UPDATE, DELETE
- [ ] Comprendre WHERE, ORDER BY, LIMIT
- [ ] Comprendre les clés primaires (PRIMARY KEY)
- [ ] Comprendre les clés étrangères (FOREIGN KEY)
- [ ] Comprendre les relations 1:N, N:N
- [ ] Normalisation de base (3NF)

### Prisma ORM - Setup
- [ ] Installer Prisma et Prisma Client
- [ ] Initialiser `npx prisma init`
- [ ] Configurer DATABASE_URL dans `.env`
- [ ] Créer un schéma `schema.prisma`
- [ ] Générer le client Prisma
- [ ] Utiliser `npx prisma studio`

### Prisma - Modèles Basiques
- [ ] Créer un modèle User
- [ ] Créer des champs : id (PK), email (unique), password_hash
- [ ] Ajouter types : String, Int, Boolean, DateTime
- [ ] Ajouter @default(autoincrement()) pour id
- [ ] Ajouter @unique pour email
- [ ] Créer une migration et l'appliquer

### Prisma - Relations
- [ ] Créer un modèle Role
- [ ] Implémenter relation N:N User ↔ Role (via User_Role)
- [ ] Utiliser `@relation` pour définir les relations
- [ ] Utiliser `onDelete: Cascade` pour nettoyer les orphelins
- [ ] Créer une relation 1:N (User → Posts)

### Prisma - Opérations CRUD
- [ ] `create()` : créer un utilisateur
- [ ] `findUnique()` : trouver par email/id
- [ ] `findMany()` : lister tous les utilisateurs
- [ ] `update()` : modifier un utilisateur
- [ ] `delete()` : supprimer un utilisateur
- [ ] `upsert()` : create ou update
- [ ] `deleteMany()` : supprimer plusieurs

### Prisma - Relations Avancées
- [ ] Utiliser `include: { roles: true }` pour charger les relations
- [ ] Utiliser `select: { id: true, email: true }` pour optimiser
- [ ] Charger des relations imbriquées (users → roles → permissions)
- [ ] Utiliser `where: { status: 'active' }` dans les relations

### Prisma - Transactions
- [ ] Utiliser `prisma.$transaction()` pour opérations atomiques
- [ ] Lister les opérations qui doivent être ensemble
- [ ] Implémenter le rollback automatique

### Prisma - Migrations
- [ ] Créer une migration : `npx prisma migrate dev --name "description"`
- [ ] Appliquer les migrations : `npx prisma db push`
- [ ] Générer le client : `npx prisma generate`
- [ ] Réinitialiser la base en dev : `npx prisma migrate reset`

### MongoDB avec Mongoose
- [ ] Installer Mongoose
- [ ] Se connecter à MongoDB
- [ ] Implémenter retry logic pour la connexion
- [ ] Créer un schéma Mongoose (ex: Review)
- [ ] Implémenter des hooks (`pre`, `post`)
- [ ] Faire du CRUD avec Mongoose

### Dual Database Setup
- [ ] Configurer Prisma pour MySQL en parallèle
- [ ] Configurer Mongoose pour MongoDB en parallèle
- [ ] Utiliser MySQL pour données relationnelles critiques
- [ ] Utiliser MongoDB pour données flexibles (reviews, comments)
- [ ] Synchroniser les IDs entre les deux bases si nécessaire

### Test de Phase 3
- [ ] `npx prisma studio` montre les tables créées
- [ ] Créer un utilisateur via Prisma
- [ ] Assigner un rôle à l'utilisateur (relation N:N)
- [ ] Récupérer l'utilisateur avec `include: { roles: true }`
- [ ] Modifier un utilisateur
- [ ] Supprimer un utilisateur (les rôles sont nettoyés)
- [ ] MongoDB store une review avec Mongoose

**Ressources à consulter** :
- Prisma Official Documentation
- Mongoose Official Documentation
- SQL Tutorial (W3Schools)
- Database Design Basics

---

## 📋 PHASE 4 : FRONTEND BASICS (Semaine 7)

### Vue 3 Fundamentals
- [ ] Comprendre la réactivité avec `ref()` et `reactive()`
- [ ] Utiliser `computed()` pour propriétés calculées
- [ ] Utiliser `watch()` pour effectuer des actions
- [ ] Utiliser les lifecycle hooks : `onMounted()`, `onBeforeUnmount()`
- [ ] Implémenter des méthodes avec `const myMethod = () => {}`
- [ ] Utiliser `v-if`, `v-else`, `v-show`
- [ ] Utiliser `v-for` pour les listes
- [ ] Utiliser `@click`, `@submit`, `@input` pour les événements
- [ ] Utiliser `v-model` pour two-way binding

### Vite Setup
- [ ] Créer un projet Vite : `npm create vite@latest`
- [ ] Configurer Vite pour Vue 3
- [ ] Démarrer le serveur dev : `npm run dev`
- [ ] Build pour production : `npm run build`
- [ ] Comprendre HMR (Hot Module Replacement)
- [ ] Configurer les imports alias (@)

### Vue Router
- [ ] Installer Vue Router 4
- [ ] Créer des routes de base
- [ ] Lazy load les composants des pages
- [ ] Implémenter la navigation avec `<router-link>`
- [ ] Récupérer les paramètres de route : `:id`
- [ ] Utiliser `useRouter()` pour naviguer programmatiquement
- [ ] Implémenter des guards (`beforeEach`)
- [ ] Rediriger vers login si pas authentifié

### Pinia Store Setup
- [ ] Installer Pinia
- [ ] Créer un store auth : `defineStore('auth', ...)`
- [ ] Implémenter `state`, `getters`, `actions`
- [ ] Charger depuis localStorage au montage
- [ ] Persister l'état dans localStorage
- [ ] Accéder au store avec `useAuthStore()`

### Axios Configuration
- [ ] Installer Axios
- [ ] Créer une instance Axios
- [ ] Déterminer l'URL API selon l'environnement
- [ ] Implémenter un interceptor de requête (ajouter JWT)
- [ ] Implémenter un interceptor de réponse (gérer 401)
- [ ] Créer des services (authService, userService)
- [ ] Utiliser les services dans les composants

### Bootstrap 5
- [ ] Installer Bootstrap 5
- [ ] Importer les styles CSS
- [ ] Utiliser les classes de grid (container, row, col)
- [ ] Utiliser les utilitaires (p, m, text-center, etc.)
- [ ] Créer une navbar
- [ ] Créer des formulaires
- [ ] Utiliser des modals

### Composants Vue de Base
- [ ] Créer un composant dumb (GlassButton)
- [ ] Utiliser `defineProps()` pour les props
- [ ] Utiliser `defineEmits()` pour les événements
- [ ] Utiliser `<slot>` pour la composition
- [ ] Créer un composant de navbar
- [ ] Créer un composant de footer

### Test de Phase 4
- [ ] npm run dev lance le frontend sur http://localhost:5173
- [ ] Router navigation fonctionne (clicker sur les liens change la page)
- [ ] Pinia store persiste les données dans localStorage
- [ ] Axios requête GET retourne des données
- [ ] Bootstrap grid responsive (mobile vs desktop)

**Ressources à consulter** :
- Vue 3 Official Guide
- Vue Router Official Guide
- Pinia Official Guide
- Axios Official Guide
- Bootstrap 5 Documentation

---

## 📋 PHASE 5 : INTÉGRATION FULL-STACK (Semaine 8)

### Login/Register Flow Complet
- [ ] Frontend form → Backend validation → Database save
- [ ] Frontend receive token → Store in localStorage
- [ ] Frontend send token → Backend verify → Protected route
- [ ] Logout clears localStorage et redirige vers home
- [ ] Profile page affiche les données utilisateur

### API Communication
- [ ] Frontend axios call
- [ ] Backend reçoit la requête
- [ ] Backend valide avec Zod
- [ ] Backend accède à la base de données
- [ ] Backend retourne les données
- [ ] Frontend reçoit et affiche

### State Management
- [ ] User data persiste après refresh
- [ ] Logout efface le data
- [ ] RBAC (role-based access control) fonctionne
- [ ] Guards de Vue Router redirigent les users non auth

### Gestion des Erreurs
- [ ] Frontend affiche les messages d'erreur
- [ ] Backend retourne les erreurs formatées
- [ ] Network errors sont gérés
- [ ] Validation errors affichent les messages Zod

### Local Development avec Docker Compose
- [ ] Créer Dockerfile pour backend
- [ ] Créer Dockerfile pour frontend
- [ ] Créer compose.yaml pour tout
- [ ] Démarrer avec `docker-compose up`
- [ ] MySQL et MongoDB dans des containers
- [ ] Frontend accède au backend via http://backend:3000

### Test de Phase 5
- [ ] Naviguer vers /register
- [ ] Créer un compte
- [ ] Naviguer vers /login
- [ ] Connexion avec les credentials
- [ ] Être redirigé vers /dashboard
- [ ] Le token est dans localStorage
- [ ] Rafraîchir la page, rester logged in
- [ ] Cliquer logout, être redirigé vers /
- [ ] /dashboard redirection vers /login si pas auth

**Ressources à consulter** :
- Docker Official Docs
- Docker Compose Official Docs
- Postman pour tester les APIs

---

## 📋 PHASE 6 : DÉPLOIEMENT & PRODUCTION (Semaines 9-10)

### Docker Optimization
- [ ] Optimiser la taille des images
- [ ] Multi-stage builds
- [ ] Health checks
- [ ] Non-root user pour sécurité

### Cloud Databases
- [ ] Créer un compte Aiven (ou PlanetScale)
- [ ] Créer une base MySQL cloud
- [ ] Configurer DATABASE_URL pour le cloud
- [ ] Créer un compte MongoDB Atlas
- [ ] Créer un cluster MongoDB
- [ ] Configurer MONGODB_URI

### Backend Deployment
- [ ] Créer un compte Railway (ou Render, Heroku)
- [ ] Connecter le repo GitHub
- [ ] Configurer les variables d'environnement
- [ ] Configurer la base de données cloud
- [ ] Deploy et vérifier que c'est accessible
- [ ] Vérifier les logs
- [ ] Tester les endpoints en production

### Frontend Deployment
- [ ] Créer un compte Netlify
- [ ] Connecter le repo GitHub
- [ ] Configurer `netlify.toml`
- [ ] Build command: `npm ci && npm run build`
- [ ] Publish directory: `dist`
- [ ] Configurer les variables d'environnement (VITE_API_URL)
- [ ] Déployer et vérifier

### CORS en Production
- [ ] Mettre à jour la whitelist des origines autorisées
- [ ] Backend doit accepter https://frontend-domain.com
- [ ] Tester les requêtes cross-origin

### Monitoring et Logging
- [ ] Configurer les logs backend
- [ ] Configurer les logs frontend
- [ ] Vérifier les erreurs en production
- [ ] Mettre en place des alertes (optionnel)

### Documentation
- [ ] Documenter la structure du projet
- [ ] Écrire un README complet
- [ ] Documenter les endpoints API
- [ ] Écrire un guide de setup local
- [ ] Écrire un guide de déploiement

### Testing
- [ ] Unit tests avec Vitest (frontend)
- [ ] E2E tests avec Playwright (frontend)
- [ ] Tests API avec scripts (backend)
- [ ] Coverage > 80%

### Code Quality
- [ ] ESLint configuration
- [ ] Prettier formatting
- [ ] No console.log en production
- [ ] Error logging structuré

### Security Final Check
- [ ] JWT_SECRET configuré en env
- [ ] Pas de credentials en dur
- [ ] HTTPS activated
- [ ] CORS whitelist
- [ ] Rate limiting activé
- [ ] Helmet headers configurés
- [ ] Password hashing avec bcrypt
- [ ] Input validation avec Zod

### Test de Phase 6
- [ ] Backend accessible via URL production
- [ ] Frontend accessible via URL production
- [ ] Login fonctionne en production
- [ ] Erreurs ne révèlent pas les détails sensibles
- [ ] Performance acceptable

**Ressources à consulter** :
- Netlify Deployment Docs
- Railway Deployment Docs
- MongoDB Atlas Setup
- Aiven PostgreSQL/MySQL Setup
- OWASP Security Guidelines

---

## 📋 PATTERNS À MAÎTRISER

Cochez chaque pattern au fur et à mesure que vous le maîtrisez :

- [ ] **Pattern 1: MVC Architecture**
  - [ ] Routes → Controllers → Models
  - [ ] Séparation claire des responsabilités

- [ ] **Pattern 2: Zod Validation**
  - [ ] Schémas réutilisables
  - [ ] Middleware de validation
  - [ ] Messages d'erreur clairs

- [ ] **Pattern 3: JWT Authentication**
  - [ ] Génération de tokens
  - [ ] Vérification du token
  - [ ] Middleware d'authentification
  - [ ] Guards de navigation frontend

- [ ] **Pattern 4: Prisma Relations**
  - [ ] Include pour charger les relations
  - [ ] Select pour optimiser
  - [ ] Relations imbriquées

- [ ] **Pattern 5: Transactions**
  - [ ] Opérations atomiques
  - [ ] Rollback automatique
  - [ ] Intégrité des données

- [ ] **Pattern 6: Error Handling**
  - [ ] Try/catch robuste
  - [ ] Status codes appropriés
  - [ ] Logging des erreurs

- [ ] **Pattern 7: Pinia Stores**
  - [ ] State, getters, actions
  - [ ] Persistance localStorage
  - [ ] Initialisation au montage

- [ ] **Pattern 8: Axios Services**
  - [ ] Instance centralisée
  - [ ] Intercepteurs JWT
  - [ ] Gestion des erreurs globale

- [ ] **Pattern 9: Composants Dumb**
  - [ ] Props et events
  - [ ] Réutilisabilité
  - [ ] Slots pour composition

---

## 📊 RÉCAPITULATIF DE PROGRESSION

Cochez votre phase actuelle :

**PHASE 1 (Semaines 1-2)**
- [ ] Fondamentaux backend
- [ ] Express et routage
- [ ] Variables d'environnement
- Status: ☐ Pas commencé ☐ En cours ☐ Complété

**PHASE 2 (Semaines 3-4)**
- [ ] Authentification JWT
- [ ] Bcrypt et hashage
- [ ] Zod validation
- Status: ☐ Pas commencé ☐ En cours ☐ Complété

**PHASE 3 (Semaines 5-6)**
- [ ] Prisma et MySQL
- [ ] Mongoose et MongoDB
- [ ] Relations et migrations
- Status: ☐ Pas commencé ☐ En cours ☐ Complété

**PHASE 4 (Semaine 7)**
- [ ] Vue 3 Composition API
- [ ] Vue Router
- [ ] Pinia store
- [ ] Axios configuration
- Status: ☐ Pas commencé ☐ En cours ☐ Complété

**PHASE 5 (Semaine 8)**
- [ ] Integration full-stack
- [ ] Login flow complet
- [ ] Docker Compose local
- Status: ☐ Pas commencé ☐ En cours ☐ Complété

**PHASE 6 (Semaines 9-10)**
- [ ] Déploiement production
- [ ] Cloud databases
- [ ] Testing et monitoring
- [ ] Documentation finale
- Status: ☐ Pas commencé ☐ En cours ☐ Complété

---

## 🎯 CHECKPOINTS CLÉS

Avant de passer à la phase suivante, vérifiez :

**Avant Phase 2:**
- [ ] Serveur Express démarre sans erreur
- [ ] Routes GET/POST/PUT/DELETE fonctionnent
- [ ] Variables d'environnement chargées correctement

**Avant Phase 3:**
- [ ] Login/register flow fonctionne en local
- [ ] Token JWT généré et vérifié
- [ ] Zod validation rejecte les données invalides

**Avant Phase 4:**
- [ ] Prisma studio affiche les tables
- [ ] Requêtes Prisma include/select fonctionnent
- [ ] MongoDB connecté et stockant les données

**Avant Phase 5:**
- [ ] Vue app démarre sans erreur
- [ ] Router navigation fonctionne
- [ ] Pinia store persiste les données

**Avant Phase 6:**
- [ ] Frontend + Backend communiquent sans erreur
- [ ] Login fonctionne end-to-end
- [ ] Docker Compose démarre tous les services

---

**Bonne chance ! Vous avez tout ce qu'il faut pour réussir. Progressez phase par phase et cochez les boîtes au fur et à mesure. 🚀**
