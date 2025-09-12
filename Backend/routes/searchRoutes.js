const express = require("express");
const router = express.Router();

// Importer les fonctions avancées de recherche
const {
    getAvailableCarpoolingsAdvanced,
    getSearchStatistics,
} = require("../controllers/searchAdvanced");

// Routes pour la recherche avancée
router.get("/advanced", getAvailableCarpoolingsAdvanced); // Recherche avancée avec pagination et tri
router.get("/statistics", getSearchStatistics); // Statistiques de recherche

module.exports = router;
