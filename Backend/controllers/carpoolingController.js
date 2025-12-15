const { PrismaClient, PrismaClientKnownRequestError } = require("@prisma/client");
const prisma = new PrismaClient();
const {
    sendReviewInvitation,
    sendTripCompletionNotification,
    sendCancellationNotification,
} = require("../utils/emailService.js");
const {
    cancelCarpoolingById,
    autoCancelExpiredCarpoolings,
} = require("../utils/carpoolingUtils.js");
// MongoDB models temporarily disabled
// const Review = require("../models/Review");
// const DriverPreferences = require("../models/DriverPreferences");

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
                message: "Veuillez fournir toutes les informations obligatoires.",
            });
        }

        // Vérifier que l'utilisateur est propriétaire du véhicule
        const vehicle = await prisma.vehicle.findUnique({
            where: { id: parseInt(vehicle_id) },
            select: { user_id: true, seats_available: true },
        });

        if (!vehicle) {
            return res.status(404).json({ message: "Véhicule non trouvé." });
        }

        if (vehicle.user_id !== userId) {
            return res.status(403).json({
                message: "Vous ne pouvez créer un covoiturage qu'avec vos propres véhicules.",
            });
        }

        // Vérifier que le nombre de places demandé ne dépasse pas la capacité
        if (parseInt(seats_offered) > vehicle.seats_available) {
            return res.status(400).json({
                message: `Ce véhicule ne peut accueillir que ${vehicle.seats_available} passagers maximum.`,
            });
        }

        // Valider les dates
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
                message: "L'heure d'arrivée doit être après l'heure de départ.",
            });
        }

        // Calculer la commission de la plateforme (5% du prix par passager)
        const platform_commission_earned = Math.round(price_per_passenger * 0.05 * 100) / 100;

        // Créer le covoiturage
        const carpooling = await prisma.carpooling.create({
            data: {
                driver_id: userId,
                departure_address,
                arrival_address,
                departure_datetime: departureDate,
                arrival_datetime: arrivalDate,
                price_per_passenger: parseFloat(price_per_passenger),
                initial_seats_offered: parseInt(seats_offered),
                seats_remaining: parseInt(seats_offered),
                vehicle_id: parseInt(vehicle_id),
                platform_commission_earned,
                status: "prévu",
            },
        });

        res.status(201).json({
            message: "Covoiturage créé avec succès !",
            carpooling: {
                id: carpooling.id,
                departure_address: carpooling.departure_address,
                arrival_address: carpooling.arrival_address,
                departure_datetime: carpooling.departure_datetime,
                arrival_datetime: carpooling.arrival_datetime,
                price_per_passenger: carpooling.price_per_passenger,
                seats_offered: carpooling.initial_seats_offered,
            },
        });
    } catch (error) {
        console.error("Erreur création covoiturage:", error);

        if (error instanceof PrismaClientKnownRequestError) {
            return res.status(400).json({
                message: "Erreur de base de données.",
                error: process.env.NODE_ENV === "development" ? error.message : undefined,
            });
        }

        res.status(500).json({
            message: "Erreur lors de la création du covoiturage.",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};

/* --------------------------------------------------- Obtenir covoiturages disponibles -------------------------- */
const getAvailableCarpoolings = async (req, res) => {
    try {
        // Nettoyer les covoiturages expirés avant de retourner les résultats
        await autoCancelExpiredCarpoolings();

        const { departure, arrival, date } = req.query;

        const whereClause = {
            status: "prévu",
            seats_remaining: { gt: 0 },
            departure_datetime: { gt: new Date() },
            driver: { suspended: false },
        };

        // Filtres optionnels
        if (departure) {
            // Prisma 'mode' option was causing validation errors in the current Prisma client.
            // Remove 'mode' to use default behavior (case-sensitive). For case-insensitive
            whereClause.departure_address = {
                contains: departure,
            };
        }
        if (arrival) {
            whereClause.arrival_address = {
                contains: arrival,
            };
        }
        if (date) {
            const searchDate = new Date(date);
            const nextDay = new Date(searchDate);
            nextDay.setDate(nextDay.getDate() + 1);

            whereClause.departure_datetime = {
                ...whereClause.departure_datetime,
                gte: searchDate,
                lt: nextDay,
            };
        }

        const carpoolings = await prisma.carpooling.findMany({
            where: whereClause,
            include: {
                driver: {
                    select: {
                        id: true,
                        pseudo: true,
                        profile_picture_url: true,
                    },
                },
                vehicle: {
                    include: {
                        brand: true,
                        color: true,
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
            orderBy: { departure_datetime: "asc" },
        });

        // Transformer les données pour correspondre au format attendu
        const formattedCarpoolings = carpoolings.map((c) => ({
            ...c,
            driver_pseudo: c.driver.pseudo,
            driver_photo: c.driver.profile_picture_url,
            driver_id: c.driver.id,
            model: c.vehicle.model,
            plate_number: c.vehicle.plate_number,
            is_electric: c.vehicle.is_electric,
            brand_name: c.vehicle.brand?.name || null,
            color_name: c.vehicle.color?.name || null,
            duration_minutes: Math.round(
                (new Date(c.arrival_datetime) - new Date(c.departure_datetime)) / (1000 * 60)
            ),
            participants_count: c._count.participations,
        }));

        res.status(200).json({
            carpoolings: formattedCarpoolings,
            count: formattedCarpoolings.length,
        });
    } catch (error) {
        console.error("Erreur récupération covoiturages:", error);

        if (error instanceof PrismaClientKnownRequestError) {
            return res.status(400).json({
                message: "Erreur de base de données.",
                error: process.env.NODE_ENV === "development" ? error.message : undefined,
            });
        }

        res.status(500).json({
            message: "Erreur lors de la récupération des covoiturages.",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};

/* --------------------------------------------------- Obtenir covoiturages d'un chauffeur ---------------------- */
const getDriverCarpoolings = async (req, res) => {
    try {
        // Nettoyer les covoiturages expirés avant de retourner les résultats
        await autoCancelExpiredCarpoolings();

        const userId = req.user.id;

        const carpoolings = await prisma.carpooling.findMany({
            where: { driver_id: userId },
            include: {
                vehicle: {
                    include: {
                        brand: true,
                        color: true,
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
            orderBy: { departure_datetime: "desc" },
        });

        // Transformer les données
        const formattedCarpoolings = carpoolings.map((c) => ({
            ...c,
            model: c.vehicle.model,
            plate_number: c.vehicle.plate_number,
            is_electric: c.vehicle.is_electric,
            brand_name: c.vehicle.brand?.name || null,
            color_name: c.vehicle.color?.name || null,
            participants_count: c._count.participations,
        }));

        res.status(200).json({
            carpoolings: formattedCarpoolings,
        });
    } catch (error) {
        console.error("Erreur récupération covoiturages chauffeur:", error);

        if (error instanceof PrismaClientKnownRequestError) {
            return res.status(400).json({
                message: "Erreur de base de données.",
                error: process.env.NODE_ENV === "development" ? error.message : undefined,
            });
        }

        res.status(500).json({
            message: "Erreur lors de la récupération des covoiturages.",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};

/* --------------------------------------------------- Modifier un covoiturage ----------------------------------- */
const updateCarpooling = async (req, res) => {
    try {
        const userId = req.user.id;
        const carpoolingId = req.params.id;
        const updateData = req.body;

        // Vérifier que le covoiturage appartient à l'utilisateur
        const existingCarpooling = await prisma.carpooling.findUnique({
            where: { id: parseInt(carpoolingId) },
            select: { driver_id: true, status: true },
        });

        if (!existingCarpooling) {
            return res.status(404).json({ message: "Covoiturage non trouvé." });
        }

        if (existingCarpooling.driver_id !== userId) {
            return res.status(403).json({
                message: "Vous ne pouvez modifier que vos propres covoiturages.",
            });
        }

        if (existingCarpooling.status !== "prévu") {
            return res.status(400).json({
                message: "Seuls les covoiturages prévus peuvent être modifiés.",
            });
        }

        // Préparer les données à mettre à jour
        const prismaUpdateData = {};

        if (updateData.departure_address)
            prismaUpdateData.departure_address = updateData.departure_address;
        if (updateData.arrival_address)
            prismaUpdateData.arrival_address = updateData.arrival_address;
        if (updateData.departure_datetime)
            prismaUpdateData.departure_datetime = new Date(updateData.departure_datetime);
        if (updateData.arrival_datetime)
            prismaUpdateData.arrival_datetime = new Date(updateData.arrival_datetime);
        if (updateData.price_per_passenger) {
            prismaUpdateData.price_per_passenger = parseFloat(updateData.price_per_passenger);
            prismaUpdateData.platform_commission_earned =
                Math.round(parseFloat(updateData.price_per_passenger) * 0.05 * 100) / 100;
        }

        // Mettre à jour le covoiturage
        const updatedCarpooling = await prisma.carpooling.update({
            where: { id: parseInt(carpoolingId) },
            data: prismaUpdateData,
        });

        res.status(200).json({
            message: "Covoiturage mis à jour avec succès !",
            carpooling: updatedCarpooling,
        });
    } catch (error) {
        console.error("Erreur modification covoiturage:", error);

        if (error instanceof PrismaClientKnownRequestError) {
            return res.status(400).json({
                message: "Erreur de base de données.",
                error: process.env.NODE_ENV === "development" ? error.message : undefined,
            });
        }

        res.status(500).json({
            message: "Erreur lors de la modification du covoiturage.",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};

/* --------------------------------------------------- Annuler un covoiturage ------------------------------------ */
const cancelCarpooling = async (req, res) => {
    try {
        const userId = req.user.id;
        const carpoolingId = req.params.id;

        // Vérifier que le covoiturage appartient à l'utilisateur
        const carpooling = await prisma.carpooling.findUnique({
            where: { id: parseInt(carpoolingId) },
            select: {
                driver_id: true,
                status: true,
                departure_address: true,
                arrival_address: true,
                departure_datetime: true,
                driver: {
                    select: { pseudo: true },
                },
                participations: {
                    where: { cancellation_date: null },
                    include: {
                        passenger: {
                            select: { email: true, pseudo: true },
                        },
                    },
                },
            },
        });

        if (!carpooling) {
            return res.status(404).json({ message: "Covoiturage non trouvé." });
        }

        if (carpooling.driver_id !== userId) {
            return res.status(403).json({
                message: "Vous ne pouvez annuler que vos propres covoiturages.",
            });
        }

        if (carpooling.status !== "prévu") {
            return res.status(400).json({
                message: "Seuls les covoiturages prévus peuvent être annulés.",
            });
        }

        // Utiliser la fonction utilitaire pour annuler le covoiturage
        const result = await cancelCarpoolingById(carpoolingId, {
            isAutoCancelled: false,
        });

        if (!result.success) {
            return res.status(400).json({
                message: "Erreur lors de l'annulation du covoiturage.",
                error: result.error,
            });
        }

        // Envoyer des notifications d'annulation aux passagers
        try {
            for (const participation of carpooling.participations) {
                await sendCancellationNotification({
                    passengerEmail: participation.passenger.email,
                    passengerName: participation.passenger.pseudo,
                    driverName: carpooling.driver.pseudo,
                    departureAddress: carpooling.departure_address,
                    arrivalAddress: carpooling.arrival_address,
                    departureDate: carpooling.departure_datetime,
                    refundAmount: participation.credits_paid,
                    carpoolingId: parseInt(carpoolingId),
                });
            }
        } catch (emailError) {
            console.warn("⚠️ Erreur envoi notifications annulation:", emailError.message);
            // Ne pas échouer si les emails ne s'envoient pas
        }

        res.status(200).json({
            message: "Covoiturage annulé avec succès !",
            participants_refunded: result.participantsCount,
        });
    } catch (error) {
        console.error("Erreur annulation covoiturage:", error);

        if (error instanceof PrismaClientKnownRequestError) {
            return res.status(400).json({
                message: "Erreur de base de données.",
                error: process.env.NODE_ENV === "development" ? error.message : undefined,
            });
        }

        res.status(500).json({
            message: "Erreur lors de l'annulation du covoiturage.",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};

/* --------------------------------------------------- Démarrer un covoiturage ----------------------------------- */
const startCarpooling = async (req, res) => {
    try {
        const userId = req.user.id;
        const carpoolingId = req.params.id;

        // Vérifier que le covoiturage appartient à l'utilisateur
        const carpooling = await prisma.carpooling.findUnique({
            where: { id: parseInt(carpoolingId) },
            select: { driver_id: true, status: true },
        });

        if (!carpooling) {
            return res.status(404).json({ message: "Covoiturage non trouvé." });
        }

        if (carpooling.driver_id !== userId) {
            return res.status(403).json({
                message: "Vous ne pouvez démarrer que vos propres covoiturages.",
            });
        }

        if (carpooling.status !== "prévu") {
            return res.status(400).json({
                message: "Seuls les covoiturages prévus peuvent être démarrés.",
            });
        }

        // Marquer le covoiturage comme démarré
        await prisma.carpooling.update({
            where: { id: parseInt(carpoolingId) },
            data: { status: "démarré" },
        });

        res.status(200).json({
            message: "Covoiturage démarré avec succès !",
        });
    } catch (error) {
        console.error("Erreur démarrage covoiturage:", error);

        if (error instanceof PrismaClientKnownRequestError) {
            return res.status(400).json({
                message: "Erreur de base de données.",
                error: process.env.NODE_ENV === "development" ? error.message : undefined,
            });
        }

        res.status(500).json({
            message: "Erreur lors du démarrage du covoiturage.",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};

/* --------------------------------------------------- Terminer un covoiturage ----------------------------------- */
const finishCarpooling = async (req, res) => {
    try {
        const userId = req.user.id;
        const carpoolingId = req.params.id;

        // Démarrer une transaction Prisma
        const result = await prisma.$transaction(async (transactionPrisma) => {
            // Vérifier que le covoiturage appartient à l'utilisateur
            const carpooling = await transactionPrisma.carpooling.findUnique({
                where: { id: parseInt(carpoolingId) },
                select: {
                    driver_id: true,
                    status: true,
                    price_per_passenger: true,
                    platform_commission_earned: true,
                },
            });

            if (!carpooling) {
                throw new Error("Covoiturage non trouvé.");
            }

            if (carpooling.driver_id !== userId) {
                throw new Error("Vous ne pouvez terminer que vos propres covoiturages.");
            }

            if (carpooling.status !== "démarré") {
                throw new Error("Seuls les covoiturages démarrés peuvent être terminés.");
            }

            // Récupérer les informations détaillées du covoiturage pour les emails
            const carpoolingInfo = await transactionPrisma.carpooling.findUnique({
                where: { id: parseInt(carpoolingId) },
                include: {
                    driver: {
                        select: {
                            pseudo: true,
                            email: true,
                        },
                    },
                },
                select: {
                    departure_address: true,
                    arrival_address: true,
                    departure_datetime: true,
                    driver: true,
                },
            });

            // Récupérer les participants pour calculer les gains ET pour envoyer les emails
            const participants = await transactionPrisma.participation.findMany({
                where: {
                    carpooling_id: parseInt(carpoolingId),
                    cancellation_date: null,
                },
                include: {
                    passenger: {
                        select: {
                            pseudo: true,
                            email: true,
                        },
                    },
                },
            });

            const participantsCount = participants.length;
            const totalEarnings = participantsCount * carpooling.price_per_passenger;
            const commission = participantsCount * carpooling.platform_commission_earned;
            const driverEarnings = totalEarnings - commission;

            // Créditer le chauffeur
            await transactionPrisma.user.update({
                where: { id: userId },
                data: { credits: { increment: driverEarnings } },
            });

            // Marquer le covoiturage comme terminé
            await transactionPrisma.carpooling.update({
                where: { id: parseInt(carpoolingId) },
                data: { status: "terminé" },
            });

            // Enregistrer l'historique des crédits pour le chauffeur
            await transactionPrisma.credit_transaction.create({
                data: {
                    user_id: userId,
                    transaction_type: "crédit",
                    amount: driverEarnings,
                    description: `Gains covoiturage #${carpoolingId} (${participantsCount} passagers)`,
                    transaction_date: new Date(),
                },
            });

            return {
                driverEarnings,
                participantsCount,
                participants,
                carpoolingInfo,
            };
        });

        // Optionnel: Envoyer des notifications par email (hors transaction)
        try {
            // Email au chauffeur
            const driverSubject = "Covoiturage terminé - Gains crédités";
            const driverMessage = `
                Votre covoiturage de ${result.carpoolingInfo.departure_address} à ${result.carpoolingInfo.arrival_address} est terminé.
                
                Vous avez transporté ${result.participantsCount} passager(s) et gagné ${result.driverEarnings} crédits.
                Ces crédits ont été automatiquement ajoutés à votre solde.
                
                Merci de contribuer à la mobilité durable !
            `;

            // Email aux passagers
            for (const participant of result.participants) {
                const passengerSubject = "Covoiturage terminé - Merci pour votre participation";
                const passengerMessage = `
                    Bonjour ${participant.passenger.pseudo},
                    
                    Le covoiturage de ${result.carpoolingInfo.departure_address} à ${result.carpoolingInfo.arrival_address} est maintenant terminé.
                    
                    N'hésitez pas à laisser un avis sur votre expérience avec ${result.carpoolingInfo.driver.pseudo}.
                    
                    À bientôt pour de nouveaux trajets !
                `;

                // await sendEmail(participant.passenger.email, passengerSubject, passengerMessage);
            }
        } catch (emailError) {
            console.warn("Erreur envoi emails:", emailError.message);
            // Ne pas faire échouer la transaction pour les emails
        }

        res.status(200).json({
            message: "Covoiturage terminé avec succès !",
            earnings: result.driverEarnings,
            participants_count: result.participantsCount,
        });
    } catch (error) {
        console.error("Erreur fin covoiturage:", error);

        if (error instanceof PrismaClientKnownRequestError) {
            return res.status(400).json({
                message: "Erreur de base de données.",
                error: process.env.NODE_ENV === "development" ? error.message : undefined,
            });
        }

        // Erreurs métier
        if (
            error.message.includes("covoiturage") ||
            error.message.includes("appartient") ||
            error.message.includes("démarré")
        ) {
            return res.status(400).json({
                message: error.message,
            });
        }

        res.status(500).json({
            message: "Erreur lors de la fin du covoiturage.",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};

/* --------------------------------------------------- Obtenir les détails d'un covoiturage ---------------------- */
const getCarpoolingById = async (req, res) => {
    try {
        const { id } = req.params;

        const carpooling = await prisma.carpooling.findUnique({
            where: { id: parseInt(id) },
            include: {
                driver: {
                    select: {
                        pseudo: true,
                        profile_picture_url: true,
                    },
                },
                vehicle: {
                    include: {
                        brand: true,
                        color: true,
                    },
                },
            },
        });

        if (!carpooling) {
            return res.status(404).json({ message: "Covoiturage non trouvé." });
        }

        // Calculer la durée
        const duration_minutes = Math.round(
            (new Date(carpooling.arrival_datetime) - new Date(carpooling.departure_datetime)) /
                (1000 * 60)
        );

        // Transformer les données pour correspondre au format attendu
        const result = {
            ...carpooling,
            driver_pseudo: carpooling.driver.pseudo,
            driver_photo: carpooling.driver.profile_picture_url,
            model: carpooling.vehicle.model,
            plate_number: carpooling.vehicle.plate_number,
            is_electric: carpooling.vehicle.is_electric,
            brand_name: carpooling.vehicle.brand?.name || null,
            color_name: carpooling.vehicle.color?.name || null,
            duration_minutes,
        };

        // Données temporaires (MongoDB désactivé)
        // 1. Note moyenne du chauffeur
        result.driver_rating = 4.5; // Note par défaut
        result.total_reviews = 12; // Nombre d'avis par défaut

        // 2. Préférences du chauffeur (par défaut)
        result.driver_preferences = {
            allowsSmoking: false,
            allowsPets: true,
            conversationLevel: "modéré",
            preferredMusicGenre: "pop",
            specialRules: "Pas de nourriture dans la voiture",
            customPreferences: [],
        };

        // 3. Avis récents (exemples)
        result.recent_reviews = [
            {
                rating: 5,
                comment: "Excellent chauffeur, très ponctuel !",
                createdAt: new Date("2025-01-15"),
                reviewer_pseudo: "Marie_L",
            },
            {
                rating: 4,
                comment: "Trajet agréable et sécurisé.",
                createdAt: new Date("2025-01-10"),
                reviewer_pseudo: "Pierre_K",
            },
        ];

        res.status(200).json({ carpooling: result });
    } catch (error) {
        console.error("Erreur récupération covoiturage:", error);

        if (error instanceof PrismaClientKnownRequestError) {
            return res.status(400).json({
                message: "Erreur de base de données.",
                error: process.env.NODE_ENV === "development" ? error.message : undefined,
            });
        }

        res.status(500).json({
            message: "Erreur lors de la récupération du covoiturage.",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
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
