const db = require("../Config/db.js");
const Review = require("../models/Review");
const DriverPreferences = require("../models/DriverPreferences");

/* --------------------------------------------------- Créer un covoiturage -------------------------------------- */
const createCarpooling = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            departure_address,
            arrival_address,
            departure_datetime,
            arrival_datetime,
            price_per_passenger,
            seats_offered,
            vehicle_id,
        } = req.body;

        // Validation des données obligatoires
        if (
            !departure_address ||
            !arrival_address ||
            !departure_datetime ||
            !arrival_datetime ||
            !price_per_passenger ||
            !seats_offered ||
            !vehicle_id
        ) {
            return res.status(400).json({
                message:
                    "Veuillez fournir toutes les informations obligatoires.",
            });
        }

        // Vérifier que l'utilisateur est propriétaire du véhicule
        const vehicleCheckSql =
            "SELECT user_id, seats_available FROM Vehicle WHERE id = ?";
        const [vehicleCheck] = await db.query(vehicleCheckSql, [vehicle_id]);

        if (vehicleCheck.length === 0) {
            return res.status(404).json({ message: "Véhicule non trouvé." });
        }

        if (vehicleCheck[0].user_id !== userId) {
            return res.status(403).json({
                message: "Vous ne pouvez utiliser que vos propres véhicules.",
            });
        }

        // Vérifier que le nombre de places offertes ne dépasse pas la capacité du véhicule
        if (seats_offered > vehicleCheck[0].seats_available) {
            return res.status(400).json({
                message: `Ce véhicule n'a que ${vehicleCheck[0].seats_available} places disponibles.`,
            });
        }

        // Vérifier que les dates sont cohérentes
        const departureDate = new Date(departure_datetime);
        const arrivalDate = new Date(arrival_datetime);
        const now = new Date();

        if (departureDate <= now) {
            return res.status(400).json({
                message: "La date de départ doit être dans le futur.",
            });
        }

        if (arrivalDate <= departureDate) {
            return res.status(400).json({
                message: "La date d'arrivée doit être après la date de départ.",
            });
        }

        // Créer le covoiturage
        const carpoolingSql = `
            INSERT INTO Carpooling (
                departure_address, arrival_address, departure_datetime, arrival_datetime,
                price_per_passenger, initial_seats_offered, seats_remaining, driver_id, vehicle_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(carpoolingSql, [
            departure_address,
            arrival_address,
            departure_datetime,
            arrival_datetime,
            price_per_passenger,
            seats_offered,
            seats_offered,
            userId,
            vehicle_id,
        ]);

        if (result.affectedRows > 0) {
            res.status(201).json({
                message: "Covoiturage créé avec succès !",
                carpoolingId: result.insertId,
            });
        } else {
            res.status(500).json({
                message: "Erreur lors de la création du covoiturage.",
            });
        }
    } catch (error) {
        console.error(
            "Erreur détaillée lors de la création du covoiturage:",
            error
        );
        console.error("Code erreur:", error.code);
        console.error("Message SQL:", error.sqlMessage);
        res.status(500).json({
            message: "Erreur lors de la création du covoiturage.",
        });
    }
};

/* --------------------------------------------------- Lister tous les covoiturages disponibles --------------- */
const getAvailableCarpoolings = async (req, res) => {
    try {
        const {
            departure,
            arrival,
            date,
            maxPrice,
            isElectric,
            maxDuration,
            minRating,
        } = req.query;

        let sql = `
            SELECT c.*, 
                   u.pseudo as driver_pseudo,
                   u.profile_picture_url as driver_photo,
                   v.model, v.plate_number, v.is_electric,
                   b.name as brand_name, 
                   col.name as color_name,
                   TIMESTAMPDIFF(MINUTE, c.departure_datetime, c.arrival_datetime) as duration_minutes
            FROM Carpooling c
            INNER JOIN User u ON c.driver_id = u.id
            INNER JOIN Vehicle v ON c.vehicle_id = v.id
            LEFT JOIN Brand b ON v.brand_id = b.id
            LEFT JOIN Color col ON v.color_id = col.id
            WHERE c.status = 'prévu' AND c.seats_remaining > 0
        `;
        const params = [];

        // Filtres optionnels selon le cahier des charges (US 4)
        if (departure) {
            sql += " AND c.departure_address LIKE ?";
            params.push(`%${departure}%`);
        }
        if (arrival) {
            sql += " AND c.arrival_address LIKE ?";
            params.push(`%${arrival}%`);
        }
        if (date) {
            sql += " AND DATE(c.departure_datetime) = ?";
            params.push(date);
        }

        // Filtre prix maximum
        if (maxPrice) {
            sql += " AND c.price_per_passenger <= ?";
            params.push(parseFloat(maxPrice));
        }

        // Filtre écologique (voiture électrique)
        if (isElectric === "true") {
            sql += " AND v.is_electric = 1";
        }

        // Filtre durée maximale (en minutes)
        if (maxDuration) {
            sql +=
                " AND TIMESTAMPDIFF(MINUTE, c.departure_datetime, c.arrival_datetime) <= ?";
            params.push(parseInt(maxDuration));
        }

        sql += " ORDER BY c.departure_datetime ASC";

        const [carpoolings] = await db.query(sql, params);

        // Enrichir avec les notes MongoDB des chauffeurs
        if (carpoolings.length > 0) {
            const driverIds = [...new Set(carpoolings.map((c) => c.driver_id))];

            // Récupérer les moyennes des notes depuis MongoDB
            const driverRatings = {};
            for (const driverId of driverIds) {
                const rating = await Review.getAverageRating(driverId);
                driverRatings[driverId] = rating.average;
            }

            // Ajouter les notes aux covoiturages
            carpoolings.forEach((carpooling) => {
                carpooling.driver_rating =
                    driverRatings[carpooling.driver_id] || 0;
            });

            // Filtrer par note minimale si spécifiée
            if (minRating && parseFloat(minRating) > 0) {
                const filteredCarpoolings = carpoolings.filter(
                    (c) => c.driver_rating >= parseFloat(minRating)
                );

                if (filteredCarpoolings.length === 0) {
                    return res.status(200).json({
                        carpoolings: [],
                        message: `Aucun covoiturage trouvé avec une note minimale de ${minRating}.`,
                    });
                }

                return res
                    .status(200)
                    .json({ carpoolings: filteredCarpoolings });
            }
        }

        // Si aucun résultat trouvé, proposer la date du prochain itinéraire disponible
        if (carpoolings.length === 0 && date) {
            const nextAvailableSql = `
                SELECT MIN(DATE(c.departure_datetime)) as next_date
                FROM Carpooling c
                WHERE c.status = 'prévu' AND c.seats_remaining > 0
                AND DATE(c.departure_datetime) > ?
                ${departure ? "AND c.departure_address LIKE ?" : ""}
                ${arrival ? "AND c.arrival_address LIKE ?" : ""}
            `;
            const nextParams = [date];
            if (departure) nextParams.push(`%${departure}%`);
            if (arrival) nextParams.push(`%${arrival}%`);

            const [nextAvailable] = await db.query(
                nextAvailableSql,
                nextParams
            );

            return res.status(200).json({
                carpoolings: [],
                nextAvailableDate: nextAvailable[0]?.next_date || null,
                message:
                    "Aucun covoiturage trouvé pour cette date. Consultez la prochaine date disponible.",
            });
        }

        res.status(200).json({ carpoolings });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur lors de la récupération des covoiturages.",
        });
    }
};

/* --------------------------------------------------- Obtenir les covoiturages d'un chauffeur ---------------- */
const getDriverCarpoolings = async (req, res) => {
    try {
        const userId = req.user.id;

        const sql = `
            SELECT c.*, 
                   v.model, v.plate_number,
                   COUNT(p.id) as participants_count
            FROM Carpooling c
            INNER JOIN Vehicle v ON c.vehicle_id = v.id
            LEFT JOIN Participation p ON c.id = p.carpooling_id AND p.cancellation_date IS NULL
            WHERE c.driver_id = ?
            GROUP BY c.id
            ORDER BY c.departure_datetime DESC
        `;
        const [carpoolings] = await db.query(sql, [userId]);

        res.status(200).json({ carpoolings });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur lors de la récupération des covoiturages.",
        });
    }
};

/* --------------------------------------------------- Modifier un covoiturage ----------------------------------- */
const updateCarpooling = async (req, res) => {
    try {
        const userId = req.user.id;
        const carpoolingId = req.params.id;
        const {
            departure_address,
            arrival_address,
            departure_datetime,
            arrival_datetime,
            price_per_passenger,
        } = req.body;

        // Vérifier que le covoiturage appartient à l'utilisateur
        const ownerCheckSql =
            "SELECT driver_id, status, initial_seats_offered, seats_remaining FROM Carpooling WHERE id = ?";
        const [ownerCheck] = await db.query(ownerCheckSql, [carpoolingId]);

        if (ownerCheck.length === 0) {
            return res.status(404).json({ message: "Covoiturage non trouvé." });
        }

        if (ownerCheck[0].driver_id !== userId) {
            return res.status(403).json({
                message:
                    "Vous ne pouvez modifier que vos propres covoiturages.",
            });
        }

        // Vérifier que le covoiturage peut encore être modifié
        if (ownerCheck[0].status !== "prévu") {
            return res.status(400).json({
                message: "Seuls les covoiturages prévus peuvent être modifiés.",
            });
        }

        // Vérifier s'il y a déjà des participants
        const participantsCount =
            ownerCheck[0].initial_seats_offered - ownerCheck[0].seats_remaining;
        if (participantsCount > 0) {
            return res.status(400).json({
                message:
                    "Impossible de modifier ce covoiturage car des passagers y participent déjà.",
            });
        }

        // Construire la requête de mise à jour dynamiquement
        const updates = [];
        const values = [];

        if (departure_address !== undefined) {
            updates.push("departure_address = ?");
            values.push(departure_address);
        }
        if (arrival_address !== undefined) {
            updates.push("arrival_address = ?");
            values.push(arrival_address);
        }
        if (departure_datetime !== undefined) {
            // Vérifier que la nouvelle date est dans le futur
            const departureDate = new Date(departure_datetime);
            if (departureDate <= new Date()) {
                return res.status(400).json({
                    message: "La date de départ doit être dans le futur.",
                });
            }
            updates.push("departure_datetime = ?");
            values.push(departure_datetime);
        }
        if (arrival_datetime !== undefined) {
            updates.push("arrival_datetime = ?");
            values.push(arrival_datetime);
        }
        if (price_per_passenger !== undefined) {
            updates.push("price_per_passenger = ?");
            values.push(price_per_passenger);
        }

        if (updates.length === 0) {
            return res
                .status(400)
                .json({ message: "Aucune donnée à mettre à jour." });
        }

        values.push(carpoolingId);
        const updateSql = `UPDATE Carpooling SET ${updates.join(
            ", "
        )} WHERE id = ?`;
        const [result] = await db.query(updateSql, values);

        if (result.affectedRows > 0) {
            res.status(200).json({
                message: "Covoiturage mis à jour avec succès !",
            });
        } else {
            res.status(500).json({
                message: "Erreur lors de la mise à jour du covoiturage.",
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur lors de la mise à jour du covoiturage.",
        });
    }
};

/* --------------------------------------------------- Annuler un covoiturage ------------------------------------ */
const cancelCarpooling = async (req, res) => {
    try {
        const userId = req.user.id;
        const carpoolingId = req.params.id;

        // Démarrer une transaction
        await db.query("START TRANSACTION");

        try {
            // Vérifier que le covoiturage appartient à l'utilisateur
            const carpoolingSql =
                "SELECT driver_id, status, price_per_passenger FROM Carpooling WHERE id = ?";
            const [carpoolingCheck] = await db.query(carpoolingSql, [
                carpoolingId,
            ]);

            if (carpoolingCheck.length === 0) {
                await db.query("ROLLBACK");
                return res
                    .status(404)
                    .json({ message: "Covoiturage non trouvé." });
            }

            if (carpoolingCheck[0].driver_id !== userId) {
                await db.query("ROLLBACK");
                return res.status(403).json({
                    message:
                        "Vous ne pouvez annuler que vos propres covoiturages.",
                });
            }

            if (carpoolingCheck[0].status === "annulé") {
                await db.query("ROLLBACK");
                return res
                    .status(400)
                    .json({ message: "Ce covoiturage est déjà annulé." });
            }

            // Récupérer les participants pour les rembourser
            const participantsSql = `
                SELECT passenger_id, credits_paid 
                FROM Participation 
                WHERE carpooling_id = ? AND cancellation_date IS NULL
            `;
            const [participants] = await db.query(participantsSql, [
                carpoolingId,
            ]);

            // Rembourser les participants
            for (const participant of participants) {
                await db.query(
                    "UPDATE User SET credits = credits + ? WHERE id = ?",
                    [participant.credits_paid, participant.passenger_id]
                );

                // Marquer la participation comme annulée
                await db.query(
                    "UPDATE Participation SET cancellation_date = CURRENT_TIMESTAMP WHERE passenger_id = ? AND carpooling_id = ?",
                    [participant.passenger_id, carpoolingId]
                );
            }

            // Marquer le covoiturage comme annulé
            await db.query(
                "UPDATE Carpooling SET status = 'annulé' WHERE id = ?",
                [carpoolingId]
            );

            await db.query("COMMIT");

            res.status(200).json({
                message:
                    "Covoiturage annulé avec succès. Les participants ont été remboursés.",
            });
        } catch (error) {
            await db.query("ROLLBACK");
            throw error;
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur lors de l'annulation du covoiturage.",
        });
    }
};

/* --------------------------------------------------- Démarrer un covoiturage ----------------------------------- */
const startCarpooling = async (req, res) => {
    try {
        const userId = req.user.id;
        const carpoolingId = req.params.id;

        // Vérifier que le covoiturage appartient à l'utilisateur
        const ownerCheckSql =
            "SELECT driver_id, status FROM Carpooling WHERE id = ?";
        const [ownerCheck] = await db.query(ownerCheckSql, [carpoolingId]);

        if (ownerCheck.length === 0) {
            return res.status(404).json({ message: "Covoiturage non trouvé." });
        }

        if (ownerCheck[0].driver_id !== userId) {
            return res.status(403).json({
                message:
                    "Vous ne pouvez démarrer que vos propres covoiturages.",
            });
        }

        if (ownerCheck[0].status !== "prévu") {
            return res.status(400).json({
                message: "Seuls les covoiturages prévus peuvent être démarrés.",
            });
        }

        // Marquer le covoiturage comme démarré
        const [result] = await db.query(
            "UPDATE Carpooling SET status = 'démarré' WHERE id = ?",
            [carpoolingId]
        );

        if (result.affectedRows > 0) {
            res.status(200).json({
                message: "Covoiturage démarré avec succès !",
            });
        } else {
            res.status(500).json({
                message: "Erreur lors du démarrage du covoiturage.",
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur lors du démarrage du covoiturage.",
        });
    }
};

/* --------------------------------------------------- Terminer un covoiturage ----------------------------------- */
const finishCarpooling = async (req, res) => {
    try {
        const userId = req.user.id;
        const carpoolingId = req.params.id;

        // Démarrer une transaction
        await db.query("START TRANSACTION");

        try {
            // Vérifier que le covoiturage appartient à l'utilisateur
            const carpoolingSql =
                "SELECT driver_id, status, price_per_passenger, platform_commission_earned FROM Carpooling WHERE id = ?";
            const [carpoolingCheck] = await db.query(carpoolingSql, [
                carpoolingId,
            ]);

            if (carpoolingCheck.length === 0) {
                await db.query("ROLLBACK");
                return res
                    .status(404)
                    .json({ message: "Covoiturage non trouvé." });
            }

            if (carpoolingCheck[0].driver_id !== userId) {
                await db.query("ROLLBACK");
                return res.status(403).json({
                    message:
                        "Vous ne pouvez terminer que vos propres covoiturages.",
                });
            }

            if (carpoolingCheck[0].status !== "démarré") {
                await db.query("ROLLBACK");
                return res.status(400).json({
                    message:
                        "Seuls les covoiturages démarrés peuvent être terminés.",
                });
            }

            // Calculer les gains du chauffeur (nombre de participants * prix - commission)
            const participantsSql = `
                SELECT COUNT(*) as participants_count 
                FROM Participation 
                WHERE carpooling_id = ? AND cancellation_date IS NULL
            `;
            const [participantsResult] = await db.query(participantsSql, [
                carpoolingId,
            ]);
            const participantsCount = participantsResult[0].participants_count;

            const totalEarnings =
                participantsCount * carpoolingCheck[0].price_per_passenger;
            const commission =
                participantsCount *
                carpoolingCheck[0].platform_commission_earned;
            const driverEarnings = totalEarnings - commission;

            // Créditer le chauffeur
            await db.query(
                "UPDATE User SET credits = credits + ? WHERE id = ?",
                [driverEarnings, userId]
            );

            // Marquer le covoiturage comme terminé
            await db.query(
                "UPDATE Carpooling SET status = 'terminé' WHERE id = ?",
                [carpoolingId]
            );

            await db.query("COMMIT");

            res.status(200).json({
                message: "Covoiturage terminé avec succès !",
                earnings: driverEarnings,
                commission: commission,
            });
        } catch (error) {
            await db.query("ROLLBACK");
            throw error;
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur lors de la finalisation du covoiturage.",
        });
    }
};

// --------------------------------------------------- Détail d'un covoiturage par ID ----------------------------
const getCarpoolingById = async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `
            SELECT c.*, 
                   u.pseudo as driver_pseudo,
                   u.profile_picture_url as driver_photo,
                   v.model, v.plate_number, v.is_electric,
                   b.name as brand_name, 
                   col.name as color_name,
                   TIMESTAMPDIFF(MINUTE, c.departure_datetime, c.arrival_datetime) as duration_minutes
            FROM Carpooling c
            INNER JOIN User u ON c.driver_id = u.id
            INNER JOIN Vehicle v ON c.vehicle_id = v.id
            LEFT JOIN Brand b ON v.brand_id = b.id
            LEFT JOIN Color col ON v.color_id = col.id
            WHERE c.id = ?
        `;
        const [results] = await db.query(sql, [id]);
        if (results.length === 0) {
            return res.status(404).json({ message: "Covoiturage non trouvé." });
        }

        const carpooling = results[0];

        // Enrichir avec les données MongoDB
        // 1. Note moyenne du chauffeur
        const rating = await Review.getAverageRating(carpooling.driver_id);
        carpooling.driver_rating = rating.average;
        carpooling.total_reviews = rating.total;

        // 2. Préférences du chauffeur
        const preferences = await DriverPreferences.findByDriverId(
            carpooling.driver_id
        );
        carpooling.driver_preferences = preferences
            ? {
                  allowsSmoking: preferences.allowsSmoking,
                  allowsPets: preferences.allowsPets,
                  conversationLevel: preferences.conversationLevel,
                  preferredMusicGenre: preferences.preferredMusicGenre,
                  specialRules: preferences.specialRules,
                  customPreferences: preferences.customPreferences,
              }
            : null;

        // 3. Quelques avis récents (3 derniers)
        const recentReviews = await Review.find({
            reviewedUserId: carpooling.driver_id,
            validationStatus: "approved",
        })
            .sort({ createdAt: -1 })
            .limit(3);

        if (recentReviews.length > 0) {
            // Récupérer les pseudos des reviewers
            const reviewerIds = recentReviews.map((r) => r.reviewerId);
            const reviewersSql = `
                SELECT id, pseudo 
                FROM User 
                WHERE id IN (${reviewerIds.join(",")})
            `;
            const [reviewers] = await db.query(reviewersSql);
            const reviewersMap = reviewers.reduce((map, reviewer) => {
                map[reviewer.id] = reviewer;
                return map;
            }, {});

            carpooling.recent_reviews = recentReviews.map((review) => ({
                rating: review.rating,
                comment: review.comment,
                createdAt: review.createdAt,
                reviewer_pseudo:
                    reviewersMap[review.reviewerId]?.pseudo || "Utilisateur",
            }));
        } else {
            carpooling.recent_reviews = [];
        }

        res.status(200).json({ carpooling });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur lors de la récupération du covoiturage.",
        });
    }
};

module.exports = {
    createCarpooling,
    getAvailableCarpoolings,
    getDriverCarpoolings,
    updateCarpooling,
    cancelCarpooling,
    startCarpooling,
    finishCarpooling,
    getCarpoolingById,
};
