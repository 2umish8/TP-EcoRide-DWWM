# Environment Configuration Architecture

## Overview

EcoRide uses **separate `.env` files** for each service because they are deployed independently:

- **Backend** → Render (only Backend folder is deployed)
- **Frontend** → Netlify (only Frontend folder is deployed)
- **Local Development** → Two separate services

## File Structure

```
TP-EcoRide-DWWM/
├── Backend/
│   ├── .env                    ← Backend configuration (development)
│   ├── .env.example            ← Template for Backend
│   └── server.js               ← Loads Backend/.env
│
└── Frontend/
    ├── .env                    ← Default Frontend config
    ├── .env.local              ← Local development config (overrides .env)
    ├── .env.production         ← Production config
    ├── .env.example            ← Template for Frontend
    └── vite.config.js          ← Vite loads env files automatically
```

## Backend Configuration

**File:** `Backend/.env`

```bash
# Environment
NODE_ENV=development
PORT=3000

# Security
JWT_SECRET=your_secret
JWT_EXPIRATION=1h
BCRYPT_SALT_ROUNDS=10

# MySQL Database
DATABASE_URL="mysql://..."

# MongoDB
MONGODB_URI=mongodb://localhost:27017/ecoride_reviews
```

**How it's loaded:**
```javascript
// Backend/server.js
require("dotenv").config(); // Loads from Backend/.env (cwd is Backend/)
```

**In Production (Render):**
- Render sets environment variables in its dashboard
- Backend/.env is **not used** in production
- All vars come from Render's environment configuration

## Frontend Configuration

**Files:**
- `.env` - Default (rarely used)
- `.env.local` - Local development (overrides .env)
- `.env.production` - Production (used in `npm run build`)

**How Vite handles it:**
```javascript
// Frontend/src/services/api.js
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  // fallback logic...
}
```

Vite automatically loads `.env.local` in development and `.env.production` in production build.

**In Production (Netlify):**
- Netlify sets `VITE_API_URL` in Build settings
- `.env.production` is used as fallback
- The environment variable is injected at build time

## Local Development Setup

### For Backend

```bash
cd Backend
# Copy .env.example to .env
cp .env.example .env
# Edit .env with your local values
# Then:
npm run dev
```

Backend automatically reads `Backend/.env`

### For Frontend

```bash
cd Frontend
# Frontend reads from .env.local in development
# (.env.local is already configured for localhost:3000)
npm run dev
```

Vite automatically reads `Frontend/.env.local`

## Key Points

1. **No global `.env` at root** ✅
   - Each service has its own `.env`
   - Matches deployment architecture

2. **Explicit loading in Backend** ✅
   ```javascript
   require("dotenv").config(); // Loads cwd/.env
   ```

3. **Vite handles Frontend** ✅
   - Automatically loads `.env.local` (dev) or `.env.production` (prod)
   - No code changes needed

4. **Production is different** ✅
   - Backend: Environment variables from Render dashboard
   - Frontend: Build-time variables from Netlify settings

5. **Never commit `.env` files** ✅
   - They're in `.gitignore`
   - Use `.env.example` as templates

## Troubleshooting

**Backend loads wrong environment variables?**
- Verify you're in `Backend/` folder when running `npm run dev`
- Check that `Backend/.env` exists
- Ensure it has `MONGODB_URI=mongodb://localhost:27017/ecoride_reviews` for local dev

**Frontend can't connect to Backend?**
- Check `Frontend/.env.local` has `VITE_API_URL=http://localhost:3000/api`
- Verify Backend is running on port 3000

**Production variables not working?**
- **Render (Backend):** Check dashboard → Settings → Environment
- **Netlify (Frontend):** Check Site settings → Build & deploy → Environment
