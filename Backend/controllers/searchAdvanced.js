// Script pour améliorer la logique de recherche d'itinéraires
// Ce script ajoute des fonctionnalités avancées à la recherche

const {
    PrismaClient,
    PrismaClientKnownRequestError,
} = require("@prisma/client");
const prisma = new PrismaClient();
const {
    autoCancelExpiredCarpoolings,
} = require("../utils/carpoolingUtils.js");
// MongoDB models temporarily disabled
// const Review = require("../models/Review");

/*
 * Fonction améliorée de recherche d'itinéraires avec fonctionnalités avancées
 * Nouvelles fonctionnalités :
 * - Recherche par rayon géographique (approximation par mots-clés)
 * - Tri avancé (prix, note, départ, durée)
 * - Pagination
 * - Statistiques de recherche
 * - Suggestions intelligentes
 */
const getAvailableCarpoolingsAdvanced = async (req, res) => {
    try {
        // Nettoyer les covoiturages expirés avant de retourner les résultats
        await autoCancelExpiredCarpoolings();

        const {
            departure,
            arrival,
            date,
            dateFrom,
            dateTo,
            maxPrice,
            minPrice,
            isElectric,
            maxDuration,
            minDuration,
            minRating,
            sortBy = "departure_datetime", // price, rating, duration, departure_datetime
            sortOrder = "ASC", // ASC, DESC
            page = 1,
            limit = 20,
            includeFull = false, // Inclure les covoiturages complets
        } = req.query;

        // Validation des paramètres
        const validSortFields = [
            "price_per_passenger",
            "departure_datetime",
            "duration_minutes",
            "driver_rating",
        ];
        const sortField = validSortFields.includes(sortBy)
            ? sortBy
            : "departure_datetime";
        const order = sortOrder.toUpperCase() === "DESC" ? "desc" : "asc";
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 20));
        const skip = (pageNum - 1) * limitNum;

        // Construction des filtres Prisma
        const where = {
            status: "prévu",
            departure_datetime: {
                gt: new Date(),
            },
            driver: {
                suspended: false,
            },
        };

        // Condition sur les places disponibles
        if (includeFull !== "true") {
            where.seats_remaining = { gt: 0 };
        }

        // Filtres de base avec recherche flexible
        if (departure) {
            where.departure_address = {
                contains: departure,
                mode: "insensitive",
            };
        }

        if (arrival) {
            where.arrival_address = {
                contains: arrival,
                mode: "insensitive",
            };
        }

        // Filtres de date améliorés
        if (date) {
            const searchDate = new Date(date);
            const nextDay = new Date(searchDate);
            nextDay.setDate(nextDay.getDate() + 1);

            where.departure_datetime = {
                ...where.departure_datetime,
                gte: searchDate,
                lt: nextDay,
            };
        } else {
            // Plage de dates
            if (dateFrom) {
                where.departure_datetime = {
                    ...where.departure_datetime,
                    gte: new Date(dateFrom),
                };
            }
            if (dateTo) {
                const endDate = new Date(dateTo);
                endDate.setDate(endDate.getDate() + 1);
                where.departure_datetime = {
                    ...where.departure_datetime,
                    lt: endDate,
                };
            }
        }

        // Filtres de prix améliorés
        if (minPrice) {
            where.price_per_passenger = {
                ...where.price_per_passenger,
                gte: parseFloat(minPrice),
            };
        }
        if (maxPrice) {
            where.price_per_passenger = {
                ...where.price_per_passenger,
                lte: parseFloat(maxPrice),
            };
        }

        // Filtre écologique
        if (isElectric === "true") {
            where.vehicle = {
                is_electric: true,
            };
        }

        // Compter le total pour pagination
        const totalResults = await prisma.carpooling.count({ where });

        // Configuration des relations incluant les calculs de durée
        const include = {
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
        };

        // Configuration de l'ordre
        let orderBy = {};

        if (sortField === "price_per_passenger") {
            orderBy.price_per_passenger = order;
        } else if (sortField === "departure_datetime") {
            orderBy.departure_datetime = order;
        } else if (sortField === "duration_minutes") {
            // Pour la durée, on devra trier après récupération
            orderBy.departure_datetime = "asc";
        } else {
            orderBy.departure_datetime = "asc";
        }

        // Récupérer les covoiturages
        const carpoolings = await prisma.carpooling.findMany({
            where,
            include,
            orderBy,
            skip,
            take: limitNum,
        });

        // Enrichir avec les calculs nécessaires
        const enrichedCarpoolings = carpoolings.map((carpooling) => {
            const duration_minutes = Math.round(
                (new Date(carpooling.arrival_datetime) -
                    new Date(carpooling.departure_datetime)) /
                    (1000 * 60)
            );

            const occupancy_rate =
                Math.round(
                    ((carpooling.initial_seats_offered -
                        carpooling.seats_remaining) /
                        carpooling.initial_seats_offered) *
                        100 *
                        10
                ) / 10;

            return {
                ...carpooling,
                driver_pseudo: carpooling.driver.pseudo,
                driver_photo: carpooling.driver.profile_picture_url,
                model: carpooling.vehicle.model,
                plate_number: carpooling.vehicle.plate_number,
                is_electric: carpooling.vehicle.is_electric,
                vehicle_seats: carpooling.vehicle.seats_available,
                brand_name: carpooling.vehicle.brand?.name || null,
                color_name: carpooling.vehicle.color?.name || null,
                duration_minutes,
                occupancy_rate,
                driver_rating: 0, // Sera calculé avec MongoDB
                is_almost_full: carpooling.seats_remaining <= 1,
                is_departing_soon:
                    new Date(carpooling.departure_datetime) - new Date() <=
                    24 * 60 * 60 * 1000,
                eco_friendly: carpooling.vehicle.is_electric,
            };
        });

        // Filtrer par durée si spécifié
        let filteredCarpoolings = enrichedCarpoolings;
        if (minDuration) {
            filteredCarpoolings = filteredCarpoolings.filter(
                (c) => c.duration_minutes >= parseInt(minDuration)
            );
        }
        if (maxDuration) {
            filteredCarpoolings = filteredCarpoolings.filter(
                (c) => c.duration_minutes <= parseInt(maxDuration)
            );
        }

        // Enrichir avec les notes MongoDB des chauffeurs
        if (filteredCarpoolings.length > 0) {
            const driverIds = [
                ...new Set(filteredCarpoolings.map((c) => c.driver_id)),
            ];

            // Récupérer les moyennes des notes depuis MongoDB
            const driverRatings = {};
            for (const driverId of driverIds) {
                try {
                    // MongoDB Review model disabled, setting default rating
                    driverRatings[driverId] = 0;
                    // const rating = await Review.getAverageRating(driverId);
                    // driverRatings[driverId] = rating.average || 0;
                } catch (error) {
                    console.warn(
                        `Erreur récupération note chauffeur ${driverId}:`,
                        error.message
                    );
                    driverRatings[driverId] = 0;
                }
            }

            // Ajouter les notes aux covoiturages
            filteredCarpoolings.forEach((carpooling) => {
                carpooling.driver_rating =
                    driverRatings[carpooling.driver_id] || 0;
            });

            // Filtrer par note minimale si spécifiée
            if (minRating && parseFloat(minRating) > 0) {
                filteredCarpoolings = filteredCarpoolings.filter(
                    (c) => c.driver_rating >= parseFloat(minRating)
                );
            }

            // Tri par rating ou durée si demandé
            if (sortField === "driver_rating") {
                filteredCarpoolings.sort((a, b) => {
                    const comparison =
                        (b.driver_rating || 0) - (a.driver_rating || 0);
                    return order === "desc" ? comparison : -comparison;
                });
            } else if (sortField === "duration_minutes") {
                filteredCarpoolings.sort((a, b) => {
                    const comparison = a.duration_minutes - b.duration_minutes;
                    return order === "desc" ? -comparison : comparison;
                });
            }
        }

        // Calculer les statistiques
        const stats = {
            total: totalResults,
            page: pageNum,
            totalPages: Math.ceil(totalResults / limitNum),
            hasNext: pageNum < Math.ceil(totalResults / limitNum),
            hasPrev: pageNum > 1,
            averagePrice:
                filteredCarpoolings.length > 0
                    ? Math.round(
                          filteredCarpoolings.reduce(
                              (sum, c) => sum + c.price_per_passenger,
                              0
                          ) / filteredCarpoolings.length
                      )
                    : 0,
            electricCount: filteredCarpoolings.filter((c) => c.is_electric)
                .length,
            departsToday: filteredCarpoolings.filter((c) => {
                const today = new Date().toDateString();
                return new Date(c.departure_datetime).toDateString() === today;
            }).length,
        };

        // Si aucun résultat après filtrage par note
        if (
            filteredCarpoolings.length === 0 &&
            enrichedCarpoolings.length > 0
        ) {
            return res.status(200).json({
                carpoolings: [],
                stats,
                message: `Aucun covoiturage trouvé avec une note minimale de ${minRating}. ${enrichedCarpoolings.length} covoiturages disponibles sans ce filtre.`,
            });
        }

        // Si aucun résultat trouvé, proposer des alternatives
        if (filteredCarpoolings.length === 0) {
            const suggestions = await generateSearchSuggestions(req.query);

            return res.status(200).json({
                carpoolings: [],
                stats: {
                    total: 0,
                    page: pageNum,
                    totalPages: 0,
                    hasNext: false,
                    hasPrev: false,
                },
                suggestions,
                message:
                    "Aucun covoiturage trouvé avec ces critères. Consultez nos suggestions.",
            });
        }

        res.status(200).json({
            carpoolings: filteredCarpoolings,
            stats,
            filters: {
                departure,
                arrival,
                date,
                maxPrice,
                isElectric,
                minRating,
            },
        });
    } catch (error) {
        console.error("Erreur recherche avancée:", error);

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
            message: "Erreur lors de la recherche de covoiturages.",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};

/*
 * Génère des suggestions intelligentes quand aucun résultat n'est trouvé
 */
async function generateSearchSuggestions(originalQuery) {
    const suggestions = {
        alternativeDates: [],
        popularDestinations: [],
        priceAdjustments: [],
        generalTips: [],
    };

    try {
        // Suggestions de dates alternatives (5 prochains jours)
        if (originalQuery.date || originalQuery.dateFrom) {
            const baseWhere = {
                status: "prévu",
                seats_remaining: { gt: 0 },
                departure_datetime: { gt: new Date() },
            };

            // Ajouter filtres de lieu si présents
            if (originalQuery.departure) {
                baseWhere.departure_address = {
                    contains: originalQuery.departure,
                    mode: "insensitive",
                };
            }
            if (originalQuery.arrival) {
                baseWhere.arrival_address = {
                    contains: originalQuery.arrival,
                    mode: "insensitive",
                };
            }

            // Récupérer les dates avec des résultats
            const dateResults = await prisma.carpooling.groupBy({
                by: ["departure_datetime"],
                where: baseWhere,
                _count: {
                    id: true,
                },
                orderBy: {
                    departure_datetime: "asc",
                },
                take: 5,
            });

            suggestions.alternativeDates = dateResults.map((r) => ({
                date: r.departure_datetime.toISOString().split("T")[0],
                availableTrips: r._count.id,
            }));
        }

        // Destinations populaires
        const popularResults = await prisma.carpooling.groupBy({
            by: ["arrival_address"],
            where: {
                status: "prévu",
                seats_remaining: { gt: 0 },
                departure_datetime: { gt: new Date() },
            },
            _count: {
                id: true,
            },
            orderBy: {
                _count: {
                    id: "desc",
                },
            },
            take: 5,
        });

        suggestions.popularDestinations = popularResults.map((r) => ({
            destination: r.arrival_address,
            availableTrips: r._count.id,
        }));

        // Suggestions d'ajustement de prix
        if (originalQuery.maxPrice) {
            const currentMax = parseFloat(originalQuery.maxPrice);
            const adjustedPrices = [
                {
                    price: currentMax + 5,
                    label: `Essayez ${currentMax + 5}€ (+5€)`,
                },
                {
                    price: currentMax + 10,
                    label: `Essayez ${currentMax + 10}€ (+10€)`,
                },
                {
                    price: currentMax + 15,
                    label: `Essayez ${currentMax + 15}€ (+15€)`,
                },
            ];
            suggestions.priceAdjustments = adjustedPrices;
        }

        // Conseils généraux
        suggestions.generalTips = [
            "Essayez d'élargir votre zone de départ ou d'arrivée",
            "Consultez les dates voisines pour plus d'options",
            "Les covoiturages électriques peuvent avoir des prix différents",
            "Réservez à l'avance pour plus de choix",
        ];
    } catch (error) {
        console.warn("Erreur génération suggestions:", error.message);
    }

    return suggestions;
}

/*
 * Fonction pour obtenir des statistiques générales sur les recherches
 */
const getSearchStatistics = async (req, res) => {
    try {
        const stats = {};

        // Destinations les plus populaires
        const popularDestinations = await prisma.carpooling.groupBy({
            by: ["arrival_address"],
            where: {
                status: "prévu",
                departure_datetime: { gt: new Date() },
            },
            _count: {
                id: true,
            },
            orderBy: {
                _count: {
                    id: "desc",
                },
            },
            take: 10,
        });

        stats.popularDestinations = popularDestinations.map((dest) => ({
            arrival_address: dest.arrival_address,
            search_count: dest._count.id,
        }));

        // Prix moyens par trajet - requête plus complexe avec groupBy
        const routeStats = await prisma.carpooling.groupBy({
            by: ["departure_address", "arrival_address"],
            where: {
                status: "prévu",
                departure_datetime: { gt: new Date() },
            },
            _avg: {
                price_per_passenger: true,
            },
            _count: {
                id: true,
            },
            having: {
                id: {
                    _count: {
                        gte: 2,
                    },
                },
            },
            orderBy: {
                _count: {
                    id: "desc",
                },
            },
            take: 10,
        });

        stats.averagePrices = routeStats.map((route) => ({
            route: `${route.departure_address} → ${route.arrival_address}`,
            avg_price:
                Math.round((route._avg.price_per_passenger || 0) * 100) / 100,
            trip_count: route._count.id,
        }));

        // Statistiques sur les véhicules avec agrégations
        const vehicleStatsResult = await prisma.carpooling.aggregate({
            where: {
                status: "prévu",
                departure_datetime: { gt: new Date() },
            },
            _count: {
                id: true,
            },
            _avg: {
                price_per_passenger: true,
            },
        });

        // Compter les trajets électriques séparément
        const electricTripsCount = await prisma.carpooling.count({
            where: {
                status: "prévu",
                departure_datetime: { gt: new Date() },
                vehicle: {
                    is_electric: true,
                },
            },
        });

        // Calculer la durée moyenne (nécessite une approche différente avec Prisma)
        const carpoolingsForDuration = await prisma.carpooling.findMany({
            where: {
                status: "prévu",
                departure_datetime: { gt: new Date() },
            },
            select: {
                departure_datetime: true,
                arrival_datetime: true,
            },
        });

        const avgDuration =
            carpoolingsForDuration.length > 0
                ? Math.round(
                      carpoolingsForDuration.reduce((sum, c) => {
                          const duration =
                              (new Date(c.arrival_datetime) -
                                  new Date(c.departure_datetime)) /
                              (1000 * 60);
                          return sum + duration;
                      }, 0) / carpoolingsForDuration.length
                  )
                : 0;

        stats.vehicleStats = {
            total_trips: vehicleStatsResult._count.id,
            electric_trips: electricTripsCount,
            avg_price:
                Math.round(
                    (vehicleStatsResult._avg.price_per_passenger || 0) * 100
                ) / 100,
            avg_duration_minutes: avgDuration,
        };

        res.status(200).json({ stats });
    } catch (error) {
        console.error("Erreur statistiques recherche:", error);

        if (error instanceof PrismaClientKnownRequestError) {
            return res.status(400).json({
                message:
                    "Erreur de base de données lors de la récupération des statistiques.",
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

module.exports = {
    getAvailableCarpoolingsAdvanced,
    generateSearchSuggestions,
    getSearchStatistics,
};
