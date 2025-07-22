require("dotenv").config();
const express = require("express");
const {
    getAvailableCarpoolings,
} = require("./controllers/carpoolingController");

const app = express();

// Middleware
app.use(express.json());

// Route de test
app.get("/test-available", getAvailableCarpoolings);

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🧪 Serveur de test démarré sur le port ${PORT}`);
    console.log(`📍 Testez: http://localhost:${PORT}/test-available`);
});
