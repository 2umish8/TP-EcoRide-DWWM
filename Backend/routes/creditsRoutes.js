const express = require("express");
const router = express.Router();

// Importer les fonctions du contrôleur
const {
    getUserCredits,
    getCreditHistory,
    purchaseCredits,
    getFinancialStats,
    transferCredits,
} = require("../controllers/creditsController");

// Importer les middlewares d'authentification
const { authMiddleware } = require("../authMiddleware");

// Routes protégées (nécessitent une authentification)
router.get("/balance", authMiddleware, getUserCredits);
router.get("/history", authMiddleware, getCreditHistory);
router.get("/transactions", authMiddleware, getCreditHistory); // Alias pour le frontend
router.post("/purchase", authMiddleware, purchaseCredits);
router.get("/stats", authMiddleware, getFinancialStats);
router.post("/transfer", authMiddleware, transferCredits);

module.exports = router;
