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
            pseudo: "chauffeur_paris_adv",
            email: "chauffeur.paris.adv@test.com",
            password: "test123",
            tokenKey: "driver1",
        },
        {
            pseudo: "chauffeur_lyon_adv",
            email: "chauffeur.lyon.adv@test.com",
            password: "test123",
            tokenKey: "driver2",
        },
        {
            pseudo: "passager_test1_adv",
            email: "passager1.adv@test.com",
            password: "test123",
            tokenKey: "passenger1",
        },
        {
            pseudo: "passager_test2_adv",
            email: "passager2.adv@test.com",
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

// Fonction pour créer des véhicules de test diversifiés
async function createTestVehicles() {
    console.log("\n🚙 Création des véhicules de test...\n");

    const vehicles = [
        {
            token: authTokens.driver1,
            vehicle: {
                plate_number: "PARIS-ADV-001",
                model: "Model S",
                seats_available: 4,
                is_electric: true,
                brand_name: "Tesla",
                color_name: "Noir",
            },
            driver: "chauffeur_paris_adv",
        },
        {
            token: authTokens.driver1,
            vehicle: {
                plate_number: "PARIS-ADV-002",
                model: "Megane",
                seats_available: 5,
                is_electric: false,
                brand_name: "Renault",
                color_name: "Blanc",
            },
            driver: "chauffeur_paris_adv",
        },
        {
            token: authTokens.driver2,
            vehicle: {
                plate_number: "LYON-ADV-001",
                model: "i3",
                seats_available: 4,
                is_electric: true,
                brand_name: "BMW",
                color_name: "Gris",
            },
            driver: "chauffeur_lyon_adv",
        },
        {
            token: authTokens.driver2,
            vehicle: {
                plate_number: "LYON-ADV-002",
                model: "308",
                seats_available: 5,
                is_electric: false,
                brand_name: "Peugeot",
                color_name: "Rouge",
            },
            driver: "chauffeur_lyon_adv",
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

// Fonction pour créer des covoiturages de test variés
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

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const afterTomorrow = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const in3Days = new Date(now.getTime() + 72 * 60 * 60 * 1000);

    const carpoolings = [
        // Trajets courts (moins de 3h)
        {
            token: authTokens.driver1,
            carpooling: {
                departure_address: "Paris, Châtelet-Les Halles",
                arrival_address: "Orléans, Centre-ville",
                departure_datetime: new Date(
                    tomorrow.setHours(9, 0, 0, 0)
                ).toISOString(),
                arrival_datetime: new Date(
                    tomorrow.getTime() + 2 * 60 * 60 * 1000
                ).toISOString(), // +2h
                price_per_passenger: 15,
                seats_offered: 3,
                vehicle_id: driver1Vehicles.data.vehicles.find(
                    (v) => v.is_electric
                )?.id,
            },
            description: "Paris → Orléans (Tesla, court trajet, pas cher)",
        },
        // Trajets moyens (3-5h)
        {
            token: authTokens.driver1,
            carpooling: {
                departure_address: "Paris, Gare du Nord",
                arrival_address: "Lyon, Part-Dieu",
                departure_datetime: new Date(
                    tomorrow.setHours(14, 30, 0, 0)
                ).toISOString(),
                arrival_datetime: new Date(
                    tomorrow.getTime() + 4.5 * 60 * 60 * 1000
                ).toISOString(), // +4h30
                price_per_passenger: 30,
                seats_offered: 4,
                vehicle_id: driver1Vehicles.data.vehicles.find(
                    (v) => !v.is_electric
                )?.id,
            },
            description: "Paris → Lyon (Renault, trajet moyen, prix standard)",
        },
        // Trajets longs (>5h)
        {
            token: authTokens.driver1,
            carpooling: {
                departure_address: "Paris, Porte de Versailles",
                arrival_address: "Marseille, Vieux-Port",
                departure_datetime: new Date(
                    afterTomorrow.setHours(7, 0, 0, 0)
                ).toISOString(),
                arrival_datetime: new Date(
                    afterTomorrow.getTime() + 8 * 60 * 60 * 1000
                ).toISOString(), // +8h
                price_per_passenger: 55,
                seats_offered: 2,
                vehicle_id: driver1Vehicles.data.vehicles.find(
                    (v) => v.is_electric
                )?.id,
            },
            description: "Paris → Marseille (Tesla, long trajet, premium)",
        },
        // Trajets écologiques
        {
            token: authTokens.driver2,
            carpooling: {
                departure_address: "Lyon, Bellecour",
                arrival_address: "Grenoble, Centre-ville",
                departure_datetime: new Date(
                    tomorrow.setHours(16, 0, 0, 0)
                ).toISOString(),
                arrival_datetime: new Date(
                    tomorrow.getTime() + 2.5 * 60 * 60 * 1000
                ).toISOString(), // +2h30
                price_per_passenger: 18,
                seats_offered: 3,
                vehicle_id: driver2Vehicles.data.vehicles.find(
                    (v) => v.is_electric
                )?.id,
            },
            description: "Lyon → Grenoble (BMW électrique, éco-friendly)",
        },
        // Trajets économiques
        {
            token: authTokens.driver2,
            carpooling: {
                departure_address: "Lyon, Perrache",
                arrival_address: "Clermont-Ferrand, Centre",
                departure_datetime: new Date(
                    in3Days.setHours(11, 30, 0, 0)
                ).toISOString(),
                arrival_datetime: new Date(
                    in3Days.getTime() + 3 * 60 * 60 * 1000
                ).toISOString(), // +3h
                price_per_passenger: 12,
                seats_offered: 4,
                vehicle_id: driver2Vehicles.data.vehicles.find(
                    (v) => !v.is_electric
                )?.id,
            },
            description: "Lyon → Clermont-Ferrand (Peugeot, économique)",
        },
        // Trajet retour
        {
            token: authTokens.driver2,
            carpooling: {
                departure_address: "Marseille, Gare Saint-Charles",
                arrival_address: "Paris, Gare de Lyon",
                departure_datetime: new Date(
                    in3Days.setHours(19, 0, 0, 0)
                ).toISOString(),
                arrival_datetime: new Date(
                    in3Days.getTime() + 7.5 * 60 * 60 * 1000
                ).toISOString(), // +7h30
                price_per_passenger: 50,
                seats_offered: 3,
                vehicle_id: driver2Vehicles.data.vehicles.find(
                    (v) => v.is_electric
                )?.id,
            },
            description: "Marseille → Paris (BMW électrique, retour)",
        },
    ];

    for (const { token, carpooling, description } of carpoolings) {
        try {
            if (carpooling.vehicle_id) {
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
        }
    }
}

// Tests de la recherche basique
async function testBasicSearch() {
    console.log("\n🔍 Tests de recherche basique...\n");

    const basicTests = [
        {
            name: "Recherche basique - Tous les covoiturages",
            endpoint: "/carpoolings/available",
            params: {},
        },
        {
            name: "Recherche par départ - Paris",
            endpoint: "/carpoolings/available",
            params: { departure: "Paris" },
        },
        {
            name: "Recherche par arrivée - Lyon",
            endpoint: "/carpoolings/available",
            params: { arrival: "Lyon" },
        },
        {
            name: "Recherche électrique uniquement",
            endpoint: "/carpoolings/available",
            params: { isElectric: "true" },
        },
    ];

    for (const test of basicTests) {
        try {
            console.log(`🧪 ${test.name}`);

            const queryString = new URLSearchParams(test.params).toString();
            const url = `${BASE_URL}${test.endpoint}${
                queryString ? "?" + queryString : ""
            }`;

            const startTime = Date.now();
            const response = await axios.get(url);
            const duration = Date.now() - startTime;

            console.log(
                `   📊 Résultats: ${response.data.carpoolings.length} | ⏱️ ${duration}ms`
            );
            console.log(`   ✅ Test réussi\n`);
        } catch (error) {
            console.error(
                `   ❌ Erreur: ${
                    error.response?.data?.message || error.message
                }\n`
            );
        }
    }
}

// Tests de la recherche avancée
async function testAdvancedSearch() {
    console.log("\n🚀 Tests de recherche avancée...\n");

    const advancedTests = [
        {
            name: "Recherche avec pagination",
            params: { page: 1, limit: 3 },
        },
        {
            name: "Tri par prix croissant",
            params: { sortBy: "price_per_passenger", sortOrder: "ASC" },
        },
        {
            name: "Tri par prix décroissant",
            params: { sortBy: "price_per_passenger", sortOrder: "DESC" },
        },
        {
            name: "Tri par durée croissante",
            params: { sortBy: "duration_minutes", sortOrder: "ASC" },
        },
        {
            name: "Filtres de prix (min-max)",
            params: { minPrice: 15, maxPrice: 35 },
        },
        {
            name: "Filtres de durée (min-max)",
            params: { minDuration: 120, maxDuration: 300 }, // 2h à 5h
        },
        {
            name: "Plage de dates",
            params: {
                dateFrom: new Date().toISOString().split("T")[0],
                dateTo: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0],
            },
        },
        {
            name: "Recherche complexe avec tous filtres",
            params: {
                departure: "Paris",
                arrival: "Lyon",
                isElectric: "true",
                maxPrice: 35,
                sortBy: "price_per_passenger",
                sortOrder: "ASC",
            },
        },
        {
            name: "Inclure covoiturages complets",
            params: { includeFull: "true" },
        },
    ];

    for (const test of advancedTests) {
        try {
            console.log(`🧪 ${test.name}`);

            const queryString = new URLSearchParams(test.params).toString();
            const url = `${BASE_URL}/search/advanced?${queryString}`;

            const startTime = Date.now();
            const response = await axios.get(url);
            const duration = Date.now() - startTime;

            const { carpoolings, stats, filters } = response.data;

            console.log(
                `   📊 Résultats: ${carpoolings.length} | ⏱️ ${duration}ms`
            );
            if (stats) {
                console.log(
                    `   📈 Stats: Total ${stats.total} | Page ${stats.page}/${stats.totalPages}`
                );
                if (stats.averagePrice)
                    console.log(`   💰 Prix moyen: ${stats.averagePrice}€`);
                if (stats.electricCount)
                    console.log(`   🔋 Électriques: ${stats.electricCount}`);
            }
            console.log(`   ✅ Test réussi\n`);
        } catch (error) {
            console.error(
                `   ❌ Erreur: ${
                    error.response?.data?.message || error.message
                }\n`
            );
        }
    }
}

// Test des statistiques de recherche
async function testSearchStatistics() {
    console.log("\n📊 Test des statistiques de recherche...\n");

    try {
        const response = await axios.get(`${BASE_URL}/search/statistics`);
        const { stats } = response.data;

        console.log("✅ Statistiques récupérées:");
        console.log(
            `   🎯 Destinations populaires: ${stats.popularDestinations.length}`
        );
        console.log(
            `   💰 Routes avec prix moyens: ${stats.averagePrices.length}`
        );
        console.log(`   🚗 Statistiques véhicules:`);
        console.log(`     - Total trajets: ${stats.vehicleStats.total_trips}`);
        console.log(
            `     - Trajets électriques: ${stats.vehicleStats.electric_trips}`
        );
        console.log(`     - Prix moyen: ${stats.vehicleStats.avg_price}€`);
        console.log(
            `     - Durée moyenne: ${stats.vehicleStats.avg_duration_minutes} minutes`
        );
    } catch (error) {
        console.error(
            `❌ Erreur statistiques: ${
                error.response?.data?.message || error.message
            }`
        );
    }
}

// Test de performance comparative
async function testPerformanceComparison() {
    console.log("\n⚡ Test de performance comparative...\n");

    const testParams = { departure: "Paris", arrival: "Lyon", maxPrice: 50 };
    const queryString = new URLSearchParams(testParams).toString();

    try {
        // Test recherche basique
        console.log("🧪 Test recherche basique");
        const startBasic = Date.now();
        const basicResponse = await axios.get(
            `${BASE_URL}/carpoolings/available?${queryString}`
        );
        const basicDuration = Date.now() - startBasic;

        console.log(`   ⏱️ Durée: ${basicDuration}ms`);
        console.log(
            `   📊 Résultats: ${basicResponse.data.carpoolings.length}`
        );

        // Test recherche avancée
        console.log("\n🧪 Test recherche avancée");
        const startAdvanced = Date.now();
        const advancedResponse = await axios.get(
            `${BASE_URL}/search/advanced?${queryString}&sortBy=price_per_passenger`
        );
        const advancedDuration = Date.now() - startAdvanced;

        console.log(`   ⏱️ Durée: ${advancedDuration}ms`);
        console.log(
            `   📊 Résultats: ${advancedResponse.data.carpoolings.length}`
        );

        if (advancedResponse.data.stats) {
            console.log(`   📈 Statistiques incluses: Oui`);
        }

        // Comparaison
        console.log(`\n📊 Comparaison:`);
        console.log(`   🏃 Recherche basique: ${basicDuration}ms`);
        console.log(`   🚀 Recherche avancée: ${advancedDuration}ms`);
        console.log(`   📈 Différence: ${advancedDuration - basicDuration}ms`);

        if (advancedDuration < basicDuration * 2) {
            console.log(
                `   ✅ Performance acceptable (moins de 2x plus lente)`
            );
        } else {
            console.log(`   ⚠️ Performance à optimiser`);
        }
    } catch (error) {
        console.error(`❌ Erreur test performance: ${error.message}`);
    }
}

// Fonction principale
async function runAdvancedSearchTests() {
    console.log(
        "🚀 Démarrage des tests de recherche avancée d'itinéraires EcoRide\n"
    );
    console.log("=".repeat(70));

    try {
        // Étape 1: Créer les données de test
        await createTestUsers();
        await createTestVehicles();
        await createTestCarpoolings();

        console.log("\n" + "=".repeat(70));

        // Étape 2: Tests de recherche basique
        await testBasicSearch();

        // Étape 3: Tests de recherche avancée
        await testAdvancedSearch();

        // Étape 4: Tests des statistiques
        await testSearchStatistics();

        // Étape 5: Test de performance
        await testPerformanceComparison();

        console.log("\n" + "=".repeat(70));
        console.log("🎉 Tous les tests de recherche avancée terminés !");
    } catch (error) {
        console.error("❌ Erreur globale lors des tests:", error.message);
    }
}

// Exécuter les tests si ce script est lancé directement
if (require.main === module) {
    runAdvancedSearchTests();
}

module.exports = { runAdvancedSearchTests };
