// Importer Express
const express = require("express");
// Importer bcrypt pour le hachage de mot de passe
const bcrypt = require("bcrypt");
// Importer et configurer dotenv pour les variables d'environnement
require("dotenv").config();
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

        if (!pseudo || !email || !password) {
            return res
                .status(400)
                .json({ message: "Veuillez fournir toutes les informations." });
        }

        // Hachage du mot de passe
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Note: Le nom de la table dans le MCD est `USER` en majuscules.
        // Cependant, le MCD est uniquement utilisé pour le maquettage et la documentation.
        // Dans la base de données, la table est nommée `User` en PascalCase.

        // Insertion de l'utilisateur dans la base de données
        const sql =
            "INSERT INTO User (pseudo, email, password_hash) VALUES (?, ?, ?)";

        await db.query(sql, [pseudo, email, password_hash]);

        res.status(201).json({ message: "Utilisateur créé avec succès !" });
    } catch (error) {
        console.error(error);
        // Gestion d'erreur plus spécifique
        // 'ER_DUP_ENTRY' est le code d'erreur MySQL pour une entrée dupliquée.
        if (error.code === "ER_DUP_ENTRY") {
            return res
                .status(409)
                .json({ message: "L'email ou le pseudo existe déjà." });
        }

        res.status(500).json({
            message: "Erreur lors de la création de l'utilisateur.",
        });
    }
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
