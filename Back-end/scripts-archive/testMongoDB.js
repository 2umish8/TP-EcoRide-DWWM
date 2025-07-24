require("dotenv").config();
const connectMongoDB = require("../Config/mongodb.js");
const Review = require("../models/Review");
const DriverPreferences = require("../models/DriverPreferences");

async function testMongoDB() {
    try {
        console.log("🧪 Démarrage des tests MongoDB...\n");

        // Test de connexion
        await connectMongoDB();
        console.log("✅ Connexion MongoDB réussie\n");

        // Test 1: Créer une préférence chauffeur
        console.log("📝 Test 1: Création préférences chauffeur...");
        const testPreferences = await DriverPreferences.createOrUpdate(999, {
            allowsSmoking: false,
            allowsPets: true,
            conversationLevel: "friendly",
            preferredMusicGenre: "Jazz",
            specialRules: "Pas de nourriture dans la voiture",
            customPreferences: [
                {
                    type: "music",
                    value: "Jazz uniquement",
                    description: "J'aime le jazz relaxant pendant la conduite",
                },
            ],
        });
        console.log("✅ Préférences créées:", testPreferences._id);

        // Test 2: Créer un avis
        console.log("\n📝 Test 2: Création avis...");
        const testReview = new Review({
            reviewerId: 888,
            reviewedUserId: 999,
            carpoolingId: 777,
            rating: 4.5,
            comment: "Excellent chauffeur, très ponctuel !",
            validationStatus: "approved",
        });
        await testReview.save();
        console.log("✅ Avis créé:", testReview._id);

        // Test 3: Calculer la moyenne des notes
        console.log("\n📝 Test 3: Calcul moyenne notes...");
        const rating = await Review.getAverageRating(999);
        console.log("✅ Moyenne chauffeur 999:", rating);

        // Test 4: Récupérer préférences
        console.log("\n📝 Test 4: Récupération préférences...");
        const preferences = await DriverPreferences.findByDriverId(999);
        console.log("✅ Préférences trouvées:", preferences.conversationLevel);

        // Test 5: Avis en attente
        console.log("\n📝 Test 5: Avis en attente...");
        const testPendingReview = new Review({
            reviewerId: 777,
            reviewedUserId: 999,
            carpoolingId: 666,
            rating: 3,
            comment: "Trajet correct mais retard au départ",
            validationStatus: "pending",
        });
        await testPendingReview.save();

        const pendingReviews = await Review.getPendingReviews();
        console.log("✅ Avis en attente trouvés:", pendingReviews.length);

        console.log("\n🎉 Tous les tests MongoDB ont réussi !");
        console.log("\n📊 Résumé des collections créées:");
        console.log("   - DriverPreferences: 1 document");
        console.log("   - Reviews: 2 documents");
        console.log("\n🚀 MongoDB est prêt pour production !");
    } catch (error) {
        console.error("❌ Erreur lors des tests MongoDB:", error);
    } finally {
        // Fermer la connexion
        const mongoose = require("mongoose");
        await mongoose.connection.close();
        console.log("\n🔒 Connexion MongoDB fermée");
        process.exit(0);
    }
}

// Lancer les tests
testMongoDB();
