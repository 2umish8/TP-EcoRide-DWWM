const { PrismaClient, PrismaClientKnownRequestError } = require("@prisma/client");
const prisma = new PrismaClient();

/* --------------------------------------------------- Vérifier les conditions de participation ------------------- */
const checkParticipationConditions = async (req, res) => {
    try {
        console.log(
            "🔍 checkParticipationConditions called - params:",
            req.params,
            "user:",
            req.user
        );
        const userId = req.user?.id;
        const carpoolingId = parseInt(req.params.id);

        if (!userId) {
            console.log("❌ No user ID found in request");
            return res.status(401).json({ message: "Utilisateur non authentifié." });
        }

        // Vérifier que le covoiturage existe et récupérer l'utilisateur en une seule requête
        const [carpooling, user, existingParticipation] = await Promise.all([
            prisma.carpooling.findUnique({
                where: { id: carpoolingId },
                select: {
                    driver_id: true,
                    status: true,
                    price_per_passenger: true,
                    seats_remaining: true,
                },
            }),
            prisma.user.findUnique({
                where: { id: userId },
                select: { credits: true },
            }),
            prisma.participation.findFirst({
                where: {
                    passenger_id: userId,
                    carpooling_id: carpoolingId,
                    cancellation_date: null,
                },
            }),
        ]);

        if (!carpooling) {
            return res.status(404).json({ message: "Covoiturage non trouvé." });
        }

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        if (carpooling.driver_id === userId) {
            return res.status(400).json({
                message: "Vous ne pouvez pas rejoindre votre propre covoiturage.",
            });
        }

        if (carpooling.status !== "prévu") {
            return res.status(400).json({
                message: "Ce covoiturage n'est plus disponible.",
            });
        }

        if (carpooling.seats_remaining <= 0) {
            return res.status(400).json({
                message: "Il n'y a plus de places disponibles pour ce covoiturage.",
            });
        }

        if (existingParticipation) {
            return res.status(400).json({
                message: "Vous participez déjà à ce covoiturage.",
            });
        }

        if (user.credits < carpooling.price_per_passenger) {
            return res.status(400).json({
                message: "Vous n'avez pas assez de crédits pour ce covoiturage.",
            });
        }

        // Toutes les conditions sont remplies
        res.status(200).json({
            message: "Participation possible",
            carpooling: {
                id: carpoolingId,
                price_per_passenger: carpooling.price_per_passenger,
                seats_remaining: carpooling.seats_remaining,
            },
            user: {
                current_credits: user.credits,
                credits_after_participation: user.credits - carpooling.price_per_passenger,
            },
        });
    } catch (error) {
        console.error("Erreur vérification participation:", error);
        res.status(500).json({
            message: "Erreur lors de la vérification des conditions de participation.",
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
                message: "La confirmation explicite est requise pour participer au covoiturage.",
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
                    seats_remaining: true,
                },
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
                throw new Error(
                    "Plus de places disponibles ! D'autres passagers ont réservé entre temps."
                );
            }

            // Re-vérifier que l'utilisateur ne participe pas déjà
            const existingParticipation = await transactionPrisma.participation.findFirst({
                where: {
                    passenger_id: userId,
                    carpooling_id: parseInt(carpoolingId),
                    cancellation_date: null,
                },
            });

            if (existingParticipation) {
                throw new Error("Vous participez déjà à ce covoiturage.");
            }

            // RE-VÉRIFIER que l'utilisateur a assez de crédits
            const user = await transactionPrisma.user.findUnique({
                where: { id: userId },
                select: { credits: true },
            });

            if (user.credits < carpooling.price_per_passenger) {
                throw new Error("Vous n'avez plus assez de crédits pour ce covoiturage.");
            }

            // Débiter les crédits de l'utilisateur
            await transactionPrisma.user.update({
                where: { id: userId },
                data: {
                    credits: { decrement: carpooling.price_per_passenger },
                },
            });

            // Créer la participation
            const participation = await transactionPrisma.participation.create({
                data: {
                    passenger_id: userId,
                    carpooling_id: parseInt(carpoolingId),
                    credits_paid: carpooling.price_per_passenger,
                    participation_date: new Date(),
                },
            });

            // Réduire le nombre de places disponibles
            await transactionPrisma.carpooling.update({
                where: { id: parseInt(carpoolingId) },
                data: { seats_remaining: { decrement: 1 } },
            });

            // Ajouter les crédits au conducteur (prix - commission plateforme)
            const driverEarnings = carpooling.price_per_passenger - 2;
            await transactionPrisma.user.update({
                where: { id: carpooling.driver_id },
                data: { credits: { increment: driverEarnings } },
            });

            return {
                participation,
                remaining_credits: user.credits - carpooling.price_per_passenger,
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
        if (
            error.message.includes("covoiturage") ||
            error.message.includes("crédits") ||
            error.message.includes("places")
        ) {
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
        const result = await prisma.$transaction(async (transactionPrisma) => {
            // Vérifier que la participation existe
            const participation = await transactionPrisma.participation.findFirst({
                where: {
                    passenger_id: userId,
                    carpooling_id: parseInt(carpoolingId),
                    cancellation_date: null,
                },
                include: {
                    carpooling: {
                        select: {
                            status: true,
                            departure_datetime: true,
                        },
                    },
                },
            });

            if (!participation) {
                throw new Error("Participation non trouvée ou déjà annulée.");
            }

            // Vérifier que le covoiturage n'a pas encore commencé
            if (participation.carpooling.status !== "prévu") {
                throw new Error(
                    "Impossible d'annuler une participation pour un covoiturage qui a déjà commencé ou est terminé."
                );
            }

            // Calculer le temps jusqu'au départ
            const now = new Date();
            const departureTime = new Date(participation.carpooling.departure_datetime);
            const hoursUntilDeparture = (departureTime - now) / (1000 * 60 * 60);

            let refundAmount = participation.price_paid;

            // Politique d'annulation : pénalité si annulation moins de 2h avant
            if (hoursUntilDeparture < 2) {
                refundAmount = Math.floor(participation.price_paid * 0.5); // 50% de remboursement
            }

            // Rembourser l'utilisateur
            await transactionPrisma.user.update({
                where: { id: userId },
                data: { credits: { increment: refundAmount } },
            });

            // Marquer la participation comme annulée
            await transactionPrisma.participation.update({
                where: { id: participation.id },
                data: { cancellation_date: new Date() },
            });

            // Incrémenter le nombre de places disponibles
            await transactionPrisma.carpooling.update({
                where: { id: parseInt(carpoolingId) },
                data: { seats_remaining: { increment: 1 } },
            });

            const penalty = participation.price_paid - refundAmount;

            return {
                refundAmount,
                penalty,
                originalAmount: participation.price_paid,
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

        const participations = await prisma.participation.findMany({
            where: { passenger_id: userId },
            include: {
                carpooling: {
                    select: {
                        departure_address: true,
                        arrival_address: true,
                        departure_datetime: true,
                        arrival_datetime: true,
                        status: true,
                        driver: {
                            select: {
                                pseudo: true,
                            },
                        },
                        vehicle: {
                            select: {
                                model: true,
                                plate_number: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                carpooling: {
                    departure_datetime: "desc",
                },
            },
        });

        // Transformer les données pour correspondre au format attendu
        const formattedParticipations = participations.map((p) => ({
            ...p,
            departure_address: p.carpooling.departure_address,
            arrival_address: p.carpooling.arrival_address,
            departure_datetime: p.carpooling.departure_datetime,
            arrival_datetime: p.carpooling.arrival_datetime,
            carpooling_status: p.carpooling.status,
            driver_pseudo: p.carpooling.driver.pseudo,
            model: p.carpooling.vehicle.model,
            plate_number: p.carpooling.vehicle.plate_number,
        }));

        res.status(200).json({ participations: formattedParticipations });
    } catch (error) {
        console.error("Erreur récupération participations:", error);

        if (error instanceof PrismaClientKnownRequestError) {
            return res.status(400).json({
                message: "Erreur de base de données.",
                error: process.env.NODE_ENV === "development" ? error.message : undefined,
            });
        }

        res.status(500).json({
            message: "Erreur lors de la récupération des participations.",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
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
        const participation = await prisma.participation.findFirst({
            where: {
                passenger_id: userId,
                carpooling_id: parseInt(carpoolingId),
                cancellation_date: null,
            },
            include: {
                carpooling: {
                    select: {
                        status: true,
                    },
                },
            },
        });

        if (!participation) {
            return res.status(404).json({
                message: "Participation non trouvée.",
            });
        }

        if (participation.carpooling.status !== "terminé") {
            return res.status(400).json({
                message: "Le covoiturage doit être terminé pour valider la participation.",
            });
        }

        // Mettre à jour la validation
        await prisma.participation.update({
            where: { id: participation.id },
            data: { is_validated },
        });

        res.status(200).json({
            message: `Participation ${is_validated ? "validée" : "non validée"} avec succès.`,
        });
    } catch (error) {
        console.error("Erreur validation participation:", error);

        if (error instanceof PrismaClientKnownRequestError) {
            return res.status(400).json({
                message: "Erreur de base de données.",
                error: process.env.NODE_ENV === "development" ? error.message : undefined,
            });
        }

        res.status(500).json({
            message: "Erreur lors de la validation de la participation.",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};

/* --------------------------------------------------- Obtenir les participants d'un covoiturage ---------------- */
const getCarpoolingParticipants = async (req, res) => {
    try {
        const carpoolingId = req.params.id;
        const userId = req.user.id;

        // Vérifier que l'utilisateur est le chauffeur du covoiturage
        const carpooling = await prisma.carpooling.findUnique({
            where: { id: parseInt(carpoolingId) },
            select: { driver_id: true },
        });

        if (!carpooling) {
            return res.status(404).json({
                message: "Covoiturage non trouvé.",
            });
        }

        if (carpooling.driver_id !== userId) {
            return res.status(403).json({
                message: "Vous n'êtes pas autorisé à voir les participants de ce covoiturage.",
            });
        }

        // Récupérer les participants
        const participants = await prisma.participation.findMany({
            where: {
                carpooling_id: parseInt(carpoolingId),
                cancellation_date: null,
            },
            include: {
                passenger: {
                    select: {
                        pseudo: true,
                        profile_picture_url: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                participation_date: "asc",
            },
        });

        // Transformer les données
        const formattedParticipants = participants.map((p) => ({
            participation_id: p.id,
            passenger_id: p.passenger_id,
            pseudo: p.passenger.pseudo,
            profile_picture_url: p.passenger.profile_picture_url,
            email: p.passenger.email,
            participation_date: p.participation_date,
            price_paid: p.price_paid,
            status: p.status,
            is_validated: p.is_validated,
        }));

        res.status(200).json({ participants: formattedParticipants });
    } catch (error) {
        console.error("Erreur récupération participants:", error);

        if (error instanceof PrismaClientKnownRequestError) {
            return res.status(400).json({
                message: "Erreur de base de données.",
                error: process.env.NODE_ENV === "development" ? error.message : undefined,
            });
        }

        res.status(500).json({
            message: "Erreur lors de la récupération des participants.",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
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
