const express = require("express");
const router = express.Router();

// Importer les fonctions du contrôleur
const {
    registerUser,
    loginUser,
    becomeDriver,
    getUserProfile,
    updateUserProfile,
    changePassword,
} = require("../controllers/userController");
// Importer les middlewares d'authentification
const { authMiddleware, requireRole } = require("../authMiddleware");

// Routes publiques (sans authentification)
router.post("/register", registerUser);
router.post("/login", loginUser);

// Routes protégées (nécessitent une authentification)
router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, updateUserProfile);
router.post("/change-password", authMiddleware, changePassword);
router.post("/become-driver", authMiddleware, becomeDriver);

module.exports = router;
