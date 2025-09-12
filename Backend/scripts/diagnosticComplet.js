const axios = require("axios");
const mongoose = require("mongoose");
const Review = require("../models/Review");
const connectMongoDB = require("../Config/mongodb.js");

const API_BASE_URL =
    process.env.API_URL ||
    "https://tp-ecoride-dwwm-production.up.railway.app/api";

async function diagnosticComplet() {
    console.log("🔍 DIAGNOSTIC COMPLET - Reviews et MongoDB\n");
    console.log("=".repeat(50));

    // 1. Vérification des variables d'environnement
    console.log("\n1️⃣ VÉRIFICATION DES VARIABLES D'ENVIRONNEMENT");
    console.log("-".repeat(40));

    const mongoUri = process.env.MONGODB_URI;
    if (mongoUri) {
        console.log("✅ MONGODB_URI définie");
        if (mongoUri.includes("railway") || mongoUri.includes("mongodb.net")) {
            console.log("✅ URI MongoDB cloud détectée");
        } else {
            console.log("⚠️ URI MongoDB locale détectée");
        }
    } else {
        console.log("❌ MONGODB_URI manquante");
    }

    // 2. Test de connexion MongoDB
    console.log("\n2️⃣ TEST DE CONNEXION MONGODB");
    console.log("-".repeat(40));

    try {
        await connectMongoDB();
        console.log("✅ Connexion MongoDB établie");

        // Test du modèle Review
        const reviewCount = await Review.countDocuments();
        console.log(`✅ Modèle Review accessible - ${reviewCount} reviews`);
    } catch (error) {
        console.log("❌ Erreur de connexion MongoDB:", error.message);
    }

    // 3. Test de l'API
    console.log("\n3️⃣ TEST DE L'API");
    console.log("-".repeat(40));

    try {
        const response = await axios.get(`${API_BASE_URL}/users/109`);
        console.log("✅ API accessible");
        console.log(`✅ Statut: ${response.status}`);

        if (response.data.stats) {
            console.log("✅ Statistiques présentes dans la réponse");
            console.log(`   - Total trips: ${response.data.stats.totalTrips}`);
            console.log(
                `   - Note moyenne: ${response.data.stats.averageRating}`
            );
            console.log(
                `   - Total reviews: ${response.data.stats.totalReviews}`
            );
        } else {
            console.log("❌ Statistiques manquantes dans la réponse");
        }

        if (response.data.reviews) {
            console.log(
                `✅ Reviews présentes: ${response.data.reviews.length} reviews`
            );
            if (response.data.reviews.length > 0) {
                const firstReview = response.data.reviews[0];
                if (firstReview.id && firstReview.id.length > 20) {
                    console.log("✅ Format ID MongoDB détecté");
                } else {
                    console.log("⚠️ Format ID suspect");
                }
            }
        } else {
            console.log("❌ Reviews manquantes dans la réponse");
        }
    } catch (error) {
        console.log("❌ Erreur API:", error.message);
        if (error.response) {
            console.log(`   - Statut: ${error.response.status}`);
            console.log(
                `   - Message: ${
                    error.response.data?.message || "Aucun message"
                }`
            );
        }
    }

    // 4. Test des méthodes MongoDB
    console.log("\n4️⃣ TEST DES MÉTHODES MONGODB");
    console.log("-".repeat(40));

    try {
        // Test getAverageRating
        const stats = await Review.getAverageRating(109);
        console.log("✅ getAverageRating fonctionnelle");
        console.log(`   - Note moyenne: ${stats.average}`);
        console.log(`   - Total: ${stats.total}`);

        // Test find reviews
        const reviews = await Review.find({
            reviewedUserId: 109,
            validationStatus: "approved",
        }).limit(3);
        console.log(`✅ Récupération reviews: ${reviews.length} trouvées`);

        // Test pending reviews
        const pending = await Review.getPendingReviews();
        console.log(`✅ Reviews en attente: ${pending.length} trouvées`);
    } catch (error) {
        console.log("❌ Erreur méthodes MongoDB:", error.message);
    }

    // 5. Vérification des imports
    console.log("\n5️⃣ VÉRIFICATION DES IMPORTS");
    console.log("-".repeat(40));

    try {
        const userController = require("../controllers/userController.js");
        console.log("✅ userController importé avec succès");

        const reviewController = require("../controllers/reviewController.js");
        console.log("✅ reviewController importé avec succès");

        const ReviewModel = require("../models/Review.js");
        console.log("✅ Modèle Review importé avec succès");
    } catch (error) {
        console.log("❌ Erreur import:", error.message);
    }

    // 6. Résumé et recommandations
    console.log("\n6️⃣ RÉSUMÉ ET RECOMMANDATIONS");
    console.log("-".repeat(40));

    console.log("📋 Points à vérifier:");
    console.log("   - Variables d'environnement MongoDB configurées");
    console.log("   - Connexion MongoDB établie");
    console.log("   - API accessible et fonctionnelle");
    console.log("   - Reviews récupérées depuis MongoDB");
    console.log("   - Statistiques calculées correctement");

    console.log("\n🔧 Actions recommandées:");
    console.log("   1. Vérifier MONGODB_URI dans Railway");
    console.log("   2. S'assurer que MongoDB Atlas est accessible");
    console.log("   3. Vérifier les permissions de la base MongoDB");
    console.log("   4. Tester avec des données de test si nécessaire");

    // Fermer la connexion MongoDB
    await mongoose.connection.close();
    console.log("\n🔒 Connexion MongoDB fermée");
}

// Exécuter le diagnostic
diagnosticComplet().catch(console.error);
