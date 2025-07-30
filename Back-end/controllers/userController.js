const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../Config/db.js");
const Review = require("../models/Review");
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
            "INSERT INTO user (pseudo, email, password_hash) VALUES (?, ?, ?)";
        const [result] = await db.query(sql, [
            pseudo,
            normalizedEmail,
            passwordHash,
        ]);

        if (result.affectedRows && result.affectedRows > 0) {
            // Attribuer le rôle "passager" par défaut
            const userId = result.insertId;
            const roleSql =
                "INSERT INTO user_role (user_id, role_id) VALUES (?, (SELECT id FROM role WHERE name = 'passager'))";
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

        const sql = "SELECT * FROM user WHERE email = ? OR pseudo = ?";
        const [[user]] = await db.query(sql, [identifier, identifier]);

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res
                .status(401)
                .json({ message: "Identifiant ou mot de passe incorrect." });
        }

        // Récupérer les rôles de l'utilisateur
        const rolesSql = `
            SELECT r.name 
            FROM role r 
            INNER JOIN user_role ur ON r.id = ur.role_id 
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
// Devenir chauffeur (ajouter le rôle chauffeur) - PROCESSUS STRICT
const becomeDriver = async (req, res) => {
    try {
        const userId = req.user.id;

        // Vérifier si l'utilisateur a déjà le rôle chauffeur
        const checkSql = `
            SELECT 1 FROM user_role ur 
            INNER JOIN role r ON ur.role_id = r.id 
            WHERE ur.user_id = ? AND r.name = 'chauffeur'
        `;
        const [existing] = await db.query(checkSql, [userId]);

        if (existing.length > 0) {
            return res
                .status(400)
                .json({ message: "Vous êtes déjà chauffeur." });
        }

        // Vérifier que l'utilisateur a au moins un véhicule
        const vehicleCheckSql =
            "SELECT COUNT(*) as count FROM vehicle WHERE owner_id = ?";
        const [[vehicleCount]] = await db.query(vehicleCheckSql, [userId]);

        if (vehicleCount.count === 0) {
            return res.status(400).json({
                message:
                    "Vous devez enregistrer au moins un véhicule pour devenir chauffeur.",
                code: "VEHICLE_REQUIRED",
            });
        }

        // Ajouter le rôle chauffeur (permanent et définitif)
        const sql =
            "INSERT INTO user_role (user_id, role_id) VALUES (?, (SELECT id FROM role WHERE name = 'chauffeur'))";
        await db.query(sql, [userId]);

        // Log de l'événement important
        console.log(`🚗 Nouvel chauffeur EcoRide: User ID ${userId}`);

        res.status(200).json({
            message:
                "Félicitations ! Vous êtes maintenant chauffeur EcoRide. Ce statut est permanent.",
            isPermanent: true,
        });
    } catch (error) {
        console.error("Erreur lors de la création du chauffeur:", error);
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
            "SELECT id, pseudo, email, credits, profile_picture_url, creation_date FROM user WHERE id = ?";
        const [[user]] = await db.query(userSql, [userId]);

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        // Récupérer les rôles
        const rolesSql = `
            SELECT r.name 
            FROM role r 
            INNER JOIN user_role ur ON r.id = ur.role_id 
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

/* --------------------------------------------------- Obtenir le profil d'un utilisateur par ID -------------------------------------- */
const getUserById = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Récupérer les informations utilisateur
        const userSql =
            "SELECT id, pseudo, email, credits, profile_picture_url, creation_date FROM user WHERE id = ?";
        const [[user]] = await db.query(userSql, [userId]);

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        // Récupérer les rôles
        const rolesSql = `
            SELECT r.id, r.name 
            FROM role r 
            INNER JOIN user_role ur ON r.id = ur.role_id 
            WHERE ur.user_id = ?
        `;
        const [rolesResult] = await db.query(rolesSql, [userId]);
        const roles = rolesResult.map((row) => ({
            id: row.id,
            name: row.name,
        }));

        // Récupérer les statistiques des covoiturages (MySQL)
        const statsSql = `
            SELECT 
                COUNT(DISTINCT c.id) as totalTrips
            FROM user u
            LEFT JOIN carpooling c ON u.id = c.driver_id
            WHERE u.id = ?
        `;
        const [[stats]] = await db.query(statsSql, [userId]);

        // Récupérer les statistiques des avis (MongoDB)
        const reviewStats = await Review.getAverageRating(parseInt(userId));

        // Récupérer les avis reçus depuis MongoDB
        const reviews = await Review.find({
            reviewedUserId: parseInt(userId),
            validationStatus: "approved",
        })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        // Récupérer les informations des reviewers depuis MySQL
        const reviewerIds = reviews.map((review) => review.reviewerId);
        let reviewerInfo = {};

        if (reviewerIds.length > 0) {
            const reviewerSql = `
                SELECT id, pseudo, profile_picture_url
                FROM user
                WHERE id IN (${reviewerIds.map(() => "?").join(",")})
            `;
            const [reviewers] = await db.query(reviewerSql, reviewerIds);
            reviewers.forEach((reviewer) => {
                reviewerInfo[reviewer.id] = reviewer;
            });
        }

        // Formater les avis
        const formattedReviews = reviews.map((review) => ({
            id: review._id,
            rating: review.rating,
            comment: review.comment,
            created_at: review.createdAt,
            reviewer: reviewerInfo[review.reviewerId] || {
                id: review.reviewerId,
                pseudo: "Utilisateur supprimé",
                profile_picture_url: null,
            },
        }));

        res.status(200).json({
            user: {
                ...user,
                roles: roles,
            },
            stats: {
                totalTrips: stats.totalTrips || 0,
                averageRating: reviewStats.average
                    ? reviewStats.average.toFixed(1)
                    : null,
                totalReviews: reviewStats.total || 0,
            },
            reviews: formattedReviews,
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
        const updateSql = `UPDATE user SET ${updates.join(", ")} WHERE id = ?`;
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
        const userSql = "SELECT password_hash FROM user WHERE id = ?";
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
            "UPDATE user SET password_hash = ? WHERE id = ?",
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
    getUserById,
    updateUserProfile,
    changePassword,
};
