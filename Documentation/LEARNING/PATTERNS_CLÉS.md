# Patterns et Concepts Clés du Projet EcoRide

## Avant-Propos

Ce document centralise les **patterns essentiels** trouvés dans EcoRide que vous DEVEZ maîtriser pour pouvoir les réappliquer dans vos propres projets. Chaque pattern est accompagné d'une explication, d'exemples concrets du projet, et de cas d'usage alternatifs.

---

## 1. PATTERN : ARCHITECTURE MVC AVEC EXPRESS

### Concept
MVC = Model-View-Controller
- **Routes** : Définissent les endpoints HTTP
- **Controllers** : Contiennent la logique métier
- **Models** : Définissent la structure des données

### Pourquoi c'est important
- Séparation des responsabilités
- Code maintenable et testable
- Réutilisabilité

### Structure EcoRide

```
routes/userRoutes.js
  ↓ appelle
controllers/userController.js
  ↓ utilise
prisma (Models)
```

### Exemple complet

**1. Route** (`routes/userRoutes.js`) :
```javascript
router.post(
  "/register",
  validateBody(registerSchema),  // Validation
  registerUser                    // Controller
);
```

**2. Controller** (`controllers/userController.js`) :
```javascript
const registerUser = async (req, res) => {
  // 1. Extraire les données validées
  const { pseudo, email, password } = req.validatedBody;

  // 2. Logique métier : validation
  const emailValidation = validateAndNormalizeEmail(email);
  if (!emailValidation.isValid) {
    return res.status(400).json({ message: "Email invalide" });
  }

  // 3. Logique métier : cryptage
  const passwordHash = await bcrypt.hash(password, 10);

  // 4. Accéder à la base de données
  const user = await prisma.user.create({
    data: { pseudo, email, password_hash: passwordHash }
  });

  // 5. Retourner la réponse
  res.status(201).json({ user });
};
```

**3. Model** (`prisma/schema.prisma`) :
```prisma
model User {
  id            Int     @id @default(autoincrement())
  pseudo        String  @unique
  email         String  @unique
  password_hash String
  // ...
}
```

### Cas d'usage alternatifs
- Création d'un produit → `POST /products` → `createProduct`
- Suppression d'un utilisateur → `DELETE /users/:id` → `deleteUser`
- Mise à jour d'un profil → `PUT /users/:id` → `updateProfile`

---

## 2. PATTERN : MIDDLEWARE DE VALIDATION ZOD

### Concept
Avant que les données n'atteignent le controller, on les valide avec Zod via un middleware.

### Pourquoi c'est important
- Validation centralisée et réutilisable
- Messages d'erreur clairs et consistants
- Prévention des données invalides

### Structure EcoRide

```
Zod Schema
    ↓
validateBody middleware
    ↓
req.validatedBody (données sûres)
    ↓
Controller (logique métier)
```

### Exemple complet

**1. Schéma Zod** (`validators/userValidator.js`) :
```javascript
const createUserSchema = z.object({
  pseudo: z.string()
    .min(3, "Min 3 caractères")
    .max(50, "Max 50 caractères"),
  email: z.string()
    .email("Email invalide"),
  password: z.string()
    .min(8, "Min 8 caractères")
    .regex(/[A-Z]/, "Min 1 majuscule")
    .regex(/[0-9]/, "Min 1 chiffre")
    .regex(/[^A-Za-z0-9]/, "Min 1 symbole")
});
```

**2. Middleware** (`middlewares/validate.js`) :
```javascript
function validateBody(schema) {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.body);
      req.validatedBody = validatedData;  // ← Les données validées sont attachées
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.issues.map(issue => ({
          path: issue.path.join("."),
          message: issue.message
        }));
        return res.status(400).json({ errors });
      }
      next(err);
    }
  };
}
```

**3. Route** :
```javascript
router.post(
  "/register",
  validateBody(createUserSchema),  // ← Middleware appliqué ici
  registerUser
);
```

**4. Controller** :
```javascript
const registerUser = async (req, res) => {
  // À ce moment, req.validatedBody contient des données garanties
  const { pseudo, email, password } = req.validatedBody;
  // ... logique métier sécurisée
};
```

### Cas d'usage alternatifs
```javascript
// Validation de mise à jour
const updateUserSchema = z.object({
  pseudo: z.string().min(3).optional(),
  profile_picture_url: z.string().url().optional()
});

router.put(
  "/users/:id",
  authMiddleware,
  validateBody(updateUserSchema),
  updateUser
);

// Validation de recherche
const searchSchema = z.object({
  departure: z.string(),
  arrival: z.string(),
  date: z.string().refine(d => new Date(d) > new Date(), "Date doit être future")
});

router.get("/search", validateBody(searchSchema), searchCarpoolings);
```

---

## 3. PATTERN : MIDDLEWARE D'AUTHENTIFICATION JWT

### Concept
Protéger les routes en vérifiant le JWT dans le header Authorization.

### Pourquoi c'est important
- Sécuriser les ressources
- Identifier l'utilisateur
- Implémenter l'autorisation

### Structure EcoRide

```
Client envoie JWT
  ↓
Middleware vérifie JWT
  ↓
req.user = { id, email, roles }
  ↓
Controller peut accéder à req.user
```

### Exemple complet

**1. Middleware** (`authMiddleware.js`) :
```javascript
function authMiddleware(req, res, next) {
  // Extraire le token du header Authorization
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];  // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({
      message: "Accès non autorisé : token manquant"
    });
  }

  // Vérifier le token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        message: "Token invalide ou expiré"
      });
    }

    // Attacher l'utilisateur à la requête
    req.user = user;
    next();
  });
}
```

**2. Générer un JWT** (dans le controller login) :
```javascript
const loginUser = async (req, res) => {
  // ... vérifier email et password ...

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      pseudo: user.pseudo,
      roles: user.roles.map(r => r.name)
    },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  res.json({
    token,
    user: { id: user.id, pseudo: user.pseudo, email: user.email }
  });
};
```

**3. Protéger une route** :
```javascript
// Route publique
router.post("/login", validateBody(loginSchema), loginUser);

// Route protégée
router.get("/profile", authMiddleware, getUserProfile);

// Route protégée avec rôle
router.post(
  "/admin/users",
  authMiddleware,
  requireRole("admin"),
  createUser
);
```

**4. Utiliser req.user dans un controller** :
```javascript
const getUserProfile = async (req, res) => {
  // req.user est disponible grâce au middleware
  const userId = req.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: true, vehicles: true }
  });

  res.json({ user });
};
```

**5. Côté frontend** (Axios interceptor) :
```javascript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Cas d'usage alternatifs
```javascript
// Middleware avec rôles multiples
const requireAdmin = requireRole(['admin', 'moderator']);

// Guards de navigation côté frontend
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('authToken');
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

// Refresh token pattern
const refreshToken = jwt.sign(
  { id: user.id },
  process.env.JWT_REFRESH_SECRET,
  { expiresIn: "7d" }
);
```

---

## 4. PATTERN : GESTION DES RELATIONS AVEC PRISMA

### Concept
Charger les données relationnelles avec `include` pour obtenir les données imbriquées.

### Pourquoi c'est important
- Éviter les requêtes multiples
- Accéder aux relations de l'entité
- N+1 query problem

### Structure EcoRide

```
User
  ├─ roles (User_Role) → Role
  ├─ vehicles (Vehicle)
  │   └─ carpools (Carpooling)
  │       └─ participations (Participation)
  └─ driverTrips (Carpooling)
```

### Exemple complet

**1. Sans relations** (MAUVAIS - données incomplètes) :
```javascript
const user = await prisma.user.findUnique({
  where: { id: 1 }
});
// Résultat : { id, pseudo, email, password_hash, credits, ...}
// Les relations ne sont PAS incluses
```

**2. Avec relations** (BON) :
```javascript
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    roles: true,  // Inclure tous les rôles
    vehicles: true  // Inclure tous les véhicules
  }
});
// Résultat : { id, pseudo, email, roles: [...], vehicles: [...]}
```

**3. Relations imbriquées** (ADVANCED) :
```javascript
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    roles: {
      include: {
        role: true  // Les détails du rôle
      }
    },
    vehicles: {
      include: {
        carpools: {
          where: { status: 'prévu' },
          include: {
            participations: true
          }
        }
      }
    },
    driverTrips: {
      include: {
        vehicle: true,
        participations: true
      }
    },
    participations: {
      include: {
        carpooling: {
          include: { vehicle: true }
        }
      }
    }
  }
});
```

**4. Alternative : Sélectionner des champs** (OPTIMIZE) :
```javascript
// Si vous ne voulez que certains champs
const user = await prisma.user.findUnique({
  where: { id: 1 },
  select: {
    id: true,
    pseudo: true,
    email: true,
    vehicles: {
      select: {
        id: true,
        model: true,
        plate_number: true
      }
    }
  }
});
```

### Cas d'usage alternatifs
```javascript
// Obtenir un carpooling avec tous les détails
const carpooling = await prisma.carpooling.findUnique({
  where: { id: carpoolingId },
  include: {
    driver: {
      select: { id: true, pseudo: true, profile_picture_url: true }
    },
    vehicle: true,
    participations: {
      include: {
        passenger: {
          select: { id: true, pseudo: true, profile_picture_url: true }
        }
      }
    }
  }
});

// Lister les covoiturages avec filtrage
const carpoolings = await prisma.carpooling.findMany({
  where: {
    status: 'prévu',
    seats_remaining: { gt: 0 },
    departure_datetime: { gt: new Date() }
  },
  include: {
    driver: true,
    vehicle: true,
    participations: true
  },
  orderBy: { departure_datetime: 'asc' },
  take: 10
});
```

---

## 5. PATTERN : TRANSACTIONS PRISMA POUR OPÉRATIONS CRITIQUES

### Concept
Grouper plusieurs opérations en une transaction atomic (tout réussit ou tout échoue).

### Pourquoi c'est important
- Intégrité des données
- Pas de state inconsistent
- Rollback automatique en cas d'erreur

### Structure EcoRide

```
Opération 1 (décrémenter crédits)
Opération 2 (créer participation)
Opération 3 (décrémenter places)

Tout échoue ensemble OU tout réussit ensemble
```

### Exemple complet

**Cas d'usage : Ajouter un passager à un covoiturage**

```javascript
const addPassengerToTrip = async (req, res) => {
  try {
    const { carpoolingId } = req.params;
    const passengerId = req.user.id;
    const pricePerPassenger = 50;  // Crédits à payer

    // ❌ MAUVAIS : Opérations séparées
    // Si l'une échoue au milieu, state inconsistent
    // Ex: crédits décrémentés mais participation non créée

    // ✅ BON : Utiliser une transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Vérifier la disponibilité
      const carpooling = await tx.carpooling.findUnique({
        where: { id: parseInt(carpoolingId) }
      });

      if (!carpooling || carpooling.seats_remaining <= 0) {
        throw new Error("Plus de places disponibles");
      }

      // 2. Vérifier les crédits du passager
      const passenger = await tx.user.findUnique({
        where: { id: passengerId }
      });

      if (passenger.credits < pricePerPassenger) {
        throw new Error("Crédits insuffisants");
      }

      // 3. Décrémenter les crédits
      await tx.user.update({
        where: { id: passengerId },
        data: { credits: { decrement: pricePerPassenger } }
      });

      // 4. Créer la participation
      const participation = await tx.participation.create({
        data: {
          passenger_id: passengerId,
          carpooling_id: parseInt(carpoolingId),
          credits_paid: pricePerPassenger
        }
      });

      // 5. Décrémenter les places
      await tx.carpooling.update({
        where: { id: parseInt(carpoolingId) },
        data: { seats_remaining: { decrement: 1 } }
      });

      return participation;
    });

    res.status(201).json({
      message: "Participation créée avec succès",
      participation: result
    });
  } catch (error) {
    // Si une opération échoue, TOUTES les modifications sont annulées
    console.error("Erreur transaction:", error);
    res.status(400).json({
      message: error.message
    });
  }
};
```

### Cas d'usage alternatifs

**Transférer des crédits entre utilisateurs** :
```javascript
const transferCredits = async (fromId, toId, amount) => {
  const result = await prisma.$transaction(async (tx) => {
    // Vérifier les fonds
    const sender = await tx.user.findUnique({ where: { id: fromId } });
    if (sender.credits < amount) {
      throw new Error("Fonds insuffisants");
    }

    // Décrémenter sender
    const updatedSender = await tx.user.update({
      where: { id: fromId },
      data: { credits: { decrement: amount } }
    });

    // Incrémenter receiver
    const updatedReceiver = await tx.user.update({
      where: { id: toId },
      data: { credits: { increment: amount } }
    });

    // Enregistrer la transaction
    const record = await tx.creditTransaction.create({
      data: {
        sender_id: fromId,
        receiver_id: toId,
        amount,
        timestamp: new Date()
      }
    });

    return { updatedSender, updatedReceiver, record };
  });

  return result;
};
```

**Créer un post avec tags et commentaires** :
```javascript
const createPostWithData = async (userId, postData, tags) => {
  return await prisma.$transaction(async (tx) => {
    // Créer le post
    const post = await tx.post.create({
      data: {
        title: postData.title,
        content: postData.content,
        author_id: userId
      }
    });

    // Ajouter les tags (N:N)
    for (const tagName of tags) {
      let tag = await tx.tag.findUnique({ where: { name: tagName } });
      if (!tag) {
        tag = await tx.tag.create({ data: { name: tagName } });
      }
      await tx.postTag.create({
        data: { post_id: post.id, tag_id: tag.id }
      });
    }

    return post;
  });
};
```

---

## 6. PATTERN : GESTION DES ERREURS AVEC TRY/CATCH

### Concept
Capturer les erreurs et les transformer en réponses HTTP appropriées.

### Pourquoi c'est important
- L'utilisateur comprend ce qui s'est passé
- Le serveur ne crash pas
- Logging des erreurs

### Structure EcoRide

```
try {
  logique métier
} catch (error) {
  transformer l'erreur
  retourner une réponse HTTP
}
```

### Exemple complet

```javascript
const createCarpooling = async (req, res) => {
  try {
    // 1. Validation d'input
    const {
      departure_address,
      arrival_address,
      price_per_passenger,
      seats_offered,
      vehicle_id
    } = req.body;

    if (!departure_address || !arrival_address) {
      return res.status(400).json({
        message: "Adresses manquantes"
      });
    }

    // 2. Opérations de logique métier
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: parseInt(vehicle_id) }
    });

    if (!vehicle) {
      return res.status(404).json({
        message: "Véhicule non trouvé"
      });
    }

    if (vehicle.user_id !== req.user.id) {
      return res.status(403).json({
        message: "Vous ne pouvez utiliser que vos propres véhicules"
      });
    }

    // 3. Opération de base de données
    const carpooling = await prisma.carpooling.create({
      data: {
        driver_id: req.user.id,
        departure_address,
        arrival_address,
        price_per_passenger,
        initial_seats_offered: parseInt(seats_offered),
        seats_remaining: parseInt(seats_offered),
        vehicle_id: parseInt(vehicle_id)
      }
    });

    res.status(201).json({
      message: "Covoiturage créé avec succès",
      carpooling
    });

  } catch (error) {
    // Gérer différents types d'erreurs
    console.error("Erreur création covoiturage:", error);

    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return res.status(409).json({
          message: "Cet enregistrement existe déjà"
        });
      }
    }

    // Erreur générique (ne pas exposer les détails en production)
    res.status(500).json({
      message: "Erreur lors de la création du covoiturage",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};
```

### Cas d'usage alternatifs

**Classe d'erreur personnalisée** :
```javascript
class ValidationError extends Error {
  constructor(message, details) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

class AuthorizationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

const controller = async (req, res) => {
  try {
    if (!data.email.includes('@')) {
      throw new ValidationError('Email invalide', [
        { field: 'email', message: 'Doit contenir @' }
      ]);
    }

    if (user.id !== resourceOwnerId) {
      throw new AuthorizationError('Non propriétaire de cette ressource');
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        message: error.message,
        details: error.details
      });
    }

    if (error instanceof AuthorizationError) {
      return res.status(403).json({
        message: error.message
      });
    }

    res.status(500).json({ message: 'Erreur serveur' });
  }
};
```

---

## 7. PATTERN : VUE STORE (PINIA) AVEC ÉTAT PERSISTANT

### Concept
Centralize l'état de l'application dans un store, avec sauvegarde locale.

### Pourquoi c'est important
- État unique et prévisible
- Partage de données entre composants
- Persistance entre rechargements

### Structure EcoRide

```
Browser localStorage
        ↓
loadUserFromStorage()
        ↓
Pinia store
        ↓
Composants Vue
```

### Exemple complet

**1. Créer un store Pinia** (`stores/auth.js`) :
```javascript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  // STATE - Les données
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref(localStorage.getItem('authToken'))
  const isAuthenticated = ref(!!localStorage.getItem('authToken'))
  const isLoading = ref(false)
  const error = ref(null)

  // GETTERS - Propriétés calculées (lecture seule)
  const isLoggedIn = computed(() => isAuthenticated.value)
  const currentUser = computed(() => user.value)
  const userRole = computed(() => user.value?.role || null)

  // ACTIONS - Fonctions asynchrones
  const login = async (credentials) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.post('/users/login', credentials)
      const { user: userData, token: newToken } = response.data

      // Mettre à jour l'état
      user.value = userData
      token.value = newToken
      isAuthenticated.value = true

      // Persister dans localStorage
      localStorage.setItem('authToken', newToken)
      localStorage.setItem('user', JSON.stringify(userData))

      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur de connexion'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const register = async (userData) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.post('/users/register', userData)
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur d\'inscription'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    isAuthenticated.value = false
    error.value = null

    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  }

  const loadUserFromStorage = () => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('authToken')

    if (storedUser && storedToken) {
      user.value = JSON.parse(storedUser)
      token.value = storedToken
      isAuthenticated.value = true
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    isLoggedIn,
    currentUser,
    userRole,
    login,
    register,
    logout,
    loadUserFromStorage
  }
})
```

**2. Utiliser le store dans un composant** :
```vue
<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Accéder au state
const isLoggedIn = computed(() => authStore.isLoggedIn)
const user = computed(() => authStore.currentUser)

// Appeler une action
const handleLogin = async () => {
  const result = await authStore.login({
    email: 'user@example.com',
    password: 'Pass2025!'
  })

  if (result.success) {
    router.push('/dashboard')
  }
}

// Charger depuis localStorage au montage
onMounted(() => {
  authStore.loadUserFromStorage()
})
</script>

<template>
  <div v-if="isLoggedIn" class="user-card">
    <p>Bienvenue {{ user.pseudo }}</p>
    <button @click="authStore.logout">Déconnexion</button>
  </div>

  <div v-else class="login-form">
    <input v-model="email" type="email" />
    <input v-model="password" type="password" />
    <button @click="handleLogin" :disabled="authStore.isLoading">
      {{ authStore.isLoading ? 'Connexion...' : 'Se connecter' }}
    </button>
    <p v-if="authStore.error" class="error">{{ authStore.error }}</p>
  </div>
</template>
```

### Cas d'usage alternatifs

**Store pour liste de produits** :
```javascript
export const useProductStore = defineStore('products', () => {
  const products = ref([])
  const selectedProduct = ref(null)
  const isLoading = ref(false)

  const fetchProducts = async () => {
    isLoading.value = true
    try {
      const { data } = await api.get('/products')
      products.value = data
    } finally {
      isLoading.value = false
    }
  }

  const selectProduct = (id) => {
    selectedProduct.value = products.value.find(p => p.id === id)
  }

  return {
    products: computed(() => products.value),
    selectedProduct: computed(() => selectedProduct.value),
    isLoading: computed(() => isLoading.value),
    fetchProducts,
    selectProduct
  }
})
```

---

## 8. PATTERN : SERVICES API AVEC AXIOS

### Concept
Centraliser toutes les appels API dans des services réutilisables.

### Pourquoi c'est important
- Pas de code dupliqué
- Configuration centralisée
- Injection automatique de JWT
- Gestion globale des erreurs

### Structure EcoRide

```
services/api.js
  ├── api instance (axios)
  │   ├── interceptors.request (ajouter JWT)
  │   └── interceptors.response (gérer 401)
  └── Services métier
      ├── authService
      ├── userService
      └── carpoolingService
```

### Exemple complet

**1. Configuration Axios** (`services/api.js`) :
```javascript
import axios from 'axios'

// Déterminer l'URL API selon l'environnement
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }

  if (import.meta.env.MODE === 'production') {
    return '/api'
  }

  return 'http://localhost:3000/api'
}

const API_BASE_URL = getApiUrl()

// Instance Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Intercepteur de requête - Ajouter le JWT automatiquement
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Intercepteur de réponse - Gérer les erreurs globalement
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré → rediriger vers login
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default api
```

**2. Services métier** :
```javascript
// Services d'authentification
export const authService = {
  async login(credentials) {
    const { data } = await api.post('/users/login', credentials)
    return data
  },

  async register(userData) {
    const { data } = await api.post('/users/register', userData)
    return data
  },

  async getProfile() {
    const { data } = await api.get('/users/profile')
    return data
  }
}

// Services pour covoiturages
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
  },

  async joinCarpooling(carpoolingId) {
    const { data } = await api.post(`/carpoolings/${carpoolingId}/join`)
    return data
  }
}

// Services pour utilisateurs
export const userService = {
  async updateProfile(userId, userData) {
    const { data } = await api.put(`/users/${userId}`, userData)
    return data
  },

  async uploadProfilePicture(userId, file) {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await api.post(`/users/${userId}/picture`, formData)
    return data
  }
}
```

**3. Utilisation dans les composants** :
```vue
<script setup>
import { ref, onMounted } from 'vue'
import { carpoolingService } from '@/services/api'

const carpoolings = ref([])
const isLoading = ref(false)
const error = ref(null)

const loadCarpoolings = async (searchParams) => {
  isLoading.value = true
  error.value = null

  try {
    const data = await carpoolingService.searchCarpoolings(searchParams)
    carpoolings.value = data.carpoolings
  } catch (err) {
    error.value = err.response?.data?.message || 'Erreur lors de la recherche'
  } finally {
    isLoading.value = false
  }
}

const joinTrip = async (carpoolingId) => {
  try {
    const result = await carpoolingService.joinCarpooling(carpoolingId)
    // Mettre à jour l'état local
    await loadCarpoolings()
  } catch (err) {
    error.value = err.response?.data?.message
  }
}

onMounted(() => {
  loadCarpoolings({ date: '2025-12-15' })
})
</script>

<template>
  <div class="carpooling-list">
    <div v-if="isLoading" class="spinner">Chargement...</div>

    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-for="carpooling in carpoolings" :key="carpooling.id" class="carpooling-card">
      <h3>{{ carpooling.departure_address }} → {{ carpooling.arrival_address }}</h3>
      <p>{{ carpooling.price_per_passenger }} crédits</p>
      <button @click="joinTrip(carpooling.id)">Rejoindre</button>
    </div>
  </div>
</template>
```

---

## 9. PATTERN : COMPOSANTS VUE RÉUTILISABLES

### Concept
Créer des composants génériques avec props et events pour maximum de réutilisabilité.

### Pourquoi c'est important
- DRY (Don't Repeat Yourself)
- Consistency dans l'UI
- Maintenance plus facile

### Structure EcoRide

```
GlassButton.vue (composant dumb)
  ← Props: variant, size, disabled, loading
  ← Events: @click

CustomModal.vue (composant dumb)
  ← Props: isOpen, title
  ← Events: @close, @confirm

LoginView.vue (composant smart)
  ← Utilise les services
  ← Gère l'état
  ← Utilise les composants dumb
```

### Exemple complet

**1. Composant dumb (réutilisable)** (`components/GlassButton.vue`) :
```vue
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
  loading: Boolean,
  type: {
    type: String,
    default: 'button'
  }
})

defineEmits(['click'])
</script>

<template>
  <button
    :type="type"
    :class="['glass-btn', `btn-${variant}`, `btn-${size}`, { disabled, loading }]"
    :disabled="disabled || loading"
    @click="$emit('click')"
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
  font-size: 1rem;
  font-weight: 500;
}

.glass-btn:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
  transform: translateY(-2px);
}

.glass-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.glass-btn.btn-sm {
  padding: 6px 12px;
  font-size: 0.875rem;
}

.glass-btn.btn-lg {
  padding: 14px 28px;
  font-size: 1.125rem;
}

.glass-btn.btn-primary {
  background: rgba(0, 208, 132, 0.8);
  color: white;
}

.glass-btn.btn-danger {
  background: rgba(220, 53, 69, 0.8);
  color: white;
}

.spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.6s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
```

**2. Composant smart (conteneur logique)** (`views/LoginView.vue`) :
```vue
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import GlassButton from '@/components/GlassButton.vue'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const errorMessage = ref('')

const handleLogin = async () => {
  errorMessage.value = ''

  const result = await authStore.login({
    email: email.value,
    password: password.value
  })

  if (result.success) {
    await router.push('/dashboard')
  } else {
    errorMessage.value = result.error
  }
}
</script>

<template>
  <div class="login-page">
    <form @submit.prevent="handleLogin">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Mot de passe" required />

      <div v-if="errorMessage" class="error">{{ errorMessage }}</div>

      <!-- Utiliser le composant réutilisable -->
      <GlassButton
        variant="primary"
        size="lg"
        type="submit"
        :loading="authStore.isLoading"
        @click="handleLogin"
      >
        Se connecter
      </GlassButton>
    </form>
  </div>
</template>
```

### Cas d'usage alternatifs

**Composant Card réutilisable** :
```vue
<!-- components/Card.vue -->
<script setup>
defineProps({
  title: String,
  subtitle: String,
  elevation: {
    type: Number,
    default: 2
  }
})
</script>

<template>
  <div :class="['card', `elevation-${elevation}`]">
    <div v-if="title" class="card-header">
      <h3>{{ title }}</h3>
      <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
    </div>
    <div class="card-body">
      <slot>No content</slot>
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>
```

**Utilisation** :
```vue
<Card title="Profil utilisateur" subtitle="Gérer vos informations">
  <p>{{ user.email }}</p>

  <template #footer>
    <button>Éditer</button>
  </template>
</Card>
```

---

## Résumé : Patterns Clés à Maîtriser

| Pattern              | Quand l'utiliser     | Bénéfice                                     |
| -------------------- | -------------------- | -------------------------------------------- |
| **MVC**              | Toujours             | Structure claire, maintenance                |
| **Zod Validation**   | Toutes les routes    | Données sûres, erreurs claires               |
| **JWT Auth**         | Routes protégées     | Sécurité, identification                     |
| **Prisma Relations** | Requêtes complexes   | Performance, données complètes               |
| **Transactions**     | Opérations critiques | Intégrité des données                        |
| **Error Handling**   | Try/catch partout    | Robustesse, user feedback                    |
| **Pinia Stores**     | État partagé         | État unique et persistant                    |
| **Axios Services**   | Appels API           | Code réutilisable, configuration centralisée |
| **Composants dumb**  | UI réutilisable      | DRY, consistency                             |

Ces patterns constituent l'épine dorsale d'une application full-stack professionnelle. En les maîtrisant, vous pourrez reproduire n'importe quel projet similaire ! 🚀
