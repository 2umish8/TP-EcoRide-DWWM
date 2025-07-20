const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../Config/db.js");

/* --------------------------------------------------- inscription -------------------------------------------------- */
const registerUser = async (req, res) => {
    try {
        const { pseudo, email, password } = req.body;

        if (!pseudo || !email || !password) {
            return res
                .status(400)
                .json({ message: "Veuillez fournir toutes les informations." });
        }

        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        const sql =
            "INSERT INTO User (pseudo, email, password_hash) VALUES (?, ?, ?)";
        const [result] = await db.query(sql, [pseudo, email, password_hash]);

        if (result.affectedRows && result.affectedRows > 0) {
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
};

/* --------------------------------------------------- connexion --------------------------------------------------- */
const loginUser = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({
                message: "Veuillez fournir un identifiant et un mot de passe.",
            });
        }

        const sql = "SELECT * FROM User WHERE email = ? OR pseudo = ?";
        const [[user]] = await db.query(sql, [identifier, identifier]);

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res
                .status(401)
                .json({ message: "Identifiant ou mot de passe incorrect." });
        }

        const token = jwt.sign(
            { id: user.id, pseudo: user.pseudo, email: user.email },
            process.env.JWT_SECRET || "default_secret",
            { expiresIn: "1h" }
        );
        res.status(200).json({ message: "Connexion réussie !", token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la connexion." });
    }
};

module.exports = { registerUser, loginUser };
