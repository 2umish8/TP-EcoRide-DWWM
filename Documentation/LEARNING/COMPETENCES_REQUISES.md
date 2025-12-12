# Compétences Requises pour Reproduire le Projet EcoRide

## Vue d'ensemble du projet

EcoRide est une **plateforme de covoiturage full-stack** axée sur la mobilité écologique avec système de crédits. C'est une architecture **SPA (Single Page Application)** avec backend Node.js, frontend Vue.js, base de données MySQL + MongoDB, et déploiement containerisé.

---

## 1. BACKEND (Node.js / Express.js)

### 1.1 Fondamentaux Node.js et Express

**Compétences essentielles :**
- Créer une application Express basique avec routage
- Comprendre le cycle de vie des requêtes HTTP (middleware)
- Gérer les variables d'environnement avec `dotenv`
- Implémenter un serveur avec pagination, filtrage et recherche
- Gestion des erreurs asynchrones avec try/catch
- Logging et debugging d'application backend

**À maîtriser pour EcoRide :**
```javascript
// Structure server.js - Configuration Express
const express = require("express");
const app = express();
app.use(express.json());
app.use(cors(corsOptions));
app.use("/api/users", userRoutes);
```

**Fichiers clés :** `Backend/server.js`, `Backend/routes/*`

---

### 1.2 Authentification et Autorisation

**Compétences essentielles :**
- JWT (JSON Web Tokens) - génération, validation, refresh
- Bcrypt - hachage et vérification de mots de passe
- Middleware d'authentification personnalisé
- Contrôle d'accès basé sur les rôles (RBAC)
- Gestion des tokens dans les headers HTTP

**À maîtriser pour EcoRide :**

```javascript
// Génération JWT
const token = jwt.sign(
  { id: user.id, email: user.email, roles: user.roles },
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);

// Middleware d'authentification
function authMiddleware(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token invalide" });
    req.user = user;
    next();
  });
}

// Contrôle des rôles
function requireRole(roles) {
  return (req, res, next) => {
    const hasRole = roles.some(r => req.user.roles.includes(r));
    if (!hasRole) return res.status(403).json({ message: "Accès refusé" });
    next();
  };
}
```

**Fichiers clés :** `Backend/authMiddleware.js`, `Backend/controllers/userController.js` (loginUser)

---

### 1.3 Validation des Données avec Zod

**Compétences essentielles :**
- Créer des schémas Zod pour valider les inputs
- Valider les types de données, longueurs, formats
- Messages d'erreur personnalisés
- Middleware de validation
- Transformation et refinement de données

**À maîtriser pour EcoRide :**

```javascript
const { z } = require("zod");

const createUserSchema = z.object({
  pseudo: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string()
    .min(8)
    .regex(/[A-Z]/, { message: "Doit contenir une majuscule" })
    .regex(/[0-9]/, { message: "Doit contenir un chiffre" })
    .regex(/[^A-Za-z0-9]/, { message: "Doit contenir un symbole" })
});

// Middleware de validation
function validateBody(schema) {
  return (req, res, next) => {
    try {
      req.validatedBody = schema.parse(req.body);
      next();
    } catch (err) {
      res.status(400).json({ errors: err.issues });
    }
  };
}
```

**Fichiers clés :** `Backend/validators/*`, `Backend/middlewares/validate.js`

---

### 1.4 Bases de Données Relationnelles (MySQL avec Prisma)

**Compétences essentielles :**
- Prisma ORM - configuration et utilisation
- Schémas de base de données relationnelles
- Relations 1:N, N:N
- Migrations de schéma
- CRUD avec Prisma Client
- Requêtes avec `include` et `where`

**À maîtriser pour EcoRide :**

```prisma
// Schema.prisma - Modèles de données
model User {
  id             Int      @id @default(autoincrement())
  pseudo         String   @unique
  email          String   @unique
  password_hash  String
  credits        Int      @default(20)
  roles          User_Role[]
  driverTrips    Carpooling[] @relation("DriverTrips")
  vehicles       Vehicle[]
}

model Carpooling {
  id                    Int
  departure_address     String
  arrival_address       String
  departure_datetime    DateTime
  price_per_passenger   Int
  driver_id             Int
  vehicle_id            Int
  
  driver                User    @relation("DriverTrips", fields: [driver_id], references: [id])
  vehicle               Vehicle @relation(fields: [vehicle_id], references: [id])
  participations        Participation[]
}

model Participation {
  passenger_id          Int
  carpooling_id         Int
  credits_paid          Int
  
  passenger             User       @relation(fields: [passenger_id], references: [id])
  carpooling            Carpooling @relation(fields: [carpooling_id], references: [id])
}
```

**Opérations Prisma essentielles :**

```javascript
// Créer
const user = await prisma.user.create({
  data: { pseudo, email, password_hash }
});

// Lire avec relations
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { roles: true, vehicles: true, driverTrips: true }
});

// Mettre à jour
await prisma.user.update({
  where: { id: userId },
  data: { credits: user.credits - amount }
});

// Supprimer
await prisma.carpooling.delete({
  where: { id: carpoolingId }
});
```

**Commandes importantes :**
```bash
npx prisma generate          # Générer le client Prisma
npx prisma db push          # Appliquer les changements au schéma
npx prisma migrate dev --name "description"  # Créer une migration
```

**Fichiers clés :** `Backend/prisma/schema.prisma`, `Backend/Config/db.js`, contrôleurs

---

### 1.5 Bases de Données NoSQL (MongoDB avec Mongoose)

**Compétences essentielles :**
- Mongoose - schémas et modèles
- Documents flexibles vs schémas SQL
- Connexion et reconnexion avec retry logic
- Opérations CRUD sur MongoDB
- Différences entre MySQL et MongoDB

**À maîtriser pour EcoRide :**

```javascript
// Modèle MongoDB
const reviewSchema = new Schema({
  carpooling_id: ObjectId,
  reviewer_id: ObjectId,
  rating: Number,
  comment: String,
  createdAt: { type: Date, default: Date.now }
});

const Review = mongoose.model('Review', reviewSchema);

// Opérations
const review = await Review.create({
  carpooling_id: id,
  reviewer_id: req.user.id,
  rating,
  comment
});

// Connexion avec retry logic
const connectMongoDB = async () => {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(mongoURI, options);
      console.log("Connecté");
      return;
    } catch (error) {
      if (attempt === MAX_RETRIES) throw error;
      await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
    }
  }
};
```

**Fichiers clés :** `Backend/Config/mongodb.js`, `Backend/models/Review.js`, `Backend/routes/reviewRoutes.js`

---

### 1.6 Architecture MVC et Séparation des Responsabilités

**Compétences essentielles :**
- Pattern MVC (Model-View-Controller)
- Séparation : routes → contrôleurs → services
- Réutilisabilité du code
- Maintenabilité et testabilité

**Structure à respecter :**

```
Backend/
├── routes/          # Définition des endpoints
│   └── userRoutes.js
├── controllers/     # Logique métier
│   └── userController.js
├── models/          # Schémas de données (MongoDB)
│   └── Review.js
├── validators/      # Schémas Zod
│   └── userValidator.js
├── middlewares/     # Logique cross-cutting
│   └── validate.js
└── utils/           # Fonctions utilitaires
    └── emailValidator.js
```

**Fichiers clés :** Toute l'architecture du Backend

---

### 1.7 Sécurité Web

**Compétences essentielles :**
- CORS (Cross-Origin Resource Sharing)
- Helmet.js pour sécuriser les headers HTTP
- Rate limiting (express-rate-limit)
- Validation et sanitization d'inputs
- Gestion des erreurs sans révéler d'infos sensibles

**À maîtriser pour EcoRide :**

```javascript
// CORS - Whitelist des origines autorisées
const corsOptions = {
  origin: ["http://localhost:5173", "https://ecoridetp.netlify.app"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
};
app.use(cors(corsOptions));

// Helmet - Sécuriser les headers
app.use(helmet());

// Rate limiting - Limitation de débit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use("/api", apiLimiter);

// Gestion des erreurs sécurisée
catch (error) {
  const message = process.env.NODE_ENV === "development"
    ? error.message
    : "Erreur serveur";
  res.status(500).json({ message });
}
```

**Fichiers clés :** `Backend/server.js`, `Backend/authMiddleware.js`

---

### 1.8 Utilitaires et Services Auxiliaires

**Compétences essentielles :**
- Validation d'email (normalization, format)
- Validation de mot de passe (force, exigences)
- Services email (Nodemailer)
- Utilitaires de conversion et transformation

**À maîtriser pour EcoRide :**

```javascript
// emailValidator.js
function validateAndNormalizeEmail(email) {
  const normalized = email.trim().toLowerCase();
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    isValid: regex.test(normalized),
    normalizedEmail: normalized
  };
}

// passwordValidator.js
function validatePassword(password) {
  const errors = [];
  if (password.length < 8) errors.push("Min 8 caractères");
  if (!/[A-Z]/.test(password)) errors.push("Min 1 majuscule");
  if (!/[0-9]/.test(password)) errors.push("Min 1 chiffre");
  if (!/[^A-Za-z0-9]/.test(password)) errors.push("Min 1 symbole");
  
  return {
    isValid: errors.length === 0,
    errors,
    suggestions: ["Utilisez des caractères variés"]
  };
}

// emailService.js - Nodemailer
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({...});

async function sendReviewInvitation(email, carpoolingData) {
  await transporter.sendMail({
    to: email,
    subject: "Invité à commenter votre trajet",
    html: `<h1>Merci pour votre trajet!</h1>`
  });
}
```

**Fichiers clés :** `Backend/utils/*`

---

## 2. FRONTEND (Vue.js 3 + Vite)

### 2.1 Vue 3 et Composition API

**Compétences essentielles :**
- Syntaxe Vue 3 avec `<script setup>`
- Réactivité : `ref()`, `reactive()`, `computed()`
- `watch()` et `watchEffect()` pour les effets secondaires
- Lifecycle hooks : `onMounted()`, `onBeforeUnmount()`
- Gestion des événements et bindings

**À maîtriser pour EcoRide :**

```vue
<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/counter'

// Données réactives
const formData = ref({
  email: '',
  password: ''
})

// Computed properties
const isFormValid = computed(() => {
  return formData.value.email && formData.value.password
})

// Watchers
watch(() => formData.value.email, (newEmail) => {
  console.log('Email changé:', newEmail)
})

// Lifecycle
onMounted(async () => {
  // Charger les données initialement
})

// Méthodes
const handleSubmit = async () => {
  // Logique de soumission
}
</script>

<template>
  <div class="container">
    <input v-model="formData.email" />
    <button @click="handleSubmit" :disabled="!isFormValid">
      Soumettre
    </button>
  </div>
</template>
```

**Fichiers clés :** Tous les fichiers `.vue` dans `Frontend/src/views/` et `Frontend/src/components/`

---

### 2.2 Vue Router et Navigation

**Compétences essentielles :**
- Configuration de routes avec `createRouter`
- Lazy loading des composants pour performance
- Navigation programmatique et guards
- Routes paramétrées
- Organisation hiérarchique des routes

**À maîtriser pour EcoRide :**

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/carpoolings/:id',
      name: 'CarpoolingDetail',
      component: () => import('../views/CarpoolingDetailView.vue')
    }
  ]
})

// Navigation programmatique
const router = useRouter()
router.push({ name: 'home' })
router.push({ path: '/search', query: { departure: 'Paris' } })
```

**Fichiers clés :** `Frontend/src/router/index.js`

---

### 2.3 Pinia - State Management

**Compétences essentielles :**
- Créer des stores avec `defineStore`
- State, getters, actions
- Persistance avec localStorage
- Composition between stores
- Debugging avec Pinia DevTools

**À maîtriser pour EcoRide :**

```javascript
// stores/auth.js
import { defineStore } from 'pinia'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', {
  // État
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('authToken'),
    isAuthenticated: !!localStorage.getItem('authToken')
  }),

  // Getters (propriétés calculées)
  getters: {
    isLoggedIn: (state) => state.isAuthenticated,
    currentUser: (state) => state.user,
    userRole: (state) => state.user?.role || null
  },

  // Actions (mutations asynchrones)
  actions: {
    async login(credentials) {
      const { user, token } = await api.post('/users/login', credentials)
      
      this.token = token
      this.user = user
      this.isAuthenticated = true
      
      localStorage.setItem('authToken', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      return { success: true, user }
    },

    async logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
    },

    loadUserFromStorage() {
      const userData = localStorage.getItem('user')
      const token = localStorage.getItem('authToken')
      
      if (userData && token) {
        this.user = JSON.parse(userData)
        this.token = token
        this.isAuthenticated = true
      }
    }
  }
})
```

**Usage dans les composants :**

```javascript
const authStore = useAuthStore()

// Accéder à l'état
const user = computed(() => authStore.currentUser)
const isLoggedIn = computed(() => authStore.isLoggedIn)

// Appeler une action
await authStore.login({ email, password })
await authStore.logout()
```

**Fichiers clés :** `Frontend/src/stores/*.js`

---

### 2.4 Axios et Communication API

**Compétences essentielles :**
- Configuration d'une instance Axios
- Intercepteurs (request/response)
- Gestion d'erreurs globale
- Injection automatique de JWT
- Détection d'environnement (dev/prod)

**À maîtriser pour EcoRide :**

```javascript
// services/api.js
import axios from 'axios'

// Déterminer l'URL de l'API selon l'environnement
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  if (import.meta.env.MODE === 'production') {
    return '/api'  // Proxy nginx
  }
  
  if (window.location.hostname === 'localhost') {
    return window.location.port === '80'
      ? '/api'
      : 'http://localhost:3000/api'
  }
  
  return 'https://production-api.com/api'
}

const api = axios.create({
  baseURL: getApiUrl(),
  headers: { 'Content-Type': 'application/json' }
})

// Intercepteur de requête - Ajouter le JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Intercepteur de réponse - Gérer les erreurs 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Services métier
export const authService = {
  async login(credentials) {
    const { data } = await api.post('/users/login', credentials)
    return data
  },

  async register(userData) {
    const { data } = await api.post('/users/register', userData)
    return data
  }
}

export const carpoolingService = {
  async searchCarpoolings(query) {
    const { data } = await api.get('/carpoolings/search', { params: query })
    return data
  },

  async createCarpooling(tripData) {
    const { data } = await api.post('/carpoolings', tripData)
    return data
  },

  async getCarpoolingDetail(id) {
    const { data } = await api.get(`/carpoolings/${id}`)
    return data
  }
}

export default api
```

**Fichiers clés :** `Frontend/src/services/api.js`

---

### 2.5 Composants Vue Réutilisables

**Compétences essentielles :**
- Créer des composants génériques
- Props et validation de props
- Events et v-model
- Slots pour la composition
- Composants sans logique métier (Smart vs Dumb)

**À maîtriser pour EcoRide :**

```vue
<!-- components/GlassButton.vue -->
<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'danger'].includes(v)
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  },
  disabled: Boolean,
  loading: Boolean
})

defineEmits(['click'])
</script>

<template>
  <button
    class="glass-btn"
    :class="[`btn-${variant}`, `btn-${size}`, { disabled, loading }]"
    @click="$emit('click')"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="spinner"></span>
    <slot>Click me</slot>
  </button>
</template>

<style scoped>
.glass-btn {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.glass-btn:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
}

.glass-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
```

**Fichiers clés :** `Frontend/src/components/*.vue`

---

### 2.6 Bootstrap 5 et CSS Personnalisé

**Compétences essentielles :**
- Utiliser les classes Bootstrap (grid, flexbox, utilities)
- Variables CSS personnalisées
- Responsive design
- Theming
- CSS Scoped en Vue

**À maîtriser pour EcoRide :**

```vue
<script setup>
// Utiliser les variables CSS custom
</script>

<template>
  <!-- Classes Bootstrap -->
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-6 col-lg-4">
        <div class="card shadow-lg">
          <img class="card-img-top" :src="image" />
          <div class="card-body">
            <h5 class="card-title">{{ title }}</h5>
            <p class="card-text">{{ description }}</p>
            <button class="btn btn-primary">Learn More</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Variables CSS custom */
:root {
  --primary-color: #00d084;
  --dark-bg: #1a1a2e;
}

.card {
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--dark-bg) 0%, #16213e 100%);
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
}

/* Responsive */
@media (max-width: 768px) {
  .card {
    margin-bottom: 1rem;
  }
}
</style>
```

**Fichiers clés :** `Frontend/src/assets/`, fichiers `.vue`

---

### 2.7 Vite et Build Optimization

**Compétences essentielles :**
- Configuration Vite basique
- Lazy loading et code splitting
- Optimisation de build
- Variables d'environnement avec Vite
- HMR (Hot Module Replacement)

**À maîtriser pour EcoRide :**

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  },
  
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue', 'vue-router', 'pinia']
        }
      }
    }
  }
})
```

**Commandes importantes :**
```bash
npm run dev          # Démarrer le serveur de dev avec HMR
npm run build        # Build optimisé pour production
npm run preview      # Prévisualiser le build production
```

**Fichiers clés :** `Frontend/vite.config.js`, `Frontend/package.json`

---

### 2.8 Testing (Vitest + Playwright)

**Compétences essentielles :**
- Unit tests avec Vitest
- E2E tests avec Playwright
- Mocking et assertions
- Couverture de code

**À maîtriser pour EcoRide :**

```javascript
// tests/example.spec.js (Vitest)
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import LoginView from '@/views/LoginView.vue'

describe('LoginView', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(LoginView)
  })

  it('affiche le formulaire de connexion', () => {
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('désactive le bouton si le formulaire est invalide', async () => {
    const button = wrapper.find('button[type="submit"]')
    expect(button.attributes('disabled')).toBe('')
  })
})
```

```javascript
// e2e/login.spec.js (Playwright)
import { test, expect } from '@playwright/test'

test('Login flow', async ({ page }) => {
  await page.goto('http://localhost:5173/login')
  
  await page.fill('input[type="email"]', 'test@example.com')
  await page.fill('input[type="password"]', 'Test2025!')
  
  await page.click('button[type="submit"]')
  
  await page.waitForURL('/')
  expect(await page.locator('.navbar').isVisible()).toBe(true)
})
```

**Fichiers clés :** `Frontend/e2e/`, `Frontend/vitest.config.js`, `Frontend/playwright.config.js`

---

## 3. BASES DE DONNÉES

### 3.1 Design de Schéma Relationnel (MySQL)

**Compétences essentielles :**
- Modélisation entité-relation (ER)
- Normalisation (1NF, 2NF, 3NF)
- Clés primaires et étrangères
- Relations : 1:1, 1:N, N:N
- Types de données SQL appropriés
- Indexation pour performance

**À maîtriser pour EcoRide :**

```sql
-- Modèle relationnel
-- Users → Roles (N:N)
-- Users → Vehicles (1:N)
-- Vehicles → Carpooling (1:N)
-- Carpooling → Participation (1:N)
-- Participation → Users (N:1)

-- Exemple de requête complexe
SELECT 
  c.id,
  c.departure_address,
  c.arrival_address,
  u.pseudo AS driver_name,
  v.model,
  COUNT(p.id) AS participants_count,
  c.seats_remaining
FROM Carpooling c
JOIN User u ON c.driver_id = u.id
JOIN Vehicle v ON c.vehicle_id = v.id
LEFT JOIN Participation p ON c.id = p.carpooling_id
WHERE c.status = 'prévu'
  AND c.departure_datetime > NOW()
  AND c.seats_remaining > 0
  AND u.suspended = FALSE
GROUP BY c.id
ORDER BY c.departure_datetime ASC;
```

**Fichiers clés :** `Backend/prisma/schema.prisma`, `Backend/Database/creation_base_de_donnees.sql`

---

### 3.2 Prisma ORM - Avancé

**Compétences essentielles :**
- Requêtes complexes avec `include` et `select`
- Agrégations et groupements
- Transactions
- Unique constraints et validation
- Migration strategy

**À maîtriser pour EcoRide :**

```javascript
// Requête avec relations imbriquées
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    roles: true,
    vehicles: {
      include: {
        carpools: {
          where: { status: 'prévu' },
          include: { participations: true }
        }
      }
    },
    driverTrips: {
      include: { participations: true, vehicle: true }
    },
    participations: {
      include: { carpooling: true }
    }
  }
})

// Agrégation
const stats = await prisma.carpooling.aggregate({
  where: { driver_id: userId, status: 'completed' },
  _count: true,
  _sum: { platform_commission_earned: true }
})

// Transactions
const result = await prisma.$transaction(async (tx) => {
  // Décrémenter les crédits du passager
  await tx.user.update({
    where: { id: passengerId },
    data: { credits: { decrement: price } }
  })
  
  // Créer la participation
  const participation = await tx.participation.create({
    data: { passenger_id: passengerId, carpooling_id: carpoolingId }
  })
  
  // Décrémenter les places
  await tx.carpooling.update({
    where: { id: carpoolingId },
    data: { seats_remaining: { decrement: 1 } }
  })
  
  return participation
})
```

**Fichiers clés :** Contrôleurs, tous les accès base de données

---

### 3.3 MongoDB et Mongoose - Flexible Schema

**Compétences essentielles :**
- Documents vs schémas relationnels
- Schémas Mongoose
- CRUD sur MongoDB
- Requêtes `find`, `findById`, `updateOne`
- Avantages et inconvénients vs SQL

**À maîtriser pour EcoRide :**

```javascript
// Modèle Mongoose
const reviewSchema = new Schema({
  carpooling_id: { type: ObjectId, ref: 'Carpooling', required: true },
  reviewer_id: { type: ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, maxlength: 500 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

const Review = mongoose.model('Review', reviewSchema)

// CRUD
// CREATE
const review = await Review.create({
  carpooling_id: carpoolingId,
  reviewer_id: userId,
  rating: 5,
  comment: "Excellent trajet!"
})

// READ
const reviews = await Review.find({ carpooling_id: carpoolingId })

// UPDATE
await Review.updateOne(
  { _id: reviewId },
  { rating: 4, comment: "Updated" }
)

// DELETE
await Review.deleteOne({ _id: reviewId })
```

**Fichiers clés :** `Backend/models/Review.js`, `Backend/Config/mongodb.js`, `Backend/controllers/reviewController.js`

---

## 4. DEVOPS ET DÉPLOIEMENT

### 4.1 Docker et Containerization

**Compétences essentielles :**
- Dockerfile - image creation
- Docker Compose - multi-container orchestration
- Volumes et networking
- Environment variables dans containers
- Health checks

**À maîtriser pour EcoRide :**

```dockerfile
# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

```yaml
# compose.yaml - Production
version: '3.8'

services:
  backend:
    build: ./Backend
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      MONGODB_URI: ${MONGODB_URI}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - mysql
      - mongodb
    volumes:
      - ./Backend/logs:/app/logs

  frontend:
    build: ./Frontend
    ports:
      - "80:80"
    environment:
      VITE_API_URL: http://backend:3000/api
    depends_on:
      - backend

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: ecoride_db
    volumes:
      - mysql_data:/var/lib/mysql

  mongodb:
    image: mongo:7.0
    environment:
      MONGO_INITDB_DATABASE: ecoride_reviews
    volumes:
      - mongo_data:/data/db

volumes:
  mysql_data:
  mongo_data:
```

**Fichiers clés :** `Backend/Dockerfile`, `Frontend/Dockerfile`, `compose.yaml`, `compose.dev.yaml`

---

### 4.2 Netlify - Frontend Deployment

**Compétences essentielles :**
- Configuration Netlify avec `netlify.toml`
- Build commands et publish directory
- Environment variables
- Redirection SPA
- Continuous deployment

**À maîtriser pour EcoRide :**

```toml
# netlify.toml
[build]
  base = "Frontend"
  command = "npm ci && npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[context.production.environment]
  VITE_API_URL = "https://api-production.com/api"
```

**Fichiers clés :** `netlify.toml`

---

### 4.3 Cloud Database (Aiven, MongoDB Atlas)

**Compétences essentielles :**
- Provisionner des bases de données cloud
- Connection strings et credentials
- Backups et maintenance
- Monitoring et logging
- Scaling

**À maîtriser pour EcoRide :**

- MySQL cloud instance via Aiven
- MongoDB cloud via MongoDB Atlas
- Configuration des variables d'environnement
- Connection pooling

**Fichiers clés :** `.env` (configuration), scripts de migration

---

## 5. GIT ET VERSIONNING

### 5.1 Git Workflows

**Compétences essentielles :**
- Commits avec messages descriptifs
- Branches pour features/fixes
- Pull requests avec description
- Merges et conflict resolution
- Rebase vs merge strategies

**À maîtriser pour EcoRide :**

```bash
# Workflow typical
git checkout -b feature/user-authentication
# ... coding ...
git add .
git commit -m "feat(auth): add JWT authentication middleware"
git push origin feature/user-authentication
# → Create Pull Request
# → Code review
# → Merge to main
```

---

## 6. PATTERNS ET CONCEPTS TRANSVERSAUX

### 6.1 RESTful API Design

**Compétences essentielles :**
- HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Status codes (200, 201, 400, 403, 404, 500)
- Resource-based URLs
- Versioning strategies
- Pagination et filtering

**À maîtriser pour EcoRide :**

```javascript
// RESTful endpoints structure
GET    /api/carpoolings              // List all
POST   /api/carpoolings              // Create
GET    /api/carpoolings/:id          // Detail
PUT    /api/carpoolings/:id          // Full update
PATCH  /api/carpoolings/:id          // Partial update
DELETE /api/carpoolings/:id          // Delete

// Query parameters
GET /api/carpoolings?status=prévu&limit=10&offset=0
GET /api/carpoolings/search?departure=Paris&arrival=Lyon

// Response structure
{
  success: true,
  data: { ... },
  message: "Covoiturage créé avec succès",
  timestamp: "2025-12-10T10:30:00Z"
}

// Error response
{
  success: false,
  error: {
    code: "VALIDATION_ERROR",
    message: "Email invalide",
    details: [{ field: "email", message: "Format invalide" }]
  }
}
```

---

### 6.2 Async/Await et Promises

**Compétences essentielles :**
- Promises et `.then()/.catch()`
- Async/await syntax
- Error handling avec try/catch
- Promise.all() pour parallélisation
- Timeout et cancellation

**À maîtriser pour EcoRide :**

```javascript
// Async/await pattern
async function createCarpooling(data) {
  try {
    // Valider
    const validation = await validateCarpoolingData(data)
    if (!validation.isValid) {
      throw new ValidationError(validation.errors)
    }
    
    // Vérifier les permissions
    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicle_id } })
    if (vehicle.user_id !== req.user.id) {
      throw new AuthorizationError("Accès refusé")
    }
    
    // Créer - transaction
    const result = await prisma.$transaction(async (tx) => {
      const carpooling = await tx.carpooling.create({ data: {...} })
      await sendNotification(vehicle.user_id, "Trajet créé")
      return carpooling
    })
    
    return result
  } catch (error) {
    if (error instanceof ValidationError) {
      return { success: false, errors: error.details }
    }
    throw error
  }
}

// Parallélisation
const [user, vehicles, trips] = await Promise.all([
  prisma.user.findUnique({ where: { id } }),
  prisma.vehicle.findMany({ where: { user_id: id } }),
  prisma.carpooling.findMany({ where: { driver_id: id } })
])
```

---

### 6.3 Environment Management

**Compétences essentielles :**
- `.env` files et dotenv
- Environment-specific configurations
- Secrets vs public values
- CI/CD environment variables

**À maîtriser pour EcoRide :**

```bash
# Backend .env (example)
NODE_ENV=development
PORT=3000

# Database MySQL
DATABASE_URL="mysql://user:password@localhost:3306/ecoride_db"

# Database MongoDB
MONGODB_URI="mongodb://localhost:27017/ecoride_reviews"

# Security
JWT_SECRET="your-super-secret-key-min-32-chars-required"
BCRYPT_SALT_ROUNDS=10

# Email
EMAIL_SERVICE="gmail"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"

# CORS
ALLOWED_ORIGINS="http://localhost:5173,https://ecoridetp.netlify.app"

# Frontend .env.local (example)
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=EcoRide
```

---

## 7. PLAN APPRENTISSAGE PROGRESSIF

### Phase 1 : Fondamentaux (Semaines 1-2)

**Backend :**
- [ ] JavaScript asynchrone (Promises, async/await)
- [ ] Node.js basiques (require, exports, modules)
- [ ] Express basique (routes, middleware)
- [ ] Variables d'environnement avec dotenv

**Frontend :**
- [ ] JavaScript ES6+ (arrow functions, destructuring, spread)
- [ ] HTML5 et CSS3 basics
- [ ] Bootstrap 5 basics

**Databases :**
- [ ] SQL basics (SELECT, INSERT, UPDATE, DELETE)
- [ ] Design relationnel basique (clés, relations)

### Phase 2 : Stack de Base (Semaines 3-4)

**Backend :**
- [ ] Express routing patterns
- [ ] Middleware et ordre d'exécution
- [ ] Bcrypt et hachage de mots de passe
- [ ] JWT - génération et vérification
- [ ] Middleware d'authentification custom
- [ ] Prisma - configuration et CRUD basique
- [ ] MySQL - connexion et requêtes simples

**Frontend :**
- [ ] Vue 3 fundamentals
- [ ] Composition API et reactivity
- [ ] Vue Router basique
- [ ] Pinia store basique
- [ ] Axios et API calls

### Phase 3 : Architecture & Patterns (Semaines 5-6)

**Backend :**
- [ ] Zod validation schemas
- [ ] Middleware de validation
- [ ] MVC architecture
- [ ] Structure controllers/routes/models
- [ ] Error handling patterns
- [ ] CORS et sécurité Web
- [ ] Rate limiting
- [ ] Prisma relations avancées

**Frontend :**
- [ ] Composants réutilisables
- [ ] Props et events
- [ ] Lifecycle hooks avancés
- [ ] Watch et computed avancés
- [ ] Services et abstraction API
- [ ] Store actions asynchrones

### Phase 4 : Intégration Full-Stack (Semaines 7-8)

**Backend :**
- [ ] MongoDB/Mongoose setup
- [ ] Dual database patterns
- [ ] Email services
- [ ] Transactions avec Prisma
- [ ] Logging et debugging
- [ ] Testing API (scripts)

**Frontend :**
- [ ] Forms complexes avec validation
- [ ] State management avancé
- [ ] Error handling global
- [ ] Loading states et skeletons
- [ ] Modal et composants complexes

### Phase 5 : Déploiement & DevOps (Semaines 9-10)

- [ ] Docker basics et Dockerfile
- [ ] Docker Compose pour dev local
- [ ] Netlify configuration et deployment
- [ ] Cloud databases (Aiven, MongoDB Atlas)
- [ ] Environment variables en production
- [ ] HTTPS et SSL
- [ ] Monitoring basique

### Phase 6 : Spécialisations (Semaines 11-12)

- [ ] Testing (Vitest + Playwright)
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Code organization patterns
- [ ] Documentation
- [ ] Git workflows avancés

---

## 8. RESSOURCES D'APPRENTISSAGE RECOMMANDÉES

### Backend (Node.js/Express)
- **Express.js Official Guide** : https://expressjs.com/
- **Prisma Docs** : https://www.prisma.io/docs/
- **Zod** : https://zod.dev/
- **JWT Best Practices** : https://tools.ietf.org/html/rfc7519
- **Mongoose Docs** : https://mongoosejs.com/

### Frontend (Vue.js)
- **Vue 3 Official Guide** : https://vuejs.org/guide/
- **Vue Router** : https://router.vuejs.org/
- **Pinia Docs** : https://pinia.vuejs.org/
- **Axios** : https://axios-http.com/
- **Bootstrap 5** : https://getbootstrap.com/docs/5.0/

### Databases
- **Prisma ORM** : https://www.prisma.io/
- **MySQL Documentation** : https://dev.mysql.com/doc/
- **MongoDB University** : https://learn.mongodb.com/
- **SQL Tutorial** : https://www.w3schools.com/sql/

### DevOps
- **Docker Official Docs** : https://docs.docker.com/
- **Docker Compose** : https://docs.docker.com/compose/
- **Netlify Docs** : https://docs.netlify.com/

---

## 9. CHECKLIST POUR DÉMARRER VOTRE NOUVEAU PROJET

### Initialisation
- [ ] Créer un nouveau repository Git
- [ ] Initialiser `package.json` backend et frontend
- [ ] Configurer `.gitignore`
- [ ] Créer `.env.example` pour documenter les variables

### Structure Backend
- [ ] Configurer Express avec middleware (cors, helmet, rate-limit)
- [ ] Setup Prisma avec MySQL
- [ ] Setup Mongoose avec MongoDB
- [ ] Créer la structure : routes/, controllers/, models/, validators/, middlewares/
- [ ] Implémenter authentication (JWT + bcrypt)
- [ ] Créer les premiers schémas Prisma et migrations

### Structure Frontend
- [ ] Initialiser Vite avec Vue 3
- [ ] Configurer Vue Router avec lazy loading
- [ ] Installer Pinia pour state management
- [ ] Configurer Axios avec intercepteurs
- [ ] Créer la structure : views/, components/, stores/, services/
- [ ] Mettre en place Bootstrap 5
- [ ] Créer composants réutilisables de base

### Intégration API
- [ ] Tester la communication frontend-backend en local
- [ ] Implémenter login/register flow complet
- [ ] Tester authentication et refresh tokens
- [ ] Vérifier les CORS et erreurs

### Déploiement
- [ ] Créer Dockerfile pour backend et frontend
- [ ] Mettre en place Docker Compose pour développement
- [ ] Configurer `netlify.toml` pour frontend
- [ ] Tester le build production localement
- [ ] Déployer sur Netlify (frontend) et cloud (backend)
- [ ] Configurer les variables d'environnement en production

### Testing
- [ ] Mettre en place Vitest pour unit tests
- [ ] Ajouter tests des composants Vue critiques
- [ ] Mettre en place Playwright pour E2E tests
- [ ] Tester les principaux user flows

### Documentation
- [ ] Documenter la structure du projet
- [ ] Créer guide de setup local
- [ ] Documenter les endpoints API
- [ ] Créer guide de déploiement

---

## 10. ERREURS COURANTES À ÉVITER

### Backend
- ❌ Ne pas valider les inputs (FIX: utiliser Zod)
- ❌ Exposer les erreurs sensibles en production (FIX: gérer les erreurs proprement)
- ❌ Stocker les secrets en dur (FIX: utiliser `.env`)
- ❌ Oublier les relations Prisma (FIX: utiliser `include` ou `select`)
- ❌ Transactions non utilisées pour opérations critiques (FIX: utiliser `prisma.$transaction`)
- ❌ N'importe quel CORS - whitelist les origines (FIX: lister explicitement)

### Frontend
- ❌ Faire des requêtes API directement dans les templates (FIX: utiliser services)
- ❌ Ne pas utiliser le state management (FIX: centraliser avec Pinia)
- ❌ Stocker les tokens en sessionStorage au lieu de localStorage (FIX: localStorage pour persistance)
- ❌ Composants monolithiques non réutilisables (FIX: découper en composants)
- ❌ Pas de gestion d'erreurs API (FIX: intercepteurs et état d'erreur)

### DevOps
- ❌ Secrets exposés dans les Dockerfiles (FIX: utiliser environment variables)
- ❌ Volumes pas configurés correctement (FIX: mapper les chemins correctly)
- ❌ Pas de health checks (FIX: ajouter des health checks Docker)
- ❌ Ports hardcodés (FIX: utiliser variables d'environnement)

---

## Conclusion

Le projet EcoRide couvre l'intégralité d'une stack full-stack moderne :

**Backend** : Node.js, Express, JWT, Prisma, MySQL, Mongoose, MongoDB, Zod, Validation
**Frontend** : Vue 3, Composition API, Pinia, Vue Router, Axios, Bootstrap 5, Vite
**DevOps** : Docker, Docker Compose, Netlify, Cloud Databases
**Architecture** : MVC, RESTful API, State Management, Component-based design

Pour maîtriser ce projet, vous devez progresser graduellement du simple au complexe, en commençant par les fondamentaux et en construisant des compétences progressives. Utilisez cette checklist comme guide et adaptez le rythme à votre situation.

**Temps estimé pour une maîtrise complète : 8-12 semaines** (selon votre expérience initiale)

Bon apprentissage ! 🚀
