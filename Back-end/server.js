// Importer Express
const express = require("express");
// Importer la connexion à la base de données
const db = require("./Config/db.js"); // Importer la connexion à la base de données

// Créer l'application Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour permettre à Express de traiter les données JSON
app.use(express.json());

// --- ROUTE POUR L'INSCRIPTION ---
app.post("/api/users/register", async (req, res) => {
    try {
        const { pseudo, email, password } = req.body;

        // Note : Il manquera ici l'étape de hachage du mot de passe (avec bcrypt)
        // Mais pour un premier test, on avance.
        if (!pseudo || !email || !password) {
            return res
                .status(400)
                .json({ message: "Veuillez fournir toutes les informations." });
        }

        const sql =
            "INSERT INTO User (pseudo, email, password_hash) VALUES (?, ?, ?)";
        // Pour l'instant, on stocke le mot de passe en clair. À CHANGER pour le hash !
        await db.query(sql, [pseudo, email, password]);

        res.status(201).json({ message: "Utilisateur créé avec succès !" });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur lors de la création de l'utilisateur.",
        });
    }
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
