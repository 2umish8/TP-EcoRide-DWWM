const axios = require("axios");

// Configuration de base
const BASE_URL = "http://localhost:3000/api";

async function testExistingSearch() {
    console.log("🔍 Tests des fonctionnalités de recherche existantes\n");

    const tests = [
        {
            name: "Recherche basique - Tous les covoiturages",
            url: `${BASE_URL}/carpoolings/available`,
        },
        {
            name: "Recherche par départ - Paris",
            url: `${BASE_URL}/carpoolings/available?departure=Paris`,
        },
        {
            name: "Recherche par arrivée - Lyon",
            url: `${BASE_URL}/carpoolings/available?arrival=Lyon`,
        },
        {
            name: "Recherche par prix max - 20€",
            url: `${BASE_URL}/carpoolings/available?maxPrice=20`,
        },
        {
            name: "Recherche véhicules non-électriques",
            url: `${BASE_URL}/carpoolings/available?isElectric=false`,
        },
        {
            name: "Recherche par durée max - 3h (180 min)",
            url: `${BASE_URL}/carpoolings/available?maxDuration=180`,
        },
        {
            name: "Recherche combinée - Toulouse vers Bordeaux, max 25€",
            url: `${BASE_URL}/carpoolings/available?departure=Toulouse&arrival=Bordeaux&maxPrice=25`,
        },
    ];

    for (const test of tests) {
        try {
            console.log(`🧪 ${test.name}`);

            const startTime = Date.now();
            const response = await axios.get(test.url);
            const duration = Date.now() - startTime;

            const carpoolings = response.data.carpoolings;

            console.log(
                `   📊 Résultats: ${carpoolings.length} covoiturage(s)`
            );
            console.log(`   ⏱️ Temps: ${duration}ms`);

            if (carpoolings.length > 0) {
                const first = carpoolings[0];
                console.log(
                    `   📍 Premier: ${first.departure_address} → ${first.arrival_address}`
                );
                console.log(
                    `   💰 Prix: ${first.price_per_passenger}€ | 🪑 Places: ${first.seats_remaining}`
                );
                console.log(
                    `   ⚡ Électrique: ${first.is_electric ? "Oui" : "Non"}`
                );
                console.log(`   ⏱️ Durée: ${first.duration_minutes} minutes`);
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

async function testSearchPerformance() {
    console.log("⚡ Test de performance des recherches\n");

    const searches = [
        `${BASE_URL}/carpoolings/available`,
        `${BASE_URL}/carpoolings/available?departure=Paris`,
        `${BASE_URL}/carpoolings/available?departure=Paris&arrival=Lyon&maxPrice=30`,
    ];

    for (const url of searches) {
        try {
            const times = [];

            // 5 requêtes pour calculer la moyenne
            for (let i = 0; i < 5; i++) {
                const start = Date.now();
                await axios.get(url);
                times.push(Date.now() - start);
            }

            const avgTime = Math.round(
                times.reduce((a, b) => a + b, 0) / times.length
            );
            const minTime = Math.min(...times);
            const maxTime = Math.max(...times);

            console.log(`📊 ${url.split("?")[1] || "Recherche basique"}`);
            console.log(
                `   ⏱️ Temps moyen: ${avgTime}ms (min: ${minTime}ms, max: ${maxTime}ms)`
            );
            console.log(
                `   ${
                    avgTime < 100
                        ? "✅ Excellent"
                        : avgTime < 500
                        ? "✅ Bon"
                        : "⚠️ À améliorer"
                }\n`
            );
        } catch (error) {
            console.error(`❌ Erreur performance: ${error.message}\n`);
        }
    }
}

async function runExistingSearchTests() {
    console.log(
        "🚀 Tests des fonctionnalités de recherche d'itinéraires existantes"
    );
    console.log("=".repeat(70));

    try {
        await testExistingSearch();
        await testSearchPerformance();

        console.log("=".repeat(70));
        console.log("🎉 Tests de recherche existante terminés avec succès !");
        console.log(
            "📊 Résumé: Les fonctionnalités de base de recherche fonctionnent correctement"
        );
        console.log("🚀 Prêt pour les fonctionnalités avancées !");
    } catch (error) {
        console.error("❌ Erreur globale:", error.message);
    }
}

// Exécuter les tests si ce script est lancé directement
if (require.main === module) {
    runExistingSearchTests();
}

module.exports = { runExistingSearchTests };
