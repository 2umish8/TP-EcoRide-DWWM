# GUIDE RAPIDE DE RÉFÉRENCE : Commandes et Snippets Essentiels

Gardez ce document à côté de vous pendant votre apprentissage. C'est une **cheat sheet** avec les commandes et codes les plus courants.

---

## 🚀 DÉMARRAGE RAPIDE

### Créer un nouveau projet
```bash
# Backend
mkdir mon-projet && cd mon-projet
mkdir Backend Frontend
cd Backend
npm init -y
npm install express cors helmet dotenv bcrypt jsonwebtoken @prisma/client zod

# Frontend
cd ../Frontend
npm create vite@latest . -- --template vue
npm install
```

### Démarrer en développement
```bash
# Terminal 1: Backend
cd Backend
npm run dev

# Terminal 2: Frontend
cd Frontend
npm run dev

# Accédez à http://localhost:5173
```

---

## 📦 BACKEND - Commandes Essentielles

### Prisma
```bash
# Initialiser Prisma
npx prisma init

# Générer le client après modification du schema
npx prisma generate

# Appliquer les changements à la base
npx prisma db push

# Créer une migration
npx prisma migrate dev --name "add_users_table"

# Ouvrir Prisma Studio (UI pour explorer les données)
npx prisma studio

# Réinitialiser la base en développement
npx prisma migrate reset

# Voir l'état des migrations
npx prisma migrate status
```

### Installation rapide des dépendances
```bash
# Essentielles
npm install express cors helmet dotenv

# Authentification
npm install bcrypt jsonwebtoken

# Database
npm install @prisma/client prisma mongoose

# Validation
npm install zod

# Dev tools
npm install -D nodemon
```

### Package.json scripts
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "db:push": "prisma db push",
    "db:generate": "prisma generate",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset"
  }
}
```

---

## 🗄️ DATABASE - Schémas et Migrations

### Schéma Prisma de base
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id            Int     @id @default(autoincrement())
  email         String  @unique
  pseudo        String  @unique
  password_hash String
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt

  roles User_Role[]
  posts Post[]

  @@map("users")
}

model Role {
  id   Int    @id @default(autoincrement())
  name String @unique

  users User_Role[]

  @@map("roles")
}

model User_Role {
  user_id Int
  role_id Int

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)
  role Role @relation(fields: [role_id], references: [id], onDelete: Cascade)

  @@id([user_id, role_id])
  @@map("user_roles")
}

model Post {
  id        Int     @id @default(autoincrement())
  title     String
  content   String  @db.Text
  author_id Int
  created_at DateTime @default(now())

  author User @relation(fields: [author_id], references: [id], onDelete: Cascade)

  @@map("posts")
}
```

### Variables d'environnement .env
```bash
NODE_ENV=development
PORT=3000

# MySQL
DATABASE_URL="mysql://root:password@localhost:3306/mon_db"

# MongoDB
MONGODB_URI="mongodb://localhost:27017/mon_db"

# Security
JWT_SECRET="votre-cle-secrete-min-32-caracteres"
BCRYPT_SALT_ROUNDS=10

# CORS
ALLOWED_ORIGINS="http://localhost:5173,http://localhost"
```

---

## 🔐 AUTHENTIFICATION - Snippets Essentiels

### Générer un JWT
```javascript
const jwt = require("jsonwebtoken");

const token = jwt.sign(
  {
    id: user.id,
    email: user.email,
    roles: user.roles.map(r => r.name)
  },
  process.env.JWT_SECRET,
  { expiresIn: "24h" }
);

res.json({ token, user });
```

### Vérifier un JWT
```javascript
jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
  if (err) {
    return res.status(403).json({ message: "Token invalide" });
  }
  req.user = decoded;
  next();
});
```

### Hasher un mot de passe
```javascript
const bcrypt = require("bcrypt");

const password_hash = await bcrypt.hash(password, 10);
// Stocker password_hash en base
```

### Vérifier un mot de passe
```javascript
const isValid = await bcrypt.compare(inputPassword, storedHash);
if (!isValid) {
  return res.status(401).json({ message: "Mot de passe incorrect" });
}
```

### Middleware d'authentification
```javascript
function authMiddleware(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ message: "Token manquant" });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token invalide" });
    req.user = user;
    next();
  });
}

// Utilisation
router.get("/profile", authMiddleware, getUserProfile);
```

### Middleware de rôle
```javascript
function requireRole(roles) {
  return (req, res, next) => {
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    const hasRole = rolesArray.some(r => req.user.roles?.includes(r));
    
    if (!hasRole) {
      return res.status(403).json({ message: "Accès refusé" });
    }
    next();
  };
}

// Utilisation
router.post("/admin/users", authMiddleware, requireRole("admin"), createUser);
```

---

## ✅ VALIDATION - Zod Schemas

### Schéma de registration
```javascript
const { z } = require("zod");

const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string()
    .min(8, "Min 8 caractères")
    .regex(/[A-Z]/, "Min 1 majuscule")
    .regex(/[0-9]/, "Min 1 chiffre")
    .regex(/[^A-Za-z0-9]/, "Min 1 symbole"),
  pseudo: z.string()
    .min(3, "Min 3 caractères")
    .max(50, "Max 50 caractères")
});
```

### Middleware de validation
```javascript
function validateBody(schema) {
  return (req, res, next) => {
    try {
      req.validatedBody = schema.parse(req.body);
      next();
    } catch (err) {
      const errors = err.issues.map(e => ({
        path: e.path.join("."),
        message: e.message
      }));
      res.status(400).json({ errors });
    }
  };
}

// Utilisation
router.post("/register", validateBody(registerSchema), registerUser);
```

---

## 🔗 PRISMA - Requêtes Courantes

### Create
```javascript
const user = await prisma.user.create({
  data: {
    email: "user@example.com",
    pseudo: "user123",
    password_hash: "hashed_password"
  }
});
```

### Read - Simple
```javascript
const user = await prisma.user.findUnique({
  where: { email: "user@example.com" }
});
```

### Read - Avec relations
```javascript
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    roles: true,
    posts: true
  }
});
```

### Read - Avec select
```javascript
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    email: true,
    pseudo: true,
    posts: {
      select: { id: true, title: true }
    }
  }
});
```

### Read - Multiple
```javascript
const users = await prisma.user.findMany({
  where: { role: "admin" },
  include: { posts: true },
  orderBy: { created_at: "desc" },
  take: 10,
  skip: 0
});
```

### Update
```javascript
const user = await prisma.user.update({
  where: { id: userId },
  data: {
    pseudo: "new_pseudo",
    email: "new@email.com"
  }
});
```

### Increment/Decrement
```javascript
// Ajouter 100 crédits
await prisma.user.update({
  where: { id: userId },
  data: { credits: { increment: 100 } }
});

// Retirer 50 crédits
await prisma.user.update({
  where: { id: userId },
  data: { credits: { decrement: 50 } }
});
```

### Delete
```javascript
const user = await prisma.user.delete({
  where: { id: userId }
});
```

### Transaction
```javascript
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.update({
    where: { id: userId },
    data: { credits: { decrement: 50 } }
  });
  
  const post = await tx.post.create({
    data: { title: "New post", author_id: userId }
  });
  
  return { user, post };
});
```

### Aggregate
```javascript
const stats = await prisma.user.aggregate({
  where: { role: "admin" },
  _count: true,
  _sum: { credits: true },
  _avg: { credits: true }
});
```

---

## 🎨 FRONTEND - Vue 3 + Pinia

### Installer les dépendances
```bash
npm install axios pinia vue-router bootstrap
npm install -D @vitejs/plugin-vue
```

### Router basique
```javascript
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// Guard d'authentification
router.beforeEach((to, from, next) => {
  const isAuth = !!localStorage.getItem('authToken')
  
  if (to.meta.requiresAuth && !isAuth) {
    next('/login')
  } else if (to.meta.requiresGuest && isAuth) {
    next('/')
  } else {
    next()
  }
})

export default router
```

### Store Pinia
```javascript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref(localStorage.getItem('authToken'))
  const isLoading = ref(false)

  const isLoggedIn = computed(() => !!token.value)

  const login = async (email, password) => {
    isLoading.value = true
    try {
      const { data } = await api.post('/users/login', { email, password })
      user.value = data.user
      token.value = data.token
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('authToken', data.token)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data?.message }
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('authToken')
  }

  return { user, token, isLoggedIn, isLoading, login, logout }
})
```

### Axios configuration
```javascript
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
})

// Intercepteur request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Intercepteur response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

### Composant avec store
```vue
<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const isLoggedIn = computed(() => authStore.isLoggedIn)
const user = computed(() => authStore.user)
</script>

<template>
  <div v-if="isLoggedIn">
    <p>Bienvenue {{ user.email }}</p>
    <button @click="authStore.logout">Déconnexion</button>
  </div>
  <div v-else>
    <p>Vous n'êtes pas connecté</p>
  </div>
</template>
```

### Composant réutilisable
```vue
<script setup>
defineProps({
  variant: { type: String, default: 'primary' },
  disabled: Boolean,
  loading: Boolean
})
defineEmits(['click'])
</script>

<template>
  <button
    :class="['btn', `btn-${variant}`, { disabled, loading }]"
    :disabled="disabled || loading"
    @click="$emit('click')"
  >
    <span v-if="loading" class="spinner"></span>
    <slot>Click</slot>
  </button>
</template>

<style scoped>
.btn { padding: 10px 20px; border-radius: 8px; cursor: pointer; }
.btn-primary { background: #007bff; color: white; }
.btn.disabled { opacity: 0.5; cursor: not-allowed; }
.spinner { animation: spin 0.6s linear infinite; }
</style>
```

---

## 🐳 DOCKER - Commandes Essentielles

### Dockerfile Backend
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "start"]
```

### Dockerfile Frontend
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: mon_db
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  mongodb:
    image: mongo:7.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  backend:
    build: ./Backend
    environment:
      DATABASE_URL: "mysql://root:root@mysql:3306/mon_db"
      MONGODB_URI: "mongodb://mongodb:27017/mon_db"
      JWT_SECRET: "dev-secret"
    ports:
      - "3000:3000"
    depends_on:
      - mysql
      - mongodb
    command: npm run dev

  frontend:
    build: ./Frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend
    command: npm run dev

volumes:
  mysql_data:
  mongo_data:
```

### Commandes Docker
```bash
# Démarrer les services
docker-compose up

# Démarrer en arrière-plan
docker-compose up -d

# Arrêter les services
docker-compose down

# Voir les logs
docker-compose logs -f backend

# Rebuilder les images
docker-compose build

# Exécuter une commande dans un container
docker-compose exec backend npx prisma studio
```

---

## 🚀 DÉPLOIEMENT - Configuration

### netlify.toml
```toml
[build]
  base = "Frontend"
  command = "npm ci && npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[context.production.environment]
  VITE_API_URL = "https://votre-api-production.com/api"
```

### Variables d'environnement production
```bash
# Backend
NODE_ENV=production
PORT=3000
DATABASE_URL="mysql://user:pass@cloud-db.com:3306/db"
MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/db"
JWT_SECRET="production-secret-key-min-32-chars"
ALLOWED_ORIGINS="https://frontend-domain.com"

# Frontend
VITE_API_URL=https://backend-api-url.com/api
```

---

## 🧪 TESTING - Snippets

### Vitest (unit test)
```javascript
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import LoginForm from '@/components/LoginForm.vue'

describe('LoginForm', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(LoginForm)
  })

  it('renders form', () => {
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('enables submit when valid', async () => {
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('Pass2025!')
    expect(wrapper.find('button').attributes('disabled')).toBeUndefined()
  })
})
```

### Playwright (E2E test)
```javascript
import { test, expect } from '@playwright/test'

test('Login flow', async ({ page }) => {
  await page.goto('http://localhost:5173/login')
  
  await page.fill('input[type="email"]', 'test@example.com')
  await page.fill('input[type="password"]', 'Pass2025!')
  
  await page.click('button[type="submit"]')
  
  await expect(page).toHaveURL('http://localhost:5173/dashboard')
})
```

---

## 📝 NOTES IMPORTANTES

### Sécurité
- ✅ Hasher les mots de passe avec bcrypt
- ✅ JWT avec secret fort (min 32 caractères)
- ✅ Tokens avec expiration
- ✅ CORS whitelist explicite
- ✅ Variables sensibles en .env (jamais en git)
- ❌ Ne jamais exposer les erreurs de base de données

### Performance
- ✅ Lazy load les routes Vue
- ✅ Utiliser `select` au lieu d'`include` quand possible
- ✅ Paginer les résultats
- ✅ Indexer les colonnes fréquemment cherchées
- ✅ Cacher les réponses API

### Scalabilité
- ✅ Séparer MySQL (relational) et MongoDB (flexible)
- ✅ Utiliser les transactions pour l'intégrité
- ✅ Logging structuré
- ✅ Rate limiting
- ✅ Health checks

---

C'est votre **cheat sheet** ! Bookmarkez-la et consultez-la souvent pendant l'apprentissage. 🎯
