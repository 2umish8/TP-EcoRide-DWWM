// Importer Express
const express = require("express");
// Importer et configurer dotenv pour les variables d'environnement
require("dotenv").config();
// Importer la connexion à la base de données MySQL
const db = require("./Config/db.js");
// Importer la connexion à MongoDB
const connectMongoDB = require("./Config/mongodb.js");
// Importer le middleware d'authentification
const {
    authMiddleware,
    requireRole,
    requireAnyRole,
} = require("./authMiddleware.js");
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

// Créer l'application Express
const app = express();
const PORT = process.env.PORT || 3000;

// Connecter à MongoDB
connectMongoDB();

// Utiliser cors pour permettre les requêtes cross-origin
app.use(cors());

// Middleware pour permettre à Express de traiter les données JSON
app.use(express.json());

// Afficher les variables d'environnement
console.log("🚀 Démarrage de l'application...");
console.log("📋 Variables d'environnement:");
console.log("- PORT:", process.env.PORT);
console.log("- NODE_ENV:", process.env.NODE_ENV);
console.log("- MONGODB_URI:", process.env.MONGODB_URI ? "Définie" : "Manquante");
console.log("- DB_HOST:", process.env.DB_HOST);

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

// Routes MongoDB - Avis et préférences
app.use("/api/reviews", reviewRoutes);
app.use("/api/preferences", preferencesRoutes);

// Routes de recherche avancée
app.use("/api/search", searchRoutes);

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});

// Gestion des signaux d'arrêt
process.on('SIGTERM', () => {
    console.log('🛑 Signal SIGTERM reçu, arrêt gracieux...');
    app.close(() => {
        console.log('✅ Serveur arrêté proprement');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log(' Signal SIGINT reçu, arrêt gracieux...');
    app.close(() => {
        console.log('✅ Serveur arrêté proprement');
        process.exit(0);
    });
});

// Gestion des erreurs 404
app.use("*", (req, res) => {
    res.status(404).json({
        message: "Route non trouvée",
        path: req.originalUrl
    });
});

// Gestion globale des erreurs
app.use((error, req, res, next) => {
    console.error("Erreur serveur:", error);
    res.status(500).json({
        message: "Erreur interne du serveur"
    });
});
