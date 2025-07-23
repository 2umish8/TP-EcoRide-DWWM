const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../Config/db.js");
const { validateAndNormalizeEmail } = require("../utils/emailValidator.js");
const {
    validatePassword,
    getPasswordErrorMessage,
} = require("../utils/passwordValidator.js");

/* --------------------------------------------------- inscription -------------------------------------------------- */
const registerUser = async (req, res) => {
    try {
        const { pseudo, email, password } = req.body;

        if (!pseudo || !email || !password) {
            return res
                .status(400)
                .json({ message: "Veuillez fournir toutes les informations." });
        }

        // Validation du format d'email
        const emailValidation = validateAndNormalizeEmail(email);
        if (!emailValidation.isValid) {
            return res.status(400).json({
                message:
                    "Format d'email invalide. Veuillez saisir une adresse email valide (ex: utilisateur@exemple.com).",
            });
        }

        // Validation de la force du mot de passe
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                message: getPasswordErrorMessage(passwordValidation),
                errors: passwordValidation.errors,
                suggestions: passwordValidation.suggestions,
            });
        }

        // Utiliser l'email normalisé (minuscules, sans espaces)
        const normalizedEmail = emailValidation.normalizedEmail;

        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const sql =
            "INSERT INTO User (pseudo, email, password_hash) VALUES (?, ?, ?)";
        const [result] = await db.query(sql, [
            pseudo,
            normalizedEmail,
            passwordHash,
        ]);

        if (result.affectedRows && result.affectedRows > 0) {
            // Attribuer le rôle "passager" par défaut
            const userId = result.insertId;
            const roleSql =
                "INSERT INTO User_Role (user_id, role_id) VALUES (?, (SELECT id FROM Role WHERE name = 'passager'))";
            await db.query(roleSql, [userId]);

            res.status(201).json({
                message:
                    "Utilisateur créé avec succès ! Veuillez vous connecter avec vos identifiants.",
                user: {
                    id: userId,
                    pseudo: pseudo,
                    email: normalizedEmail,
                },
            });
        } else {
            res.status(500).json({
                message: "Erreur lors de la création de l'utilisateur.",
            });
        }
    } catch (error) {
        console.error(error);
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Un compte avec cet email ou ce pseudo existe déjà.",
            });
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

        // Récupérer les rôles de l'utilisateur
        const rolesSql = `
            SELECT r.name 
            FROM Role r 
            INNER JOIN User_Role ur ON r.id = ur.role_id 
            WHERE ur.user_id = ?
        `;
        const [rolesResult] = await db.query(rolesSql, [user.id]);
        const roles = rolesResult.map((row) => row.name);

        const token = jwt.sign(
            {
                id: user.id,
                pseudo: user.pseudo,
                email: user.email,
                roles: roles,
                credits: user.credits,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        res.status(200).json({
            message: "Connexion réussie !",
            token,
            user: {
                id: user.id,
                pseudo: user.pseudo,
                email: user.email,
                roles: roles,
                credits: user.credits,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la connexion." });
    }
};

/* --------------------------------------------------- gestion des rôles -------------------------------------------- */
// Devenir chauffeur (ajouter le rôle chauffeur)
const becomeDriver = async (req, res) => {
    try {
        const userId = req.user.id;

        // Vérifier si l'utilisateur a déjà le rôle chauffeur
        const checkSql = `
            SELECT 1 FROM User_Role ur 
            INNER JOIN Role r ON ur.role_id = r.id 
            WHERE ur.user_id = ? AND r.name = 'chauffeur'
        `;
        const [existing] = await db.query(checkSql, [userId]);

        if (existing.length > 0) {
            return res
                .status(400)
                .json({ message: "Vous êtes déjà chauffeur." });
        }

        // Ajouter le rôle chauffeur
        const sql =
            "INSERT INTO User_Role (user_id, role_id) VALUES (?, (SELECT id FROM Role WHERE name = 'chauffeur'))";
        await db.query(sql, [userId]);

        res.status(200).json({
            message:
                "Vous êtes maintenant chauffeur ! Vous pouvez ajouter vos véhicules.",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur lors de l'ajout du rôle chauffeur.",
        });
    }
};

// Obtenir le profil utilisateur avec ses rôles
const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        // Récupérer les informations utilisateur
        const userSql =
            "SELECT id, pseudo, email, credits, profile_picture_url, creation_date FROM User WHERE id = ?";
        const [[user]] = await db.query(userSql, [userId]);

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        // Récupérer les rôles
        const rolesSql = `
            SELECT r.name 
            FROM Role r 
            INNER JOIN User_Role ur ON r.id = ur.role_id 
            WHERE ur.user_id = ?
        `;
        const [rolesResult] = await db.query(rolesSql, [userId]);
        const roles = rolesResult.map((row) => row.name);

        res.status(200).json({
            user: {
                ...user,
                roles: roles,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur lors de la récupération du profil.",
        });
    }
};

/* --------------------------------------------------- Mettre à jour le profil -------------------------------------- */
const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { pseudo, email, profile_picture_url } = req.body;

        // Construire la requête de mise à jour dynamiquement
        const updates = [];
        const values = [];

        if (pseudo !== undefined) {
            updates.push("pseudo = ?");
            values.push(pseudo);
        }
        if (email !== undefined) {
            // Validation du format d'email si l'email est fourni
            const emailValidation = validateAndNormalizeEmail(email);
            if (!emailValidation.isValid) {
                return res.status(400).json({
                    message:
                        "Format d'email invalide. Veuillez saisir une adresse email valide (ex: utilisateur@exemple.com).",
                });
            }
            updates.push("email = ?");
            values.push(emailValidation.normalizedEmail);
        }
        if (profile_picture_url !== undefined) {
            updates.push("profile_picture_url = ?");
            values.push(profile_picture_url);
        }

        if (updates.length === 0) {
            return res
                .status(400)
                .json({ message: "Aucune donnée à mettre à jour." });
        }

        values.push(userId);
        const updateSql = `UPDATE User SET ${updates.join(", ")} WHERE id = ?`;
        const [result] = await db.query(updateSql, values);

        if (result.affectedRows > 0) {
            res.status(200).json({
                message: "Profil mis à jour avec succès !",
            });
        } else {
            res.status(500).json({
                message: "Erreur lors de la mise à jour du profil.",
            });
        }
    } catch (error) {
        console.error(error);
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Ce pseudo ou cet email est déjà utilisé.",
            });
        }
        res.status(500).json({
            message: "Erreur lors de la mise à jour du profil.",
        });
    }
};

/* --------------------------------------------------- Changer le mot de passe ----------------------------------- */
const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message:
                    "Veuillez fournir l'ancien et le nouveau mot de passe.",
            });
        }

        // Validation de la force du nouveau mot de passe
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                message: getPasswordErrorMessage(passwordValidation),
                errors: passwordValidation.errors,
                suggestions: passwordValidation.suggestions,
            });
        }

        // Récupérer le mot de passe actuel
        const userSql = "SELECT password_hash FROM User WHERE id = ?";
        const [[user]] = await db.query(userSql, [userId]);

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        // Vérifier l'ancien mot de passe
        const isCurrentPasswordValid = await bcrypt.compare(
            currentPassword,
            user.password_hash
        );
        if (!isCurrentPasswordValid) {
            return res
                .status(400)
                .json({ message: "Mot de passe actuel incorrect." });
        }

        // Hasher le nouveau mot de passe
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
        const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

        // Mettre à jour le mot de passe
        const [result] = await db.query(
            "UPDATE User SET password_hash = ? WHERE id = ?",
            [newPasswordHash, userId]
        );

        if (result.affectedRows > 0) {
            res.status(200).json({
                message: "Mot de passe changé avec succès !",
            });
        } else {
            res.status(500).json({
                message: "Erreur lors du changement de mot de passe.",
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur lors du changement de mot de passe.",
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    becomeDriver,
    getUserProfile,
    updateUserProfile,
    changePassword,
};
