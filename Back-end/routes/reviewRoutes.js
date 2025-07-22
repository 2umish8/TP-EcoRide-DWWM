const express = require("express");
const router = express.Router();

// Importer les fonctions du contrôleur
const {
    createReview,
    getDriverReviews,
    getPendingReviews,
    validateReview,
    getReportedTrips,
} = require("../controllers/reviewController");

// Importer les middlewares d'authentification
const { authMiddleware, requireRole } = require("../authMiddleware");

// Routes publiques
router.get("/driver/:driverId", getDriverReviews); // Voir les avis d'un chauffeur

// Routes protégées (utilisateurs authentifiés)
router.post("/", authMiddleware, createReview); // Créer un avis

// Routes d'administration (employés et admins)
router.get(
    "/pending",
    authMiddleware,
    requireRole(["administrateur", "employe"]),
    getPendingReviews
);
router.put(
    "/:id/validate",
    authMiddleware,
    requireRole(["administrateur", "employe"]),
    validateReview
);
router.get(
    "/reported",
    authMiddleware,
    requireRole(["administrateur", "employe"]),
    getReportedTrips
);

module.exports = router;
