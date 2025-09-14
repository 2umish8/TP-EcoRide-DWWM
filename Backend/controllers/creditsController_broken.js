const { PrismaClient, PrismaClientKnownRequestError } = require("@prisma/client"); 
const prisma = new PrismaClient();

/* --------------------------------------------------- Obtenir le solde de crédits ------------------------------- */
const getUserCredits = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { credits: true }
        });

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        res.status(200).json({ credits: user.credits });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur lors de la récupération du solde.",
        });
    }
};

/* --------------------------------------------------- Historique des transactions ------------------------------- */
const getTransactionHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        // Récupérer l'historique des participations (débits)
        const participations = await prisma.participation.findMany({
            where: { passenger_id: userId },
            include: {
                carpooling: {
                    select: {
                        departure_address: true,
                        arrival_address: true,
                        id: true
                    }
                }
            }
        });

        const participationHistory = participations.map(p => ({
            type: 'participation',
            amount: -p.credits_paid,
            date: p.participation_date,
            description: `Participation covoiturage: ${p.carpooling.departure_address} → ${p.carpooling.arrival_address}`,
            carpooling_id: p.carpooling.id
        }));

        // Récupérer l'historique des gains de covoiturage (crédits)
        const completedCarpoolings = await prisma.carpooling.findMany({
            where: {
                driver_id: userId,
                status: 'terminé'
            },
            include: {
                participation: {
                    where: {
                        cancellation_date: null
                    }
                }
            }
        });

        const earningsHistory = completedCarpoolings.map(c => ({
            type: 'earning',
            amount: (c.participation.length * c.price_per_passenger - c.participation.length * c.platform_commission_earned),
            date: c.departure_datetime,
            description: `Gains covoiturage: ${c.departure_address} → ${c.arrival_address}`,
            carpooling_id: c.id
        }));

        // Récupérer l'historique des remboursements
        const refundsData = await prisma.participation.findMany({
            where: {
                passenger_id: userId,
                cancellation_date: { not: null }
            },
            include: {
                carpooling: {
                    select: {
                        departure_address: true,
                        arrival_address: true,
                        id: true
                    }
                }
            }
        });

        const refundsHistory = refundsData.map(p => ({
            type: 'refund',
            amount: p.credits_paid,
            date: p.cancellation_date,
            description: `Remboursement: ${p.carpooling.departure_address} → ${p.carpooling.arrival_address}`,
            carpooling_id: p.carpooling.id
        }));

        // Combiner tous les historiques et trier par date
        const allTransactions = [
            ...participationHistory,
            ...earningsHistory,
            ...refundsHistory,
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        res.status(200).json({ transactions: allTransactions });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur lors de la récupération de l'historique.",
        });
    }
};

/* --------------------------------------------------- Acheter des crédits (simulation) ------------------------- */
const purchaseCredits = async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount } = req.body;

        // Validation du montant
        if (!amount || amount <= 0 || amount > 1000) {
            return res.status(400).json({
                message: "Le montant doit être entre 1 et 1000 crédits.",
            });
        }

        // Dans un vrai système, ici on intégrerait un système de paiement (Stripe, PayPal, etc.)
        // Pour la simulation, on ajoute directement les crédits

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                credits: {
                    increment: amount
                }
            },
            select: { credits: true }
        });

        res.status(200).json({
            message: `${amount} crédits ajoutés avec succès !`,
            newBalance: updatedUser.credits,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de l'achat de crédits." });
    }
};

/* --------------------------------------------------- Statistiques financières ------------------------------- */
const getFinancialStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // Total dépensé en participations
        const spentSql = `
            SELECT COALESCE(SUM(credits_paid), 0) as total_spent
            FROM Participation 
            WHERE passenger_id = ?
        `;
        const [[spentResult]] = await prisma.query(spentSql, [userId]);

        // Total gagné en tant que chauffeur
        const earnedSql = `
            SELECT COALESCE(SUM(
                (p_count.participants * c.price_per_passenger) - 
                (p_count.participants * c.platform_commission_earned)
            ), 0) as total_earned
            FROM Carpooling c
            INNER JOIN (
                SELECT carpooling_id, COUNT(*) as participants
                FROM Participation 
                WHERE cancellation_date IS NULL
                GROUP BY carpooling_id
            ) p_count ON c.id = p_count.carpooling_id
            WHERE c.driver_id = ? AND c.status = 'terminé'
        `;
        const [[earnedResult]] = await prisma.query(earnedSql, [userId]);

        // Nombre de covoiturages créés
        const createdCarpoolingsSql = `
            SELECT COUNT(*) as created_carpoolings
            FROM Carpooling 
            WHERE driver_id = ?
        `;
        const [[createdResult]] = await prisma.query(createdCarpoolingsSql, [
            userId,
        ]);

        // Nombre de participations
        const participationsSql = `
            SELECT COUNT(*) as total_participations
            FROM Participation 
            WHERE passenger_id = ?
        `;
        const [[participationsResult]] = await prisma.query(participationsSql, [
            userId,
        ]);

        // Commission totale générée pour la plateforme
        const commissionSql = `
            SELECT COALESCE(SUM(p_count.participants * c.platform_commission_earned), 0) as total_commission
            FROM Carpooling c
            INNER JOIN (
                SELECT carpooling_id, COUNT(*) as participants
                FROM Participation 
                WHERE cancellation_date IS NULL
                GROUP BY carpooling_id
            ) p_count ON c.id = p_count.carpooling_id
            WHERE c.driver_id = ? AND c.status = 'terminé'
        `;
        const [[commissionResult]] = await prisma.query(commissionSql, [userId]);

        res.status(200).json({
            totalSpent: spentResult.total_spent,
            totalEarned: earnedResult.total_earned,
            createdCarpoolings: createdResult.created_carpoolings,
            totalParticipations: participationsResult.total_participations,
            platformCommission: commissionResult.total_commission,
            netBalance: earnedResult.total_earned - spentResult.total_spent,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur lors de la récupération des statistiques.",
        });
    }
};

/* --------------------------------------------------- Transfert de crédits (entre utilisateurs) -------------- */
const transferCredits = async (req, res) => {
    try {
        const userId = req.user.id;
        const { recipient_email, amount, message } = req.body;

        // Validation
        if (!recipient_email || !amount || amount <= 0) {
            return res.status(400).json({
                message:
                    "Veuillez fournir un email destinataire et un montant valide.",
            });
        }

        // Démarrer une transaction
        await prisma.query("START TRANSACTION");

        try {
            // Vérifier que l'expéditeur a assez de crédits
            const [[sender]] = await prisma.query(
                "SELECT credits FROM User WHERE id = ?",
                [userId]
            );

            if (sender.credits < amount) {
                await prisma.query("ROLLBACK");
                return res.status(400).json({
                    message:
                        "Vous n'avez pas assez de crédits pour ce transfert.",
                });
            }

            // Vérifier que le destinataire existe
            const [[recipient]] = await prisma.query(
                "SELECT id, pseudo FROM User WHERE email = ?",
                [recipient_email]
            );

            if (!recipient) {
                await prisma.query("ROLLBACK");
                return res.status(404).json({
                    message: "Utilisateur destinataire non trouvé.",
                });
            }

            if (recipient.id === userId) {
                await prisma.query("ROLLBACK");
                return res.status(400).json({
                    message:
                        "Vous ne pouvez pas vous transférer des crédits à vous-même.",
                });
            }

            // Effectuer le transfert
            await prisma.query(
                "UPDATE User SET credits = credits - ? WHERE id = ?",
                [amount, userId]
            );
            await prisma.query(
                "UPDATE User SET credits = credits + ? WHERE id = ?",
                [amount, recipient.id]
            );

            await prisma.query("COMMIT");

            res.status(200).json({
                message: `Transfert de ${amount} crédits effectué avec succès vers ${recipient.pseudo} !`,
            });
        } catch (error) {
            await prisma.query("ROLLBACK");
            throw error;
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur lors du transfert de crédits.",
        });
    }
};

module.exports = {
    getUserCredits,
    getTransactionHistory,
    purchaseCredits,
    getFinancialStats,
    transferCredits,
};
