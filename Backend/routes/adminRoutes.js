const express = require("express");
const router = express.Router();

// Importer les fonctions du contrôleur
const {
    getPlatformStats,
    getAllUsers,
    toggleUserSuspension,
    manageUserRoles,
    getAllCarpoolings,
    adminCancelCarpooling,
} = require("../controllers/adminController");

// Importer les middlewares d'authentification
const { authMiddleware, requireRole } = require("../authMiddleware");

// Routes d'administration (nécessitent le rôle administrateur ou employe)
router.get(
    "/stats",
    authMiddleware,
    requireRole(["administrateur", "employe"]),
    getPlatformStats
);
router.get(
    "/users",
    authMiddleware,
    requireRole(["administrateur", "employe"]),
    getAllUsers
);
router.put(
    "/users/:id/suspension",
    authMiddleware,
    requireRole(["administrateur", "employe"]),
    toggleUserSuspension
);
router.put(
    "/users/:id/roles",
    authMiddleware,
    requireRole(["administrateur"]),
    manageUserRoles
);
router.get(
    "/carpoolings",
    authMiddleware,
    requireRole(["administrateur", "employe"]),
    getAllCarpoolings
);
router.post(
    "/carpoolings/:id/cancel",
    authMiddleware,
    requireRole(["administrateur", "employe"]),
    adminCancelCarpooling
);

module.exports = router;
