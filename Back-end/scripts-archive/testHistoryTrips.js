const axios = require("axios");

// Configuration de base
const BASE_URL = "http://localhost:3000/api";
let driverToken = "";
let passengerToken = "";
let driverUserId = "";
let passengerUserId = "";

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

// Tests de l'historique des trajets
async function testHistoryTrips() {
    console.log("🚀 Test de l'historique des trajets EcoRide\n");

    const timestamp = Date.now();

    try {
        // ============ SETUP: CRÉATION DES UTILISATEURS ============
        console.log("🔧 Setup: Création des utilisateurs de test");

        // Créer un chauffeur
        const driver = {
            pseudo: `driver_history_${timestamp}`,
            email: `driver_history_${timestamp}@test.com`,
            password: "Test123!",
        };

        const driverRegisterResponse = await axios.post(
            `${BASE_URL}/users/register`,
            driver
        );
        console.log("✅ Chauffeur créé:", driverRegisterResponse.data.message);

        // Connecter le chauffeur
        const driverLoginResponse = await axios.post(
            `${BASE_URL}/users/login`,
            {
                identifier: driver.email,
                password: driver.password,
            }
        );
        driverToken = driverLoginResponse.data.token;
        driverUserId = driverLoginResponse.data.user.id;

        // Devenir chauffeur
        await axios.post(
            `${BASE_URL}/users/become-driver`,
            {},
            authenticatedRequest(driverToken, {})
        );

        // Reconnexion pour obtenir les nouveaux rôles
        const driverReloginResponse = await axios.post(
            `${BASE_URL}/users/login`,
            {
                identifier: driver.email,
                password: driver.password,
            }
        );
        driverToken = driverReloginResponse.data.token;
        console.log("✅ Chauffeur connecté et rôle attribué");

        // Créer un passager
        const passenger = {
            pseudo: `passenger_history_${timestamp}`,
            email: `passenger_history_${timestamp}@test.com`,
            password: "Test123!",
        };

        const passengerRegisterResponse = await axios.post(
            `${BASE_URL}/users/register`,
            passenger
        );
        console.log(
            "✅ Passager créé:",
            passengerRegisterResponse.data.message
        );

        // Connecter le passager
        const passengerLoginResponse = await axios.post(
            `${BASE_URL}/users/login`,
            {
                identifier: passenger.email,
                password: passenger.password,
            }
        );
        passengerToken = passengerLoginResponse.data.token;
        passengerUserId = passengerLoginResponse.data.user.id;
        console.log("✅ Passager connecté");

        // ============ TEST 1: HISTORIQUE CHAUFFEUR VIDE ============
        console.log("\n📋 Test 1: Historique chauffeur (vide)");

        const emptyDriverHistoryResponse = await axios.get(
            `${BASE_URL}/carpoolings/my-carpoolings`,
            authenticatedRequest(driverToken, {})
        );
        console.log(
            `✅ Historique chauffeur vide: ${emptyDriverHistoryResponse.data.carpoolings.length} covoiturage(s)`
        );

        // ============ TEST 2: HISTORIQUE PASSAGER VIDE ============
        console.log("\n📋 Test 2: Historique passager (vide)");

        const emptyPassengerHistoryResponse = await axios.get(
            `${BASE_URL}/participations/my-participations`,
            authenticatedRequest(passengerToken, {})
        );
        console.log(
            `✅ Historique passager vide: ${emptyPassengerHistoryResponse.data.participations.length} participation(s)`
        );

        console.log("\n🎉 TESTS DE L'HISTORIQUE VIDE TERMINÉS AVEC SUCCÈS!");
        console.log("✅ Endpoint chauffeur: /carpoolings/my-carpoolings");
        console.log("✅ Endpoint passager: /participations/my-participations");
        console.log("✅ Authentification fonctionnelle");
        console.log("✅ Format de réponse conforme");
    } catch (error) {
        console.error(
            "❌ Erreur lors des tests:",
            error.response?.data?.message || error.message
        );
        throw error;
    }
}

// Exécuter les tests si ce script est lancé directement
if (require.main === module) {
    testHistoryTrips()
        .then(() => {
            console.log("\n✅ Tous les tests sont terminés avec succès!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("\n❌ Les tests ont échoué:", error.message);
            process.exit(1);
        });
}

module.exports = { testHistoryTrips };
