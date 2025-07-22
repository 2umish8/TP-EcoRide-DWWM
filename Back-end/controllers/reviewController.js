// MongoDB models temporarily disabled
// const Review = require("../models/Review");
const db = require("../Config/db.js");

/* --------------------------------------------------- Créer un avis ---------------------------------- */
const createReview = async (req, res) => {
    try {
        const reviewerId = req.user.id;
        const {
            carpoolingId,
            reviewedUserId,
            rating,
            comment,
            isReported,
            reportReason,
        } = req.body;

        // Vérifier que l'utilisateur a participé à ce covoiturage
        const participationSql = `
            SELECT p.id, c.driver_id, c.status
            FROM Participation p
            INNER JOIN Carpooling c ON p.carpooling_id = c.id
            WHERE p.passenger_id = ? AND p.carpooling_id = ? AND p.cancellation_date IS NULL
        `;
        const [participation] = await db.query(participationSql, [
            reviewerId,
            carpoolingId,
        ]);

        if (participation.length === 0) {
            return res.status(403).json({
                message:
                    "Vous ne pouvez laisser un avis que sur les covoiturages auxquels vous avez participé.",
            });
        }

        // Vérifier que le covoiturage est terminé
        if (participation[0].status !== "terminé") {
            return res.status(400).json({
                message:
                    "Vous ne pouvez laisser un avis que sur un covoiturage terminé.",
            });
        }

        // Vérifier que l'utilisateur évalué est bien le chauffeur
        if (participation[0].driver_id !== reviewedUserId) {
            return res.status(400).json({
                message:
                    "Vous ne pouvez évaluer que le chauffeur du covoiturage.",
            });
        }

        // Vérifier qu'un avis n'existe pas déjà
        const existingReview = await Review.findOne({
            reviewerId,
            carpoolingId,
        });

        if (existingReview) {
            return res.status(400).json({
                message: "Vous avez déjà laissé un avis pour ce covoiturage.",
            });
        }

        // Créer le nouvel avis
        const reviewData = {
            reviewerId,
            reviewedUserId,
            carpoolingId,
            rating,
            comment: comment || "",
            isReported: isReported || false,
            reportReason: reportReason || "",
        };

        const newReview = new Review(reviewData);
        await newReview.save();

        res.status(201).json({
            message:
                "Avis créé avec succès. Il sera visible après validation par un employé.",
            review: {
                id: newReview._id,
                rating: newReview.rating,
                comment: newReview.comment,
                validationStatus: newReview.validationStatus,
                createdAt: newReview.createdAt,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur lors de la création de l'avis.",
        });
    }
};

/* --------------------------------------------------- Obtenir les avis d'un chauffeur ---------------------------------- */
const getDriverReviews = async (req, res) => {
    try {
        const driverId = parseInt(req.params.driverId);
        const { page = 1, limit = 10 } = req.query;

        // Récupérer les avis approuvés uniquement
        const reviews = await Review.find({
            reviewedUserId: driverId,
            validationStatus: "approved",
        })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        // Obtenir les informations des reviewers depuis MySQL
        if (reviews.length > 0) {
            const reviewerIds = reviews.map((review) => review.reviewerId);
            const reviewersSql = `
                SELECT id, pseudo, profile_picture_url
                FROM User
                WHERE id IN (${reviewerIds.join(",")})
            `;
            const [reviewers] = await db.query(reviewersSql);
            const reviewersMap = reviewers.reduce((map, reviewer) => {
                map[reviewer.id] = reviewer;
                return map;
            }, {});

            // Enrichir les avis avec les données des reviewers
            const enrichedReviews = reviews.map((review) => ({
                id: review._id,
                rating: review.rating,
                comment: review.comment,
                createdAt: review.createdAt,
                reviewer: {
                    pseudo:
                        reviewersMap[review.reviewerId]?.pseudo ||
                        "Utilisateur inconnu",
                    profilePicture:
                        reviewersMap[review.reviewerId]?.profile_picture_url,
                },
            }));

            // Obtenir la moyenne et le total
            const stats = await Review.getAverageRating(driverId);

            res.status(200).json({
                reviews: enrichedReviews,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(stats.total / limit),
                    totalReviews: stats.total,
                },
                averageRating: stats.average,
            });
        } else {
            res.status(200).json({
                reviews: [],
                pagination: {
                    currentPage: 1,
                    totalPages: 0,
                    totalReviews: 0,
                },
                averageRating: 0,
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur lors de la récupération des avis.",
        });
    }
};

/* --------------------------------------------------- Obtenir les avis en attente (employé) ---------------------------------- */
const getPendingReviews = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const reviews = await Review.find({ validationStatus: "pending" })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        if (reviews.length > 0) {
            // Récupérer les informations des utilisateurs depuis MySQL
            const userIds = [
                ...new Set([
                    ...reviews.map((r) => r.reviewerId),
                    ...reviews.map((r) => r.reviewedUserId),
                ]),
            ];

            const usersSql = `
                SELECT id, pseudo, profile_picture_url
                FROM User
                WHERE id IN (${userIds.join(",")})
            `;
            const [users] = await db.query(usersSql);
            const usersMap = users.reduce((map, user) => {
                map[user.id] = user;
                return map;
            }, {});

            // Récupérer les informations des covoiturages
            const carpoolingIds = reviews.map((r) => r.carpoolingId);
            const carpoolingsSql = `
                SELECT id, departure_address, arrival_address, departure_datetime
                FROM Carpooling
                WHERE id IN (${carpoolingIds.join(",")})
            `;
            const [carpoolings] = await db.query(carpoolingsSql);
            const carpoolingsMap = carpoolings.reduce((map, carpooling) => {
                map[carpooling.id] = carpooling;
                return map;
            }, {});

            const enrichedReviews = reviews.map((review) => ({
                id: review._id,
                rating: review.rating,
                comment: review.comment,
                isReported: review.isReported,
                reportReason: review.reportReason,
                createdAt: review.createdAt,
                reviewer: {
                    id: review.reviewerId,
                    pseudo:
                        usersMap[review.reviewerId]?.pseudo ||
                        "Utilisateur inconnu",
                },
                reviewedDriver: {
                    id: review.reviewedUserId,
                    pseudo:
                        usersMap[review.reviewedUserId]?.pseudo ||
                        "Chauffeur inconnu",
                },
                carpooling: carpoolingsMap[review.carpoolingId] || null,
            }));

            res.status(200).json({
                reviews: enrichedReviews,
                pagination: {
                    currentPage: parseInt(page),
                    limit: parseInt(limit),
                },
            });
        } else {
            res.status(200).json({
                reviews: [],
                pagination: {
                    currentPage: 1,
                    limit: parseInt(limit),
                },
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur lors de la récupération des avis en attente.",
        });
    }
};

/* --------------------------------------------------- Valider/Rejeter un avis (employé) ---------------------------------- */
const validateReview = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const { status } = req.body; // "approved" ou "rejected"
        const employeeId = req.user.id;

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({
                message: "Le statut doit être 'approved' ou 'rejected'.",
            });
        }

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({
                message: "Avis non trouvé.",
            });
        }

        if (review.validationStatus !== "pending") {
            return res.status(400).json({
                message: "Cet avis a déjà été traité.",
            });
        }

        review.validationStatus = status;
        review.validatedBy = employeeId;
        review.validatedAt = new Date();
        await review.save();

        res.status(200).json({
            message: `Avis ${
                status === "approved" ? "approuvé" : "rejeté"
            } avec succès.`,
            review: {
                id: review._id,
                validationStatus: review.validationStatus,
                validatedAt: review.validatedAt,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur lors de la validation de l'avis.",
        });
    }
};

/* --------------------------------------------------- Obtenir les signalements ---------------------------------- */
const getReportedTrips = async (req, res) => {
    try {
        const reportedReviews = await Review.getReportedTrips();

        if (reportedReviews.length > 0) {
            // Enrichir avec les données MySQL
            const userIds = [
                ...new Set([
                    ...reportedReviews.map((r) => r.reviewerId),
                    ...reportedReviews.map((r) => r.reviewedUserId),
                ]),
            ];

            const usersSql = `
                SELECT id, pseudo, email
                FROM User
                WHERE id IN (${userIds.join(",")})
            `;
            const [users] = await db.query(usersSql);
            const usersMap = users.reduce((map, user) => {
                map[user.id] = user;
                return map;
            }, {});

            const carpoolingIds = reportedReviews.map((r) => r.carpoolingId);
            const carpoolingsSql = `
                SELECT id, departure_address, arrival_address, departure_datetime, arrival_datetime
                FROM Carpooling
                WHERE id IN (${carpoolingIds.join(",")})
            `;
            const [carpoolings] = await db.query(carpoolingsSql);
            const carpoolingsMap = carpoolings.reduce((map, carpooling) => {
                map[carpooling.id] = carpooling;
                return map;
            }, {});

            const enrichedReports = reportedReviews.map((review) => ({
                id: review._id,
                reportReason: review.reportReason,
                rating: review.rating,
                comment: review.comment,
                createdAt: review.createdAt,
                reporter: {
                    pseudo: usersMap[review.reviewerId]?.pseudo,
                    email: usersMap[review.reviewerId]?.email,
                },
                driver: {
                    pseudo: usersMap[review.reviewedUserId]?.pseudo,
                    email: usersMap[review.reviewedUserId]?.email,
                },
                carpooling: carpoolingsMap[review.carpoolingId],
            }));

            res.status(200).json({ reports: enrichedReports });
        } else {
            res.status(200).json({ reports: [] });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur lors de la récupération des signalements.",
        });
    }
};

module.exports = {
    createReview,
    getDriverReviews,
    getPendingReviews,
    validateReview,
    getReportedTrips,
};
