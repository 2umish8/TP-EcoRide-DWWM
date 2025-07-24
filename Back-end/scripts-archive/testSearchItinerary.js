const axios = require("axios");

// Configuration de base
const BASE_URL = "http://localhost:3000/api";
let authTokens = {
    driver1: "",
    driver2: "",
    passenger1: "",
    passenger2: "",
};

// Helper pour les requêtes authentifiées
const authenticatedRequest = (token, config) => ({
    ...config,
    headers: {
        ...config.headers,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    },
});

// Fonction pour créer des utilisateurs de test
async function createTestUsers() {
    console.log("👥 Création des utilisateurs de test...\n");

    const users = [
        {
            pseudo: "chauffeur_paris",
            email: "chauffeur.paris@test.com",
            password: "test123",
            tokenKey: "driver1",
        },
        {
            pseudo: "chauffeur_lyon",
            email: "chauffeur.lyon@test.com",
            password: "test123",
            tokenKey: "driver2",
        },
        {
            pseudo: "passager_test1",
            email: "passager1@test.com",
            password: "test123",
            tokenKey: "passenger1",
        },
        {
            pseudo: "passager_test2",
            email: "passager2@test.com",
            password: "test123",
            tokenKey: "passenger2",
        },
    ];

    for (const user of users) {
        try {
            // Inscription
            await axios.post(`${BASE_URL}/users/register`, {
                pseudo: user.pseudo,
                email: user.email,
                password: user.password,
            });
            console.log(`✅ Utilisateur ${user.pseudo} créé`);

            // Connexion
            const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
                identifier: user.email,
                password: user.password,
            });
            authTokens[user.tokenKey] = loginResponse.data.token;

            // Si c'est un chauffeur, le faire devenir chauffeur
            if (user.tokenKey.includes("driver")) {
                await axios.post(
                    `${BASE_URL}/users/become-driver`,
                    {},
                    authenticatedRequest(authTokens[user.tokenKey], {})
                );
                console.log(`🚗 ${user.pseudo} est maintenant chauffeur`);

                // Se reconnecter pour obtenir le token avec les nouveaux rôles
                const reloginResponse = await axios.post(
                    `${BASE_URL}/users/login`,
                    {
                        identifier: user.email,
                        password: user.password,
                    }
                );
                authTokens[user.tokenKey] = reloginResponse.data.token;
                console.log(`🔄 Token mis à jour pour ${user.pseudo}`);
            }
        } catch (error) {
            if (error.response?.data?.message?.includes("déjà utilisé")) {
                // L'utilisateur existe déjà, on se connecte
                const loginResponse = await axios.post(
                    `${BASE_URL}/users/login`,
                    {
                        identifier: user.email,
                        password: user.password,
                    }
                );
                authTokens[user.tokenKey] = loginResponse.data.token;
                console.log(`🔄 Utilisateur ${user.pseudo} reconnecté`);
            } else {
                console.error(`❌ Erreur avec ${user.pseudo}:`, error.message);
            }
        }
    }
}

// Fonction pour créer des véhicules de test
async function createTestVehicles() {
    console.log("\n🚙 Création des véhicules de test...\n");

    const vehicles = [
        {
            token: authTokens.driver1,
            vehicle: {
                plate_number: "PARIS-001",
                model: "Model 3",
                seats_available: 4,
                is_electric: true,
                brand_name: "Tesla",
                color_name: "Blanc",
            },
            driver: "chauffeur_paris",
        },
        {
            token: authTokens.driver1,
            vehicle: {
                plate_number: "PARIS-002",
                model: "Clio",
                seats_available: 4,
                is_electric: false,
                brand_name: "Renault",
                color_name: "Rouge",
            },
            driver: "chauffeur_paris",
        },
        {
            token: authTokens.driver2,
            vehicle: {
                plate_number: "LYON-001",
                model: "Leaf",
                seats_available: 4,
                is_electric: true,
                brand_name: "Nissan",
                color_name: "Bleu",
            },
            driver: "chauffeur_lyon",
        },
    ];

    for (const { token, vehicle, driver } of vehicles) {
        try {
            await axios.post(
                `${BASE_URL}/vehicles`,
                vehicle,
                authenticatedRequest(token, {})
            );
            console.log(
                `✅ Véhicule ${vehicle.plate_number} créé pour ${driver}`
            );
        } catch (error) {
            if (error.response?.data?.message?.includes("existe déjà")) {
                console.log(`🔄 Véhicule ${vehicle.plate_number} existe déjà`);
            } else {
                console.error(
                    `❌ Erreur véhicule ${vehicle.plate_number}:`,
                    error.message
                );
            }
        }
    }
}

// Fonction pour créer des covoiturages de test
async function createTestCarpoolings() {
    console.log("\n🛣️ Création des covoiturages de test...\n");

    // Récupérer les véhicules des chauffeurs
    const driver1Vehicles = await axios.get(
        `${BASE_URL}/vehicles/my-vehicles`,
        authenticatedRequest(authTokens.driver1, {})
    );
    const driver2Vehicles = await axios.get(
        `${BASE_URL}/vehicles/my-vehicles`,
        authenticatedRequest(authTokens.driver2, {})
    );

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2); // +2 jours au lieu de +1
    const afterTomorrow = new Date();
    afterTomorrow.setDate(afterTomorrow.getDate() + 3); // +3 jours au lieu de +2

    const carpoolings = [
        {
            token: authTokens.driver1,
            carpooling: {
                departure_address: "Paris, Place de la République",
                arrival_address: "Lyon, Part-Dieu",
                departure_datetime: new Date(
                    tomorrow.setHours(9, 0, 0, 0)
                ).toISOString(),
                arrival_datetime: new Date(
                    tomorrow.setHours(13, 30, 0, 0)
                ).toISOString(),
                price_per_passenger: 25,
                seats_offered: 3,
                vehicle_id: driver1Vehicles.data.vehicles.find(
                    (v) => v.is_electric
                )?.id,
            },
            description: "Paris → Lyon (Tesla électrique, demain 9h)",
        },
        {
            token: authTokens.driver1,
            carpooling: {
                departure_address: "Paris, Gare de Lyon",
                arrival_address: "Marseille, Vieux-Port",
                departure_datetime: new Date(
                    afterTomorrow.setHours(14, 0, 0, 0)
                ).toISOString(),
                arrival_datetime: new Date(
                    afterTomorrow.setHours(22, 0, 0, 0)
                ).toISOString(),
                price_per_passenger: 45,
                seats_offered: 2,
                vehicle_id: driver1Vehicles.data.vehicles.find(
                    (v) => !v.is_electric
                )?.id,
            },
            description: "Paris → Marseille (Clio essence, après-demain 14h)",
        },
        {
            token: authTokens.driver2,
            carpooling: {
                departure_address: "Lyon, Perrache",
                arrival_address: "Nice, Centre-ville",
                departure_datetime: new Date(
                    tomorrow.setHours(8, 0, 0, 0)
                ).toISOString(),
                arrival_datetime: new Date(
                    tomorrow.setHours(13, 0, 0, 0)
                ).toISOString(),
                price_per_passenger: 30,
                seats_offered: 3,
                vehicle_id: driver2Vehicles.data.vehicles[0]?.id,
            },
            description: "Lyon → Nice (Nissan électrique, demain 8h)",
        },
        {
            token: authTokens.driver2,
            carpooling: {
                departure_address: "Paris, Châtelet",
                arrival_address: "Lyon, Bellecour",
                departure_datetime: new Date(
                    afterTomorrow.setHours(10, 30, 0, 0)
                ).toISOString(),
                arrival_datetime: new Date(
                    afterTomorrow.setHours(15, 0, 0, 0)
                ).toISOString(),
                price_per_passenger: 20,
                seats_offered: 4,
                vehicle_id: driver2Vehicles.data.vehicles[0]?.id,
            },
            description: "Paris → Lyon (Nissan électrique, après-demain 10h30)",
        },
    ];

    for (const { token, carpooling, description } of carpoolings) {
        try {
            if (carpooling.vehicle_id) {
                console.log(`🚧 Tentative création: ${description}`);
                console.log(`   📋 Véhicule ID: ${carpooling.vehicle_id}`);
                console.log(`   📅 Départ: ${carpooling.departure_datetime}`);
                console.log(`   📅 Arrivée: ${carpooling.arrival_datetime}`);

                const response = await axios.post(
                    `${BASE_URL}/carpoolings`,
                    carpooling,
                    authenticatedRequest(token, {})
                );
                console.log(
                    `✅ Covoiturage créé: ${description} (ID: ${response.data.carpoolingId})`
                );
            } else {
                console.log(`⚠️ Aucun véhicule trouvé pour: ${description}`);
            }
        } catch (error) {
            console.error(
                `❌ Erreur covoiturage ${description}:`,
                error.response?.data?.message || error.message
            );
            if (error.response?.data) {
                console.error(`   📋 Détails:`, error.response.data);
            }
        }
    }
}

// Tests de recherche d'itinéraires
async function testSearchFunctionality() {
    console.log("\n🔍 Tests de recherche d'itinéraires...\n");

    const searchTests = [
        {
            name: "Recherche basique - Tous les covoiturages",
            params: {},
            expectedMinResults: 4,
        },
        {
            name: "Recherche par ville de départ - Paris",
            params: { departure: "Paris" },
            expectedMinResults: 3,
        },
        {
            name: "Recherche par ville d'arrivée - Lyon",
            params: { arrival: "Lyon" },
            expectedMinResults: 2,
        },
        {
            name: "Recherche par itinéraire complet - Paris vers Lyon",
            params: { departure: "Paris", arrival: "Lyon" },
            expectedMinResults: 2,
        },
        {
            name: "Recherche par date - demain",
            params: {
                date: new Date(Date.now() + 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0],
            },
            expectedMinResults: 2,
        },
        {
            name: "Recherche par prix maximum - 25€",
            params: { maxPrice: 25 },
            expectedMinResults: 2,
        },
        {
            name: "Recherche véhicules électriques uniquement",
            params: { isElectric: "true" },
            expectedMinResults: 3,
        },
        {
            name: "Recherche par durée maximum - 5h (300 minutes)",
            params: { maxDuration: 300 },
            expectedMinResults: 3,
        },
        {
            name: "Recherche combinée - Paris vers Lyon, électrique, max 25€",
            params: {
                departure: "Paris",
                arrival: "Lyon",
                isElectric: "true",
                maxPrice: 25,
            },
            expectedMinResults: 1,
        },
        {
            name: "Recherche sans résultats - destination inexistante",
            params: { arrival: "Tokyo" },
            expectedMinResults: 0,
        },
    ];

    for (const test of searchTests) {
        try {
            console.log(`🧪 Test: ${test.name}`);

            const queryString = new URLSearchParams(test.params).toString();
            const url = `${BASE_URL}/carpoolings/available${
                queryString ? "?" + queryString : ""
            }`;

            const response = await axios.get(url);
            const carpoolings = response.data.carpoolings;

            console.log(`   📊 Résultats trouvés: ${carpoolings.length}`);

            if (carpoolings.length >= test.expectedMinResults) {
                console.log(
                    `   ✅ Test réussi (attendu: min ${test.expectedMinResults})`
                );

                // Afficher quelques détails sur les résultats
                if (carpoolings.length > 0) {
                    const first = carpoolings[0];
                    console.log(
                        `   📍 Premier résultat: ${first.departure_address} → ${first.arrival_address}`
                    );
                    console.log(
                        `   💰 Prix: ${first.price_per_passenger}€ | 🪑 Places: ${first.seats_remaining}`
                    );
                    if (first.is_electric)
                        console.log(`   🔋 Véhicule électrique`);
                }
            } else {
                console.log(
                    `   ❌ Test échoué (attendu: min ${test.expectedMinResults}, obtenu: ${carpoolings.length})`
                );
            }

            console.log("");
        } catch (error) {
            console.error(
                `   ❌ Erreur lors du test "${test.name}":`,
                error.response?.data?.message || error.message
            );
            console.log("");
        }
    }
}

// Test des cas d'erreur et cas limites
async function testEdgeCases() {
    console.log("\n🧪 Tests des cas limites et d'erreur...\n");

    const edgeTests = [
        {
            name: "Recherche avec paramètres invalides - prix négatif",
            params: { maxPrice: -10 },
        },
        {
            name: "Recherche avec date passée",
            params: { date: "2020-01-01" },
        },
        {
            name: "Recherche avec durée invalide",
            params: { maxDuration: "invalide" },
        },
    ];

    for (const test of edgeTests) {
        try {
            console.log(`🧪 Test: ${test.name}`);

            const queryString = new URLSearchParams(test.params).toString();
            const url = `${BASE_URL}/carpoolings/available?${queryString}`;

            const response = await axios.get(url);
            console.log(`   📊 Résultats: ${response.data.carpoolings.length}`);
            console.log(
                `   ✅ Aucune erreur serveur (gestion correcte des paramètres invalides)`
            );
        } catch (error) {
            if (error.response && error.response.status < 500) {
                console.log(
                    `   ✅ Erreur client appropriée: ${error.response.status} - ${error.response.data.message}`
                );
            } else {
                console.log(
                    `   ❌ Erreur serveur inattendue: ${error.message}`
                );
            }
        }
        console.log("");
    }
}

// Test de performance avec beaucoup de données
async function testPerformance() {
    console.log("\n⚡ Test de performance...\n");

    try {
        const startTime = Date.now();

        // Recherche complexe avec tous les filtres
        const response = await axios.get(
            `${BASE_URL}/carpoolings/available?departure=Paris&arrival=Lyon&isElectric=true&maxPrice=50&maxDuration=600`
        );

        const endTime = Date.now();
        const duration = endTime - startTime;

        console.log(`⏱️ Temps de réponse: ${duration}ms`);
        console.log(`📊 Résultats: ${response.data.carpoolings.length}`);

        if (duration < 1000) {
            console.log(`✅ Performance acceptable (< 1s)`);
        } else {
            console.log(`⚠️ Performance à améliorer (> 1s)`);
        }
    } catch (error) {
        console.error(`❌ Erreur test performance:`, error.message);
    }
}

// Fonction principale
async function runSearchTests() {
    console.log("🚀 Démarrage des tests de recherche d'itinéraires EcoRide\n");
    console.log("=".repeat(60));

    try {
        // Étape 1: Créer les données de test
        await createTestUsers();
        await createTestVehicles();
        await createTestCarpoolings();

        console.log("\n" + "=".repeat(60));

        // Étape 2: Tests de recherche
        await testSearchFunctionality();

        // Étape 3: Tests des cas limites
        await testEdgeCases();

        // Étape 4: Test de performance
        await testPerformance();

        console.log("\n" + "=".repeat(60));
        console.log("🎉 Tous les tests de recherche d'itinéraires terminés !");
    } catch (error) {
        console.error("❌ Erreur globale lors des tests:", error.message);
    }
}

// Exécuter les tests si ce script est lancé directement
if (require.main === module) {
    runSearchTests();
}

module.exports = { runSearchTests };
