// Importer Express
const express = require("express");
// Importer et configurer dotenv pour les variables d'environnement
// Charge automatiquement depuis Backend/.env (ou Backend/.env.local en développement)
require("dotenv").config();
// Importer la connexion à la base de données MySQL
const db = require("./Config/db.js");
// Importer la connexion à MongoDB
const connectMongoDB = require("./Config/mongodb.js");
// Importer le middleware d'authentification
const { authMiddleware, requireRole, requireAnyRole } = require("./authMiddleware.js");
// Importer les routes des utilisateurs
const userRoutes = require("./routes/userRoutes");
// Importer les autres routes
const vehicleRoutes = require("./routes/vehicleRoutes");
const carpoolingRoutes = require("./routes/carpoolingRoutes");
const participationRoutes = require("./routes/participationRoutes");
const creditsRoutes = require("./routes/creditsRoutes");
const adminRoutes = require("./routes/adminRoutes");
// Importer les nouvelles routes MongoDB
const reviewRoutes = require("./routes/reviewRoutes");
const preferencesRoutes = require("./routes/preferencesRoutes");
// Importer les routes de recherche avancée
const searchRoutes = require("./routes/searchRoutes");
// Importer cors pour gérer les requêtes cross-origin
const cors = require("cors");
// Importer helmet pour sécuriser les en-têtes HTTP
const helmet = require("helmet");
// Importer express-rate-limit pour la limitation de débit
const rateLimit = require("express-rate-limit");

// Créer l'application Express
const app = express();
const PORT = process.env.PORT || 3000;

// Connecter à MongoDB
connectMongoDB();

app.use(helmet());

// Appliquer une limitation de débit globale à toutes les requêtes /api/*
// Relax limits in development/test to allow E2E testing
const isProduction = process.env.NODE_ENV === "production";
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isProduction ? 100 : 1000, // Production: 100 req/15min, Dev/Test: 1000 req/15min
    standardHeaders: true, // Retourne les informations de limite dans les en-têtes `RateLimit-*`
    legacyHeaders: false, // Désactive les en-têtes `X-RateLimit-*` (obsolètes)
    message: "Trop de requêtes envoyées depuis cette IP, veuillez réessayer après 15 minutes.",
});

app.use("/api", apiLimiter);

// Configurer CORS - Production et développement
const corsOptions = {
    origin: function (origin, callback) {
        // Permettre les requêtes sans origin (applications mobiles, etc.)
        if (!origin) return callback(null, true);

        // Liste des origines autorisées
        const allowedOrigins = [
            "http://localhost", // Docker nginx frontend on port 80
            "http://localhost:80", // Explicit port 80
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5175",
            "http://127.0.0.1",
            "http://127.0.0.1:80",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174",
            "http://127.0.0.1:5175",
            "https://ecoridetp.netlify.app", // Production frontend on Netlify
            // Ajouter d'autres domaines de production si nécessaire
        ];

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Middleware pour permettre à Express de traiter les données JSON
app.use(express.json());

/* ****************************************************************************************************************** */
/*                                                     ROUTES                                                         */
/* ****************************************************************************************************************** */
// Utiliser les routes pour les utilisateurs
// Toutes les routes définies dans userRoutes.js seront préfixées par /api/users
app.use("/api/users", userRoutes);

// Routes pour les véhicules
app.use("/api/vehicles", vehicleRoutes);

// Routes pour les covoiturages
app.use("/api/carpoolings", carpoolingRoutes);

// Routes pour les participations
app.use("/api/participations", participationRoutes);

// Routes pour les crédits
app.use("/api/credits", creditsRoutes);

// Routes d'administration
app.use("/api/admin", adminRoutes);

// Health check endpoint for Docker and monitoring
app.get("/api/health", async (req, res) => {
    try {
        // Test MySQL connection via Prisma
        const { PrismaClient } = require("@prisma/client");
        const prisma = new PrismaClient();
        await prisma.$queryRaw`SELECT 1`;
        await prisma.$disconnect();

        // Test MongoDB connection
        const mongoose = require("mongoose");
        const mongoStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";

        res.status(200).json({
            status: "ok",
            timestamp: new Date().toISOString(),
            database: "connected",
            mongodb: mongoStatus,
            version: process.env.npm_package_version || "1.0.0",
            environment: process.env.NODE_ENV || "development",
        });
    } catch (error) {
        console.error("Health check failed:", error);
        res.status(503).json({
            status: "error",
            timestamp: new Date().toISOString(),
            error: "Database connection failed",
        });
    }
});

// Routes MongoDB - Avis et préférences
app.use("/api/reviews", reviewRoutes);
app.use("/api/preferences", preferencesRoutes);

// Routes de recherche avancée
app.use("/api/search", searchRoutes);

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
