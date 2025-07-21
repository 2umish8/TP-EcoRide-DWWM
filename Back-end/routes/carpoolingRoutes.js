const express = require("express");
const router = express.Router();

// Importer les fonctions du contrôleur
const {
    createCarpooling,
    getAvailableCarpoolings,
    getDriverCarpoolings,
    updateCarpooling,
    cancelCarpooling,
    startCarpooling,
    finishCarpooling,
} = require("../controllers/carpoolingController");

// Importer les middlewares d'authentification
const { authMiddleware, requireRole } = require("../authMiddleware");

// Routes publiques
router.get("/available", getAvailableCarpoolings); // Recherche de covoiturages

// Routes protégées
router.post("/", authMiddleware, requireRole(["chauffeur"]), createCarpooling);
router.get("/my-carpoolings", authMiddleware, getDriverCarpoolings);
router.put("/:id", authMiddleware, updateCarpooling);
router.post("/:id/cancel", authMiddleware, cancelCarpooling);
router.post("/:id/start", authMiddleware, startCarpooling);
router.post("/:id/finish", authMiddleware, finishCarpooling);

module.exports = router;
