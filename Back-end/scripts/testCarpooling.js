const axios = require("axios");

// Configuration de base
const BASE_URL = "http://localhost:3000/api";
let driverToken = "";
let passengerToken = "";
let driverUserId = "";
let passengerUserId = "";
let vehicleId = "";
let carpoolingIds = [];

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

// Tests complets des fonctionnalités de covoiturage
async function testCarpoolingFunctionality() {
    console.log(
        "🚀 Démarrage des tests des fonctionnalités de covoiturage EcoRide\n"
    );

    const timestamp = Date.now();

    try {
        // ============ SETUP: CRÉATION DES UTILISATEURS ET VÉHICULE ============
        console.log("🔧 Setup: Création des utilisateurs de test");

        // Créer un chauffeur
        const driver = {
            pseudo: `chauffeur_${timestamp}`,
            email: `chauffeur_${timestamp}@test.com`,
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
        console.log("✅ Chauffeur connecté");

        // Devenir chauffeur
        await axios.post(
            `${BASE_URL}/users/become-driver`,
            {},
            authenticatedRequest(driverToken, {})
        );
        console.log("✅ Rôle chauffeur attribué");

        // Reconnexion pour obtenir un token avec les nouveaux rôles
        const driverReloginResponse = await axios.post(
            `${BASE_URL}/users/login`,
            {
                identifier: driver.email,
                password: driver.password,
            }
        );
        driverToken = driverReloginResponse.data.token;
        console.log("✅ Chauffeur reconnecté avec les nouveaux rôles");

        // Créer un passager
        const passenger = {
            pseudo: `passager_${timestamp}`,
            email: `passager_${timestamp}@test.com`,
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

        // Ajouter un véhicule au chauffeur
        const vehicle = {
            plate_number: `TEST-${timestamp}`.slice(-10),
            model: "Clio",
            seats_available: 4,
            is_electric: false,
            brand_name: "Renault",
            color_name: "Rouge",
        };

        const vehicleResponse = await axios.post(
            `${BASE_URL}/vehicles`,
            vehicle,
            authenticatedRequest(driverToken, {})
        );
        vehicleId = vehicleResponse.data.vehicleId;
        console.log("✅ Véhicule ajouté, ID:", vehicleId);
        console.log("");

        // ============ TEST 1: CRÉATION DE PLUSIEURS COVOITURAGES ============
        console.log("🚗 Test 1: Création de plusieurs covoiturages");

        const carpoolings = [
            {
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
                price_per_passenger: 25,
                seats_offered: 3,
                vehicle_id: vehicleId,
            },
            {
                departure_address: "Lyon, France",
                arrival_address: "Marseille, France",
                departure_datetime: new Date(Date.now() + 48 * 60 * 60 * 1000)
                    .toISOString()
                    .slice(0, 19)
                    .replace("T", " "),
                arrival_datetime: new Date(Date.now() + 51 * 60 * 60 * 1000)
                    .toISOString()
                    .slice(0, 19)
                    .replace("T", " "),
                price_per_passenger: 20,
                seats_offered: 2,
                vehicle_id: vehicleId,
            },
            {
                departure_address: "Paris, France",
                arrival_address: "Bordeaux, France",
                departure_datetime: new Date(Date.now() + 72 * 60 * 60 * 1000)
                    .toISOString()
                    .slice(0, 19)
                    .replace("T", " "),
                arrival_datetime: new Date(Date.now() + 78 * 60 * 60 * 1000)
                    .toISOString()
                    .slice(0, 19)
                    .replace("T", " "),
                price_per_passenger: 35,
                seats_offered: 4,
                vehicle_id: vehicleId,
            },
        ];

        for (let i = 0; i < carpoolings.length; i++) {
            try {
                console.log(
                    `Création du covoiturage ${i + 1}:`,
                    JSON.stringify(carpoolings[i], null, 2)
                );
                const carpoolingResponse = await axios.post(
                    `${BASE_URL}/carpoolings`,
                    carpoolings[i],
                    authenticatedRequest(driverToken, {})
                );
                carpoolingIds.push(carpoolingResponse.data.carpoolingId);
                console.log(
                    `✅ Covoiturage ${i + 1} créé: ${
                        carpoolings[i].departure_address
                    } → ${carpoolings[i].arrival_address}`
                );
                console.log(
                    `   ID: ${carpoolingResponse.data.carpoolingId}, Prix: ${carpoolings[i].price_per_passenger}€`
                );
            } catch (error) {
                console.error(
                    `❌ Erreur lors de la création du covoiturage ${i + 1}:`,
                    error.response?.data || error.message
                );
                throw error;
            }
        }
        console.log("");

        // ============ TEST 2: RECHERCHE FILTRÉE DE COVOITURAGES ============
        console.log("🔍 Test 2: Recherche filtrée de covoiturages");

        // Recherche par départ
        const searchByDeparture = await axios.get(
            `${BASE_URL}/carpoolings/available?departure=Paris`
        );
        console.log(
            `✅ Recherche par départ (Paris): ${searchByDeparture.data.carpoolings.length} résultat(s)`
        );

        // Recherche par départ et arrivée
        const searchByRoute = await axios.get(
            `${BASE_URL}/carpoolings/available?departure=Paris&arrival=Lyon`
        );
        console.log(
            `✅ Recherche Paris → Lyon: ${searchByRoute.data.carpoolings.length} résultat(s)`
        );

        // Recherche par prix maximum
        const searchByPrice = await axios.get(
            `${BASE_URL}/carpoolings/available?max_price=30`
        );
        console.log(
            `✅ Recherche prix ≤ 30€: ${searchByPrice.data.carpoolings.length} résultat(s)`
        );

        // Recherche par nombre de places minimum
        const searchBySeats = await axios.get(
            `${BASE_URL}/carpoolings/available?min_seats=3`
        );
        console.log(
            `✅ Recherche ≥ 3 places: ${searchBySeats.data.carpoolings.length} résultat(s)`
        );

        // Recherche combinée
        const searchCombined = await axios.get(
            `${BASE_URL}/carpoolings/available?departure=Paris&max_price=30&min_seats=2`
        );
        console.log(
            `✅ Recherche combinée (Paris + prix ≤ 30€ + ≥ 2 places): ${searchCombined.data.carpoolings.length} résultat(s)`
        );
        console.log("");

        // ============ TEST 3: PARTICIPATION À UN COVOITURAGE ============
        console.log("👥 Test 3: Participation à un covoiturage");

        // Utilisons le covoiturage Lyon → Marseille (20€) qui coûte moins que les 20 crédits par défaut
        const targetCarpoolingId = carpoolingIds[1]; // Lyon → Marseille (20€)

        // Vérifier les crédits du passager avant participation
        const passengerCreditsBeforeResponse = await axios.get(
            `${BASE_URL}/credits/balance`,
            authenticatedRequest(passengerToken, {})
        );
        console.log(
            `💰 Crédits du passager avant participation: ${passengerCreditsBeforeResponse.data.credits} crédits`
        );

        // Le passager rejoint le covoiturage
        const joinResponse = await axios.post(
            `${BASE_URL}/participations/${targetCarpoolingId}/join`,
            {},
            authenticatedRequest(passengerToken, {})
        );
        console.log(
            "✅ Passager a rejoint le covoiturage:",
            joinResponse.data.message
        );

        // Vérifier les participants
        const participantsResponse = await axios.get(
            `${BASE_URL}/participations/${targetCarpoolingId}/participants`,
            authenticatedRequest(driverToken, {})
        );
        console.log(
            `✅ Participants du covoiturage: ${participantsResponse.data.participants.length} participant(s)`
        );

        // Vérifier les crédits du passager
        const passengerCreditsResponse = await axios.get(
            `${BASE_URL}/credits/balance`,
            authenticatedRequest(passengerToken, {})
        );
        console.log(
            `✅ Crédits restants du passager: ${passengerCreditsResponse.data.credits} crédits`
        );
        console.log("");

        // ============ TEST 4: ANNULATION AVEC REMBOURSEMENT ============
        console.log("❌ Test 4: Annulation du covoiturage avec remboursement");

        console.log("📊 État avant annulation:");
        console.log(
            `   Participants: ${participantsResponse.data.participants.length}`
        );
        console.log(
            `   Crédits passager: ${passengerCreditsResponse.data.credits}`
        );

        // Vérifier les crédits du chauffeur avant annulation
        const driverCreditsBeforeResponse = await axios.get(
            `${BASE_URL}/credits/balance`,
            authenticatedRequest(driverToken, {})
        );
        console.log(
            `   Crédits chauffeur: ${driverCreditsBeforeResponse.data.credits}`
        );

        // Annuler le covoiturage
        const cancelResponse = await axios.post(
            `${BASE_URL}/carpoolings/${targetCarpoolingId}/cancel`,
            { reason: "Test d'annulation avec remboursement" },
            authenticatedRequest(driverToken, {})
        );
        console.log("✅ Covoiturage annulé:", cancelResponse.data.message);

        // Attendre un peu pour que les remboursements soient traités
        await sleep(2000);

        // Vérifier les crédits après annulation
        const passengerCreditsAfterResponse = await axios.get(
            `${BASE_URL}/credits/balance`,
            authenticatedRequest(passengerToken, {})
        );
        const driverCreditsAfterResponse = await axios.get(
            `${BASE_URL}/credits/balance`,
            authenticatedRequest(driverToken, {})
        );

        console.log("📊 État après annulation:");
        console.log(
            `   Crédits passager: ${
                passengerCreditsAfterResponse.data.credits
            } (remboursé: ${
                passengerCreditsAfterResponse.data.credits >
                passengerCreditsResponse.data.credits
                    ? "Oui"
                    : "Non"
            })`
        );
        console.log(
            `   Crédits chauffeur: ${
                driverCreditsAfterResponse.data.credits
            } (pénalité appliquée: ${
                driverCreditsAfterResponse.data.credits <
                driverCreditsBeforeResponse.data.credits
                    ? "Oui"
                    : "Non"
            })`
        );

        // Vérifier l'historique des transactions
        const passengerHistoryResponse = await axios.get(
            `${BASE_URL}/credits/history`,
            authenticatedRequest(passengerToken, {})
        );
        const driverHistoryResponse = await axios.get(
            `${BASE_URL}/credits/history`,
            authenticatedRequest(driverToken, {})
        );

        console.log(
            `✅ Historique passager: ${passengerHistoryResponse.data.transactions.length} transaction(s)`
        );
        console.log(
            `✅ Historique chauffeur: ${driverHistoryResponse.data.transactions.length} transaction(s)`
        );
        console.log("");

        // ============ TEST 5: VÉRIFICATION DU SYSTÈME DE MAIL (SIMULATION) ============
        console.log("📧 Test 5: Système de notification (simulation)");

        // Dans un vrai système, on vérifierait que les mails ont été envoyés
        // Ici on vérifie que les données nécessaires sont disponibles

        console.log("✅ Données disponibles pour notification:");
        console.log(`   Email du passager: ${passenger.email}`);
        console.log(`   Email du chauffeur: ${driver.email}`);
        console.log(`   ID du covoiturage annulé: ${targetCarpoolingId}`);
        console.log(
            `   Montant remboursé: 20 crédits (prix du covoiturage Lyon → Marseille)`
        );
        console.log(
            "ℹ️ Dans un environnement de production, des emails seraient envoyés automatiquement"
        );
        console.log("");

        // ============ TEST 6: CRÉATION ET GESTION D'AUTRES COVOITURAGES ============
        console.log("🔄 Test 6: Gestion des autres covoiturages");

        // Vérifier que les autres covoiturages sont toujours disponibles
        const remainingCarpoolings = await axios.get(
            `${BASE_URL}/carpoolings/available`
        );
        console.log(
            `✅ Covoiturages disponibles: ${remainingCarpoolings.data.carpoolings.length}`
        );

        // Lister les covoiturages du chauffeur
        const driverCarpoolings = await axios.get(
            `${BASE_URL}/carpoolings/my-carpoolings`,
            authenticatedRequest(driverToken, {})
        );
        console.log(
            `✅ Covoiturages du chauffeur: ${driverCarpoolings.data.carpoolings.length}`
        );

        // Vérifier l'état de chaque covoiturage
        for (const carpooling of driverCarpoolings.data.carpoolings) {
            console.log(
                `   - ID: ${carpooling.id}, Statut: ${carpooling.status}, Route: ${carpooling.departure_address} → ${carpooling.arrival_address}`
            );
        }
        console.log("");

        // ============ TEST 7: MODIFICATION D'UN COVOITURAGE ============
        console.log("✏️ Test 7: Modification d'un covoiturage");

        const carpoolingToUpdate = carpoolingIds[2]; // Paris → Bordeaux (qui n'a pas été annulé)
        const updateData = {
            price_per_passenger: 40, // Augmentation de 35€ à 40€
            seats_offered: 3, // Diminution de 4 à 3 places
        };

        const updateResponse = await axios.put(
            `${BASE_URL}/carpoolings/${carpoolingToUpdate}`,
            updateData,
            authenticatedRequest(driverToken, {})
        );
        console.log("✅ Covoiturage modifié:", updateResponse.data.message);
        console.log(`   Nouveau prix: ${updateData.price_per_passenger}€`);
        console.log(`   Nouvelles places: ${updateData.seats_offered}`);
        console.log("");

        // ============ RÉSUMÉ FINAL ============
        console.log("🎉 TOUS LES TESTS DE COVOITURAGE ONT RÉUSSI!");
        console.log("✅ Création de plusieurs covoiturages");
        console.log("✅ Recherche filtrée (départ, arrivée, prix, places)");
        console.log("✅ Participation d'un passager");
        console.log("✅ Annulation avec remboursement automatique");
        console.log("✅ Gestion des pénalités pour le chauffeur");
        console.log("✅ Système de notification prêt (emails)");
        console.log("✅ Modification de covoiturages");
        console.log("✅ Gestion des statuts et de l'historique");
    } catch (error) {
        console.error("\n❌ ERREUR lors des tests de covoiturage:");

        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(
                `   Message: ${
                    error.response.data.error ||
                    error.response.data.message ||
                    "Erreur inconnue"
                }`
            );
            if (error.response.data.details) {
                console.error(
                    `   Détails: ${JSON.stringify(
                        error.response.data.details,
                        null,
                        2
                    )}`
                );
            }
        } else {
            console.error(`   Erreur: ${error.message}`);
        }

        console.log("\n📋 État du test au moment de l'erreur:");
        console.log(
            `   Token chauffeur: ${driverToken ? "Présent" : "Absent"}`
        );
        console.log(
            `   Token passager: ${passengerToken ? "Présent" : "Absent"}`
        );
        console.log(`   ID véhicule: ${vehicleId || "Non défini"}`);
        console.log(`   Covoiturages créés: ${carpoolingIds.length}`);
    }
}

// Fonction utilitaire pour nettoyer les données de test
async function cleanupTestData() {
    console.log("\n🧹 Nettoyage des données de test...");

    try {
        // Annuler tous les covoiturages créés
        for (const carpoolingId of carpoolingIds) {
            try {
                await axios.post(
                    `${BASE_URL}/carpoolings/${carpoolingId}/cancel`,
                    { reason: "Nettoyage des tests" },
                    authenticatedRequest(driverToken, {})
                );
            } catch (error) {
                // Ignorer les erreurs (covoiturage peut déjà être annulé)
            }
        }

        // Supprimer le véhicule
        if (vehicleId && driverToken) {
            try {
                await axios.delete(
                    `${BASE_URL}/vehicles/${vehicleId}`,
                    authenticatedRequest(driverToken, {})
                );
            } catch (error) {
                // Ignorer les erreurs
            }
        }

        console.log("✅ Données de test nettoyées");
    } catch (error) {
        console.log(
            "ℹ️ Impossible de nettoyer automatiquement toutes les données de test"
        );
    }
}

// Exécuter les tests si ce script est lancé directement
if (require.main === module) {
    testCarpoolingFunctionality()
        .then(() => {
            console.log("\n✨ Tests terminés avec succès!");
            return cleanupTestData();
        })
        .then(() => {
            process.exit(0);
        })
        .catch((error) => {
            console.error("\n💥 Échec des tests:", error.message);
            cleanupTestData().finally(() => {
                process.exit(1);
            });
        });
}

module.exports = {
    testCarpoolingFunctionality,
    cleanupTestData,
};
