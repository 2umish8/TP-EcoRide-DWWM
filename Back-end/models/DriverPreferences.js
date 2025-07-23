const mongoose = require("mongoose");

// Schéma pour les préférences des chauffeurs
const driverPreferencesSchema = new mongoose.Schema(
    {
        // Identifiant du chauffeur (référence vers MySQL)
        driverId: {
            type: Number,
            required: true,
            unique: true,
            index: true,
        },

        // Préférences de base
        allowsSmoking: {
            type: Boolean,
            default: false,
        },
        allowsPets: {
            type: Boolean,
            default: false,
        },

        // Préférences personnalisées (flexibles)
        customPreferences: [
            {
                type: {
                    type: String,
                    enum: ["music", "conversation", "silence", "other"],
                    required: true,
                },
                value: {
                    type: String,
                    required: true,
                    maxlength: 200,
                },
                description: {
                    type: String,
                    maxlength: 300,
                },
            },
        ],

        // Préférences de voyage
        preferredMusicGenre: {
            type: String,
            maxlength: 50,
        },
        conversationLevel: {
            type: String,
            enum: ["silent", "minimal", "friendly", "chatty"],
            default: "friendly",
        },

        // Règles spéciales
        specialRules: {
            type: String,
            maxlength: 500,
        },

        // Métadonnées
        createdAt: {
            type: Date,
            default: Date.now,
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Middleware pour mettre à jour updatedAt
driverPreferencesSchema.pre("save", function (next) {
    if (this.isModified() && !this.isNew) {
        this.updatedAt = new Date();
    }
    next();
});

// Méthodes statiques
driverPreferencesSchema.statics.findByDriverId = function (driverId) {
    return this.findOne({ driverId });
};

driverPreferencesSchema.statics.createOrUpdate = async function (
    driverId,
    preferences
) {
    return this.findOneAndUpdate(
        { driverId },
        { ...preferences, driverId, updatedAt: new Date() },
        { upsert: true, new: true, runValidators: true }
    );
};

// Méthodes d'instance
driverPreferencesSchema.methods.addCustomPreference = function (
    type,
    value,
    description = ""
) {
    this.customPreferences.push({ type, value, description });
    return this.save();
};

driverPreferencesSchema.methods.removeCustomPreference = function (
    preferenceId
) {
    this.customPreferences.id(preferenceId).remove();
    return this.save();
};

module.exports = mongoose.model("DriverPreferences", driverPreferencesSchema);
