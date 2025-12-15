/**
 * Utilitaires pour la gestion des covoiturages
 * Inclut l'annulation automatique des trajets expirés
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Annule automatiquement tous les covoiturages dont la date de départ est passée
 * et qui ont le statut "prévu"
 * 
 * @returns {Promise<Object>} - { cancelledCount: number, refundedPassengers: number }
 */
const autoCancelExpiredCarpoolings = async () => {
    try {
        const now = new Date();
        
        // Trouver tous les covoiturages expirés
        const expiredCarpoolings = await prisma.carpooling.findMany({
            where: {
                status: "prévu",
                departure_datetime: { lt: now },
            },
            include: {
                driver: {
                    select: {
                        email: true,
                        pseudo: true,
                    },
                },
                participations: {
                    where: { cancellation_date: null },
                    include: {
                        passenger: {
                            select: {
                                id: true,
                                email: true,
                                pseudo: true,
                            },
                        },
                    },
                },
            },
        });

        if (expiredCarpoolings.length === 0) {
            return { cancelledCount: 0, refundedPassengers: 0 };
        }

        let totalCancelledCount = 0;
        let totalRefundedPassengers = 0;

        // Traiter chaque covoiturage expiré
        for (const carpooling of expiredCarpoolings) {
            try {
                const result = await prisma.$transaction(
                    async (transactionPrisma) => {
                        const participants = carpooling.participations;
                        let refundedCount = 0;

                        // Rembourser tous les passagers
                        for (const participation of participants) {
                            // Créditer le passager
                            await transactionPrisma.user.update({
                                where: { id: participation.passenger_id },
                                data: {
                                    credits: {
                                        increment: participation.credits_paid,
                                    },
                                },
                            });

                            // Marquer la participation comme annulée
                            await transactionPrisma.participation.update({
                                where: { id: participation.id },
                                data: { cancellation_date: new Date() },
                            });

                            // Enregistrer l'historique des crédits
                            await transactionPrisma.credit_transaction.create({
                                data: {
                                    user_id: participation.passenger_id,
                                    transaction_type: "crédit",
                                    amount: participation.credits_paid,
                                    description: `Remboursement annulation automatique covoiturage #${carpooling.id}`,
                                    transaction_date: new Date(),
                                },
                            });

                            refundedCount++;
                        }

                        // Marquer le covoiturage comme annulé
                        await transactionPrisma.carpooling.update({
                            where: { id: carpooling.id },
                            data: { status: "annulé" },
                        });

                        return refundedCount;
                    }
                );

                totalCancelledCount++;
                totalRefundedPassengers += result;

                console.log(
                    `✅ Covoiturage #${carpooling.id} annulé automatiquement (${result} passagers remboursés)`
                );
            } catch (tripError) {
                console.error(
                    `❌ Erreur lors de l'annulation du covoiturage #${carpooling.id}:`,
                    tripError.message
                );
            }
        }

        console.log(
            `🔄 Nettoyage automatique des trajets: ${totalCancelledCount} annulés, ${totalRefundedPassengers} passagers remboursés`
        );

        return {
            cancelledCount: totalCancelledCount,
            refundedPassengers: totalRefundedPassengers,
        };
    } catch (error) {
        console.error("❌ Erreur nettoyage automatique des covoiturages:", error);
        return { cancelledCount: 0, refundedPassengers: 0 };
    }
};

/**
 * Annule un covoiturage spécifique et rembourse les participants
 * Utilise la logique centralisée pour éviter la duplication
 * 
 * @param {number} carpoolingId - ID du covoiturage à annuler
 * @param {Object} options - Options supplémentaires
 * @param {boolean} options.isAutoCancelled - Si true, indique une annulation automatique
 * @returns {Promise<Object>} - { success: boolean, participantsCount: number, error?: string }
 */
const cancelCarpoolingById = async (
    carpoolingId,
    options = { isAutoCancelled: false }
) => {
    try {
        const result = await prisma.$transaction(
            async (transactionPrisma) => {
                // Vérifier que le covoiturage existe et a le statut "prévu"
                const carpooling = await transactionPrisma.carpooling.findUnique(
                    {
                        where: { id: parseInt(carpoolingId) },
                        select: {
                            status: true,
                            price_per_passenger: true,
                            driver_id: true,
                        },
                    }
                );

                if (!carpooling) {
                    throw new Error("Covoiturage non trouvé.");
                }

                if (carpooling.status !== "prévu") {
                    throw new Error(
                        "Seuls les covoiturages prévus peuvent être annulés."
                    );
                }

                // Récupérer les participants pour les rembourser
                const participants =
                    await transactionPrisma.participation.findMany({
                        where: {
                            carpooling_id: parseInt(carpoolingId),
                            cancellation_date: null,
                        },
                    });

                // Rembourser tous les participants
                for (const participant of participants) {
                    // Créditer le passager
                    await transactionPrisma.user.update({
                        where: { id: participant.passenger_id },
                        data: {
                            credits: {
                                increment: participant.credits_paid,
                            },
                        },
                    });

                    // Marquer la participation comme annulée
                    await transactionPrisma.participation.update({
                        where: { id: participant.id },
                        data: { cancellation_date: new Date() },
                    });

                    // Enregistrer l'historique des crédits
                    const refundReason = options.isAutoCancelled
                        ? `Remboursement annulation automatique covoiturage #${carpoolingId}`
                        : `Remboursement annulation covoiturage #${carpoolingId}`;

                    await transactionPrisma.credit_transaction.create({
                        data: {
                            user_id: participant.passenger_id,
                            transaction_type: "crédit",
                            amount: participant.credits_paid,
                            description: refundReason,
                            transaction_date: new Date(),
                        },
                    });
                }

                // Marquer le covoiturage comme annulé
                await transactionPrisma.carpooling.update({
                    where: { id: parseInt(carpoolingId) },
                    data: { status: "annulé" },
                });

                return { participantsCount: participants.length };
            }
        );

        return { success: true, participantsCount: result.participantsCount };
    } catch (error) {
        console.error(
            `❌ Erreur annulation covoiturage #${carpoolingId}:`,
            error.message
        );
        return {
            success: false,
            participantsCount: 0,
            error: error.message,
        };
    }
};

module.exports = {
    autoCancelExpiredCarpoolings,
    cancelCarpoolingById,
};
