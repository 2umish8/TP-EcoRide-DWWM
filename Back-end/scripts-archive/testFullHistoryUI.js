const axios = require("axios");

// Configuration de base
const BASE_URL = "http://localhost:3000/api";
let driverToken = "";
let passengerToken = "";
let driverUserId = "";
let passengerUserId = "";
let vehicleId = "";
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

// Tests complets de l'historique des trajets
async function testFullHistory() {
    console.log("🚀 Test complet de l'historique des trajets EcoRide\n");

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

        // ============ CRÉATION D'UN VÉHICULE ============
        console.log("\n🚗 Création d'un véhicule pour le chauffeur");

        const vehicleData = {
            brand_name: "Renault",
            model: "Clio",
            first_registration_date: "2020-01-15",
            plate_number: `HR${timestamp.toString().slice(-4)}`,
            seats_available: 4,
            color_name: "Bleu",
            is_electric: false,
        };

        const vehicleResponse = await axios.post(
            `${BASE_URL}/vehicles`,
            vehicleData,
            authenticatedRequest(driverToken, {})
        );
        vehicleId = vehicleResponse.data.vehicleId;
        console.log("✅ Véhicule créé:", vehicleId);

        // ============ CRÉATION D'UN COVOITURAGE ============
        console.log("\n🛣️ Création d'un covoiturage");

        const carpoolingData = {
            departure_address: "Paris, France",
            arrival_address: "Lyon, France",
            departure_datetime: new Date(Date.now() + 24 * 60 * 60 * 1000)
                .toISOString()
                .slice(0, 19)
                .replace("T", " "),
            arrival_datetime: new Date(Date.now() + 28 * 60 * 60 * 1000)
                .toISOString()
                .slice(0, 19)
                .replace("T", " "),
            price_per_passenger: 10, // Prix bas pour les crédits par défaut (50)
            seats_offered: 3,
            vehicle_id: vehicleId,
            description: "Voyage pour tester l'historique",
        };

        const carpoolingResponse = await axios.post(
            `${BASE_URL}/carpoolings`,
            carpoolingData,
            authenticatedRequest(driverToken, {})
        );
        carpoolingId = carpoolingResponse.data.carpoolingId;
        console.log("✅ Covoiturage créé:", carpoolingId);

        // ============ PARTICIPATION DU PASSAGER ============
        console.log("\n🎫 Participation du passager");

        // Vérifier les conditions
        const conditionsResponse = await axios.get(
            `${BASE_URL}/participations/${carpoolingId}/check`,
            authenticatedRequest(passengerToken, {})
        );
        console.log(
            "✅ Conditions vérifiées:",
            conditionsResponse.data.message
        );

        // Participer avec confirmation
        const participationResponse = await axios.post(
            `${BASE_URL}/participations/${carpoolingId}/join`,
            { confirmed: true },
            authenticatedRequest(passengerToken, {})
        );
        console.log(
            "✅ Participation réussie:",
            participationResponse.data.message
        );

        // ============ TEST 1: HISTORIQUE CHAUFFEUR ============
        console.log("\n📋 Test 1: Historique chauffeur");

        const driverHistoryResponse = await axios.get(
            `${BASE_URL}/carpoolings/my-carpoolings`,
            authenticatedRequest(driverToken, {})
        );
        console.log(
            `✅ Historique chauffeur: ${driverHistoryResponse.data.carpoolings.length} covoiturage(s)`
        );

        if (driverHistoryResponse.data.carpoolings.length > 0) {
            const carpooling = driverHistoryResponse.data.carpoolings[0];
            console.log("📊 Détails du covoiturage:");
            console.log(
                `   • Route: ${carpooling.departure_address} → ${carpooling.arrival_address}`
            );
            console.log(`   • Prix: ${carpooling.price_per_passenger} crédits`);
            console.log(`   • Statut: ${carpooling.status}`);
            console.log(`   • Participants: ${carpooling.participants_count}`);
            console.log(
                `   • Date: ${new Date(
                    carpooling.departure_datetime
                ).toLocaleString("fr-FR")}`
            );
        }

        // ============ TEST 2: HISTORIQUE PASSAGER ============
        console.log("\n📋 Test 2: Historique passager");

        const passengerHistoryResponse = await axios.get(
            `${BASE_URL}/participations/my-participations`,
            authenticatedRequest(passengerToken, {})
        );
        console.log(
            `✅ Historique passager: ${passengerHistoryResponse.data.participations.length} participation(s)`
        );

        if (passengerHistoryResponse.data.participations.length > 0) {
            const participation =
                passengerHistoryResponse.data.participations[0];
            console.log("📊 Détails de la participation:");
            console.log(
                `   • Route: ${participation.departure_address} → ${participation.arrival_address}`
            );
            console.log(
                `   • Prix payé: ${participation.credits_paid} crédits`
            );
            console.log(`   • Statut: ${participation.carpooling_status}`);
            console.log(`   • Conducteur: ${participation.driver_pseudo}`);
            console.log(
                `   • Véhicule: ${participation.model} (${participation.plate_number})`
            );
            console.log(
                `   • Date: ${new Date(
                    participation.departure_datetime
                ).toLocaleString("fr-FR")}`
            );
            console.log(
                `   • Réservé le: ${new Date(
                    participation.participation_date
                ).toLocaleString("fr-FR")}`
            );
        }

        console.log("\n🎉 TESTS DE L'HISTORIQUE TERMINÉS AVEC SUCCÈS!");
        console.log(
            "✅ Endpoint chauffeur fonctionnel: /carpoolings/my-carpoolings"
        );
        console.log(
            "✅ Endpoint passager fonctionnel: /participations/my-participations"
        );
        console.log("✅ Données complètes et structurées");
        console.log("✅ Historique prêt pour l'interface frontend");

        console.log("\n📱 INTERFACE FRONTEND:");
        console.log("🌐 Ouvrez http://localhost:5174 dans votre navigateur");
        console.log("🔐 Connectez-vous avec ces comptes de test:");
        console.log(
            `   📧 Chauffeur: ${driver.email} | 🔑 Mot de passe: ${driver.password}`
        );
        console.log(
            `   📧 Passager: ${passenger.email} | 🔑 Mot de passe: ${passenger.password}`
        );
        console.log("🎯 Allez dans 'Mes Trajets' pour voir l'historique!");
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
    testFullHistory()
        .then(() => {
            console.log("\n✅ Tous les tests sont terminés avec succès!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("\n❌ Les tests ont échoué:", error.message);
            process.exit(1);
        });
}

module.exports = { testFullHistory };
