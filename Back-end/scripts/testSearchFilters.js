// Test des fonctionnalités de recherche et filtres

const axios = require("axios");

const BASE_URL = "http://localhost:3000/api";

// Tests des filtres de recherche selon le cahier des charges (US 4)
async function testSearchFilters() {
    console.log("🔍 Test des filtres de recherche de covoiturages\n");

    try {
        // Test 1: Recherche de base sans filtres
        console.log("1. Recherche de base (tous les covoiturages disponibles)");
        const allTrips = await axios.get(`${BASE_URL}/carpoolings/available`);
        console.log(
            `✅ ${allTrips.data.carpoolings.length} covoiturages trouvés\n`
        );

        // Test 2: Filtrer par ville de départ
        console.log("2. Filtrer par ville de départ (Paris)");
        const parisTrips = await axios.get(
            `${BASE_URL}/carpoolings/available?departure=Paris`
        );
        console.log(
            `✅ ${parisTrips.data.carpoolings.length} covoiturages depuis Paris\n`
        );

        // Test 3: Filtrer par prix maximum
        console.log("3. Filtrer par prix maximum (≤ 20€)");
        const cheapTrips = await axios.get(
            `${BASE_URL}/carpoolings/available?maxPrice=20`
        );
        console.log(
            `✅ ${cheapTrips.data.carpoolings.length} covoiturages à 20€ maximum\n`
        );

        // Test 4: Filtrer par voitures électriques uniquement
        console.log("4. Filtrer par voitures électriques");
        const electricTrips = await axios.get(
            `${BASE_URL}/carpoolings/available?isElectric=true`
        );
        console.log(
            `✅ ${electricTrips.data.carpoolings.length} covoiturages écologiques\n`
        );

        // Test 5: Filtrer par durée maximale
        console.log("5. Filtrer par durée maximale (≤ 2h)");
        const shortTrips = await axios.get(
            `${BASE_URL}/carpoolings/available?maxDuration=120`
        );
        console.log(
            `✅ ${shortTrips.data.carpoolings.length} covoiturages de 2h maximum\n`
        );

        // Test 6: Filtrer par note minimale du chauffeur
        console.log("6. Filtrer par note minimale du chauffeur (≥ 4.0)");
        const topRatedTrips = await axios.get(
            `${BASE_URL}/carpoolings/available?minRating=4.0`
        );
        console.log(
            `✅ ${topRatedTrips.data.carpoolings.length} covoiturages avec chauffeurs bien notés\n`
        );

        // Test 7: Combinaison de filtres
        console.log("7. Combinaison de filtres (Paris, ≤ 25€, électrique)");
        const combinedFilters = await axios.get(
            `${BASE_URL}/carpoolings/available?departure=Paris&maxPrice=25&isElectric=true`
        );
        console.log(
            `✅ ${combinedFilters.data.carpoolings.length} covoiturages correspondant aux critères combinés\n`
        );

        // Test 8: Recherche avec date inexistante (doit proposer une alternative)
        console.log(
            "8. Recherche avec date dans le futur (test date alternative)"
        );
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30); // Dans 30 jours
        const futureDateStr = futureDate.toISOString().split("T")[0];

        const futureSearch = await axios.get(
            `${BASE_URL}/carpoolings/available?date=${futureDateStr}`
        );

        if (
            futureSearch.data.carpoolings.length === 0 &&
            futureSearch.data.nextAvailableDate
        ) {
            console.log(
                `✅ Aucun résultat trouvé. Prochaine date disponible: ${futureSearch.data.nextAvailableDate}\n`
            );
        } else {
            console.log(
                `✅ ${futureSearch.data.carpoolings.length} covoiturages trouvés pour cette date\n`
            );
        }

        // Affichage d'un exemple de covoiturage avec tous les détails
        if (allTrips.data.carpoolings.length > 0) {
            console.log("📋 Exemple de covoiturage avec tous les détails:");
            const example = allTrips.data.carpoolings[0];
            console.log("   - Départ:", example.departure_address);
            console.log("   - Arrivée:", example.arrival_address);
            console.log("   - Prix:", example.price_per_passenger + "€");
            console.log("   - Places restantes:", example.seats_remaining);
            console.log("   - Chauffeur:", example.driver_pseudo);
            console.log(
                "   - Note chauffeur:",
                example.driver_rating || "Pas encore noté"
            );
            console.log(
                "   - Véhicule:",
                `${example.brand_name} ${example.model}`
            );
            console.log(
                "   - Électrique:",
                example.is_electric ? "Oui" : "Non"
            );
            console.log(
                "   - Durée:",
                example.duration_minutes
                    ? `${Math.floor(example.duration_minutes / 60)}h${
                          example.duration_minutes % 60
                      }`
                    : "N/A"
            );
        }
    } catch (error) {
        console.error(
            "❌ Erreur lors des tests:",
            error.response?.data || error.message
        );
    }
}

// Exécuter les tests
testSearchFilters();
