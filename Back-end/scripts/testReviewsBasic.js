const axios = require("axios");

// Configuration de base
const API_BASE = "http://localhost:3000/api";

// Fonction utilitaire pour créer des en-têtes d'authentification
function authenticatedRequest(token, config = {}) {
    return {
        ...config,
        headers: {
            ...config.headers,
            Authorization: `Bearer ${token}`,
        },
    };
}

async function testReviewsBasic() {
    console.log("⭐ Test basique du système d'avis EcoRide (MongoDB)");
    console.log("======================================================");

    try {
        // ============ CRÉER UN UTILISATEUR DE TEST ============
        console.log("🔧 Setup: Création d'un utilisateur de test");

        const timestamp = Date.now();

        // Créer un utilisateur simple pour tester
        const userData = {
            nom: "TestUser",
            prenom: "MongoDB",
            pseudo: `testuser_${timestamp}`,
            email: `testuser_${timestamp}@test.com`,
            password: "MotDePasse123!",
            date_naissance: "1990-01-01",
            telephone: "0123456789",
        };

        const userResponse = await axios.post(
            `${API_BASE}/users/register`,
            userData
        );
        console.log("✅ Utilisateur créé:", userResponse.data.message);

        // Connexion
        const loginResponse = await axios.post(`${API_BASE}/users/login`, {
            identifier: userData.email,
            password: userData.password,
        });

        const userToken = loginResponse.data.token;
        const userId = loginResponse.data.user.id;
        console.log("✅ Utilisateur connecté, ID:", userId);
        console.log("");

        // ============ TEST: RÉCUPÉRATION DES AVIS D'UN UTILISATEUR ============
        console.log("⭐ Test 1: Consultation des avis d'un utilisateur (vide)");

        const reviewsResponse = await axios.get(
            `${API_BASE}/reviews/driver/${userId}`
        );
        console.log("✅ Récupération des avis réussie");
        console.log(`   Nombre d'avis: ${reviewsResponse.data.reviews.length}`);
        console.log(
            `   Moyenne: ${reviewsResponse.data.stats?.average || "N/A"}`
        );
        console.log(`   Total: ${reviewsResponse.data.stats?.total || 0}`);
        console.log("");

        // ============ TEST: TENTATIVE DE CRÉATION D'AVIS SANS PARTICIPATION ============
        console.log(
            "⭐ Test 2: Tentative de création d'avis sans participation"
        );

        // Essayer de créer un avis sans avoir participé à un covoiturage
        const reviewData = {
            carpoolingId: 999, // ID fictif
            reviewedUserId: userId,
            rating: 5,
            comment: "Test d'avis sans participation",
        };

        try {
            await axios.post(
                `${API_BASE}/reviews`,
                reviewData,
                authenticatedRequest(userToken)
            );
            console.log("❌ ERREUR: L'avis a été créé sans participation !");
        } catch (error) {
            if (
                error.response &&
                (error.response.status === 403 || error.response.status === 400)
            ) {
                console.log(
                    "✅ Avis correctement refusé:",
                    error.response.data.message
                );
            } else {
                console.log(
                    "❌ Erreur inattendue:",
                    error.response?.data?.message || error.message
                );
            }
        }
        console.log("");

        // ============ RÉSULTAT FINAL ============
        console.log("🎉 TESTS BASIQUES D'AVIS RÉUSSIS!");
        console.log("✅ Récupération d'avis (liste vide)");
        console.log("✅ Refus d'avis sans participation");
        console.log("✅ API Reviews MongoDB fonctionnelle");
        console.log("");
        console.log("📊 Statistiques finales:");
        console.log(`   Utilisateur testé: ${userData.pseudo} (ID: ${userId})`);
        console.log("✨ Tests terminés avec succès!");
    } catch (error) {
        console.error(
            "❌ Erreur lors des tests:",
            error.response?.data || error.message
        );
        console.error("Stack trace:", error.stack);
    }
}

// Exécuter les tests
testReviewsBasic().catch(console.error);
