const express = require("express");
const router = express.Router();

// Importer les fonctions du contrôleur
const {
    getUserCredits,
    getTransactionHistory,
    purchaseCredits,
    getFinancialStats,
    transferCredits,
} = require("../controllers/creditsController");

// Importer les middlewares d'authentification
const { authMiddleware } = require("../authMiddleware");

// Routes protégées (nécessitent une authentification)
router.get("/balance", authMiddleware, getUserCredits);
router.get("/history", authMiddleware, getTransactionHistory);
router.get("/transactions", authMiddleware, getTransactionHistory); // Alias pour le front-end
router.post("/purchase", authMiddleware, purchaseCredits);
router.get("/stats", authMiddleware, getFinancialStats);
router.post("/transfer", authMiddleware, transferCredits);

module.exports = router;
