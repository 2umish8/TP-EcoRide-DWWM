const mongoose = require("mongoose");

// Schéma pour les avis et notes des chauffeurs
const reviewSchema = new mongoose.Schema(
    {
        // Identifiants des utilisateurs (références vers MySQL)
        reviewerId: {
            type: Number,
            required: true,
            index: true,
        },
        reviewedUserId: {
            type: Number,
            required: true,
            index: true,
        },
        carpoolingId: {
            type: Number,
            required: true,
            index: true,
        },

        // Contenu de l'avis
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
            validate: {
                validator: function (v) {
                    return v >= 1 && v <= 5 && Number.isInteger(v * 2); // Permet les demi-points (1, 1.5, 2, etc.)
                },
                message:
                    "La note doit être entre 1 et 5 (demi-points autorisés)",
            },
        },
        comment: {
            type: String,
            required: false,
            maxlength: 1000,
            trim: true,
        },

        // Statut de validation par un employé
        validationStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
            index: true,
        },
        validatedBy: {
            type: Number, // ID de l'employé qui a validé
            required: false,
        },
        validatedAt: {
            type: Date,
            required: false,
        },

        // Signalement de problème
        isReported: {
            type: Boolean,
            default: false,
            index: true,
        },
        reportReason: {
            type: String,
            required: false,
            maxlength: 500,
        },

        // Métadonnées
        createdAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true, // Ajoute automatiquement createdAt et updatedAt
    }
);

// Index composé pour éviter les doublons d'avis par trajet
reviewSchema.index({ reviewerId: 1, carpoolingId: 1 }, { unique: true });

// Index pour les requêtes de moyenne des notes par chauffeur
reviewSchema.index({ reviewedUserId: 1, validationStatus: 1 });

// Middleware pour mettre à jour updatedAt
reviewSchema.pre("save", function (next) {
    if (this.isModified() && !this.isNew) {
        this.updatedAt = new Date();
    }
    next();
});

// Méthodes statiques utiles
reviewSchema.statics.getAverageRating = async function (userId) {
    const result = await this.aggregate([
        {
            $match: {
                reviewedUserId: userId,
                validationStatus: "approved",
            },
        },
        {
            $group: {
                _id: null,
                averageRating: { $avg: "$rating" },
                totalReviews: { $sum: 1 },
            },
        },
    ]);

    return result.length > 0
        ? {
              average: Math.round(result[0].averageRating * 10) / 10, // Arrondi à 1 décimale
              total: result[0].totalReviews,
          }
        : { average: 0, total: 0 };
};

reviewSchema.statics.getPendingReviews = function () {
    return this.find({ validationStatus: "pending" }).sort({ createdAt: -1 });
};

reviewSchema.statics.getReportedTrips = function () {
    return this.find({ isReported: true }).sort({ createdAt: -1 });
};

module.exports = mongoose.model("Review", reviewSchema);
