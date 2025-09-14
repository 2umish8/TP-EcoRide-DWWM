const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
    PrismaClient,
    PrismaClientKnownRequestError,
} = require("@prisma/client");
const prisma = new PrismaClient();
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

        const user = await prisma.user.create({
            data: {
                pseudo,
                email: normalizedEmail,
                password_hash: passwordHash,
            },
        });

        // Attribuer le rôle "passager" par défaut
        const role = await prisma.role.findFirst({
            where: { name: "passager" },
        });
        if (role) {
            await prisma.user_Role.create({
                data: {
                    user_id: user.id,
                    role_id: role.id,
                },
            });
        }

        res.status(201).json({
            message:
                "Utilisateur créé avec succès ! Veuillez vous connecter avec vos identifiants.",
            user: {
                id: user.id,
                pseudo: user.pseudo,
                email: user.email,
            },
        });
    } catch (error) {
        console.error(error);
        if (
            error instanceof PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
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

        const user = await prisma.user.findFirst({
            where: {
                OR: [{ email: identifier }, { pseudo: identifier }],
            },
        });

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res
                .status(401)
                .json({ message: "Identifiant ou mot de passe incorrect." });
        }

        // Récupérer les rôles de l'utilisateur
        const userWithRoles = await prisma.user.findUnique({
            where: { id: user.id },
            include: {
                roles: {
                    include: {
                        role: true,
                    },
                },
            },
        });
        const roles = userWithRoles.roles.map((ur) => ur.role.name);

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
        const existing = await prisma.user_Role.findFirst({
            where: {
                user_id: userId,
                role: { name: "chauffeur" },
            },
        });

        if (existing) {
            return res
                .status(400)
                .json({ message: "Vous êtes déjà chauffeur." });
        }

        // Vérifier que l'utilisateur a au moins un véhicule
        const vehicleCount = await prisma.vehicle.count({
            where: { user_id: userId },
        });

        if (vehicleCount === 0) {
            return res.status(400).json({
                message:
                    "Vous devez enregistrer au moins un véhicule pour devenir chauffeur.",
                code: "VEHICLE_REQUIRED",
            });
        }

        // Ajouter le rôle chauffeur (permanent et définitif)
        const role = await prisma.role.findFirst({
            where: { name: "chauffeur" },
        });
        await prisma.user_Role.create({
            data: {
                user_id: userId,
                role_id: role.id,
            },
        });

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

        // Récupérer les informations utilisateur avec ses rôles
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                pseudo: true,
                email: true,
                credits: true,
                profile_picture_url: true,
                creation_date: true,
                roles: {
                    include: {
                        role: true,
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        const roles = user.roles.map((ur) => ur.role.name);

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

        // Récupérer les informations utilisateur avec ses rôles
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
            select: {
                id: true,
                pseudo: true,
                email: true,
                credits: true,
                profile_picture_url: true,
                creation_date: true,
                roles: {
                    include: {
                        role: true,
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        const roles = user.roles.map((ur) => ({
            id: ur.role.id,
            name: ur.role.name,
        }));

        // Récupérer les statistiques des covoiturages
        const totalTrips = await prisma.carpooling.count({
            where: { driver_id: parseInt(userId) },
        });

        // Récupérer les statistiques des avis (MongoDB)
        const reviewStats = await Review.getAverageRating(parseInt(userId));
        console.log("Review stats for user", userId, ":", reviewStats);

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
            const reviewers = await prisma.user.findMany({
                where: {
                    id: { in: reviewerIds },
                },
                select: {
                    id: true,
                    pseudo: true,
                    profile_picture_url: true,
                },
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

        const responseData = {
            user: {
                ...user,
                roles: roles,
            },
            stats: {
                totalTrips: totalTrips || 0,
                averageRating:
                    reviewStats.total > 0
                        ? reviewStats.average.toFixed(1)
                        : "0.0",
                totalReviews: reviewStats.total || 0,
            },
            reviews: formattedReviews,
        };
        console.log("Response data:", responseData);
        res.status(200).json(responseData);
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

        // Construire l'objet de mise à jour dynamiquement
        const updateData = {};

        if (pseudo !== undefined) {
            updateData.pseudo = pseudo;
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
            updateData.email = emailValidation.normalizedEmail;
        }
        if (profile_picture_url !== undefined) {
            updateData.profile_picture_url = profile_picture_url;
        }

        if (Object.keys(updateData).length === 0) {
            return res
                .status(400)
                .json({ message: "Aucune donnée à mettre à jour." });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });

        if (updatedUser) {
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
        if (
            error instanceof PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
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
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { password_hash: true },
        });

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
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { password_hash: newPasswordHash },
        });

        if (updatedUser) {
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
