const axios = require("axios");

// Configuration de base
const BASE_URL = "http://localhost:3000/api";
let authToken = "";

// Helper pour les requêtes authentifiées
const authenticatedRequest = (config) => ({
    ...config,
    headers: {
        ...config.headers,
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
    },
});

// Tests des endpoints
async function runTests() {
    console.log("🚀 Démarrage des tests API EcoRide\n");

    try {
        // Test 1: Inscription d'un nouvel utilisateur
        console.log("📝 Test 1: Inscription utilisateur");
        const newUser = {
            pseudo: "testeur_api",
            email: "testeur@api.com",
            password: "test123",
        };

        const registerResponse = await axios.post(
            `${BASE_URL}/users/register`,
            newUser
        );
        console.log("✅ Inscription réussie:", registerResponse.data.message);

        // Test 2: Connexion
        console.log("\n🔐 Test 2: Connexion");
        const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
            identifier: "testeur@api.com",
            password: "test123",
        });
        authToken = loginResponse.data.token;
        console.log("✅ Connexion réussie:", loginResponse.data.message);

        // Test 3: Profil utilisateur
        console.log("\n👤 Test 3: Récupération du profil");
        const profileResponse = await axios.get(
            `${BASE_URL}/users/profile`,
            authenticatedRequest({})
        );
        console.log("✅ Profil récupéré:", profileResponse.data.user.pseudo);

        // Test 4: Devenir chauffeur
        console.log("\n🚗 Test 4: Devenir chauffeur");
        const driverResponse = await axios.post(
            `${BASE_URL}/users/become-driver`,
            {},
            authenticatedRequest({})
        );
        console.log("✅ Rôle chauffeur ajouté:", driverResponse.data.message);

        // Test 5: Ajouter un véhicule
        console.log("\n🚙 Test 5: Ajouter un véhicule");
        const vehicle = {
            plate_number: "TEST-001",
            model: "Clio",
            seats_available: 4,
            is_electric: false,
            brand_name: "Renault",
            color_name: "Rouge",
        };
        const vehicleResponse = await axios.post(
            `${BASE_URL}/vehicles`,
            vehicle,
            authenticatedRequest({})
        );
        console.log("✅ Véhicule ajouté:", vehicleResponse.data.message);

        // Test 6: Lister mes véhicules
        console.log("\n📋 Test 6: Lister mes véhicules");
        const myVehiclesResponse = await axios.get(
            `${BASE_URL}/vehicles/my-vehicles`,
            authenticatedRequest({})
        );
        console.log(
            "✅ Véhicules listés:",
            myVehiclesResponse.data.vehicles.length,
            "véhicule(s)"
        );

        // Test 7: Créer un covoiturage
        console.log("\n🛣️ Test 7: Créer un covoiturage");
        const carpooling = {
            departure_address: "Paris",
            arrival_address: "Lyon",
            departure_datetime: new Date(
                Date.now() + 24 * 60 * 60 * 1000
            ).toISOString(), // demain
            arrival_datetime: new Date(
                Date.now() + 28 * 60 * 60 * 1000
            ).toISOString(), // demain + 4h
            price_per_passenger: 25,
            seats_offered: 3,
            vehicle_id: myVehiclesResponse.data.vehicles[0].id,
        };
        const carpoolingResponse = await axios.post(
            `${BASE_URL}/carpoolings`,
            carpooling,
            authenticatedRequest({})
        );
        console.log("✅ Covoiturage créé:", carpoolingResponse.data.message);

        // Test 8: Rechercher des covoiturages
        console.log("\n🔍 Test 8: Rechercher des covoiturages");
        const searchResponse = await axios.get(
            `${BASE_URL}/carpoolings/available?departure=Paris`
        );
        console.log(
            "✅ Covoiturages trouvés:",
            searchResponse.data.carpoolings.length
        );

        // Test 9: Consulter mes crédits
        console.log("\n💰 Test 9: Consulter mes crédits");
        const creditsResponse = await axios.get(
            `${BASE_URL}/credits/balance`,
            authenticatedRequest({})
        );
        console.log("✅ Crédits actuels:", creditsResponse.data.credits);

        // Test 10: Historique des transactions
        console.log("\n📊 Test 10: Historique des transactions");
        const historyResponse = await axios.get(
            `${BASE_URL}/credits/history`,
            authenticatedRequest({})
        );
        console.log(
            "✅ Historique récupéré:",
            historyResponse.data.transactions.length,
            "transaction(s)"
        );

        console.log("\n🎉 Tous les tests ont réussi !");
    } catch (error) {
        console.error(
            "❌ Erreur lors des tests:",
            error.response?.data || error.message
        );
    }
}

// Exécuter les tests si ce script est lancé directement
if (require.main === module) {
    runTests();
}

module.exports = { runTests };
