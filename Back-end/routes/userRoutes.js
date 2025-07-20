const express = require("express");
const router = express.Router();

// Importer les fonctions du contrôleur
const { registerUser, loginUser } = require("../controllers/userController");

// Définir les routes
router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;
