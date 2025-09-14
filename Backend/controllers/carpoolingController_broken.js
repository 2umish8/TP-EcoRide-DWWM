const db = require("../Config/db.js");
const { PrismaClientKnownRequestError } = require('../generated/prisma');
const {
    sendReviewInvitation,
    sendTripCompletionNotification,
} = require("../utils/emailService.js");
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
                message:
                    "Veuillez fournir toutes les informations obligatoires.",
            });
        }

        // Vérifier que l'utilisateur est propriétaire du véhicule
        const vehicle = await db.vehicle.findUnique({
            where: { id: parseInt(vehicle_id) },
            select: { user_id: true, seats_available: true }
        });

        if (!vehicle) {
            return res.status(404).json({ message: "Véhicule non trouvé." });
        }

        if (vehicle.user_id !== userId) {
            return res.status(403).json({
                message: "Vous ne pouvez utiliser que vos propres véhicules.",
            });
        }

        // Vérifier que le nombre de places offertes ne dépasse pas la capacité du véhicule
        if (seats_offered > vehicle.seats_available) {
            return res.status(400).json({
                message: `Ce véhicule n'a que ${vehicle.seats_available} places disponibles.`,
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
        const carpooling = await db.carpooling.create({
            data: {
                departure_address,
                arrival_address,
                departure_datetime: new Date(departure_datetime),
                arrival_datetime: new Date(arrival_datetime),
                price_per_passenger: parseFloat(price_per_passenger),
                initial_seats_offered: parseInt(seats_offered),
                seats_remaining: parseInt(seats_offered),
                driver_id: userId,
                vehicle_id: parseInt(vehicle_id)
            }
        });

        res.status(201).json({
            message: "Covoiturage créé avec succès !",
            carpoolingId: carpooling.id,
        });
    } catch (error) {
        console.error(
            "Erreur détaillée lors de la création du covoiturage:",
            error
        );
        if (error instanceof PrismaClientKnownRequestError) {
            console.error("Code erreur Prisma:", error.code);
        }
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

        // Construire les filtres Prisma
        const whereConditions = {
            status: 'prévu',
            seats_remaining: { gt: 0 }
        };

        if (departure) {
            whereConditions.departure_address = { contains: departure };
        }
        if (arrival) {
            whereConditions.arrival_address = { contains: arrival };
        }
        if (date) {
            const targetDate = new Date(date);
            const nextDay = new Date(targetDate);
            nextDay.setDate(nextDay.getDate() + 1);
            whereConditions.departure_datetime = {
                gte: targetDate,
                lt: nextDay
            };
        }
        if (maxPrice) {
            whereConditions.price_per_passenger = { lte: parseFloat(maxPrice) };
        }
        if (isElectric === "true") {
            whereConditions.vehicle = { is_electric: true };
        }

        const carpoolings = await db.carpooling.findMany({
            where: whereConditions,
            include: {
                user: {
                    select: {
                        pseudo: true,
                        profile_picture_url: true
                    }
                },
                vehicle: {
                    include: {
                        brand: true,
                        color: true
                    }
                }
            },
            orderBy: { departure_datetime: 'asc' }
        });

        // Filtrer par durée maximale si spécifiée (calculé côté application)
        let filteredCarpoolings = carpoolings;
        if (maxDuration) {
            filteredCarpoolings = carpoolings.filter(c => {
                const duration = (new Date(c.arrival_datetime) - new Date(c.departure_datetime)) / (1000 * 60);
                return duration <= parseInt(maxDuration);
            });
        }

        // Formatter les données pour maintenir la compatibilité
        const formattedCarpoolings = filteredCarpoolings.map(c => ({
            ...c,
            driver_pseudo: c.user.pseudo,
            driver_photo: c.user.profile_picture_url,
            model: c.vehicle.model,
            plate_number: c.vehicle.plate_number,
            is_electric: c.vehicle.is_electric,
            brand_name: c.vehicle.brand?.name,
            color_name: c.vehicle.color?.name,
            duration_minutes: Math.round((new Date(c.arrival_datetime) - new Date(c.departure_datetime)) / (1000 * 60))
        }));

        // Temporairement : notes par défaut (MongoDB désactivé)
        if (formattedCarpoolings.length > 0) {
            // Ajouter une note par défaut pour chaque chauffeur
            formattedCarpoolings.forEach((carpooling) => {
                carpooling.driver_rating = 4.5; // Note par défaut
            });

            // Filtrer par note minimale si spécifiée
            if (minRating && parseFloat(minRating) > 0) {
                const filteredByRating = formattedCarpoolings.filter(
                    (c) => c.driver_rating >= parseFloat(minRating)
                );

                if (filteredByRating.length === 0) {
                    return res.status(200).json({
                        carpoolings: [],
                        message: `Aucun covoiturage trouvé avec une note minimale de ${minRating}.`,
                    });
                }

                return res.status(200).json({ carpoolings: filteredByRating });
            }
        }

        // Si aucun résultat trouvé, proposer la date du prochain itinéraire disponible
        if (formattedCarpoolings.length === 0 && date) {
            const nextAvailableConditions = {
                status: 'prévu',
                seats_remaining: { gt: 0 },
                departure_datetime: { gt: new Date(date) }
            };
            
            if (departure) {
                nextAvailableConditions.departure_address = { contains: departure };
            }
            if (arrival) {
                nextAvailableConditions.arrival_address = { contains: arrival };
            }

            const nextAvailable = await db.carpooling.findFirst({
                where: nextAvailableConditions,
                select: { departure_datetime: true },
                orderBy: { departure_datetime: 'asc' }
            });

            return res.status(200).json({
                carpoolings: [],
                nextAvailableDate: nextAvailable?.departure_datetime || null,
                message:
                    "Aucun covoiturage trouvé pour cette date. Consultez la prochaine date disponible.",
            });
        }

        res.status(200).json({ carpoolings: formattedCarpoolings });
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

        const carpoolings = await db.carpooling.findMany({
            where: { driver_id: userId },
            include: {
                vehicle: {
                    select: {
                        model: true,
                        plate_number: true
                    }
                },
                participation: {
                    where: { cancellation_date: null },
                    select: { id: true }
                }
            },
            orderBy: { departure_datetime: 'desc' }
        });

        // Formater les données pour maintenir la compatibilité
        const formattedCarpoolings = carpoolings.map(c => ({
            ...c,
            model: c.vehicle.model,
            plate_number: c.vehicle.plate_number,
            participants_count: c.participation.length
        }));

        res.status(200).json({ carpoolings: formattedCarpoolings });
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
        const carpooling = await db.carpooling.findUnique({
            where: { id: parseInt(carpoolingId) },
            select: {
                driver_id: true,
                status: true,
                initial_seats_offered: true,
                seats_remaining: true
            }
        });

        if (!carpooling) {
            return res.status(404).json({ message: "Covoiturage non trouvé." });
        }

        if (carpooling.driver_id !== userId) {
            return res.status(403).json({
                message:
                    "Vous ne pouvez modifier que vos propres covoiturages.",
            });
        }

        // Vérifier que le covoiturage peut encore être modifié
        if (carpooling.status !== "prévu") {
            return res.status(400).json({
                message: "Seuls les covoiturages prévus peuvent être modifiés.",
            });
        }

        // Vérifier s'il y a déjà des participants
        const participantsCount = carpooling.initial_seats_offered - carpooling.seats_remaining;
        if (participantsCount > 0) {
            return res.status(400).json({
                message:
                    "Impossible de modifier ce covoiturage car des passagers y participent déjà.",
            });
        }

        // Construire l'objet de mise à jour dynamiquement
        const updateData = {};

        if (departure_address !== undefined) {
            updateData.departure_address = departure_address;
        }
        if (arrival_address !== undefined) {
            updateData.arrival_address = arrival_address;
        }
        if (departure_datetime !== undefined) {
            // Vérifier que la nouvelle date est dans le futur
            const departureDate = new Date(departure_datetime);
            if (departureDate <= new Date()) {
                return res.status(400).json({
                    message: "La date de départ doit être dans le futur.",
                });
            }
            updateData.departure_datetime = departureDate;
        }
        if (arrival_datetime !== undefined) {
            updateData.arrival_datetime = new Date(arrival_datetime);
        }
        if (price_per_passenger !== undefined) {
            updateData.price_per_passenger = parseFloat(price_per_passenger);
        }

        if (Object.keys(updateData).length === 0) {
            return res
                .status(400)
                .json({ message: "Aucune donnée à mettre à jour." });
        }

        const updatedCarpooling = await db.carpooling.update({
            where: { id: parseInt(carpoolingId) },
            data: updateData
        });

        res.status(200).json({
            message: "Covoiturage mis à jour avec succès !",
        });
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

        // Démarrer une transaction Prisma
        const result = await db.$transaction(async (prisma) => {
            // Vérifier que le covoiturage appartient à l'utilisateur
            const carpooling = await prisma.carpooling.findUnique({
                where: { id: parseInt(carpoolingId) },
                select: {
                    driver_id: true,
                    status: true,
                    price_per_passenger: true
                }
            });

            if (!carpooling) {
                throw new Error("Covoiturage non trouvé.");
            }

            if (carpooling.driver_id !== userId) {
                throw new Error("Vous ne pouvez annuler que vos propres covoiturages.");
            }

            if (carpooling.status === "annulé") {
                throw new Error("Ce covoiturage est déjà annulé.");
            }

            // Récupérer les participants pour les rembourser
            const participants = await prisma.participation.findMany({
                where: {
                    carpooling_id: parseInt(carpoolingId),
                    cancellation_date: null
                },
                select: {
                    passenger_id: true,
                    credits_paid: true
                }
            });

            // Rembourser les participants
            for (const participant of participants) {
                await prisma.user.update({
                    where: { id: participant.passenger_id },
                    data: {
                        credits: {
                            increment: participant.credits_paid
                        }
                    }
                });

                // Marquer la participation comme annulée
                await prisma.participation.updateMany({
                    where: {
                        passenger_id: participant.passenger_id,
                        carpooling_id: parseInt(carpoolingId)
                    },
                    data: {
                        cancellation_date: new Date()
                    }
                });
            }

            // Marquer le covoiturage comme annulé
            await prisma.carpooling.update({
                where: { id: parseInt(carpoolingId) },
                data: { status: 'annulé' }
            });

            return { success: true };
        });

        res.status(200).json({
            message: "Covoiturage annulé avec succès. Les participants ont été remboursés.",
        });
    } catch (error) {
        console.error(error);
        if (error.message.includes("Covoiturage non trouvé")) {
            return res.status(404).json({ message: error.message });
        }
        if (error.message.includes("Vous ne pouvez annuler")) {
            return res.status(403).json({ message: error.message });
        }
        if (error.message.includes("déjà annulé")) {
            return res.status(400).json({ message: error.message });
        }
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
        const carpooling = await db.carpooling.findUnique({
            where: { id: parseInt(carpoolingId) },
            select: {
                driver_id: true,
                status: true
            }
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
        await db.carpooling.update({
            where: { id: parseInt(carpoolingId) },
            data: { status: 'démarré' }
        });

        res.status(200).json({
            message: "Covoiturage démarré avec succès !",
        });
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

        // Démarrer une transaction Prisma
        const result = await prisma.$transaction(async (transactionPrisma) => {
            // Vérifier que le covoiturage appartient à l'utilisateur
            const carpooling = await transactionPrisma.carpooling.findUnique({
                where: { id: parseInt(carpoolingId) },
                select: {
                    driver_id: true,
                    status: true,
                    price_per_passenger: true,
                    platform_commission_earned: true
                }
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
                            email: true
                        }
                    }
                },
                select: {
                    departure_address: true,
                    arrival_address: true,
                    departure_datetime: true,
                    driver: true
                }
            });

            // Récupérer les participants pour calculer les gains ET pour envoyer les emails
            const participants = await transactionPrisma.participation.findMany({
                where: {
                    carpooling_id: parseInt(carpoolingId),
                    cancellation_date: null
                },
                include: {
                    passenger: {
                        select: {
                            pseudo: true,
                            email: true
                        }
                    }
                }
            });

            const participantsCount = participants.length;
            const totalEarnings = participantsCount * carpooling.price_per_passenger;
            const commission = participantsCount * carpooling.platform_commission_earned;
            const driverEarnings = totalEarnings - commission;

            // Créditer le chauffeur
            await transactionPrisma.user.update({
                where: { id: userId },
                data: { credits: { increment: driverEarnings } }
            });

            // Marquer le covoiturage comme terminé
            await transactionPrisma.carpooling.update({
                where: { id: parseInt(carpoolingId) },
                data: { status: 'terminé' }
            });

            // Enregistrer l'historique des crédits pour le chauffeur
            await transactionPrisma.credit_transaction.create({
                data: {
                    user_id: userId,
                    transaction_type: 'crédit',
                    amount: driverEarnings,
                    description: `Gains covoiturage #${carpoolingId} (${participantsCount} passagers)`,
                    transaction_date: new Date()
                }
            });

            return {
                driverEarnings,
                participantsCount,
                participants,
                carpoolingInfo
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
                
                console.log(`Email envoyé à ${participant.passenger.email}`);
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
        if (error.message.includes("covoiturage") || error.message.includes("appartient") || error.message.includes("démarré")) {
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

            // NOUVELLE FONCTIONNALITÉ: Envoyer les emails de notification après la transaction réussie
            try {
                // 1. Envoyer un email de confirmation au chauffeur
                console.log(
                    "📧 Envoi de l'email de confirmation au chauffeur..."
                );
                await sendTripCompletionNotification({
                    driverEmail: carpoolingInfo.driver_email,
                    driverName: carpoolingInfo.driver_pseudo,
                    departureAddress: carpoolingInfo.departure_address,
                    arrivalAddress: carpoolingInfo.arrival_address,
                    departureDate: carpoolingInfo.departure_datetime,
                    participantsCount: participantsCount,
                    earnings: driverEarnings,
                });

                // 2. Envoyer les invitations à l'avis à tous les passagers
                console.log(
                    `📧 Envoi des invitations d'avis à ${participantsCount} passager(s)...`
                );
                const emailPromises = participants.map((passenger) =>
                    sendReviewInvitation({
                        passengerEmail: passenger.passenger_email,
                        passengerName: passenger.passenger_pseudo,
                        driverName: carpoolingInfo.driver_pseudo,
                        departureAddress: carpoolingInfo.departure_address,
                        arrivalAddress: carpoolingInfo.arrival_address,
                        departureDate: carpoolingInfo.departure_datetime,
                        carpoolingId: carpoolingId,
                        driverId: userId,
                    })
                );

                // Envoyer tous les emails en parallèle
                const emailResults = await Promise.allSettled(emailPromises);

                // Compter les succès et échecs
                const successCount = emailResults.filter(
                    (result) =>
                        result.status === "fulfilled" && result.value.success
                ).length;
                const failureCount = emailResults.length - successCount;

                console.log(
                    `✅ Emails envoyés: ${successCount} succès, ${failureCount} échecs`
                );

                // Logger les échecs pour le débogage
                emailResults.forEach((result, index) => {
                    if (result.status === "rejected" || !result.value.success) {
                        console.error(
                            `❌ Échec email pour ${participants[index].passenger_email}:`,
                            result.reason || result.value.error
                        );
                    }
                });
            } catch (emailError) {
                // Les erreurs d'email ne doivent pas faire échouer la transaction
                console.error(
                    "⚠️ Erreur lors de l'envoi des emails (transaction réussie):",
                    emailError
                );
            }

        });
    }
};

// --------------------------------------------------- Détail d'un covoiturage par ID ----------------------------
const getCarpoolingById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const carpooling = await prisma.carpooling.findUnique({
            where: { id: parseInt(id) },
            include: {
                driver: {
                    select: {
                        pseudo: true,
                        profile_picture_url: true
                    }
                },
                vehicle: {
                    include: {
                        brand: true,
                        color: true
                    }
                }
            }
        });

        if (!carpooling) {
            return res.status(404).json({ message: "Covoiturage non trouvé." });
        }

        // Calculer la durée
        const duration_minutes = Math.round(
            (new Date(carpooling.arrival_datetime) - new Date(carpooling.departure_datetime)) / (1000 * 60)
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
            duration_minutes
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
