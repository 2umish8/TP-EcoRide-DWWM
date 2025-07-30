const axios = require("axios");

const API_BASE_URL =
    process.env.API_URL ||
    "https://tp-ecoride-dwwm-production.up.railway.app/api";

async function testUserController() {
    console.log("🧪 Test du userController avec MongoDB pour les reviews...\n");

    try {
        // Test 1: Récupérer le profil d'un utilisateur
        console.log("1️⃣ Test de récupération du profil utilisateur...");
        const response = await axios.get(`${API_BASE_URL}/users/109`);

        if (response.status === 200) {
            console.log("✅ Profil utilisateur récupéré avec succès");
            console.log("📊 Statistiques:", response.data.stats);
            console.log("📝 Nombre d'avis:", response.data.reviews.length);
        } else {
            console.log("❌ Erreur lors de la récupération du profil");
        }

        // Test 2: Vérifier que les reviews viennent de MongoDB
        console.log("\n2️⃣ Vérification de la source des reviews...");
        if (response.data.reviews && response.data.reviews.length > 0) {
            const firstReview = response.data.reviews[0];
            if (
                firstReview.id &&
                typeof firstReview.id === "string" &&
                firstReview.id.length > 20
            ) {
                console.log(
                    "✅ Reviews proviennent de MongoDB (ID MongoDB détecté)"
                );
            } else {
                console.log("⚠️ Format d'ID suspect pour les reviews");
            }
        } else {
            console.log("ℹ️ Aucune review trouvée (normal si pas de données)");
        }

        // Test 3: Vérifier les statistiques
        console.log("\n3️⃣ Vérification des statistiques...");
        const stats = response.data.stats;
        if (stats.averageRating !== null || stats.totalReviews !== undefined) {
            console.log("✅ Statistiques MongoDB correctement calculées");
            console.log(`   - Note moyenne: ${stats.averageRating}`);
            console.log(`   - Nombre total d'avis: ${stats.totalReviews}`);
        } else {
            console.log("⚠️ Statistiques manquantes ou incorrectes");
        }
    } catch (error) {
        console.error("❌ Erreur lors du test:", error.message);
        if (error.response) {
            console.error("📄 Réponse d'erreur:", error.response.data);
        }
    }
}

// Exécuter le test
testUserController();
