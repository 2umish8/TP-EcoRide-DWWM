// Importer Express
const express = require("express");
// Importer bcrypt pour le hachage de mot de passe
const bcrypt = require("bcrypt");
// Importer et configurer dotenv pour les variables d'environnement
require("dotenv").config();
// Importer la connexion à la base de données
const db = require("./Config/db.js"); // Importer la connexion à la base de données
// Importer jsonwebtoken pour la génération de JWT
const jwt = require("jsonwebtoken");
// Importer le middleware d'authentification
const authMiddleware = require("./authMiddleware.js");
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
/* --------------------------------------------------- inscription -------------------------------------------------- */
app.post("/api/users/register", async (req, res) => {
    try {
        const { pseudo, email, password } = req.body;

        if (!pseudo || !email || !password) {
            return res
                .status(400)
                .json({ message: "Veuillez fournir toutes les informations." });
        }

        // Hachage du mot de passe
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
        const password_hash = await bcrypt.hash(password, saltRounds); // Utilise le nombre de tours de hachage configurable

        // Note: Le nom de la table dans le MCD est `USER` en majuscules.
        // Cependant, le MCD est uniquement utilisé pour le maquettage et la documentation.
        // Dans la base de données, la table est nommée `User` en PascalCase.

        // Insertion de l'utilisateur dans la base de données
        const sql =
            "INSERT INTO User (pseudo, email, password_hash) VALUES (?, ?, ?)";
        const [result] = await db.query(sql, [pseudo, email, password_hash]);
        if (result.affectedRows && result.affectedRows > 0) {
            // L'utilisateur est maintenant inscrit. Le client doit maintenant se connecter avec ses identifiants.
            res.status(201).json({
                message:
                    "Utilisateur créé avec succès ! Veuillez vous connecter avec vos identifiants.",
            });
        } else {
            res.status(500).json({
                message: "Erreur lors de la création de l'utilisateur.",
            });
        }
    } catch (error) {
        console.error(error);
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

/* --------------------------------------------------- connexion --------------------------------------------------- */
app.post("/api/users/login", async (req, res) => {
    try {
        // On attend un champ `identifier` qui peut être soit l'email, soit le pseudo.
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({
                message: "Veuillez fournir un identifiant et un mot de passe.",
            });
        }

        // Vérification de l'utilisateur dans la base de données par email ou pseudo
        const sql = "SELECT * FROM User WHERE email = ? OR pseudo = ?";
        const [rows] = await db.query(sql, [identifier, identifier]);

        // Si aucun utilisateur n'est trouvé, user sera undefined
        const [user] = rows;

        // Si aucun utilisateur n'est trouvé OU si le mot de passe est incorrect
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            // On renvoie la même erreur pour des raisons de sécurité (éviter l'énumération d'utilisateurs).
            return res
                .status(401)
                .json({ message: "Identifiant ou mot de passe incorrect." });
        }

        // Générer un JWT token
        const token = jwt.sign(
            { id: user.id, pseudo: user.pseudo, email: user.email },
            process.env.JWT_SECRET || "default_secret",
            { expiresIn: "1h" }
        );
        res.status(200).json({ message: "Connexion réussie !", token });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur lors de la connexion.",
        });
    }
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
