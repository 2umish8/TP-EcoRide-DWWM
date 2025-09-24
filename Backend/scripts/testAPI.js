const axios = require("axios");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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
        const uniqueSuffix = Date.now();
        const newUser = {
            pseudo: `testeur_api_${uniqueSuffix}`,
            email: `testeur+${uniqueSuffix}@api.com`,
            // Strong password to satisfy Zod validator: min 8 chars, uppercase, digit, special
            password: "Test123!",
        };

        const registerResponse = await axios.post(
            `${BASE_URL}/users/register`,
            newUser
        );
        console.log("✅ Inscription réussie:", registerResponse.data.message);

        // Test 2: Connexion
        console.log("\n🔐 Test 2: Connexion");
        const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
            identifier: newUser.email,
            // Must match the registration password above
            password: newUser.password,
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
        // Create a vehicle directly in the database for this user (bypass API role restriction)
        console.log("\n🚙 Test 4: Créer un véhicule en base pour l'utilisateur (Prisma)");
        const userId = profileResponse.data.user.id;
        // Ensure brand exists (upsert)
        const brandName = "Renault";
        let brand = await prisma.brand.findFirst({ where: { name: brandName } });
        if (!brand) {
            brand = await prisma.brand.create({ data: { name: brandName } });
        }

        // Ensure color exists (upsert)
        const colorName = "Rouge";
        let color = await prisma.color.findFirst({ where: { name: colorName } });
        if (!color) {
            color = await prisma.color.create({ data: { name: colorName } });
        }

        const vehicleData = {
            plate_number: `TEST-${uniqueSuffix}`,
            model: "Clio",
            seats_available: 4,
            is_electric: false,
            user_id: userId,
            brand_id: brand.id,
            color_id: color.id,
        };
        const createdVehicle = await prisma.vehicle.create({ data: vehicleData });
        console.log("✅ Véhicule créé en base (Prisma):", createdVehicle.plate_number);

        // Now attempt to become driver
        console.log("\n�🚗 Test 5: Devenir chauffeur");
        // Ensure the 'chauffeur' role exists in the database
        let chauffeurRole = await prisma.role.findFirst({ where: { name: "chauffeur" } });
        if (!chauffeurRole) {
            chauffeurRole = await prisma.role.create({ data: { name: "chauffeur" } });
            console.log("✅ Role 'chauffeur' créé en base pour les tests.");
        }

        const driverResponse = await axios.post(
            `${BASE_URL}/users/become-driver`,
            {},
            authenticatedRequest({})
        );
        console.log("✅ Rôle chauffeur ajouté:", driverResponse.data.message);

        // Re-login to obtain a fresh token that includes the new 'chauffeur' role
        console.log("\n🔁 Re-authentification pour récupérer le token mis à jour...");
        const relogin = await axios.post(`${BASE_URL}/users/login`, {
            identifier: newUser.email,
            password: newUser.password,
        });
        authToken = relogin.data.token;
        console.log("✅ Token mis à jour avec rôles: ", relogin.data.user.roles);

        // Disconnect Prisma client used for direct DB writes
        await prisma.$disconnect();

        // Test 5: Ajouter un véhicule
        console.log("\n🚙 Test 5: Ajouter un véhicule");
        const vehicle = {
            plate_number: `API-${uniqueSuffix}`,
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
