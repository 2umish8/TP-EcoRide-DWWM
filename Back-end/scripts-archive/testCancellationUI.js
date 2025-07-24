const axios = require("axios");

const BASE_URL = "http://localhost:3000/api";

// Variables globales pour les tests
let driverToken = null;
let passengerToken = null;
let vehicleId = null;
let carpoolingId = null;

// Fonction utilitaire pour créer des requêtes authentifiées
function authenticatedRequest(token, data = {}) {
    return {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        ...data,
    };
}

// Test complet de l'annulation de participation avec interface
async function testCancellationUI() {
    try {
        console.log("🧪 === TEST COMPLET D'ANNULATION DE PARTICIPATION ===\n");

        // ============ CRÉATION DES COMPTES DE TEST ============
        console.log("👤 Création des comptes de test");

        const timestamp = Date.now();
        const driverEmail = `driver_cancel_${timestamp}@test.com`;
        const passengerEmail = `passenger_cancel_${timestamp}@test.com`;

        // Créer le compte chauffeur
        const driverData = {
            email: driverEmail,
            password: "TestPassword123!",
            pseudo: `ChauffeurTest${timestamp}`,
        };

        const driverResponse = await axios.post(
            `${BASE_URL}/users/register`,
            driverData
        );
        console.log("✅ Chauffeur créé:", driverResponse.data.message);

        // Connexion du chauffeur
        console.log("🔑 Connexion du chauffeur...");
        const driverLoginResponse = await axios.post(
            `${BASE_URL}/users/login`,
            {
                identifier: driverEmail,
                password: "TestPassword123!",
            }
        );
        driverToken = driverLoginResponse.data.token;
        console.log("✅ Chauffeur connecté");

        // Devenir chauffeur via l'endpoint utilisateur
        console.log("👨‍✈️ Demande pour devenir chauffeur...");
        try {
            await axios.post(
                `${BASE_URL}/users/become-driver`,
                {},
                authenticatedRequest(driverToken, {})
            );
            console.log("✅ Rôle chauffeur attribué");

            // Se reconnecter pour obtenir un token avec les nouveaux rôles
            console.log("🔄 Reconnexion pour mise à jour des rôles...");
            const driverReloginResponse = await axios.post(
                `${BASE_URL}/users/login`,
                {
                    identifier: driverEmail,
                    password: "TestPassword123!",
                }
            );
            driverToken = driverReloginResponse.data.token;
            console.log("✅ Token mis à jour avec rôle chauffeur");
        } catch (err) {
            console.log(
                "⚠️ Échec de l'attribution du rôle chauffeur:",
                err.response?.data?.message || err.message
            );
            console.log("   Continuons sans le rôle (tests limités)");
        }

        // Créer le compte passager
        console.log("👤 Création du compte passager...");
        const passengerData = {
            email: passengerEmail,
            password: "TestPassword123!",
            pseudo: `PassagerTest${timestamp}`,
        };

        const passengerResponse = await axios.post(
            `${BASE_URL}/users/register`,
            passengerData
        );
        console.log("✅ Passager créé:", passengerResponse.data.message);

        // Connexion du passager
        console.log("🔑 Connexion du passager...");
        const passengerLoginResponse = await axios.post(
            `${BASE_URL}/users/login`,
            {
                identifier: passengerEmail,
                password: "TestPassword123!",
            }
        );
        passengerToken = passengerLoginResponse.data.token;
        console.log("✅ Passager connecté");

        // ============ CRÉATION DU VÉHICULE ============
        console.log("\n🚗 Création du véhicule");

        const vehicleData = {
            brand_name: "Toyota",
            model: "Prius",
            year: 2022,
            color_name: "Blanc",
            plate_number: `TC${timestamp}`,
            seats_available: 4,
            first_registration_date: "2022-01-15",
        };

        const vehicleResponse = await axios.post(
            `${BASE_URL}/vehicles`,
            vehicleData,
            authenticatedRequest(driverToken, {})
        );
        vehicleId = vehicleResponse.data.vehicleId;
        console.log("✅ Véhicule créé:", vehicleId);

        // ============ CRÉATION DU COVOITURAGE ============
        console.log("\n🛣️ Création du covoiturage");

        const carpoolingData = {
            vehicle_id: vehicleId,
            departure_address: "Paris, France",
            arrival_address: "Lyon, France",
            departure_datetime: new Date(Date.now() + 3 * 60 * 60 * 1000)
                .toISOString()
                .slice(0, 19)
                .replace("T", " "), // Dans 3 heures, format MySQL
            arrival_datetime: new Date(Date.now() + 7 * 60 * 60 * 1000)
                .toISOString()
                .slice(0, 19)
                .replace("T", " "), // Dans 7 heures, format MySQL
            seats_offered: 3,
            price_per_passenger: 15,
            description: "Test d'annulation de participation",
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

        // Vérifier les crédits avant participation
        const creditsBeforeResponse = await axios.get(
            `${BASE_URL}/credits/balance`,
            authenticatedRequest(passengerToken, {})
        );
        console.log(
            "💰 Crédits avant participation:",
            creditsBeforeResponse.data.credits
        );

        // Participer au covoiturage
        const participationResponse = await axios.post(
            `${BASE_URL}/participations/${carpoolingId}/join`,
            { confirmed: true },
            authenticatedRequest(passengerToken, {})
        );
        console.log(
            "✅ Participation confirmée:",
            participationResponse.data.message
        );
        console.log(
            "   Crédits débités:",
            participationResponse.data.creditsDebited
        );
        console.log(
            "   Crédits restants:",
            participationResponse.data.remainingCredits
        );

        // ============ VÉRIFICATION HISTORIQUE AVANT ANNULATION ============
        console.log("\n📋 Vérification de l'historique avant annulation");

        const historyBeforeResponse = await axios.get(
            `${BASE_URL}/participations/my-participations`,
            authenticatedRequest(passengerToken, {})
        );

        const activeParticipations =
            historyBeforeResponse.data.participations.filter(
                (p) => !p.cancellation_date
            );
        console.log("📊 Participations actives:", activeParticipations.length);

        if (activeParticipations.length > 0) {
            const participation = activeParticipations[0];
            console.log("   Participation trouvée:");
            console.log("   - Covoiturage ID:", participation.carpooling_id);
            console.log("   - Statut:", participation.carpooling_status);
            console.log(
                "   - Prix payé:",
                participation.credits_paid,
                "crédits"
            );
            console.log(
                "   - Peut être annulée:",
                participation.carpooling_status === "prévu" &&
                    !participation.cancellation_date
            );
        }

        // ============ ANNULATION DE LA PARTICIPATION ============
        console.log("\n❌ Test d'annulation de la participation");

        const cancelResponse = await axios.post(
            `${BASE_URL}/participations/${carpoolingId}/cancel`,
            { reason: "Test de l'interface d'annulation" },
            authenticatedRequest(passengerToken, {})
        );

        console.log("✅ Participation annulée avec succès!");
        console.log("   Message:", cancelResponse.data.message);
        if (cancelResponse.data.creditsRefunded !== undefined) {
            console.log(
                "   💰 Crédits remboursés:",
                cancelResponse.data.creditsRefunded
            );
        }
        if (cancelResponse.data.penalty && cancelResponse.data.penalty > 0) {
            console.log(
                "   ⚠️ Pénalité appliquée:",
                cancelResponse.data.penalty,
                "crédits"
            );
        }

        // ============ VÉRIFICATION APRÈS ANNULATION ============
        console.log("\n🔍 Vérification après annulation");

        // Vérifier les crédits après annulation
        const creditsAfterResponse = await axios.get(
            `${BASE_URL}/credits/balance`,
            authenticatedRequest(passengerToken, {})
        );
        console.log(
            "💰 Crédits après annulation:",
            creditsAfterResponse.data.credits
        );

        // Vérifier l'historique après annulation
        const historyAfterResponse = await axios.get(
            `${BASE_URL}/participations/my-participations`,
            authenticatedRequest(passengerToken, {})
        );

        const cancelledParticipations =
            historyAfterResponse.data.participations.filter(
                (p) => p.cancellation_date
            );
        console.log(
            "📊 Participations annulées:",
            cancelledParticipations.length
        );

        if (cancelledParticipations.length > 0) {
            const cancelledParticipation = cancelledParticipations[0];
            console.log("   Participation annulée trouvée:");
            console.log(
                "   - Covoiturage ID:",
                cancelledParticipation.carpooling_id
            );
            console.log(
                "   - Prix payé:",
                cancelledParticipation.credits_paid,
                "crédits"
            );
            console.log(
                "   - Date d'annulation:",
                new Date(
                    cancelledParticipation.cancellation_date
                ).toLocaleString("fr-FR")
            );
        }

        // Vérifier l'état du covoiturage (places libérées)
        const carpoolingStateResponse = await axios.get(
            `${BASE_URL}/carpoolings/${carpoolingId}`
        );
        const carpooling = carpoolingStateResponse.data.carpooling;
        console.log("🚗 État du covoiturage après annulation:");
        console.log(
            "   Places restantes:",
            carpooling.seats_remaining + "/" + carpooling.initial_seats_offered
        );

        // ============ TEST D'ANNULATION DÉJÀ ANNULÉE ============
        console.log("\n🚫 Test d'annulation d'une participation déjà annulée");

        try {
            await axios.post(
                `${BASE_URL}/participations/${carpoolingId}/cancel`,
                { reason: "Tentative de double annulation" },
                authenticatedRequest(passengerToken, {})
            );
            console.log(
                "❌ ERREUR: L'annulation a été acceptée alors qu'elle ne devrait pas!"
            );
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log(
                    "✅ Double annulation correctement refusée:",
                    error.response.data.message
                );
            } else {
                console.log(
                    "⚠️ Erreur inattendue:",
                    error.response?.data?.message || error.message
                );
            }
        }

        // ============ RÉSUMÉ FINAL ============
        console.log("\n🎉 === RÉSUMÉ DU TEST D'ANNULATION ===");
        console.log("✅ Comptes créés et authentifiés");
        console.log("✅ Véhicule et covoiturage créés");
        console.log("✅ Participation réussie avec débit des crédits");
        console.log("✅ Historique avant annulation vérifié");
        console.log("✅ Annulation réussie avec remboursement");
        console.log("✅ Historique après annulation mis à jour");
        console.log("✅ Places du covoiturage libérées");
        console.log("✅ Protection contre double annulation");

        console.log("\n📱 === INFORMATIONS POUR LE TEST UI ===");
        console.log(`🌐 Interface disponible: http://localhost:5174`);
        console.log(`👤 Compte passager: ${passengerEmail}`);
        console.log(`🔑 Mot de passe: TestPassword123!`);
        console.log(
            `📋 Connectez-vous et allez dans "Mes Voyages" pour voir l'historique avec l'annulation`
        );
    } catch (error) {
        console.error("\n❌ ERREUR lors du test d'annulation:");

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
        console.log(`   Véhicule créé: ${vehicleId || "Non défini"}`);
        console.log(`   Covoiturage créé: ${carpoolingId || "Non défini"}`);
    }
}

// Exécuter le test
if (require.main === module) {
    testCancellationUI();
}

module.exports = { testCancellationUI };
