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

// Routes d'administration (nécessitent le rôle admin ou employe)
router.get(
    "/stats",
    authMiddleware,
    requireRole(["admin", "employe"]),
    getPlatformStats
);
router.get(
    "/users",
    authMiddleware,
    requireRole(["admin", "employe"]),
    getAllUsers
);
router.put(
    "/users/:id/suspension",
    authMiddleware,
    requireRole(["admin", "employe"]),
    toggleUserSuspension
);
router.put(
    "/users/:id/roles",
    authMiddleware,
    requireRole(["admin"]),
    manageUserRoles
);
router.get(
    "/carpoolings",
    authMiddleware,
    requireRole(["admin", "employe"]),
    getAllCarpoolings
);
router.post(
    "/carpoolings/:id/cancel",
    authMiddleware,
    requireRole(["admin", "employe"]),
    adminCancelCarpooling
);

module.exports = router;
