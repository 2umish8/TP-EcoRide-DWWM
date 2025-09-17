const mongoose = require("mongoose");

// Configuration de la connexion MongoDB
// Connect to MongoDB with retry/backoff to avoid exiting the container
const connectMongoDB = async () => {
    const mongoURI =
        process.env.MONGODB_URI || "mongodb://localhost:27017/ecoride_reviews";

    const MAX_RETRIES = parseInt(
        process.env.MONGO_CONNECT_MAX_RETRIES || "6",
        10
    );
    const RETRY_DELAY_MS = parseInt(
        process.env.MONGO_CONNECT_RETRY_DELAY_MS || "5000",
        10
    );

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            await mongoose.connect(mongoURI, {
                maxPoolSize: 10, // Maintenir jusqu'à 10 connexions socket
                serverSelectionTimeoutMS: 5000, // Abandonner après 5s
                socketTimeoutMS: 45000, // Fermer les sockets après 45s d'inactivité
            });

            console.log("✅ Connexion MongoDB établie avec succès");
            return;
        } catch (error) {
            console.error(
                `❌ Erreur de connexion MongoDB (tentative ${attempt}/${MAX_RETRIES}):`,
                error.message
            );

            if (attempt === MAX_RETRIES) {
                console.error(
                    "❌ Échec de connexion MongoDB après plusieurs tentatives. Le processus ne sera pas arrêté automatiquement pour faciliter le debug."
                );
                // Définit l'état d'échec mais ne fait pas process.exit pour laisser le conteneur tournant
                return;
            }

            // Attendre avant la prochaine tentative
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        }
    }
};

// Gestion des événements de connexion
mongoose.connection.on("connected", () => {
    console.log("🔗 MongoDB connecté");
});

mongoose.connection.on("error", (err) => {
    console.error("🚨 Erreur MongoDB:", err);
});

mongoose.connection.on("disconnected", () => {
    console.log("🔌 MongoDB déconnecté");
});

// Fermeture propre de la connexion lors de l'arrêt de l'application
process.on("SIGINT", async () => {
    await mongoose.connection.close();
    console.log("🔒 Connexion MongoDB fermée lors de l'arrêt de l'application");
    process.exit(0);
});

module.exports = connectMongoDB;
