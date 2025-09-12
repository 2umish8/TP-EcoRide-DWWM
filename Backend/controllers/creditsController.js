const db = require("../Config/db.js");

/* --------------------------------------------------- Obtenir le solde de crédits ------------------------------- */
const getUserCredits = async (req, res) => {
    try {
        const userId = req.user.id;

        const sql = "SELECT credits FROM User WHERE id = ?";
        const [[user]] = await db.query(sql, [userId]);

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
        const participationsSql = `
            SELECT 
                'participation' as type,
                -p.credits_paid as amount,
                p.participation_date as date,
                CONCAT('Participation covoiturage: ', c.departure_address, ' → ', c.arrival_address) as description,
                c.id as carpooling_id
            FROM Participation p
            INNER JOIN Carpooling c ON p.carpooling_id = c.id
            WHERE p.passenger_id = ?
        `;

        // Récupérer l'historique des gains de covoiturage (crédits)
        const earningsSql = `
            SELECT 
                'earning' as type,
                (p_count.participants * c.price_per_passenger - p_count.participants * c.platform_commission_earned) as amount,
                c.departure_datetime as date,
                CONCAT('Gains covoiturage: ', c.departure_address, ' → ', c.arrival_address) as description,
                c.id as carpooling_id
            FROM Carpooling c
            INNER JOIN (
                SELECT carpooling_id, COUNT(*) as participants
                FROM Participation 
                WHERE cancellation_date IS NULL
                GROUP BY carpooling_id
            ) p_count ON c.id = p_count.carpooling_id
            WHERE c.driver_id = ? AND c.status = 'terminé'
        `;

        // Récupérer l'historique des remboursements
        const refundsSql = `
            SELECT 
                'refund' as type,
                p.credits_paid as amount,
                p.cancellation_date as date,
                CONCAT('Remboursement: ', c.departure_address, ' → ', c.arrival_address) as description,
                c.id as carpooling_id
            FROM Participation p
            INNER JOIN Carpooling c ON p.carpooling_id = c.id
            WHERE p.passenger_id = ? AND p.cancellation_date IS NOT NULL
        `;

        const [participations] = await db.query(participationsSql, [userId]);
        const [earnings] = await db.query(earningsSql, [userId]);
        const [refunds] = await db.query(refundsSql, [userId]);

        // Combiner tous les historiques et trier par date
        const allTransactions = [
            ...participations,
            ...earnings,
            ...refunds,
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

        const [result] = await db.query(
            "UPDATE User SET credits = credits + ? WHERE id = ?",
            [amount, userId]
        );

        if (result.affectedRows > 0) {
            // Récupérer le nouveau solde
            const [[user]] = await db.query(
                "SELECT credits FROM User WHERE id = ?",
                [userId]
            );

            res.status(200).json({
                message: `${amount} crédits ajoutés avec succès !`,
                newBalance: user.credits,
            });
        } else {
            res.status(500).json({
                message: "Erreur lors de l'achat de crédits.",
            });
        }
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
        const [[spentResult]] = await db.query(spentSql, [userId]);

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
        const [[earnedResult]] = await db.query(earnedSql, [userId]);

        // Nombre de covoiturages créés
        const createdCarpoolingsSql = `
            SELECT COUNT(*) as created_carpoolings
            FROM Carpooling 
            WHERE driver_id = ?
        `;
        const [[createdResult]] = await db.query(createdCarpoolingsSql, [
            userId,
        ]);

        // Nombre de participations
        const participationsSql = `
            SELECT COUNT(*) as total_participations
            FROM Participation 
            WHERE passenger_id = ?
        `;
        const [[participationsResult]] = await db.query(participationsSql, [
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
        const [[commissionResult]] = await db.query(commissionSql, [userId]);

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
        await db.query("START TRANSACTION");

        try {
            // Vérifier que l'expéditeur a assez de crédits
            const [[sender]] = await db.query(
                "SELECT credits FROM User WHERE id = ?",
                [userId]
            );

            if (sender.credits < amount) {
                await db.query("ROLLBACK");
                return res.status(400).json({
                    message:
                        "Vous n'avez pas assez de crédits pour ce transfert.",
                });
            }

            // Vérifier que le destinataire existe
            const [[recipient]] = await db.query(
                "SELECT id, pseudo FROM User WHERE email = ?",
                [recipient_email]
            );

            if (!recipient) {
                await db.query("ROLLBACK");
                return res.status(404).json({
                    message: "Utilisateur destinataire non trouvé.",
                });
            }

            if (recipient.id === userId) {
                await db.query("ROLLBACK");
                return res.status(400).json({
                    message:
                        "Vous ne pouvez pas vous transférer des crédits à vous-même.",
                });
            }

            // Effectuer le transfert
            await db.query(
                "UPDATE User SET credits = credits - ? WHERE id = ?",
                [amount, userId]
            );
            await db.query(
                "UPDATE User SET credits = credits + ? WHERE id = ?",
                [amount, recipient.id]
            );

            await db.query("COMMIT");

            res.status(200).json({
                message: `Transfert de ${amount} crédits effectué avec succès vers ${recipient.pseudo} !`,
            });
        } catch (error) {
            await db.query("ROLLBACK");
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
