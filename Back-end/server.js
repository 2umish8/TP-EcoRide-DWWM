// Importer Express
const express = require("express");
// Importer et configurer dotenv pour les variables d'environnement
require("dotenv").config();
// Importer la connexion à la base de données
const db = require("./Config/db.js"); // Importer la connexion à la base de données
// Importer le middleware d'authentification
const authMiddleware = require("./authMiddleware.js");
// Importer les routes des utilisateurs
const userRoutes = require("./routes/userRoutes");
// Importer cors pour gérer les requêtes cross-origin
const cors = require("cors");

// Créer l'application Express
const app = express();
const PORT = process.env.PORT || 3000;
// Utiliser cors pour permettre les requêtes cross-origin
app.use(cors());

// Middleware pour permettre à Express de traiter les données JSON
app.use(express.json());

/* ****************************************************************************************************************** */
/*                                                     UTILISATEUR                                                    */
/* ****************************************************************************************************************** */
// Utiliser les routes pour les utilisateurs
// Toutes les routes définies dans userRoutes.js seront préfixées par /api/users
app.use("/api/users", userRoutes);

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
