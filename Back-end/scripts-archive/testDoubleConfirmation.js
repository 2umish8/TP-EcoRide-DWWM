const axios = require("axios");

// Configuration de base
const BASE_URL = "http://localhost:3000/api";
let driverToken = "";
let passengerToken = "";
let carpoolingId = "";

// Helper pour les requêtes authentifiées
const authenticatedRequest = (token, config) => ({
    ...config,
    headers: {
        ...config.headers,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    },
});

// Fonction pour attendre un peu entre les tests
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Test complet de la double confirmation
async function testDoubleConfirmation() {
    console.log("🚀 === TEST DE LA DOUBLE CONFIRMATION DE PARTICIPATION ===\n");

    try {
        // ============ ÉTAPE 1: PRÉPARATION DES COMPTES ============
        console.log("👤 Étape 1: Préparation des comptes de test");

        // Inscription et connexion du chauffeur
        console.log("🚗 Création du compte chauffeur...");
        const timestamp = Date.now();
        const driverData = {
            pseudo: `chauffeur_test_${timestamp}`,
            email: `chauffeur.${timestamp}@test.com`,
            password: "Password123!",
        };

        try {
            await axios.post(`${BASE_URL}/users/register`, driverData);
        } catch (error) {
            // Compte existe déjà, on continue
        }

        const driverLogin = await axios.post(`${BASE_URL}/users/login`, {
            identifier: driverData.email,
            password: driverData.password,
        });
        driverToken = driverLogin.data.token;
        console.log("✅ Chauffeur connecté");

        // Inscription et connexion du passager
        console.log("🎫 Création du compte passager...");
        const passengerData = {
            pseudo: `passager_test_${timestamp}`,
            email: `passager.${timestamp}@test.com`,
            password: "Password123!",
        };

        try {
            await axios.post(`${BASE_URL}/users/register`, passengerData);
        } catch (error) {
            // Compte existe déjà, on continue
        }

        const passengerLogin = await axios.post(`${BASE_URL}/users/login`, {
            identifier: passengerData.email,
            password: passengerData.password,
        });
        passengerToken = passengerLogin.data.token;
        console.log("✅ Passager connecté");

        // Le chauffeur devient chauffeur
        await axios.post(
            `${BASE_URL}/users/become-driver`,
            {},
            authenticatedRequest(driverToken, {})
        );
        console.log("✅ Chauffeur activé");

        // Se reconnecter pour avoir un nouveau token avec les rôles mis à jour
        console.log("🔄 Reconnexion pour mise à jour des rôles...");
        const newDriverLogin = await axios.post(`${BASE_URL}/users/login`, {
            identifier: driverData.email,
            password: driverData.password,
        });
        driverToken = newDriverLogin.data.token;
        console.log("✅ Token mis à jour");

        // ============ ÉTAPE 2: AJOUT D'UN VÉHICULE ============
        console.log("\n🚙 Étape 2: Ajout d'un véhicule");

        const vehicleData = {
            brand_name: "Toyota",
            model: "Prius",
            color_name: "Blanc",
            plate_number: `TEST-${timestamp}`,
            seats_available: 4,
            is_electric: true,
        };

        const vehicleResponse = await axios.post(
            `${BASE_URL}/vehicles`,
            vehicleData,
            authenticatedRequest(driverToken, {})
        );
        const vehicleId = vehicleResponse.data.vehicleId;
        console.log(`✅ Véhicule ajouté avec l'ID: ${vehicleId}`);

        // ============ ÉTAPE 3: CRÉATION D'UN COVOITURAGE ============
        console.log("\n🛣️ Étape 3: Création d'un covoiturage");

        const carpoolingData = {
            departure_address: "Paris",
            arrival_address: "Lyon",
            departure_datetime: new Date(Date.now() + 24 * 60 * 60 * 1000)
                .toISOString()
                .slice(0, 19)
                .replace("T", " "), // Format MySQL DATETIME
            arrival_datetime: new Date(Date.now() + 28 * 60 * 60 * 1000)
                .toISOString()
                .slice(0, 19)
                .replace("T", " "), // Format MySQL DATETIME
            price_per_passenger: 15,
            seats_offered: 3,
            vehicle_id: vehicleId,
        };

        const carpoolingResponse = await axios.post(
            `${BASE_URL}/carpoolings`,
            carpoolingData,
            authenticatedRequest(driverToken, {})
        );
        carpoolingId = carpoolingResponse.data.carpoolingId;
        console.log(`✅ Covoiturage créé avec l'ID: ${carpoolingId}`);

        // ============ ÉTAPE 4: TEST DE LA VÉRIFICATION DES CONDITIONS ============
        console.log("\n🔍 Étape 4: Test de la vérification des conditions");

        console.log("📋 Vérification des conditions de participation...");
        const checkResponse = await axios.get(
            `${BASE_URL}/participations/${carpoolingId}/check`,
            authenticatedRequest(passengerToken, {})
        );

        console.log("✅ Conditions vérifiées:");
        console.log(`   Message: ${checkResponse.data.message}`);
        console.log(
            `   Prix: ${checkResponse.data.carpooling.price_per_passenger} crédits`
        );
        console.log(
            `   Places restantes: ${checkResponse.data.carpooling.seats_remaining}`
        );
        console.log(
            `   Crédits actuels: ${checkResponse.data.user.current_credits}`
        );
        console.log(
            `   Crédits après: ${checkResponse.data.user.credits_after_participation}`
        );

        // ============ ÉTAPE 5: TEST DE PARTICIPATION SANS CONFIRMATION ============
        console.log("\n❌ Étape 5: Test de participation sans confirmation");

        try {
            await axios.post(
                `${BASE_URL}/participations/${carpoolingId}/join`,
                {}, // Pas de confirmation
                authenticatedRequest(passengerToken, {})
            );
            console.log(
                "❌ ERREUR: La participation a été acceptée sans confirmation!"
            );
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log("✅ Participation refusée comme attendu:");
                console.log(`   ${error.response.data.message}`);
            } else {
                console.log(
                    "⚠️ Erreur inattendue:",
                    error.response?.data?.message || error.message
                );
            }
        }

        // ============ ÉTAPE 6: PARTICIPATION AVEC CONFIRMATION ============
        console.log("\n✅ Étape 6: Participation avec confirmation explicite");

        console.log("🎫 Tentative de participation avec confirmation...");
        const joinResponse = await axios.post(
            `${BASE_URL}/participations/${carpoolingId}/join`,
            { confirmed: true }, // Confirmation explicite
            authenticatedRequest(passengerToken, {})
        );

        console.log("✅ Participation confirmée:");
        console.log(`   ${joinResponse.data.message}`);
        console.log(`   Crédits débités: ${joinResponse.data.creditsDebited}`);
        console.log(
            `   Crédits restants: ${joinResponse.data.remainingCredits}`
        );

        // ============ ÉTAPE 7: VÉRIFICATION DE L'ÉTAT APRÈS PARTICIPATION ============
        console.log("\n📊 Étape 7: Vérification de l'état après participation");

        const afterJoinResponse = await axios.get(
            `${BASE_URL}/carpoolings/${carpoolingId}`
        );
        const updatedCarpooling = afterJoinResponse.data.carpooling;

        console.log("📋 État du covoiturage après participation:");
        console.log(
            `   Places restantes: ${updatedCarpooling.seats_remaining}/${updatedCarpooling.initial_seats_offered}`
        );

        const creditsResponse = await axios.get(
            `${BASE_URL}/credits/balance`,
            authenticatedRequest(passengerToken, {})
        );
        console.log(`   Crédits du passager: ${creditsResponse.data.credits}`);

        // ============ ÉTAPE 8: TEST D'UNE DEUXIÈME PARTICIPATION ============
        console.log(
            "\n🔄 Étape 8: Test d'une deuxième participation (doit échouer)"
        );

        try {
            await axios.post(
                `${BASE_URL}/participations/${carpoolingId}/join`,
                { confirmed: true },
                authenticatedRequest(passengerToken, {})
            );
            console.log(
                "❌ ERREUR: Une deuxième participation a été acceptée!"
            );
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log("✅ Deuxième participation refusée comme attendu:");
                console.log(`   ${error.response.data.message}`);
            } else {
                console.log(
                    "⚠️ Erreur inattendue:",
                    error.response?.data?.message || error.message
                );
            }
        }

        console.log(
            "\n🎉 === TOUS LES TESTS DE DOUBLE CONFIRMATION SONT TERMINÉS ==="
        );
    } catch (error) {
        console.error(
            "❌ Erreur pendant les tests:",
            error.response?.data?.message || error.message
        );
    }
}

// Fonction de nettoyage
async function cleanup() {
    try {
        if (carpoolingId && driverToken) {
            await axios.post(
                `${BASE_URL}/carpoolings/${carpoolingId}/cancel`,
                {},
                authenticatedRequest(driverToken, {})
            );
            console.log("🧹 Covoiturage de test supprimé");
        }
    } catch (error) {
        console.log("⚠️ Erreur lors du nettoyage:", error.message);
    }
}

// Exécuter les tests
if (require.main === module) {
    testDoubleConfirmation()
        .then(() => cleanup())
        .catch((error) => {
            console.error("❌ Erreur fatale:", error);
            cleanup();
        });
}

module.exports = { testDoubleConfirmation, cleanup };
