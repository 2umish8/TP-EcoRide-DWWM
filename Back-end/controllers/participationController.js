const db = require("../Config/db.js");

/* --------------------------------------------------- Rejoindre un covoiturage ---------------------------------- */
const joinCarpooling = async (req, res) => {
    try {
        const userId = req.user.id;
        const carpoolingId = req.params.id;

        // Démarrer une transaction
        await db.query("START TRANSACTION");

        try {
            // Vérifier que le covoiturage existe et est disponible
            const carpoolingSql = `
                SELECT driver_id, status, price_per_passenger, seats_remaining 
                FROM Carpooling 
                WHERE id = ?
            `;
            const [carpoolingCheck] = await db.query(carpoolingSql, [
                carpoolingId,
            ]);

            if (carpoolingCheck.length === 0) {
                await db.query("ROLLBACK");
                return res
                    .status(404)
                    .json({ message: "Covoiturage non trouvé." });
            }

            const carpooling = carpoolingCheck[0];

            // Vérifier que l'utilisateur n'est pas le chauffeur
            if (carpooling.driver_id === userId) {
                await db.query("ROLLBACK");
                return res.status(400).json({
                    message:
                        "Vous ne pouvez pas rejoindre votre propre covoiturage.",
                });
            }

            // Vérifier que le covoiturage est disponible
            if (carpooling.status !== "prévu") {
                await db.query("ROLLBACK");
                return res.status(400).json({
                    message: "Ce covoiturage n'est plus disponible.",
                });
            }

            if (carpooling.seats_remaining <= 0) {
                await db.query("ROLLBACK");
                return res.status(400).json({
                    message:
                        "Il n'y a plus de places disponibles pour ce covoiturage.",
                });
            }

            // Vérifier que l'utilisateur ne participe pas déjà
            const existingParticipationSql = `
                SELECT id FROM Participation 
                WHERE passenger_id = ? AND carpooling_id = ? AND cancellation_date IS NULL
            `;
            const [existingParticipation] = await db.query(
                existingParticipationSql,
                [userId, carpoolingId]
            );

            if (existingParticipation.length > 0) {
                await db.query("ROLLBACK");
                return res.status(400).json({
                    message: "Vous participez déjà à ce covoiturage.",
                });
            }

            // Vérifier que l'utilisateur a assez de crédits
            const userSql = "SELECT credits FROM User WHERE id = ?";
            const [userCheck] = await db.query(userSql, [userId]);

            if (userCheck[0].credits < carpooling.price_per_passenger) {
                await db.query("ROLLBACK");
                return res.status(400).json({
                    message:
                        "Vous n'avez pas assez de crédits pour ce covoiturage.",
                });
            }

            // Débiter les crédits de l'utilisateur
            await db.query(
                "UPDATE User SET credits = credits - ? WHERE id = ?",
                [carpooling.price_per_passenger, userId]
            );

            // Créer la participation
            const participationSql = `
                INSERT INTO Participation (passenger_id, carpooling_id, credits_paid) 
                VALUES (?, ?, ?)
            `;
            await db.query(participationSql, [
                userId,
                carpoolingId,
                carpooling.price_per_passenger,
            ]);

            // Décrémenter le nombre de places restantes
            await db.query(
                "UPDATE Carpooling SET seats_remaining = seats_remaining - 1 WHERE id = ?",
                [carpoolingId]
            );

            await db.query("COMMIT");

            res.status(200).json({
                message: "Vous avez rejoint le covoiturage avec succès !",
                creditsDebited: carpooling.price_per_passenger,
            });
        } catch (error) {
            await db.query("ROLLBACK");
            throw error;
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur lors de la participation au covoiturage.",
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
            const hoursUntilDeparture =
                (departureTime - now) / (1000 * 60 * 60);

            let refundAmount = participation.credits_paid;

            // Politique d'annulation : pénalité si annulation moins de 2h avant
            if (hoursUntilDeparture < 2) {
                refundAmount = Math.floor(participation.credits_paid * 0.5); // 50% de remboursement
            }

            // Rembourser l'utilisateur
            await db.query(
                "UPDATE User SET credits = credits + ? WHERE id = ?",
                [refundAmount, userId]
            );

            // Marquer la participation comme annulée
            await db.query(
                "UPDATE Participation SET cancellation_date = CURRENT_TIMESTAMP WHERE passenger_id = ? AND carpooling_id = ?",
                [userId, carpoolingId]
            );

            // Incrémenter le nombre de places disponibles
            await db.query(
                "UPDATE Carpooling SET seats_remaining = seats_remaining + 1 WHERE id = ?",
                [carpoolingId]
            );

            await db.query("COMMIT");

            const penalty = participation.credits_paid - refundAmount;
            let message = "Participation annulée avec succès !";

            if (penalty > 0) {
                message += ` Une pénalité de ${penalty} crédits a été appliquée pour annulation tardive.`;
            }

            res.status(200).json({
                message: message,
                creditsRefunded: refundAmount,
                penalty: penalty,
            });
        } catch (error) {
            await db.query("ROLLBACK");
            throw error;
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur lors de l'annulation de la participation.",
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
    joinCarpooling,
    cancelParticipation,
    getUserParticipations,
    validateParticipation,
    getCarpoolingParticipants,
};
