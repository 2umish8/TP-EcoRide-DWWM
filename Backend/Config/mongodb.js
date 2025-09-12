const mongoose = require("mongoose");

// Configuration de la connexion MongoDB
const connectMongoDB = async () => {
    try {
        const mongoURI =
            process.env.MONGODB_URI ||
            "mongodb://localhost:27017/ecoride_reviews";

        await mongoose.connect(mongoURI, {
            // Options de connexion recommandées
            maxPoolSize: 10, // Maintenir jusqu'à 10 connexions socket
            serverSelectionTimeoutMS: 5000, // Abandonner après 5s
            socketTimeoutMS: 45000, // Fermer les sockets après 45s d'inactivité
        });

        console.log("✅ Connexion MongoDB établie avec succès");
    } catch (error) {
        console.error("❌ Erreur de connexion MongoDB:", error.message);
        process.exit(1);
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
