const { MongoClient } = require("mongodb");

// Configuration MongoDB (adaptez selon votre configuration)
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DATABASE_NAME = "ecoride_reviews";

async function createTestReviews() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log("✅ Connexion à MongoDB réussie");

        const db = client.db(DATABASE_NAME);
        const reviewsCollection = db.collection("reviews");

        // Avis de test avec signalements
        const testReviews = [
            {
                carpoolingId: 2,
                reviewerId: 80,
                reviewedUserId: 38, // TestChauffeur
                rating: 1,
                comment:
                    "Conduite très dangereuse, chauffeur parlait au téléphone pendant tout le trajet. Véhicule sale et musique trop forte.",
                isReported: true,
                reportReason:
                    "Conduite dangereuse - utilisation du téléphone au volant",
                validationStatus: "pending",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                carpoolingId: 3,
                reviewerId: 81,
                reviewedUserId: 38, // TestChauffeur
                rating: 2,
                comment:
                    "Retard de 45 minutes sans prévenir. Véhicule qui sent la cigarette malgré l'indication non-fumeur.",
                isReported: true,
                reportReason:
                    "Non-respect des horaires et des conditions annoncées",
                validationStatus: "pending",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                carpoolingId: 20,
                reviewerId: 82,
                reviewedUserId: 79, // driver_1753196593440
                rating: 5,
                comment:
                    "Excellent chauffeur, très ponctuel et courtois. Véhicule propre et conduite sécurisée.",
                isReported: false,
                validationStatus: "pending",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                carpoolingId: 22,
                reviewerId: 83,
                reviewedUserId: 82, // driver_1753196983652
                rating: 1,
                comment:
                    "INACCEPTABLE ! Le chauffeur était manifestement sous l'influence d'alcool. J'ai eu très peur pour ma sécurité.",
                isReported: true,
                reportReason: "Soupçon de conduite en état d'ivresse - URGENT",
                validationStatus: "pending",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];

        // Insérer les avis
        const result = await reviewsCollection.insertMany(testReviews);
        console.log(
            `✅ ${result.insertedCount} avis de test insérés dans MongoDB`
        );

        // Afficher les IDs des avis créés
        console.log("📋 IDs des avis créés:");
        Object.values(result.insertedIds).forEach((id, index) => {
            console.log(`  ${index + 1}. ${id}`);
        });
    } catch (error) {
        console.error("❌ Erreur lors de la création des avis test:", error);
    } finally {
        await client.close();
        console.log("🔐 Connexion MongoDB fermée");
    }
}

// Exécuter le script
if (require.main === module) {
    createTestReviews();
}

module.exports = { createTestReviews };
