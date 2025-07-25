// Script pour améliorer la logique de recherche d'itinéraires
// Ce script ajoute des fonctionnalités avancées à la recherche

const db = require("../Config/db.js");
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
        const order = sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC";
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 20));
        const offset = (pageNum - 1) * limitNum;

        // Construction de la requête principale
        let sql = `
            SELECT c.*, 
                   u.pseudo as driver_pseudo,
                   u.profile_picture_url as driver_photo,
                   v.model, v.plate_number, v.is_electric, v.seats_available as vehicle_seats,
                   b.name as brand_name, 
                   col.name as color_name,
                   TIMESTAMPDIFF(MINUTE, c.departure_datetime, c.arrival_datetime) as duration_minutes,
                   -- Calcul du taux d'occupation
                   ROUND((c.initial_seats_offered - c.seats_remaining) / c.initial_seats_offered * 100, 1) as occupancy_rate
            FROM carpooling c
            INNER JOIN User u ON c.driver_id = u.id AND u.suspended = FALSE
            INNER JOIN Vehicle v ON c.vehicle_id = v.id
            LEFT JOIN Brand b ON v.brand_id = b.id
            LEFT JOIN Color col ON v.color_id = col.id
            WHERE c.status = 'prévu' AND c.departure_datetime > NOW()
        `;
        const params = [];

        // Condition sur les places disponibles
        if (includeFull !== "true") {
            sql += " AND c.seats_remaining > 0";
        }

        // Filtres de base
        if (departure) {
            // Recherche flexible avec plusieurs variantes de ville
            sql +=
                " AND (c.departure_address LIKE ? OR c.departure_address LIKE ? OR c.departure_address LIKE ?)";
            const departureVariants = [
                `%${departure}%`,
                `%${
                    departure.charAt(0).toUpperCase() +
                    departure.slice(1).toLowerCase()
                }%`,
                `%${departure.toUpperCase()}%`,
            ];
            params.push(...departureVariants);
        }

        if (arrival) {
            sql +=
                " AND (c.arrival_address LIKE ? OR c.arrival_address LIKE ? OR c.arrival_address LIKE ?)";
            const arrivalVariants = [
                `%${arrival}%`,
                `%${
                    arrival.charAt(0).toUpperCase() +
                    arrival.slice(1).toLowerCase()
                }%`,
                `%${arrival.toUpperCase()}%`,
            ];
            params.push(...arrivalVariants);
        }

        // Filtres de date améliorés
        if (date) {
            sql += " AND DATE(c.departure_datetime) = ?";
            params.push(date);
        } else {
            // Plage de dates
            if (dateFrom) {
                sql += " AND DATE(c.departure_datetime) >= ?";
                params.push(dateFrom);
            }
            if (dateTo) {
                sql += " AND DATE(c.departure_datetime) <= ?";
                params.push(dateTo);
            }
        }

        // Filtres de prix améliorés
        if (minPrice) {
            sql += " AND c.price_per_passenger >= ?";
            params.push(parseFloat(minPrice));
        }
        if (maxPrice) {
            sql += " AND c.price_per_passenger <= ?";
            params.push(parseFloat(maxPrice));
        }

        // Filtre écologique
        if (isElectric === "true") {
            sql += " AND v.is_electric = 1";
        }

        // Filtres de durée améliorés
        if (minDuration) {
            sql +=
                " AND TIMESTAMPDIFF(MINUTE, c.departure_datetime, c.arrival_datetime) >= ?";
            params.push(parseInt(minDuration));
        }
        if (maxDuration) {
            sql +=
                " AND TIMESTAMPDIFF(MINUTE, c.departure_datetime, c.arrival_datetime) <= ?";
            params.push(parseInt(maxDuration));
        }

        // Requête pour compter le total (pour pagination)
        const countSql = sql.replace(
            /SELECT c\.\*.*?FROM/,
            "SELECT COUNT(*) as total FROM"
        );
        const [countResult] = await db.query(countSql, params);
        const totalResults = countResult[0].total;

        // Ajouter le tri - attention au tri par rating qui sera fait après
        if (sortField !== "driver_rating") {
            sql += ` ORDER BY ${sortField} ${order}`;
        } else {
            sql += " ORDER BY c.departure_datetime ASC"; // Tri temporaire
        }

        // Pagination
        sql += " LIMIT ? OFFSET ?";
        params.push(limitNum, offset);

        console.log("SQL Query:", sql);
        console.log("Params:", params);

        const [carpoolings] = await db.query(sql, params);

        // Enrichir avec les notes MongoDB des chauffeurs
        if (carpoolings.length > 0) {
            const driverIds = [...new Set(carpoolings.map((c) => c.driver_id))];

            // Récupérer les moyennes des notes depuis MongoDB
            const driverRatings = {};
            for (const driverId of driverIds) {
                try {
                    const rating = await Review.getAverageRating(driverId);
                    driverRatings[driverId] = rating.average || 0;
                } catch (error) {
                    console.warn(
                        `Erreur récupération note chauffeur ${driverId}:`,
                        error.message
                    );
                    driverRatings[driverId] = 0;
                }
            }

            // Ajouter les notes aux covoiturages
            carpoolings.forEach((carpooling) => {
                carpooling.driver_rating =
                    driverRatings[carpooling.driver_id] || 0;

                // Ajouter des métadonnées utiles
                carpooling.is_almost_full = carpooling.seats_remaining <= 1;
                carpooling.is_departing_soon =
                    new Date(carpooling.departure_datetime) - new Date() <=
                    24 * 60 * 60 * 1000;
                carpooling.eco_friendly = carpooling.is_electric;
            });

            // Filtrer par note minimale si spécifiée
            let filteredCarpoolings = carpoolings;
            if (minRating && parseFloat(minRating) > 0) {
                filteredCarpoolings = carpoolings.filter(
                    (c) => c.driver_rating >= parseFloat(minRating)
                );
            }

            // Tri par rating si demandé
            if (sortField === "driver_rating") {
                filteredCarpoolings.sort((a, b) => {
                    const comparison =
                        (b.driver_rating || 0) - (a.driver_rating || 0);
                    return order === "DESC" ? comparison : -comparison;
                });
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
                    return (
                        new Date(c.departure_datetime).toDateString() === today
                    );
                }).length,
            };

            // Si aucun résultat après filtrage par note
            if (filteredCarpoolings.length === 0 && carpoolings.length > 0) {
                return res.status(200).json({
                    carpoolings: [],
                    stats,
                    message: `Aucun covoiturage trouvé avec une note minimale de ${minRating}. ${carpoolings.length} covoiturages disponibles sans ce filtre.`,
                });
            }

            return res.status(200).json({
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
        }

        // Si aucun résultat trouvé, proposer des alternatives
        if (carpoolings.length === 0) {
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
            carpoolings,
            stats: {
                total: totalResults,
                page: pageNum,
                totalPages: Math.ceil(totalResults / limitNum),
                hasNext: pageNum < Math.ceil(totalResults / limitNum),
                hasPrev: pageNum > 1,
            },
        });
    } catch (error) {
        console.error("Erreur recherche avancée:", error);
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
        // Suggestions de dates alternatives (3 prochains jours)
        if (originalQuery.date || originalQuery.dateFrom) {
            const baseSql = `
                SELECT DISTINCT DATE(departure_datetime) as suggestion_date, COUNT(*) as count
                FROM carpooling 
                WHERE status = 'prévu' AND seats_remaining > 0 AND departure_datetime > NOW()
            `;

            const dateSuggestionSql =
                baseSql +
                `
                ${originalQuery.departure ? "AND departure_address LIKE ?" : ""}
                ${originalQuery.arrival ? "AND arrival_address LIKE ?" : ""}
                GROUP BY DATE(departure_datetime)
                ORDER BY departure_datetime ASC
                LIMIT 5
            `;

            const dateParams = [];
            if (originalQuery.departure)
                dateParams.push(`%${originalQuery.departure}%`);
            if (originalQuery.arrival)
                dateParams.push(`%${originalQuery.arrival}%`);

            const [dateResults] = await db.query(dateSuggestionSql, dateParams);
            suggestions.alternativeDates = dateResults.map((r) => ({
                date: r.suggestion_date,
                availableTrips: r.count,
            }));
        }

        // Destinations populaires
        const popularSql = `
            SELECT arrival_address, COUNT(*) as trip_count
            FROM carpooling 
            WHERE status = 'prévu' AND seats_remaining > 0 AND departure_datetime > NOW()
            GROUP BY arrival_address
            ORDER BY trip_count DESC
            LIMIT 5
        `;
        const [popularResults] = await db.query(popularSql);
        suggestions.popularDestinations = popularResults.map((r) => ({
            destination: r.arrival_address,
            availableTrips: r.trip_count,
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
        const [popularDestinations] = await db.query(`
            SELECT arrival_address, COUNT(*) as search_count
            FROM carpooling 
            WHERE status = 'prévu' AND departure_datetime > NOW()
            GROUP BY arrival_address
            ORDER BY search_count DESC
            LIMIT 10
        `);
        stats.popularDestinations = popularDestinations;

        // Prix moyens par trajet
        const [avgPrices] = await db.query(`
            SELECT 
                CONCAT(departure_address, ' → ', arrival_address) as route,
                ROUND(AVG(price_per_passenger), 2) as avg_price,
                COUNT(*) as trip_count
            FROM carpooling 
            WHERE status = 'prévu' AND departure_datetime > NOW()
            GROUP BY departure_address, arrival_address
            HAVING trip_count >= 2
            ORDER BY trip_count DESC
            LIMIT 10
        `);
        stats.averagePrices = avgPrices;

        // Statistiques sur les véhicules
        const [vehicleStats] = await db.query(`
            SELECT 
                COUNT(*) as total_trips,
                SUM(CASE WHEN v.is_electric = 1 THEN 1 ELSE 0 END) as electric_trips,
                ROUND(AVG(c.price_per_passenger), 2) as avg_price,
                ROUND(AVG(TIMESTAMPDIFF(MINUTE, c.departure_datetime, c.arrival_datetime)), 0) as avg_duration_minutes
            FROM carpooling c
            INNER JOIN Vehicle v ON c.vehicle_id = v.id
            WHERE c.status = 'prévu' AND c.departure_datetime > NOW()
        `);
        stats.vehicleStats = vehicleStats[0];

        res.status(200).json({ stats });
    } catch (error) {
        console.error("Erreur statistiques recherche:", error);
        res.status(500).json({
            message: "Erreur lors de la récupération des statistiques.",
        });
    }
};

module.exports = {
    getAvailableCarpoolingsAdvanced,
    generateSearchSuggestions,
    getSearchStatistics,
};
