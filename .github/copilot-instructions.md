# EcoRide - AI Coding Assistant Instructions

## Educational Context

This document serves as a comprehensive guide for AI coding assistants working on the EcoRide project, developed as part of a DWWM (Développeur Web et Web Mobile) training program. The project demonstrates modern full-stack development practices, security implementation, and scalable architecture patterns suitable for educational and professional environments.

## Project Overview

EcoRide is a full-stack carpooling platform developed as part of a DWWM (Développeur Web et Web Mobile) training program. The application promotes ecological transportation through electric vehicle prioritization and a credit-based reward system.

## Academic Conventions & Best Practices

### Documentation Standards

-   **No Emojis**: Do not use emojis in any documentation files (README.md, DEPLOYMENT.md, etc.)
-   **Professional Style**: Maintain a professional and technical tone in all documentation
-   **Clear Structure**: Use proper Markdown formatting with clear headings and sections
-   **Accuracy**: Always verify information against current project state before writing documentation

### Assistant todo-list (appliquée par l'assistant)

-   Vérifier les fichiers clés avant de modifier la documentation: `netlify.toml`, `Frontend/package.json`, `Backend/package.json`, `Backend/server.js`, `compose.yaml`, `compose.dev.yaml`, `README.md`.
-   Ne jamais ajouter d'emojis aux fichiers de documentation.
-   Après modification, relire le dépôt pour confirmer les valeurs : base directory Netlify, build commands, publish directory, endpoint health du backend.
-   Mettre à jour `DEPLOYMENT.md` uniquement si les informations correspondent au dépôt.

Note: l'assistant doit appliquer cette checklist à chaque modification de documentation pour éviter les informations obsolètes.

### Development Methodology

-   **Version Control**: Use Git with meaningful commit messages
-   **Branch Strategy**: Feature branches for new developments, main branch for stable code
-   **Code Style**: Consistent formatting using ESLint and Prettier
-   **Documentation**: Maintain up-to-date API and code documentation

### Professional Standards

-   **Modular Architecture**: Clean separation of concerns with MVC pattern
-   **Scalability**: Design for future growth and maintainability
-   **Performance**: Optimize database queries and implement caching strategies
-   **Accessibility**: Ensure WCAG compliance for user interfaces

### Backend (Node.js/Express)

-   **Framework**: Express.js with modular routing architecture
-   **Database**: Dual database setup - MySQL (primary relational data) + MongoDB (reviews/preferences)
-   **ORM**: Prisma for MySQL database operations, Mongoose for MongoDB
-   **Authentication**: JWT (JSON Web Tokens) with role-based access control (RBAC)
-   **Validation**: Zod schemas with custom middleware for input validation
-   **Structure**: MVC (Model-View-Controller) pattern with separation of concerns

### Frontend (Vue.js 3)

-   **Framework**: Vue 3 with Composition API for modern reactive programming
-   **Router**: Vue Router 4 with lazy-loaded components for performance optimization
-   **State**: Pinia for centralized state management (Vuex successor)
-   **Styling**: Bootstrap 5 framework with custom CSS variables for theming
-   **Build**: Vite build tool with Vue DevTools for development debugging

## Key Patterns & Conventions

### Backend Patterns

#### 1. Controller Structure

```javascript
// controllers/userController.js - Standard MVC controller pattern
const registerUser = async (req, res) => {
    try {
        // Always use validated data from Zod middleware when available
        const { pseudo, email, password } = req.validatedBody || req.body;

        // Business logic implementation
        // ... validation, database operations, etc.
    } catch (error) {
        // Proper error handling with appropriate HTTP status codes
        console.error("Registration error:", error);
        return res.status(500).json({ message: "Erreur serveur" });
    }
};
```

#### 2. Route Organization

```javascript
// routes/userRoutes.js - Clean separation of routing logic
const express = require("express");
const router = express.Router();

// Import required dependencies
const { validateBody } = require("../middlewares/validate");
const { createUserSchema } = require("../validators/userValidator");
const { registerUser, loginUser } = require("../controllers/userController");
const { authMiddleware } = require("../authMiddleware");

// Public routes with input validation
router.post("/register", validateBody(createUserSchema), registerUser);
router.post("/login", validateBody(loginSchema), loginUser);

// Protected routes requiring authentication
router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, updateUserProfile);

module.exports = router;
```

#### 3. Zod Validation Schemas

```javascript
// validators/userValidator.js - Comprehensive input validation
const { z } = require("zod");

// User registration schema with detailed validation rules
const createUserSchema = z.object({
    pseudo: z
        .string()
        .min(3, { message: "Le pseudo doit contenir au moins 3 caractères" })
        .max(50, { message: "Le pseudo ne peut pas dépasser 50 caractères" }),
    email: z.string().email({ message: "Format d'adresse email invalide" }),
    password: z
        .string()
        .min(8, {
            message: "Le mot de passe doit contenir au moins 8 caractères",
        })
        .regex(/[A-Z]/, {
            message: "Le mot de passe doit contenir au moins une majuscule",
        })
        .regex(/[0-9]/, {
            message: "Le mot de passe doit contenir au moins un chiffre",
        })
        .regex(/[^A-Za-z0-9]/, {
            message:
                "Le mot de passe doit contenir au moins un caractère spécial",
        }),
});

module.exports = { createUserSchema };
```

#### 4. Database Operations with Prisma

```javascript
// Example of Prisma database operations with proper error handling
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getUserWithRelations = async (userId) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                roles: true, // Include user roles
                vehicles: true, // Include user's vehicles
                driverTrips: {
                    // Include trips where user is driver
                    include: {
                        vehicle: true,
                        participations: true,
                    },
                },
            },
        });
        return user;
    } catch (error) {
        console.error("Database query error:", error);
        throw new Error(
            "Erreur lors de la récupération des données utilisateur"
        );
    } finally {
        await prisma.$disconnect();
    }
};
```

### Frontend Patterns

#### 1. Vue 3 Composition API Component Structure

```vue
<!-- components/UserProfile.vue -->
<template>
    <div class="user-profile">
        <h2>{{ user?.pseudo || "Utilisateur" }}</h2>
        <p v-if="isLoggedIn">Email: {{ user?.email }}</p>
        <button v-if="isLoggedIn" @click="logout" class="btn btn-primary">
            Déconnexion
        </button>
    </div>
</template>

<script setup>
import { computed } from "vue";
import { useAuthStore } from "@/stores/auth";

// Reactive state management with Pinia
const authStore = useAuthStore();

// Computed properties for reactive data
const isLoggedIn = computed(() => authStore.isLoggedIn);
const user = computed(() => authStore.currentUser);

// Methods
const logout = async () => {
    try {
        await authStore.logout();
        // Redirect logic would go here
    } catch (error) {
        console.error("Logout error:", error);
    }
};
</script>

<style scoped>
.user-profile {
    /* Component-specific styles */
}
</style>
```

#### 2. API Service Layer Pattern

```javascript
// services/api.js - Centralized API configuration and error handling
import axios from "axios";

// Environment-aware API URL configuration
const getApiUrl = () => {
    // Priority: environment variable > development detection > production default
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    if (
        import.meta.env.MODE === "development" ||
        window.location.hostname === "localhost"
    ) {
        return "http://localhost:3000/api";
    }

    return "https://tp-ecoride-dwwm-production.up.railway.app/api";
};

const API_BASE_URL = getApiUrl();

// Axios instance configuration
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000, // 10 second timeout
});

// Request interceptor for JWT token injection
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("authToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized access
            localStorage.removeItem("authToken");
            localStorage.removeItem("user");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;
```

#### 3. Pinia Store Pattern for State Management

```javascript
// stores/auth.js - Authentication store with proper state management
import { defineStore } from "pinia";
import api from "@/services/api";

export const useAuthStore = defineStore("auth", {
    state: () => ({
        user: JSON.parse(localStorage.getItem("user") || "null"),
        token: localStorage.getItem("authToken"),
        isAuthenticated: !!localStorage.getItem("authToken"),
        loading: false,
        error: null,
    }),

    getters: {
        isLoggedIn: (state) => state.isAuthenticated,
        currentUser: (state) => state.user,
        userRole: (state) => state.user?.role || null,
        isLoading: (state) => state.loading,
        hasError: (state) => !!state.error,
    },

    actions: {
        // Login action with proper error handling
        async login(credentials) {
            this.loading = true;
            this.error = null;

            try {
                const response = await api.post("/users/login", credentials);
                const { user, token } = response.data;

                // Update state
                this.token = token;
                this.user = user;
                this.isAuthenticated = true;

                // Persist to localStorage
                localStorage.setItem("authToken", token);
                localStorage.setItem("user", JSON.stringify(user));

                return { success: true, user };
            } catch (error) {
                this.error =
                    error.response?.data?.message || "Erreur de connexion";
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Logout action
        async logout() {
            this.loading = true;

            try {
                // Optional: Call logout endpoint
                // await api.post('/users/logout')

                // Clear state
                this.user = null;
                this.token = null;
                this.isAuthenticated = false;
                this.error = null;

                // Clear localStorage
                localStorage.removeItem("authToken");
                localStorage.removeItem("user");
            } catch (error) {
                console.error("Logout error:", error);
            } finally {
                this.loading = false;
            }
        },

        // Load user profile from localStorage
        loadUserFromStorage() {
            const userData = localStorage.getItem("user");
            const token = localStorage.getItem("authToken");

            if (userData && token) {
                this.user = JSON.parse(userData);
                this.token = token;
                this.isAuthenticated = true;
            }
        },
    },
});
```

## Development Workflows

### Backend Development Workflow

```bash
# Development server with auto-reload
npm run dev

# Production server
npm start

# Database operations
npm run db:create    # Initialize database structure
npm run mongo:check  # Verify MongoDB connectivity
npm run test:full    # Execute complete test suite
```

### Frontend Development Workflow

```bash
# Development server with hot reload
npm run dev

# Production build optimization
npm run build

# Preview production build
npm run preview

# Code quality checks
npm run lint         # ESLint + Prettier
npm run test:unit    # Vitest unit tests
npm run test:e2e     # Playwright E2E tests
```

### Database Management Workflow

```bash
# Prisma schema management (automatic on dev start)
npx prisma generate  # Generate Prisma client
npx prisma db push   # Apply schema changes to database

# MongoDB connectivity tests
npm run mongo:test   # Basic connectivity test
npm run mongo:quick  # Fast connection verification
```

## Project Structure & File Organization

### Backend Directory Structure

```
Backend/
├── Config/
│   ├── db.js              # MySQL database configuration
│   └── mongodb.js         # MongoDB connection setup
├── controllers/           # Business logic layer
│   ├── userController.js
│   ├── carpoolingController.js
│   └── creditsController.js
├── routes/               # API endpoint definitions
│   ├── userRoutes.js
│   ├── carpoolingRoutes.js
│   └── creditsRoutes.js
├── models/               # Data models (MongoDB)
│   └── Review.js
├── middlewares/          # Custom middleware functions
│   ├── validate.js       # Zod validation middleware
│   └── authMiddleware.js # JWT authentication
├── validators/           # Input validation schemas
│   ├── userValidator.js
│   └── authValidator.js
├── utils/                # Utility functions
│   ├── emailValidator.js
│   └── passwordValidator.js
├── prisma/
│   └── schema.prisma     # Database schema definition
├── scripts/              # Development and testing scripts
│   ├── testAPI.js
│   ├── runAllTests.js
│   └── checkMongoDB.js
└── server.js             # Application entry point
```

### Frontend Directory Structure

```
Frontend/
├── public/               # Static assets
├── src/
│   ├── views/            # Page components
│   │   ├── HomeView.vue
│   │   ├── LoginView.vue
│   │   └── AdminView.vue
│   ├── components/       # Reusable UI components
│   │   ├── GlassButton.vue
│   │   └── CustomModal.vue
│   ├── stores/           # Pinia state management
│   │   └── auth.js       # Authentication store
│   ├── services/         # API communication layer
│   │   ├── api.js        # Main API service
│   │   └── mongoServices.js
│   ├── composables/      # Vue composables
│   │   └── useModal.js
│   ├── router/           # Route definitions
│   │   └── index.js
│   ├── assets/           # Static resources
│   └── utils/            # Frontend utilities
├── tests/                # Test files
└── vite.config.js        # Build configuration
```

## Environment Configuration

### Backend Environment Variables (.env)

```bash
# Database Configuration
DATABASE_URL="mysql://username:password@localhost:3306/ecoride_db"
MONGODB_URI="mongodb://localhost:27017/ecoride_reviews"

# Security Configuration
JWT_SECRET="your-256-bit-secret-key-here"
JWT_EXPIRATION="1h"
BCRYPT_SALT_ROUNDS=10

# Server Configuration
PORT=3000
NODE_ENV="development"

# CORS Configuration
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:5174"
```

### Frontend Environment Variables (.env.local)

```bash
# API Configuration
VITE_API_URL=http://localhost:3000/api

# Application Configuration
VITE_APP_NAME="EcoRide"
VITE_APP_VERSION="1.0.0"
```

## Testing Strategy

### Backend Testing Approach

-   **API Integration Tests**: `scripts/testAPI.js` - End-to-end API validation
-   **Database Tests**: `scripts/testMongoDB.js` - MongoDB connectivity and operations
-   **Full Test Suite**: `scripts/runAllTests.js` - Comprehensive test execution
-   **Search Functionality**: `scripts/testAdvancedSearch.js` - Advanced search features

### Frontend Testing Approach

-   **Unit Tests**: Vitest framework for component testing
-   **End-to-End Tests**: Playwright for complete user journey testing
-   **Code Quality**: ESLint and Prettier for consistent code formatting

## Security Best Practices

### Authentication & Authorization

-   JWT tokens with expiration (1 hour default)
-   Password hashing with bcrypt (10 salt rounds)
-   Role-based access control (Admin, Driver, Passenger)
-   Secure token storage in localStorage with automatic cleanup

### Input Validation & Sanitization

-   Zod schema validation for all user inputs
-   Email format validation and normalization
-   Password strength requirements
-   SQL injection prevention through Prisma ORM

### CORS Configuration

```javascript
// server.js - CORS security configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, etc.)
        if (!origin) return callback(null, true);

        // Validate against allowed origins
        const allowedOrigins = [
            "http://localhost:5173", // Development frontend
            "http://localhost:5174", // Alternative dev port
            "https://ecoridetp.netlify.app", // Production frontend
        ];

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
```

## Code Quality Standards

### Backend Standards

-   **ESLint**: Code linting for JavaScript best practices
-   **Prettier**: Automatic code formatting
-   **TypeScript**: Type checking for critical components
-   **Error Handling**: Consistent error responses and logging
-   **Documentation**: JSDoc comments for functions and classes

### Frontend Standards

-   **ESLint**: Vue.js specific linting rules
-   **Prettier**: Consistent code formatting
-   **Vue 3 Best Practices**: Composition API patterns
-   **Accessibility**: WCAG guidelines compliance
-   **Performance**: Lazy loading and code splitting

## Deployment & Production

### Frontend Deployment (Netlify)

-   **URL**: https://ecoridetp.netlify.app/
-   **Build Command**: `npm run build`
-   **Publish Directory**: `dist`
-   **Environment Variables**: Configured in Netlify dashboard

### Backend Deployment (Railway)

-   **Runtime**: Node.js application
-   **Database**: MySQL database service
-   **Environment**: Production environment variables
-   **Monitoring**: Railway application logs

### Database Deployment

-   **MySQL**: Aiven MySQL service
-   **MongoDB**: MongoDB Atlas cloud service
-   **Backup**: Automatic database backups
-   **Migration**: Prisma migration scripts for schema updates

## Getting Started Guide

### Prerequisites

-   Node.js (v18 or higher)
-   MySQL Server (local or cloud)
-   MongoDB (local or Atlas)
-   Git for version control

### Initial Setup

```bash
# 1. Clone the repository
git clone https://github.com/2umish8/TP-EcoRide-DWWM.git
cd TP-EcoRide-DWWM

# 2. Backend setup
cd Backend
npm install

# 3. Frontend setup
cd ../Frontend
npm install
```

### Database Configuration

```bash
# MySQL database initialization
mysql -u root -p < Backend/Database/creation_base_de_donnees.sql
mysql -u root -p < Backend/Database/insertion_donnees.sql

# Environment configuration
cp Backend/.env.example Backend/.env
cp Frontend/.env.example Frontend/.env.local
```

### Development Startup

```bash
# Terminal 1: Backend server
cd Backend && npm run dev

# Terminal 2: Frontend development server
cd Frontend && npm run dev
```

### Testing

```bash
# Backend tests
cd Backend && npm run test:full

# Frontend tests
cd Frontend && npm run test:unit
```

## Test Accounts for Development

| Role          | Username | Password   | Access Level              |
| ------------- | -------- | ---------- | ------------------------- |
| Administrator | Admin    | Admin2025! | Full system access        |
| Driver        | test     | Test2025!  | Create trips, participate |
| Passenger     | user     | User2025!  | Participate in trips      |

## Educational Objectives & Learning Outcomes

This project serves as a comprehensive learning experience covering:

### Technical Skills Development

-   **Full-Stack Development**: Integration of frontend and backend technologies
-   **Database Design**: Relational (MySQL) and NoSQL (MongoDB) database management
-   **API Development**: RESTful API design and implementation
-   **Authentication & Security**: JWT implementation and security best practices
-   **Modern Frameworks**: Vue.js 3, Node.js, Express.js proficiency

### Professional Practices

-   **Version Control**: Git workflow and collaborative development
-   **Testing Strategy**: Unit testing, integration testing, and E2E testing
-   **Code Quality**: Linting, formatting, and code review processes
-   **Documentation**: Technical documentation and API specifications
-   **Deployment**: Cloud deployment and environment management

### Industry Standards

-   **Agile Development**: Iterative development and feature implementation
-   **Security Standards**: OWASP compliance and secure coding practices
-   **Performance Optimization**: Database optimization and frontend performance
-   **Scalability**: Architecture design for future growth

This documentation ensures consistent development practices and serves as a reference for maintaining high-quality, professional standards throughout the project lifecycle.

## Common Development Tasks

### Adding a New API Endpoint

1. Create/update controller function in appropriate controller file
2. Add Zod validation schema in validators directory
3. Create/update route in routes directory
4. Test endpoint with API testing scripts
5. Update API documentation

### Adding a New Frontend Component

1. Create component file in src/components directory
2. Implement using Vue 3 Composition API
3. Add component to appropriate view or layout
4. Style with Bootstrap classes and custom CSS
5. Test component functionality

### Database Schema Changes

1. Update Prisma schema in `prisma/schema.prisma`
2. Generate new Prisma client: `npx prisma generate`
3. Create and run migration: `npx prisma db push`
4. Update related controllers and validators
5. Test database operations

This documentation serves as a comprehensive guide for developers working on the EcoRide project, ensuring consistency in code quality, architecture patterns, and development practices throughout the application lifecycle.

// Protected routes with auth middleware
router.get("/profile", authMiddleware, getUserProfile);

````

#### 3. Zod Validation Schemas
```javascript
// validators/userValidator.js - Comprehensive validation
const createUserSchema = z.object({
    pseudo: z.string().min(3).max(50),
    email: z.string().email(),
    password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/)
});
````

#### 4. Database Operations

```javascript
// Use Prisma Client for MySQL operations
const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: { roles: true },
});
```

### Frontend Patterns

#### 1. Component Structure

```vue
<script setup>
import { computed } from "vue";
import { useAuthStore } from "@/stores/counter";

const authStore = useAuthStore();
const isLoggedIn = computed(() => authStore.isLoggedIn);
</script>

<template>
    <!-- Component template -->
</template>
```

#### 2. API Service Pattern

```javascript
// services/api.js - Centralized API configuration
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
});

// Automatic JWT token injection
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("authToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});
```

#### 3. Pinia Store Pattern

```javascript
// stores/counter.js - Auth store example
export const useAuthStore = defineStore("auth", {
    state: () => ({
        user: JSON.parse(localStorage.getItem("user") || "null"),
        token: localStorage.getItem("authToken"),
    }),

    actions: {
        login(user, token) {
            this.token = token;
            this.user = user;
            localStorage.setItem("authToken", token);
            localStorage.setItem("user", JSON.stringify(user));
        },
    },
});
```

## Development Workflows

### Backend Development

```bash
# Development with auto-reload
npm run dev

# Production build
npm start

# Database operations
npm run db:create    # Setup database
npm run mongo:check  # Check MongoDB connection
npm run test:full    # Run all tests
```

### Frontend Development

```bash
# Development server
npm run dev

# Production build
npm run build

# Testing
npm run test:unit    # Vitest unit tests
npm run test:e2e     # Playwright E2E tests
npm run lint         # ESLint + Prettier
```

### Database Management

```bash
# Prisma operations (automatic on dev start)
npx prisma generate
npx prisma db push

# MongoDB operations
npm run mongo:test
npm run mongo:quick
```

## Key Files & Directories

### Backend Structure

-   `controllers/` - Business logic (userController.js, carpoolingController.js)
-   `routes/` - API endpoints (userRoutes.js, carpoolingRoutes.js)
-   `models/` - Data models (Review.js for MongoDB)
-   `middlewares/` - Custom middleware (validate.js, authMiddleware.js)
-   `validators/` - Zod schemas (userValidator.js, authValidator.js)
-   `utils/` - Helper functions (emailValidator.js, passwordValidator.js)
-   `prisma/schema.prisma` - Database schema
-   `scripts/` - Testing and utility scripts

### Frontend Structure

-   `src/views/` - Page components (HomeView.vue, LoginView.vue)
-   `src/components/` - Reusable components (GlassButton.vue, CustomModal.vue)
-   `src/stores/` - Pinia stores (counter.js for auth)
-   `src/services/` - API services (api.js, mongoServices.js)
-   `src/composables/` - Vue composables (useModal.js)
-   `src/router/` - Route definitions

## Environment Configuration

### Backend (.env)

```bash
# Database
DATABASE_URL="mysql://user:pass@localhost:3306/ecoride_db"
MONGODB_URI="mongodb://localhost:27017/ecoride_reviews"

# Security
JWT_SECRET="your-secret-key"
BCRYPT_SALT_ROUNDS=10

# Server
PORT=3000
```

### Frontend (.env.local)

```bash
VITE_API_URL=http://localhost:3000/api
```

## Testing Strategy

### Backend Testing

-   **API Tests**: `scripts/testAPI.js` - End-to-end API validation
-   **MongoDB Tests**: `scripts/testMongoDB.js` - Database connectivity
-   **Full Suite**: `scripts/runAllTests.js` - Complete test execution
-   **Search Tests**: `scripts/testAdvancedSearch.js` - Search functionality

### Frontend Testing

-   **Unit Tests**: Vitest for component testing
-   **E2E Tests**: Playwright for user journey testing
-   **Linting**: ESLint + Prettier for code quality

## Common Patterns

### Error Handling

```javascript
// Backend - Consistent error responses
try {
    // operation
} catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
}
```

### Authentication Flow

```javascript
// Frontend - Store-based auth management
const authStore = useAuthStore();
await authStore.login(userData, token);
```

### Data Validation

```javascript
// Always use validated data from middleware
const { email, password } = req.validatedBody || req.body;
```

### Database Relations

```javascript
// Prisma - Include related data
const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
        roles: true,
        vehicles: true,
    },
});
```

## Deployment & Production

-   **Frontend**: Netlify deployment (`https://ecoridetp.netlify.app/`)
-   **Backend**: Railway deployment
-   **Database**: MySQL (Railway) + MongoDB Atlas
-   **Environment**: Separate configs for dev/prod

## Code Quality Standards

-   **Backend**: ESLint, Prettier, TypeScript checking
-   **Frontend**: ESLint, Prettier, Vue 3 best practices
-   **Security**: Input validation, JWT auth, CORS configuration
-   **Performance**: Lazy loading, code splitting, database optimization

## Getting Started (New Developer)

1. **Setup Environment**:

    ```bash
    git clone <repo>
    cd Backend && npm install
    cd ../Frontend && npm install
    ```

2. **Configure Databases**:

    ```bash
    # MySQL setup
    mysql -u root -p < Backend/Database/creation_base_de_donnees.sql
    mysql -u root -p < Backend/Database/insertion_donnees.sql

    # Environment variables
    cp Backend/.env.example Backend/.env
    cp Frontend/.env.example Frontend/.env.local
    ```

3. **Start Development**:

    ```bash
    # Terminal 1: Backend
    cd Backend && npm run dev

    # Terminal 2: Frontend
    cd Frontend && npm run dev
    ```

4. **Run Tests**:
    ```bash
    cd Backend && npm run test:full
    cd ../Frontend && npm run test:unit
    ```

## Test Accounts

-   **Admin**: Admin / Admin2025!
-   **User**: test / Test2025!</content>
    <parameter name="filePath">c:\Users\umisc\OneDrive\Documents\ECF\TP-EcoRide-DWWM\.github\copilot-instructions.md
