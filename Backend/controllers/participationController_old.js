const { PrismaClient, PrismaClientKnownRequestError } = require('@prisma/client');
const prisma = new PrismaClient();

/* --------------------------------------------------- Vérifier les conditions de participation ------------------- */
const checkParticipationConditions = async (req, res) => {
    try {
        const userId = req.user.id;
        const carpoolingId = req.params.id;

        // Vérifier que le covoiturage existe et est disponible
        const carpooling = await prisma.carpooling.findUnique({
            where: { id: parseInt(carpoolingId) },
            select: {
                driver_id: true,
                status: true,
                price_per_passenger: true,
                seats_remaining: true
            }
        });

        if (!carpooling) {
            return res.status(404).json({ message: "Covoiturage non trouvé." });
        }

        // Vérifier que l'utilisateur n'est pas le chauffeur
        if (carpooling.driver_id === userId) {
            return res.status(400).json({
                message:
                    "Vous ne pouvez pas rejoindre votre propre covoiturage.",
            });
        }

        // Vérifier que le covoiturage est disponible
        if (carpooling.status !== "prévu") {
            return res.status(400).json({
                message: "Ce covoiturage n'est plus disponible.",
            });
        }

        // Vérifier qu'il reste au moins une place (revérification)
        if (carpooling.seats_remaining <= 0) {
            return res.status(400).json({
                message:
                    "Il n'y a plus de places disponibles pour ce covoiturage.",
            });
        }

        // Vérifier que l'utilisateur ne participe pas déjà
        const existingParticipation = await prisma.participation.findFirst({
            where: {
                passenger_id: userId,
                carpooling_id: parseInt(carpoolingId),
                cancellation_date: null
            }
        });

        if (existingParticipation) {
            return res.status(400).json({
                message: "Vous participez déjà à ce covoiturage.",
            });
        }

        // Vérifier que l'utilisateur a assez de crédits
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { credits: true }
        });

        if (user.credits < carpooling.price_per_passenger) {
            return res.status(400).json({
                message:
                    "Vous n'avez pas assez de crédits pour ce covoiturage.",
            });
        }

        // Toutes les conditions sont remplies, retourner les informations pour confirmation
        res.status(200).json({
            message: "Participation possible",
            carpooling: {
                id: carpoolingId,
                price_per_passenger: carpooling.price_per_passenger,
                seats_remaining: carpooling.seats_remaining,
            },
            user: {
                current_credits: user.credits,
                credits_after_participation:
                    user.credits - carpooling.price_per_passenger,
            },
        });
    } catch (error) {
        console.error("Erreur vérification participation:", error);
        
        if (error instanceof PrismaClientKnownRequestError) {
            return res.status(400).json({
                message: "Erreur de base de données.",
                error: process.env.NODE_ENV === "development" ? error.message : undefined,
            });
        }
        
        res.status(500).json({
            message:
                "Erreur lors de la vérification des conditions de participation.",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};

/* --------------------------------------------------- Rejoindre un covoiturage (avec confirmation) -------------- */
const joinCarpooling = async (req, res) => {
    try {
        const userId = req.user.id;
        const carpoolingId = req.params.id;
        const { confirmed } = req.body; // Indication que l'utilisateur confirme

        // Vérifier que la confirmation est explicite
        if (!confirmed) {
            return res.status(400).json({
                message:
                    "La confirmation explicite est requise pour participer au covoiturage.",
            });
        }

        // Démarrer une transaction Prisma
        const result = await prisma.$transaction(async (transactionPrisma) => {
            // RE-VÉRIFIER toutes les conditions (car d'autres auraient pu déjà participer)
            const carpooling = await transactionPrisma.carpooling.findUnique({
                where: { id: parseInt(carpoolingId) },
                select: {
                    driver_id: true,
                    status: true,
                    price_per_passenger: true,
                    seats_remaining: true
                }
            });

            if (!carpooling) {
                throw new Error("Covoiturage non trouvé.");
            }

            // Re-vérifier que l'utilisateur n'est pas le chauffeur
            if (carpooling.driver_id === userId) {
                throw new Error("Vous ne pouvez pas rejoindre votre propre covoiturage.");
            }

            // Re-vérifier que le covoiturage est disponible
            if (carpooling.status !== "prévu") {
                throw new Error("Ce covoiturage n'est plus disponible.");
            }

            // RE-VÉRIFIER qu'il reste au moins une place (crucial car d'autres ont pu participer)
            if (carpooling.seats_remaining <= 0) {
                throw new Error("Plus de places disponibles ! D'autres passagers ont réservé entre temps.");
            }

            // Re-vérifier que l'utilisateur ne participe pas déjà
            const existingParticipation = await transactionPrisma.participation.findFirst({
                where: {
                    passenger_id: userId,
                    carpooling_id: parseInt(carpoolingId),
                    cancellation_date: null
                }
            });

            if (existingParticipation) {
                throw new Error("Vous participez déjà à ce covoiturage.");
            }

            // RE-VÉRIFIER que l'utilisateur a assez de crédits
            const user = await transactionPrisma.user.findUnique({
                where: { id: userId },
                select: { credits: true }
            });

            if (user.credits < carpooling.price_per_passenger) {
                throw new Error("Vous n'avez plus assez de crédits pour ce covoiturage.");
            }

            // Débiter les crédits de l'utilisateur
            await transactionPrisma.user.update({
                where: { id: userId },
                data: { credits: { decrement: carpooling.price_per_passenger } }
            });

            // Créer la participation
            const participation = await transactionPrisma.participation.create({
                data: {
                    passenger_id: userId,
                    carpooling_id: parseInt(carpoolingId),
                    price_paid: carpooling.price_per_passenger,
                    participation_date: new Date(),
                    status: 'confirmé'
                }
            });

            // Réduire le nombre de places disponibles
            await transactionPrisma.carpooling.update({
                where: { id: parseInt(carpoolingId) },
                data: { seats_remaining: { decrement: 1 } }
            });

            // Enregistrer l'historique des crédits
            await transactionPrisma.credit_transaction.create({
                data: {
                    user_id: userId,
                    transaction_type: 'débit',
                    amount: carpooling.price_per_passenger,
                    description: `Participation au covoiturage #${carpoolingId}`,
                    transaction_date: new Date()
                }
            });

            return {
                participation,
                remaining_credits: user.credits - carpooling.price_per_passenger
            };
        });

        res.status(201).json({
            message: "Participation confirmée avec succès !",
            participation: result.participation,
            remaining_credits: result.remaining_credits,
        });
    } catch (error) {
        console.error("Erreur lors de la participation:", error);
        
        if (error instanceof PrismaClientKnownRequestError) {
            return res.status(400).json({
                message: "Erreur de base de données.",
                error: process.env.NODE_ENV === "development" ? error.message : undefined,
            });
        }
        
        // Erreurs métier de la transaction
        if (error.message.includes("covoiturage") || error.message.includes("crédits") || error.message.includes("places")) {
            return res.status(400).json({
                message: error.message,
            });
        }
        
        res.status(500).json({
            message: "Erreur lors de la participation au covoiturage.",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};

/* --------------------------------------------------- Annuler sa participation ---------------------------------- */
const cancelParticipation = async (req, res) => {
    try {
        const userId = req.user.id;
        const carpoolingId = req.params.id;

        // Démarrer une transaction
        await db.query("START TRANSACTION");

        try {
            // Vérifier que la participation existe
            const participationSql = `
                SELECT p.credits_paid, c.status, c.departure_datetime
                FROM Participation p
                INNER JOIN Carpooling c ON p.carpooling_id = c.id
                WHERE p.passenger_id = ? AND p.carpooling_id = ? AND p.cancellation_date IS NULL
            `;
            const [participationCheck] = await db.query(participationSql, [
                userId,
                carpoolingId,
            ]);

            if (participationCheck.length === 0) {
                await db.query("ROLLBACK");
                return res.status(404).json({
                    message: "Participation non trouvée ou déjà annulée.",
                });
            }

            const participation = participationCheck[0];

            // Vérifier que le covoiturage n'a pas encore démarré
            if (participation.status !== "prévu") {
                await db.query("ROLLBACK");
                return res.status(400).json({
                    message:
                        "Impossible d'annuler une participation à un covoiturage déjà démarré ou terminé.",
                });
            }

            // Vérifier que l'annulation se fait au moins 2 heures avant le départ (politique d'annulation)
            const departureTime = new Date(participation.departure_datetime);
            const now = new Date();
            const hoursUntilDeparture = (departureTime - now) / (1000 * 60 * 60);

            let refundAmount = participation.price_paid;

            // Politique d'annulation : pénalité si annulation moins de 2h avant
            if (hoursUntilDeparture < 2) {
                refundAmount = Math.floor(participation.price_paid * 0.5); // 50% de remboursement
            }

            // Rembourser l'utilisateur
            await transactionPrisma.user.update({
                where: { id: userId },
                data: { credits: { increment: refundAmount } }
            });

            // Marquer la participation comme annulée
            await transactionPrisma.participation.update({
                where: { id: participation.id },
                data: { cancellation_date: new Date() }
            });

            // Incrémenter le nombre de places disponibles
            await transactionPrisma.carpooling.update({
                where: { id: parseInt(carpoolingId) },
                data: { seats_remaining: { increment: 1 } }
            });

            // Enregistrer l'historique des crédits pour le remboursement
            await transactionPrisma.credit_transaction.create({
                data: {
                    user_id: userId,
                    transaction_type: 'crédit',
                    amount: refundAmount,
                    description: `Remboursement annulation covoiturage #${carpoolingId}`,
                    transaction_date: new Date()
                }
            });

            const penalty = participation.price_paid - refundAmount;
            
            return {
                refundAmount,
                penalty,
                originalAmount: participation.price_paid
            };
        });

        let message = "Participation annulée avec succès !";

        if (result.penalty > 0) {
            message += ` Une pénalité de ${result.penalty} crédits a été appliquée pour annulation tardive.`;
        }

        res.status(200).json({
            message: message,
            creditsRefunded: result.refundAmount,
            penalty: result.penalty,
        });
    } catch (error) {
        console.error("Erreur annulation participation:", error);
        
        if (error instanceof PrismaClientKnownRequestError) {
            return res.status(400).json({
                message: "Erreur de base de données.",
                error: process.env.NODE_ENV === "development" ? error.message : undefined,
            });
        }
        
        // Erreurs métier
        if (error.message.includes("Participation") || error.message.includes("covoiturage")) {
            return res.status(400).json({
                message: error.message,
            });
        }
        
        res.status(500).json({
            message: "Erreur lors de l'annulation de la participation.",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};

/* --------------------------------------------------- Lister les participations d'un utilisateur -------------- */
const getUserParticipations = async (req, res) => {
    try {
        const userId = req.user.id;

        const sql = `
            SELECT p.*, c.departure_address, c.arrival_address, c.departure_datetime, 
                   c.arrival_datetime, c.status as carpooling_status,
                   u.pseudo as driver_pseudo,
                   v.model, v.plate_number
            FROM Participation p
            INNER JOIN Carpooling c ON p.carpooling_id = c.id
            INNER JOIN User u ON c.driver_id = u.id
            INNER JOIN Vehicle v ON c.vehicle_id = v.id
            WHERE p.passenger_id = ?
            ORDER BY c.departure_datetime DESC
        `;
        const [participations] = await db.query(sql, [userId]);

        res.status(200).json({ participations });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur lors de la récupération des participations.",
        });
    }
};

/* --------------------------------------------------- Valider une participation --------------------------------- */
const validateParticipation = async (req, res) => {
    try {
        const userId = req.user.id;
        const carpoolingId = req.params.id;
        const { is_validated } = req.body; // true ou false

        if (typeof is_validated !== "boolean") {
            return res.status(400).json({
                message: "La validation doit être true ou false.",
            });
        }

        // Vérifier que la participation existe et que le covoiturage est terminé
        const participationSql = `
            SELECT p.id, c.status
            FROM Participation p
            INNER JOIN Carpooling c ON p.carpooling_id = c.id
            WHERE p.passenger_id = ? AND p.carpooling_id = ? AND p.cancellation_date IS NULL
        `;
        const [participationCheck] = await db.query(participationSql, [
            userId,
            carpoolingId,
        ]);

        if (participationCheck.length === 0) {
            return res.status(404).json({
                message: "Participation non trouvée.",
            });
        }

        if (participationCheck[0].status !== "terminé") {
            return res.status(400).json({
                message: "Vous ne pouvez valider qu'un covoiturage terminé.",
            });
        }

        // Mettre à jour la validation
        const [result] = await db.query(
            "UPDATE Participation SET is_validated_by_passenger = ? WHERE passenger_id = ? AND carpooling_id = ?",
            [is_validated, userId, carpoolingId]
        );

        if (result.affectedRows > 0) {
            const message = is_validated
                ? "Covoiturage validé avec succès !"
                : "Problème signalé sur ce covoiturage.";
            res.status(200).json({ message });
        } else {
            res.status(500).json({ message: "Erreur lors de la validation." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur lors de la validation de la participation.",
        });
    }
};

/* --------------------------------------------------- Obtenir les participants d'un covoiturage -------------- */
const getCarpoolingParticipants = async (req, res) => {
    try {
        const userId = req.user.id;
        const carpoolingId = req.params.id;

        // Vérifier que l'utilisateur est le chauffeur de ce covoiturage
        const ownerCheckSql = "SELECT driver_id FROM Carpooling WHERE id = ?";
        const [ownerCheck] = await db.query(ownerCheckSql, [carpoolingId]);

        if (ownerCheck.length === 0) {
            return res.status(404).json({ message: "Covoiturage non trouvé." });
        }

        if (ownerCheck[0].driver_id !== userId) {
            return res.status(403).json({
                message:
                    "Vous ne pouvez voir que les participants de vos propres covoiturages.",
            });
        }

        // Récupérer les participants
        const sql = `
            SELECT p.*, u.pseudo, u.email, u.profile_picture_url
            FROM Participation p
            INNER JOIN User u ON p.passenger_id = u.id
            WHERE p.carpooling_id = ? AND p.cancellation_date IS NULL
            ORDER BY p.participation_date ASC
        `;
        const [participants] = await db.query(sql, [carpoolingId]);

        res.status(200).json({ participants });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur lors de la récupération des participants.",
        });
    }
};

module.exports = {
    checkParticipationConditions,
    joinCarpooling,
    cancelParticipation,
    getUserParticipations,
    validateParticipation,
    getCarpoolingParticipants,
};
