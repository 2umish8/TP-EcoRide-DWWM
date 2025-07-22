const { runTests } = require("./testAPI");
const { runSearchTests } = require("./testSearchItinerary");
const { runAdvancedSearchTests } = require("./testAdvancedSearch");

// Fonction pour attendre un délai
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runAllBackendTests() {
    console.log("🚀 DÉMARRAGE DE LA SUITE COMPLÈTE DE TESTS BACKEND ECORIDE");
    console.log("=".repeat(80));
    console.log(`📅 Date: ${new Date().toLocaleString()}`);
    console.log("=".repeat(80));

    const startTime = Date.now();

    try {
        // Test 1: Tests API de base
        console.log("\n🔄 PHASE 1: Tests API de base");
        console.log("-".repeat(50));
        await runTests();

        console.log("\n✅ Phase 1 terminée, attente de 2 secondes...\n");
        await delay(2000);

        // Test 2: Tests de recherche d'itinéraires basique
        console.log("\n🔄 PHASE 2: Tests de recherche d'itinéraires");
        console.log("-".repeat(50));
        await runSearchTests();

        console.log("\n✅ Phase 2 terminée, attente de 2 secondes...\n");
        await delay(2000);

        // Test 3: Tests de recherche avancée
        console.log("\n🔄 PHASE 3: Tests de recherche avancée");
        console.log("-".repeat(50));
        await runAdvancedSearchTests();

        // Résumé final
        const endTime = Date.now();
        const totalDuration = Math.round((endTime - startTime) / 1000);

        console.log("\n" + "=".repeat(80));
        console.log("🎉 SUITE DE TESTS BACKEND TERMINÉE AVEC SUCCÈS!");
        console.log("=".repeat(80));
        console.log(`⏱️  Durée totale: ${totalDuration} secondes`);
        console.log(`📊 Phases testées:`);
        console.log(
            `   ✅ API de base (utilisateurs, véhicules, covoiturages, crédits)`
        );
        console.log(`   ✅ Recherche d'itinéraires basique`);
        console.log(`   ✅ Recherche d'itinéraires avancée`);
        console.log(`   ✅ Statistiques et performance`);
        console.log("=".repeat(80));
        console.log("🚀 Le backend EcoRide est prêt pour la production!");
    } catch (error) {
        console.error("\n❌ ERREUR CRITIQUE LORS DES TESTS:");
        console.error("=".repeat(50));
        console.error(error.message);
        console.error("=".repeat(50));
        console.error("🔧 Vérifiez les points suivants:");
        console.error("   • Le serveur backend est-il démarré? (npm start)");
        console.error("   • MySQL est-il accessible?");
        console.error("   • MongoDB est-il accessible?");
        console.error("   • Toutes les dépendances sont-elles installées?");
        process.exit(1);
    }
}

// Exécuter tous les tests si ce script est lancé directement
if (require.main === module) {
    runAllBackendTests();
}

module.exports = { runAllBackendTests };
