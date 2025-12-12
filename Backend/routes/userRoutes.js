const express = require("express");
const router = express.Router();

// Importer les fonctions du contrôleur
const {
    registerUser,
    loginUser,
    becomeDriver,
    getUserProfile,
    getUserById,
    updateUserProfile,
    changePassword,
} = require("../controllers/userController");
// Importer les middlewares d'authentification
const { authMiddleware } = require("../authMiddleware");

// Routes publiques (sans authentification)
const { validateBody } = require("../middlewares/validate");
const { createUserSchema } = require("../validators/userValidator");
const {
    loginSchema,
    changePasswordSchema,
} = require("../validators/authValidator");

// Validation Zod pour la création d'utilisateur
router.post("/register", validateBody(createUserSchema), registerUser);
// Validation pour la connexion
router.post("/login", validateBody(loginSchema), loginUser);

// Routes protégées (nécessitent une authentification)
router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, updateUserProfile);
router.post(
    "/change-password",
    authMiddleware,
    validateBody(changePasswordSchema),
    changePassword
);
router.post("/become-driver", authMiddleware, becomeDriver);

// Route publique pour obtenir le profil d'un utilisateur par ID (doit être en dernier)
router.get("/:userId", getUserById);

module.exports = router;
