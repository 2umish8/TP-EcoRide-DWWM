# EcoRide Frontend - Vue.js 3 Application 🌱✨

Interface utilisateur moderne pour la plateforme de covoiturage EcoRide, développée avec Vue 3, Vite et Bootstrap 5.

## 🐳 Déploiement avec Docker (Recommandé)

### 🚀 Démarrage rapide avec Docker Compose

```bash
# Depuis la racine du projet
docker compose up --build

# Mode développement avec hot reload
docker compose -f compose.yaml -f compose.dev.yaml up --build
```

### 🔧 Build et run du frontend seul

```bash
# Build l'image Docker (production)
docker build -t ecoride-frontend .

# Build pour le développement
docker build --target development -t ecoride-frontend:dev .

# Run le container de production
docker run -p 80:80 ecoride-frontend

# Run le container de développement
docker run -p 5173:5173 ecoride-frontend:dev
```

### 📊 Health Check

Le frontend inclut un endpoint de santé servi par nginx :
```bash
curl http://localhost/health
```

## 🌐 Application Déployée - Accès Direct

**🎉 L'application EcoRide est également accessible en ligne !**

### 📱 Accès à l'application

**URL** : https://ecoridetp.netlify.app/

### ✨ Fonctionnalités disponibles

- ✅ **Interface responsive** - Compatible mobile/tablette/desktop
- ✅ **Recherche avancée** - Filtres par ville, date, type de véhicule
- ✅ **Gestion des profils** - Inscription, connexion, profil utilisateur
- ✅ **Création de trajets** - Interface intuitive pour les conducteurs
- ✅ **Participation aux trajets** - Système de réservation simplifié
- ✅ **Design écologique** - Interface axée sur la durabilité
- ✅ **Animations fluides** - Transitions CSS et interactions modernes

## 🛠️ Technologies utilisées

### Core Frontend Stack
- **Vue.js 3** - Framework JavaScript moderne avec Composition API
- **Vite** - Build tool ultra-rapide avec HMR
- **Vue Router 4** - Routage SPA avec lazy loading
- **Pinia** - Gestion d'état moderne (successeur de Vuex)

### UI/UX & Styling
- **Bootstrap 5** - Framework CSS responsive
- **FontAwesome** - Iconographie complète
- **CSS Custom Properties** - Thèmes et variables personnalisés
- **Responsive Design** - Mobile-first approach

### DevOps & Quality
- **Docker Multi-stage** - Images optimisées dev/prod
- **Nginx** - Serveur web haute performance
- **ESLint + Prettier** - Qualité et formatage du code
- **Vitest** - Tests unitaires ultra-rapides
- **Playwright** - Tests E2E automatisés

## Prérequis (Développement Local)

- Node.js 18+ et npm
- Git
- Éditeur recommandé : VSCode + Volar

## ⚙️ Installation (Développement Local)

### 1. Configuration du projet

```bash
cd Frontend
npm install
```

### 2. Variables d'environnement

```bash
cp .env.example .env.local
```

Configurez votre fichier `.env.local` :

```env
# API Backend
VITE_API_URL=http://localhost:3000/api

# Application
VITE_APP_NAME="EcoRide"
VITE_APP_VERSION="1.0.0"

# Développement
VITE_DEBUG=true
```

### 3. Configuration IDE (VSCode)

Extensions recommandées :
- **Volar** - Support Vue 3 (désactiver Vetur)
- **ESLint** - Linting JavaScript/Vue
- **Prettier** - Formatage automatique
- **Auto Rename Tag** - Renommage automatique des balises

## 🚀 Démarrage

### Mode développement (avec rechargement automatique)

```bash
npm run dev
```
Accès : http://localhost:5173

### Build de production

```bash
npm run build
```

### Prévisualisation du build

```bash
npm run preview
```

### Serveur de développement avec exposition réseau

```bash
npm run dev -- --host 0.0.0.0
```

## 🧪 Tests & Qualité

### Tests unitaires (Vitest)

```bash
# Lancer les tests
npm run test:unit

# Tests en mode watch
npm run test:unit -- --watch

# Coverage des tests
npm run test:unit -- --coverage
```

### Tests E2E (Playwright)

```bash
# Installation des navigateurs (première fois)
npx playwright install

# Lancer les tests E2E
npm run test:e2e

# Tests en mode interactif
npm run test:e2e -- --ui
```

### Qualité du code

```bash
# Linting ESLint
npm run lint

# Formatage Prettier
npm run format

# Analyse des dépendances
npm audit
```

## 🏗️ Architecture & Structure

### Structure du projet

```
Frontend/
├── 📁 public/           # Assets statiques
├── 📁 src/
│   ├── 📁 views/        # Pages/vues principales
│   ├── 📁 components/   # Composants réutilisables
│   ├── 📁 stores/       # État global (Pinia)
│   ├── 📁 services/     # Services API et utilitaires
│   ├── 📁 router/       # Configuration du routage
│   ├── 📁 assets/       # Images, styles, fonts
│   ├── 📁 composables/  # Logique réutilisable Vue
│   └── 📄 main.js       # Point d'entrée
├── 📁 tests/            # Tests unitaires et E2E
├── 📄 nginx.conf        # Configuration Nginx (Docker)
├── 📄 Dockerfile        # Configuration Docker multi-stage
└── 📄 vite.config.js    # Configuration Vite
```

### Composants principaux

| Composant         | Description                     | Localisation      |
| ----------------- | ------------------------------- | ----------------- |
| `HomeView.vue`    | Page d'accueil avec recherche   | `src/views/`      |
| `LoginView.vue`   | Authentification utilisateur    | `src/views/`      |
| `SearchView.vue`  | Recherche avancée de trajets    | `src/views/`      |
| `ProfileView.vue` | Gestion du profil utilisateur   | `src/views/`      |
| `GlassButton.vue` | Bouton avec effet glassmorphism | `src/components/` |
| `CustomModal.vue` | Modal réutilisable              | `src/components/` |

### Stores Pinia

| Store    | Responsabilité                  | Fichier             |
| -------- | ------------------------------- | ------------------- |
| `auth`   | Authentification et utilisateur | `stores/counter.js` |
| `trips`  | Gestion des trajets             | `stores/trips.js`   |
| `search` | État de recherche               | `stores/search.js`  |

## 🌐 API Integration

### Configuration API

Le frontend communique avec l'API backend via Axios avec intercepteurs :

```javascript
// services/api.js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

// Injection automatique du token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Gestion des erreurs

```javascript
// Intercepteur de réponse pour la gestion d'erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirection vers login si non autorisé
      router.push('/login');
    }
    return Promise.reject(error);
  }
);
```

## 🎨 Styles & Thèmes

### Variables CSS personnalisées

```css
:root {
  --primary-color: #22c55e;
  --secondary-color: #3b82f6;
  --accent-color: #f59e0b;
  --glass-bg: rgba(255, 255, 255, 0.1);
  --shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
}
```

### Bootstrap personnalisé

Le projet utilise Bootstrap 5 avec des overrides personnalisés :

```scss
// assets/scss/custom-bootstrap.scss
$primary: #22c55e;
$secondary: #6b7280;
$success: #10b981;
```

## 📱 Responsive Design

### Breakpoints Bootstrap 5

| Taille | Breakpoint | Largeur            |
| ------ | ---------- | ------------------ |
| XS     | `<576px`   | Téléphone portrait |
| SM     | `≥576px`   | Téléphone paysage  |
| MD     | `≥768px`   | Tablette portrait  |
| LG     | `≥992px`   | Tablette paysage   |
| XL     | `≥1200px`  | Desktop            |
| XXL    | `≥1400px`  | Large desktop      |

### Optimisations mobiles

- **Touch-friendly** - Zones de touch optimisées
- **Performance** - Images optimisées et lazy loading
- **Navigation** - Menu hamburger responsive
- **Forms** - Inputs adaptés aux mobiles

## 🚀 Optimisations Performance

### Build optimisations

- **Code splitting** - Chargement lazy des routes
- **Tree shaking** - Élimination du code inutilisé
- **Minification** - HTML/CSS/JS minifiés
- **Compression** - Gzip activé (nginx)

### Runtime optimisations

- **Lazy loading** - Composants et images chargés à la demande
- **Caching** - Cache HTTP et service worker
- **Bundle analysis** - Analyse de la taille des bundles

```bash
# Analyser la taille du bundle
npm run build -- --report
```

## 🔒 Sécurité Frontend

### Mesures de sécurité

- **CSP Headers** - Content Security Policy via nginx
- **XSS Protection** - Sanitisation des inputs
- **CORS** - Configuration cross-origin stricte
- **Token Storage** - JWT stocké de manière sécurisée
- **Environment Variables** - Secrets non exposés côté client

## 🔗 Documentation connexe

- 🏗️ [Architecture technique](../Documentation/Documentation-Technique.md)
- 🔌 [Documentation API](../Documentation/API_DOCUMENTATION.md)
- 🔒 [Sécurité](../SECURITE.md)
- 🐳 [Guide Docker](README.Docker.md)

## 🤝 Contribution

### Workflow de développement

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer le serveur de dev
npm run dev

# 3. Faire les modifications
# ...

# 4. Lancer les tests
npm run test:unit
npm run lint

# 5. Build pour vérifier
npm run build
```

### Standards de qualité

- **ESLint** - Règles Vue.js et JavaScript
- **Prettier** - Formatage automatique
- **Conventional Commits** - Messages de commit standardisés
- **Component Documentation** - JSDoc pour les composants

---

**Développé avec ❤️ pour EcoRide - Interface moderne et accessible**
