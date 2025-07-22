const DriverPreferences = require("../models/DriverPreferences");

/* --------------------------------------------------- Créer/Mettre à jour les préférences ---------------------------------- */
const createOrUpdatePreferences = async (req, res) => {
    try {
        const driverId = req.user.id;
        const {
            allowsSmoking,
            allowsPets,
            customPreferences,
            preferredMusicGenre,
            conversationLevel,
            specialRules,
        } = req.body;

        const preferencesData = {
            allowsSmoking: allowsSmoking || false,
            allowsPets: allowsPets || false,
            customPreferences: customPreferences || [],
            preferredMusicGenre: preferredMusicGenre || "",
            conversationLevel: conversationLevel || "friendly",
            specialRules: specialRules || "",
        };

        const preferences = await DriverPreferences.createOrUpdate(
            driverId,
            preferencesData
        );

        res.status(200).json({
            message: "Préférences sauvegardées avec succès.",
            preferences: {
                id: preferences._id,
                allowsSmoking: preferences.allowsSmoking,
                allowsPets: preferences.allowsPets,
                customPreferences: preferences.customPreferences,
                preferredMusicGenre: preferences.preferredMusicGenre,
                conversationLevel: preferences.conversationLevel,
                specialRules: preferences.specialRules,
                updatedAt: preferences.updatedAt,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur lors de la sauvegarde des préférences.",
        });
    }
};

/* --------------------------------------------------- Récupérer les préférences d'un chauffeur ---------------------------------- */
const getDriverPreferences = async (req, res) => {
    try {
        const driverId = parseInt(req.params.driverId) || req.user.id;

        const preferences = await DriverPreferences.findByDriverId(driverId);

        if (!preferences) {
            return res.status(404).json({
                message: "Aucune préférence trouvée pour ce chauffeur.",
                preferences: {
                    allowsSmoking: false,
                    allowsPets: false,
                    customPreferences: [],
                    preferredMusicGenre: "",
                    conversationLevel: "friendly",
                    specialRules: "",
                },
            });
        }

        res.status(200).json({
            preferences: {
                id: preferences._id,
                allowsSmoking: preferences.allowsSmoking,
                allowsPets: preferences.allowsPets,
                customPreferences: preferences.customPreferences,
                preferredMusicGenre: preferences.preferredMusicGenre,
                conversationLevel: preferences.conversationLevel,
                specialRules: preferences.specialRules,
                createdAt: preferences.createdAt,
                updatedAt: preferences.updatedAt,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur lors de la récupération des préférences.",
        });
    }
};

/* --------------------------------------------------- Récupérer ses propres préférences ---------------------------------- */
const getMyPreferences = async (req, res) => {
    try {
        const driverId = req.user.id;

        const preferences = await DriverPreferences.findByDriverId(driverId);

        if (!preferences) {
            // Retourner des préférences par défaut si aucune n'existe
            return res.status(200).json({
                preferences: {
                    allowsSmoking: false,
                    allowsPets: false,
                    customPreferences: [],
                    preferredMusicGenre: "",
                    conversationLevel: "friendly",
                    specialRules: "",
                },
                isNew: true,
            });
        }

        res.status(200).json({
            preferences: {
                id: preferences._id,
                allowsSmoking: preferences.allowsSmoking,
                allowsPets: preferences.allowsPets,
                customPreferences: preferences.customPreferences,
                preferredMusicGenre: preferences.preferredMusicGenre,
                conversationLevel: preferences.conversationLevel,
                specialRules: preferences.specialRules,
                createdAt: preferences.createdAt,
                updatedAt: preferences.updatedAt,
            },
            isNew: false,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur lors de la récupération de vos préférences.",
        });
    }
};

/* --------------------------------------------------- Ajouter une préférence personnalisée ---------------------------------- */
const addCustomPreference = async (req, res) => {
    try {
        const driverId = req.user.id;
        const { type, value, description } = req.body;

        if (!type || !value) {
            return res.status(400).json({
                message: "Le type et la valeur de la préférence sont requis.",
            });
        }

        let preferences = await DriverPreferences.findByDriverId(driverId);

        if (!preferences) {
            // Créer les préférences si elles n'existent pas
            preferences = new DriverPreferences({ driverId });
        }

        await preferences.addCustomPreference(type, value, description);

        res.status(200).json({
            message: "Préférence personnalisée ajoutée avec succès.",
            preferences: preferences.customPreferences,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur lors de l'ajout de la préférence personnalisée.",
        });
    }
};

/* --------------------------------------------------- Supprimer une préférence personnalisée ---------------------------------- */
const removeCustomPreference = async (req, res) => {
    try {
        const driverId = req.user.id;
        const { preferenceId } = req.params;

        const preferences = await DriverPreferences.findByDriverId(driverId);

        if (!preferences) {
            return res.status(404).json({
                message: "Aucune préférence trouvée.",
            });
        }

        await preferences.removeCustomPreference(preferenceId);

        res.status(200).json({
            message: "Préférence personnalisée supprimée avec succès.",
            preferences: preferences.customPreferences,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message:
                "Erreur lors de la suppression de la préférence personnalisée.",
        });
    }
};

module.exports = {
    createOrUpdatePreferences,
    getDriverPreferences,
    getMyPreferences,
    addCustomPreference,
    removeCustomPreference,
};
