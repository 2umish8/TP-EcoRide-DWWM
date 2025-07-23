const express = require("express");
const router = express.Router();

// Importer les fonctions du contrôleur
const {
    joinCarpooling,
    cancelParticipation,
    getUserParticipations,
    validateParticipation,
    getCarpoolingParticipants,
} = require("../controllers/participationController");

// Importer les middlewares d'authentification
const { authMiddleware } = require("../authMiddleware");

// Routes protégées (nécessitent une authentification)
router.post("/:id/join", authMiddleware, joinCarpooling);
router.post("/:id/cancel", authMiddleware, cancelParticipation);
router.get("/my-participations", authMiddleware, getUserParticipations);
router.post("/:id/validate", authMiddleware, validateParticipation);
router.get("/:id/participants", authMiddleware, getCarpoolingParticipants);

module.exports = router;
