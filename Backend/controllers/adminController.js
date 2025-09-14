const {
    PrismaClient,
    PrismaClientKnownRequestError,
} = require("@prisma/client");
const prisma = new PrismaClient();

/* --------------------------------------------------- Statistiques générales de la plateforme ----------------- */
const getPlatformStats = async (req, res) => {
    try {
        // Nombre total d'utilisateurs
        const totalUsers = await prisma.user.count();

        // Nombre d'utilisateurs par rôle
        const roleStats = await prisma.role.findMany({
            include: {
                _count: {
                    select: {
                        user_roles: true,
                    },
                },
            },
        });

        const roleStatsFormatted = roleStats.map((role) => ({
            name: role.name,
            count: role._count.user_roles,
        }));

        // Nombre total de covoiturages
        const totalCarpoolings = await prisma.carpooling.count();

        // Covoiturages par statut
        const carpoolingStats = await prisma.carpooling.groupBy({
            by: ["status"],
            _count: {
                status: true,
            },
        });

        const carpoolingStatsFormatted = carpoolingStats.map((stat) => ({
            status: stat.status,
            count: stat._count.status,
        }));

        // Nombre total de participations
        const totalParticipations = await prisma.participation.count();

        // Participations par statut
        const participationStats = await prisma.participation.groupBy({
            by: ["status"],
            _count: {
                status: true,
            },
        });

        const participationStatsFormatted = participationStats.map((stat) => ({
            status: stat.status,
            count: stat._count.status,
        }));

        // Commission totale générée par la plateforme
        const commissionResult = await prisma.carpooling.aggregate({
            _sum: {
                platform_commission_earned: true,
            },
        });

        const totalCommission =
            commissionResult._sum.platform_commission_earned || 0;

        // Nombre total de véhicules
        const totalVehicles = await prisma.vehicle.count();

        // Véhicules par type (électriques vs traditionnels)
        const electricVehicles = await prisma.vehicle.count({
            where: { is_electric: true },
        });

        const traditionalVehicles = totalVehicles - electricVehicles;

        res.status(200).json({
            users: {
                total: totalUsers,
                byRole: roleStatsFormatted,
            },
            carpoolings: {
                total: totalCarpoolings,
                byStatus: carpoolingStatsFormatted,
            },
            participations: {
                total: totalParticipations,
                byStatus: participationStatsFormatted,
            },
            platform: {
                totalCommission: parseFloat(totalCommission.toFixed(2)),
            },
            vehicles: {
                total: totalVehicles,
                electric: electricVehicles,
                traditional: traditionalVehicles,
            },
        });
    } catch (error) {
        console.error("Erreur récupération statistiques:", error);

        if (error instanceof PrismaClientKnownRequestError) {
            return res.status(400).json({
                message: "Erreur de base de données.",
                error:
                    process.env.NODE_ENV === "development"
                        ? error.message
                        : undefined,
            });
        }

        res.status(500).json({
            message: "Erreur lors de la récupération des statistiques.",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};

/* --------------------------------------------------- Récupérer tous les utilisateurs --------------------------- */
const getAllUsers = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            search = "",
            role = "",
            suspended = "",
        } = req.query;

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        // Construction des filtres
        const where = {};

        if (search) {
            where.OR = [
                { pseudo: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { first_name: { contains: search, mode: "insensitive" } },
                { last_name: { contains: search, mode: "insensitive" } },
            ];
        }

        if (suspended !== "") {
            where.suspended = suspended === "true";
        }

        if (role) {
            where.user_roles = {
                some: {
                    role: {
                        name: role,
                    },
                },
            };
        }

        // Récupérer les utilisateurs avec pagination
        const users = await prisma.user.findMany({
            where,
            include: {
                user_roles: {
                    include: {
                        role: true,
                    },
                },
            },
            orderBy: { created_at: "desc" },
            skip,
            take: limitNum,
        });

        // Compter le total pour pagination
        const totalUsers = await prisma.user.count({ where });

        // Transformer les données
        const formattedUsers = users.map((user) => ({
            ...user,
            roles: user.user_roles.map((ur) => ur.role.name),
        }));

        res.status(200).json({
            users: formattedUsers,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: totalUsers,
                totalPages: Math.ceil(totalUsers / limitNum),
            },
        });
    } catch (error) {
        console.error("Erreur récupération utilisateurs:", error);

        if (error instanceof PrismaClientKnownRequestError) {
            return res.status(400).json({
                message: "Erreur de base de données.",
                error:
                    process.env.NODE_ENV === "development"
                        ? error.message
                        : undefined,
            });
        }

        res.status(500).json({
            message: "Erreur lors de la récupération des utilisateurs.",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};

/* --------------------------------------------------- Suspendre/réactiver un utilisateur -------------------- */
const toggleUserSuspension = async (req, res) => {
    try {
        const userId = req.params.id;
        const { suspended, reason = "" } = req.body;

        if (typeof suspended !== "boolean") {
            return res.status(400).json({
                message: "Le statut de suspension doit être un booléen.",
            });
        }

        // Vérifier que l'utilisateur existe
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
            select: { pseudo: true, suspended: true },
        });

        if (!user) {
            return res.status(404).json({
                message: "Utilisateur non trouvé.",
            });
        }

        // Mettre à jour le statut de suspension
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(userId) },
            data: {
                suspended,
                suspension_reason: suspended ? reason : null,
                suspension_date: suspended ? new Date() : null,
            },
        });

        const action = suspended ? "suspendu" : "réactivé";

        res.status(200).json({
            message: `Utilisateur ${action} avec succès.`,
            user: {
                id: updatedUser.id,
                pseudo: updatedUser.pseudo,
                suspended: updatedUser.suspended,
                suspension_reason: updatedUser.suspension_reason,
            },
        });
    } catch (error) {
        console.error("Erreur modification suspension:", error);

        if (error instanceof PrismaClientKnownRequestError) {
            return res.status(400).json({
                message: "Erreur de base de données.",
                error:
                    process.env.NODE_ENV === "development"
                        ? error.message
                        : undefined,
            });
        }

        res.status(500).json({
            message: "Erreur lors de la modification du statut de suspension.",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};

/* --------------------------------------------------- Modifier les rôles d'un utilisateur -------------------- */
const updateUserRoles = async (req, res) => {
    try {
        const userId = req.params.id;
        const { roleIds } = req.body; // Array des IDs de rôles

        if (!Array.isArray(roleIds)) {
            return res.status(400).json({
                message:
                    "Les rôles doivent être fournis sous forme de tableau.",
            });
        }

        // Vérifier que l'utilisateur existe
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
            select: { pseudo: true },
        });

        if (!user) {
            return res.status(404).json({
                message: "Utilisateur non trouvé.",
            });
        }

        // Démarrer une transaction
        const result = await prisma.$transaction(async (transactionPrisma) => {
            // Supprimer tous les rôles actuels
            await transactionPrisma.user_role.deleteMany({
                where: { user_id: parseInt(userId) },
            });

            // Ajouter les nouveaux rôles
            for (const roleId of roleIds) {
                // Vérifier que le rôle existe
                const role = await transactionPrisma.role.findUnique({
                    where: { id: parseInt(roleId) },
                });

                if (!role) {
                    throw new Error(`Rôle avec l'ID ${roleId} non trouvé.`);
                }

                await transactionPrisma.user_role.create({
                    data: {
                        user_id: parseInt(userId),
                        role_id: parseInt(roleId),
                    },
                });
            }

            // Récupérer les nouveaux rôles
            const updatedUserRoles = await transactionPrisma.user_role.findMany(
                {
                    where: { user_id: parseInt(userId) },
                    include: {
                        role: true,
                    },
                }
            );

            return updatedUserRoles.map((ur) => ur.role.name);
        });

        res.status(200).json({
            message: "Rôles mis à jour avec succès.",
            user: {
                id: parseInt(userId),
                pseudo: user.pseudo,
                roles: result,
            },
        });
    } catch (error) {
        console.error("Erreur modification rôles:", error);

        if (error instanceof PrismaClientKnownRequestError) {
            return res.status(400).json({
                message: "Erreur de base de données.",
                error:
                    process.env.NODE_ENV === "development"
                        ? error.message
                        : undefined,
            });
        }

        // Erreurs métier
        if (error.message.includes("Rôle")) {
            return res.status(400).json({
                message: error.message,
            });
        }

        res.status(500).json({
            message: "Erreur lors de la modification des rôles.",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};

/* --------------------------------------------------- Récupérer tous les covoiturages pour modération -------- */
const getAllCarpoolings = async (req, res) => {
    try {
        const { page = 1, limit = 20, status = "", search = "" } = req.query;

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        // Construction des filtres
        const where = {};

        if (status) {
            where.status = status;
        }

        if (search) {
            where.OR = [
                {
                    departure_address: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                { arrival_address: { contains: search, mode: "insensitive" } },
                {
                    driver: {
                        pseudo: { contains: search, mode: "insensitive" },
                    },
                },
            ];
        }

        // Récupérer les covoiturages avec pagination
        const carpoolings = await prisma.carpooling.findMany({
            where,
            include: {
                driver: {
                    select: {
                        pseudo: true,
                        email: true,
                    },
                },
                vehicle: {
                    include: {
                        brand: true,
                    },
                },
                _count: {
                    select: {
                        participations: {
                            where: { cancellation_date: null },
                        },
                    },
                },
            },
            orderBy: { created_at: "desc" },
            skip,
            take: limitNum,
        });

        // Compter le total pour pagination
        const totalCarpoolings = await prisma.carpooling.count({ where });

        // Transformer les données
        const formattedCarpoolings = carpoolings.map((c) => ({
            ...c,
            driver_pseudo: c.driver.pseudo,
            driver_email: c.driver.email,
            vehicle_model: c.vehicle.model,
            vehicle_brand: c.vehicle.brand?.name || "N/A",
            participants_count: c._count.participations,
        }));

        res.status(200).json({
            carpoolings: formattedCarpoolings,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: totalCarpoolings,
                totalPages: Math.ceil(totalCarpoolings / limitNum),
            },
        });
    } catch (error) {
        console.error("Erreur récupération covoiturages:", error);

        if (error instanceof PrismaClientKnownRequestError) {
            return res.status(400).json({
                message: "Erreur de base de données.",
                error:
                    process.env.NODE_ENV === "development"
                        ? error.message
                        : undefined,
            });
        }

        res.status(500).json({
            message: "Erreur lors de la récupération des covoiturages.",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};

/* --------------------------------------------------- Modérer un covoiturage (annuler/signaler) --------------- */
const moderateCarpooling = async (req, res) => {
    try {
        const carpoolingId = req.params.id;
        const { action, reason = "" } = req.body; // action: 'cancel', 'flag', 'approve'

        if (!["cancel", "flag", "approve"].includes(action)) {
            return res.status(400).json({
                message:
                    "Action invalide. Utilisez 'cancel', 'flag' ou 'approve'.",
            });
        }

        // Démarrer une transaction
        const result = await prisma.$transaction(async (transactionPrisma) => {
            // Vérifier que le covoiturage existe
            const carpooling = await transactionPrisma.carpooling.findUnique({
                where: { id: parseInt(carpoolingId) },
                include: {
                    driver: {
                        select: { pseudo: true, email: true },
                    },
                    participations: {
                        where: { cancellation_date: null },
                        include: {
                            passenger: {
                                select: { pseudo: true, email: true },
                            },
                        },
                    },
                },
            });

            if (!carpooling) {
                throw new Error("Covoiturage non trouvé.");
            }

            let updateData = {};
            let actionMessage = "";

            switch (action) {
                case "cancel":
                    if (carpooling.status === "annulé") {
                        throw new Error("Ce covoiturage est déjà annulé.");
                    }

                    updateData.status = "annulé";
                    updateData.moderation_reason = reason;
                    updateData.moderated_at = new Date();
                    actionMessage = "annulé";

                    // Rembourser tous les participants
                    for (const participation of carpooling.participations) {
                        await transactionPrisma.user.update({
                            where: { id: participation.passenger_id },
                            data: {
                                credits: {
                                    increment: participation.price_paid,
                                },
                            },
                        });

                        await transactionPrisma.participation.update({
                            where: { id: participation.id },
                            data: { cancellation_date: new Date() },
                        });

                        // Enregistrer l'historique des crédits
                        await transactionPrisma.credit_transaction.create({
                            data: {
                                user_id: participation.passenger_id,
                                transaction_type: "crédit",
                                amount: participation.price_paid,
                                description: `Remboursement modération covoiturage #${carpoolingId}`,
                                transaction_date: new Date(),
                            },
                        });
                    }
                    break;

                case "flag":
                    updateData.flagged = true;
                    updateData.moderation_reason = reason;
                    updateData.moderated_at = new Date();
                    actionMessage = "signalé";
                    break;

                case "approve":
                    updateData.flagged = false;
                    updateData.moderation_reason = null;
                    updateData.moderated_at = new Date();
                    actionMessage = "approuvé";
                    break;
            }

            // Mettre à jour le covoiturage
            const updatedCarpooling = await transactionPrisma.carpooling.update(
                {
                    where: { id: parseInt(carpoolingId) },
                    data: updateData,
                }
            );

            return {
                updatedCarpooling,
                actionMessage,
                participantsCount: carpooling.participations.length,
            };
        });

        res.status(200).json({
            message: `Covoiturage ${result.actionMessage} avec succès.`,
            carpooling: {
                id: result.updatedCarpooling.id,
                status: result.updatedCarpooling.status,
                flagged: result.updatedCarpooling.flagged,
                moderation_reason: result.updatedCarpooling.moderation_reason,
            },
            participants_affected:
                action === "cancel" ? result.participantsCount : 0,
        });
    } catch (error) {
        console.error("Erreur modération covoiturage:", error);

        if (error instanceof PrismaClientKnownRequestError) {
            return res.status(400).json({
                message: "Erreur de base de données.",
                error:
                    process.env.NODE_ENV === "development"
                        ? error.message
                        : undefined,
            });
        }

        // Erreurs métier
        if (
            error.message.includes("covoiturage") ||
            error.message.includes("annulé")
        ) {
            return res.status(400).json({
                message: error.message,
            });
        }

        res.status(500).json({
            message: "Erreur lors de la modération du covoiturage.",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};

module.exports = {
    getPlatformStats,
    getAllUsers,
    toggleUserSuspension,
    updateUserRoles,
    getAllCarpoolings,
    moderateCarpooling,
};
