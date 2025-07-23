const express = require("express");
const router = express.Router();

// Importer les fonctions du contrôleur
const {
    addVehicle,
    getUserVehicles,
    updateVehicle,
    deleteVehicle,
    getBrandsAndColors,
} = require("../controllers/vehicleController");

// Importer les middlewares d'authentification
const { authMiddleware, requireRole } = require("../authMiddleware");

// Routes pour les véhicules (toutes nécessitent une authentification)
router.post("/", authMiddleware, requireRole(["chauffeur"]), addVehicle);
router.get("/my-vehicles", authMiddleware, getUserVehicles);
router.put("/:id", authMiddleware, updateVehicle);
router.delete("/:id", authMiddleware, deleteVehicle);

// Route publique pour obtenir les marques et couleurs disponibles
router.get("/brands-colors", getBrandsAndColors);

module.exports = router;
