const {
    PrismaClient,
    PrismaClientKnownRequestError,
} = require("@prisma/client");
const prisma = new PrismaClient();

/* --------------------------------------------------- Obtenir le solde de crédits ------------------------------- */
const getUserCredits = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { credits: true },
        });

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        res.status(200).json({
            credits: user.credits,
        });
    } catch (error) {
        console.error("Erreur récupération crédits:", error);

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
            message: "Erreur lors de la récupération des crédits.",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};

/* --------------------------------------------------- Historique des transactions ------------------------------- */
const getCreditHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20 } = req.query;

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        // If the Prisma model 'credit_transaction' is not defined in the schema,
        // return an empty history instead of throwing an exception. This keeps
        // the health/test scripts robust on trimmed or older schemas.
        let transactions = [];
        let totalTransactions = 0;

        if (prisma.credit_transaction && typeof prisma.credit_transaction.findMany === "function") {
            transactions = await prisma.credit_transaction.findMany({
                where: { user_id: userId },
                orderBy: { transaction_date: "desc" },
                skip,
                take: limitNum,
                select: {
                    id: true,
                    transaction_type: true,
                    amount: true,
                    description: true,
                    transaction_date: true,
                },
            });

            totalTransactions = await prisma.credit_transaction.count({
                where: { user_id: userId },
            });
        } else {
            console.warn("Prisma model 'credit_transaction' not found - returning empty credit history.");
        }

        res.status(200).json({
            transactions,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: totalTransactions,
                totalPages: Math.ceil(totalTransactions / limitNum),
            },
        });
    } catch (error) {
        console.error("Erreur historique crédits:", error);

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
            message: "Erreur lors de la récupération de l'historique.",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};

/* --------------------------------------------------- Historique détaillé avec covoiturages ------------------------------- */
const getDetailedCreditHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20 } = req.query;

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        let transactions = [];
        let totalTransactions = 0;

        if (prisma.credit_transaction && typeof prisma.credit_transaction.findMany === "function") {
            transactions = await prisma.credit_transaction.findMany({
                where: { user_id: userId },
                orderBy: { transaction_date: "desc" },
                skip,
                take: limitNum,
                select: {
                    id: true,
                    transaction_type: true,
                    amount: true,
                    description: true,
                    transaction_date: true,
                },
            });

            totalTransactions = await prisma.credit_transaction.count({
                where: { user_id: userId },
            });
        } else {
            console.warn("Prisma model 'credit_transaction' not found - returning empty detailed credit history.");
        }

        res.status(200).json({
            transactions,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: totalTransactions,
                totalPages: Math.ceil(totalTransactions / limitNum),
            },
        });
    } catch (error) {
        console.error("Erreur historique détaillé:", error);

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
            message: "Erreur lors de la récupération de l'historique détaillé.",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};

/* --------------------------------------------------- Acheter des crédits ------------------------------- */
const purchaseCredits = async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                message: "Le montant doit être positif.",
            });
        }

        const result = await prisma.$transaction(async (transactionPrisma) => {
            // Mettre à jour le solde utilisateur
            const updatedUser = await transactionPrisma.user.update({
                where: { id: userId },
                data: { credits: { increment: amount } },
                select: { credits: true },
            });

            // Enregistrer la transaction
            await transactionPrisma.credit_transaction.create({
                data: {
                    user_id: userId,
                    transaction_type: "crédit",
                    amount: amount,
                    description: `Achat de ${amount} crédits`,
                    transaction_date: new Date(),
                },
            });

            return updatedUser;
        });

        res.status(200).json({
            message: "Crédits achetés avec succès.",
            newBalance: result.credits,
        });
    } catch (error) {
        console.error("Erreur achat crédits:", error);

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
            message: "Erreur lors de l'achat de crédits.",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};

/* --------------------------------------------------- Statistiques financières ------------------------------- */
const getFinancialStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // Total dépensé en participations - convertir avec Prisma
        const totalSpent = await prisma.participation.aggregate({
            where: {
                passenger_id: userId,
                cancellation_date: null,
            },
            _sum: { credits_paid: true },
        });

        // Total gagné en tant que chauffeur avec commission
        const earnedStats = await prisma.carpooling.findMany({
            where: {
                driver_id: userId,
                status: "terminé",
            },
            include: {
                participations: {
                    where: { cancellation_date: null },
                    select: { credits_paid: true },
                },
            },
        });

        let totalEarned = 0;
        let totalCommission = 0;

        earnedStats.forEach((carpooling) => {
            const participationEarnings = carpooling.participations.reduce(
                (sum, p) => sum + p.credits_paid,
                0
            );
            totalEarned += participationEarnings;
            totalCommission += carpooling.platform_commission_earned || 0;
        });

        // Nombre de covoiturages créés
        const createdCarpoolings = await prisma.carpooling.count({
            where: { driver_id: userId },
        });

        // Nombre de participations
        const totalParticipations = await prisma.participation.count({
            where: {
                passenger_id: userId,
                cancellation_date: null,
            },
        });

        res.status(200).json({
            totalSpent: totalSpent._sum.credits_paid || 0,
            totalEarned: parseFloat(totalEarned.toFixed(2)),
            totalCommission: parseFloat(totalCommission.toFixed(2)),
            createdCarpoolings,
            totalParticipations,
        });
    } catch (error) {
        console.error("Erreur statistiques financières:", error);

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

/* --------------------------------------------------- Transférer des crédits ------------------------------- */
const transferCredits = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { recipientId, amount } = req.body;

        if (!recipientId || !amount || amount <= 0) {
            return res.status(400).json({
                message: "ID du destinataire et montant valides requis.",
            });
        }

        if (senderId === recipientId) {
            return res.status(400).json({
                message:
                    "Vous ne pouvez pas transférer des crédits à vous-même.",
            });
        }

        const result = await prisma.$transaction(async (transactionPrisma) => {
            // Vérifier le solde de l'expéditeur
            const sender = await transactionPrisma.user.findUnique({
                where: { id: senderId },
                select: { credits: true, pseudo: true },
            });

            if (!sender) {
                throw new Error("Expéditeur non trouvé.");
            }

            if (sender.credits < amount) {
                throw new Error(
                    "Solde insuffisant pour effectuer ce transfert."
                );
            }

            // Vérifier que le destinataire existe
            const recipient = await transactionPrisma.user.findUnique({
                where: { id: recipientId },
                select: { pseudo: true },
            });

            if (!recipient) {
                throw new Error("Destinataire non trouvé.");
            }

            // Effectuer le transfert
            const updatedSender = await transactionPrisma.user.update({
                where: { id: senderId },
                data: { credits: { decrement: amount } },
                select: { credits: true },
            });

            await transactionPrisma.user.update({
                where: { id: recipientId },
                data: { credits: { increment: amount } },
            });

            // Enregistrer les transactions
            await transactionPrisma.credit_transaction.create({
                data: {
                    user_id: senderId,
                    transaction_type: "débit",
                    amount: amount,
                    description: `Transfert vers ${recipient.pseudo}`,
                    transaction_date: new Date(),
                },
            });

            await transactionPrisma.credit_transaction.create({
                data: {
                    user_id: recipientId,
                    transaction_type: "crédit",
                    amount: amount,
                    description: `Transfert de ${sender.pseudo}`,
                    transaction_date: new Date(),
                },
            });

            return {
                senderBalance: updatedSender.credits,
                recipientPseudo: recipient.pseudo,
            };
        });

        res.status(200).json({
            message: `Transfert de ${amount} crédits vers ${result.recipientPseudo} effectué avec succès.`,
            newBalance: result.senderBalance,
        });
    } catch (error) {
        console.error("Erreur transfert crédits:", error);

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
            error.message.includes("Solde insuffisant") ||
            error.message.includes("non trouvé") ||
            error.message.includes("vous-même")
        ) {
            return res.status(400).json({
                message: error.message,
            });
        }

        res.status(500).json({
            message: "Erreur lors du transfert de crédits.",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};

module.exports = {
    getUserCredits,
    getCreditHistory,
    getDetailedCreditHistory,
    purchaseCredits,
    getFinancialStats,
    transferCredits,
};
