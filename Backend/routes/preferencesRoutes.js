const express = require("express");
const router = express.Router();

// Importer les fonctions du contrôleur
const {
    createOrUpdatePreferences,
    getDriverPreferences,
    getMyPreferences,
    addCustomPreference,
    removeCustomPreference,
} = require("../controllers/preferencesController");

// Importer les middlewares d'authentification
const { authMiddleware, requireRole } = require("../authMiddleware");

// Routes publiques
router.get("/driver/:driverId", getDriverPreferences); // Voir les préférences d'un chauffeur

// Routes protégées (chauffeurs uniquement)
router.get(
    "/my-preferences",
    authMiddleware,
    requireRole(["chauffeur"]),
    getMyPreferences
);
router.post(
    "/",
    authMiddleware,
    requireRole(["chauffeur"]),
    createOrUpdatePreferences
);
router.put(
    "/",
    authMiddleware,
    requireRole(["chauffeur"]),
    createOrUpdatePreferences
);

// Gestion des préférences personnalisées
router.post(
    "/custom",
    authMiddleware,
    requireRole(["chauffeur"]),
    addCustomPreference
);
router.delete(
    "/custom/:preferenceId",
    authMiddleware,
    requireRole(["chauffeur"]),
    removeCustomPreference
);

module.exports = router;
