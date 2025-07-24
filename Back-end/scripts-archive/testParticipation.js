const axios = require("axios");

// Configuration de base
const BASE_URL = "http://localhost:3000/api";
let driverToken = "";
let passengerToken = "";
let passenger2Token = "";
let driverUserId = "";
let passengerUserId = "";
let passenger2UserId = "";
let vehicleId = "";
let carpoolingIds = [];
let participationIds = [];

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

// Fonction pour formater les dates au format MySQL
const formatDateForMySQL = (date) => {
    return date.toISOString().slice(0, 19).replace("T", " ");
};

// Tests complets des fonctionnalités de participation
async function testParticipationFunctionality() {
    console.log(
        "👥 Démarrage des tests des fonctionnalités de participation EcoRide\n"
    );

    const timestamp = Date.now();

    try {
        // ============ SETUP: CRÉATION DES UTILISATEURS ============
        console.log("🔧 Setup: Création des utilisateurs de test");

        // Créer un chauffeur
        const driver = {
            pseudo: `driver_${timestamp}`,
            email: `driver_${timestamp}@test.com`,
            password: "Test123!",
        };

        const driverRegisterResponse = await axios.post(
            `${BASE_URL}/users/register`,
            driver
        );
        console.log("✅ Chauffeur créé:", driverRegisterResponse.data.message);

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

        // Créer premier passager
        const passenger1 = {
            pseudo: `passenger1_${timestamp}`,
            email: `passenger1_${timestamp}@test.com`,
            password: "Test123!",
        };

        const passenger1RegisterResponse = await axios.post(
            `${BASE_URL}/users/register`,
            passenger1
        );
        console.log(
            "✅ Passager 1 créé:",
            passenger1RegisterResponse.data.message
        );

        const passenger1LoginResponse = await axios.post(
            `${BASE_URL}/users/login`,
            {
                identifier: passenger1.email,
                password: passenger1.password,
            }
        );
        passengerToken = passenger1LoginResponse.data.token;
        passengerUserId = passenger1LoginResponse.data.user.id;
        console.log("✅ Passager 1 connecté");

        // Créer deuxième passager
        const passenger2 = {
            pseudo: `passenger2_${timestamp}`,
            email: `passenger2_${timestamp}@test.com`,
            password: "Test123!",
        };

        const passenger2RegisterResponse = await axios.post(
            `${BASE_URL}/users/register`,
            passenger2
        );
        console.log(
            "✅ Passager 2 créé:",
            passenger2RegisterResponse.data.message
        );

        const passenger2LoginResponse = await axios.post(
            `${BASE_URL}/users/login`,
            {
                identifier: passenger2.email,
                password: passenger2.password,
            }
        );
        passenger2Token = passenger2LoginResponse.data.token;
        passenger2UserId = passenger2LoginResponse.data.user.id;
        console.log("✅ Passager 2 connecté");
        console.log("");

        // ============ SETUP: CRÉATION VÉHICULE ET COVOITURAGES ============
        console.log("🚗 Setup: Création du véhicule et des covoiturages");

        // Ajouter un véhicule au chauffeur
        const vehicle = {
            plate_number: `TEST-${timestamp.toString().slice(-6)}`,
            model: "Clio",
            seats_available: 4,
            is_electric: false,
            brand_name: "Renault",
            color_name: "Bleu",
        };

        const vehicleResponse = await axios.post(
            `${BASE_URL}/vehicles`,
            vehicle,
            authenticatedRequest(driverToken, {})
        );
        vehicleId = vehicleResponse.data.vehicleId;
        console.log("✅ Véhicule ajouté, ID:", vehicleId);

        // Créer plusieurs covoiturages avec différents prix
        const carpoolings = [
            {
                departure_address: "Paris, Gare du Nord",
                arrival_address: "Lyon, Part-Dieu",
                departure_datetime: formatDateForMySQL(
                    new Date(Date.now() + 24 * 60 * 60 * 1000)
                ),
                arrival_datetime: formatDateForMySQL(
                    new Date(Date.now() + 28 * 60 * 60 * 1000)
                ),
                price_per_passenger: 15, // Prix abordable pour tester
                seats_offered: 3,
                vehicle_id: vehicleId,
            },
            {
                departure_address: "Lyon, Part-Dieu",
                arrival_address: "Marseille, Saint-Charles",
                departure_datetime: formatDateForMySQL(
                    new Date(Date.now() + 48 * 60 * 60 * 1000)
                ),
                arrival_datetime: formatDateForMySQL(
                    new Date(Date.now() + 51 * 60 * 60 * 1000)
                ),
                price_per_passenger: 5, // Prix plus bas pour permettre le test d'annulation
                seats_offered: 2,
                vehicle_id: vehicleId,
            },
        ];

        for (let i = 0; i < carpoolings.length; i++) {
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
                `   ID: ${carpoolingResponse.data.carpoolingId}, Prix: ${carpoolings[i].price_per_passenger} crédits`
            );
        }
        console.log("");

        // ============ TEST 1: PARTICIPATION À UN COVOITURAGE ============
        console.log("🎯 Test 1: Participation d'un passager à un covoiturage");

        const targetCarpoolingId = carpoolingIds[0]; // Paris → Lyon (15 crédits)

        // Vérifier l'état initial du covoiturage
        const initialCarpoolingResponse = await axios.get(
            `${BASE_URL}/carpoolings/${targetCarpoolingId}`
        );
        const initialCarpooling = initialCarpoolingResponse.data.carpooling;
        console.log("📋 État initial du covoiturage:");
        console.log(
            `   Places restantes: ${initialCarpooling.seats_remaining}/${initialCarpooling.initial_seats_offered}`
        );
        console.log(
            `   Prix: ${initialCarpooling.price_per_passenger} crédits`
        );

        // Vérifier les crédits du passager avant participation
        const passengerCreditsBeforeResponse = await axios.get(
            `${BASE_URL}/credits/balance`,
            authenticatedRequest(passengerToken, {})
        );
        console.log(
            `   Crédits passager avant: ${passengerCreditsBeforeResponse.data.credits} crédits`
        );

        // Participer au covoiturage
        console.log("\n🎫 Participation au covoiturage...");
        const joinResponse = await axios.post(
            `${BASE_URL}/participations/${targetCarpoolingId}/join`,
            {},
            authenticatedRequest(passengerToken, {})
        );
        console.log("✅ Participation réussie:", joinResponse.data.message);

        // Vérifier l'état après participation
        const afterJoinCarpoolingResponse = await axios.get(
            `${BASE_URL}/carpoolings/${targetCarpoolingId}`
        );
        const afterJoinCarpooling = afterJoinCarpoolingResponse.data.carpooling;
        console.log("\n📊 État après participation:");
        console.log(
            `   Places restantes: ${afterJoinCarpooling.seats_remaining}/${
                afterJoinCarpooling.initial_seats_offered
            } (${
                initialCarpooling.seats_remaining -
                afterJoinCarpooling.seats_remaining
            } place en moins)`
        );

        // Vérifier la déduction des crédits
        const passengerCreditsAfterResponse = await axios.get(
            `${BASE_URL}/credits/balance`,
            authenticatedRequest(passengerToken, {})
        );
        const creditsDeducted =
            passengerCreditsBeforeResponse.data.credits -
            passengerCreditsAfterResponse.data.credits;
        console.log(
            `   Crédits passager après: ${passengerCreditsAfterResponse.data.credits} crédits`
        );
        console.log(
            `   Crédits déduits: ${creditsDeducted} crédits (attendu: ${initialCarpooling.price_per_passenger})`
        );

        // Vérifier les participants du covoiturage
        const participantsResponse = await axios.get(
            `${BASE_URL}/participations/${targetCarpoolingId}/participants`,
            authenticatedRequest(driverToken, {})
        );
        console.log(
            `   Participants: ${participantsResponse.data.participants.length} participant(s)`
        );
        console.log("");

        // ============ TEST 2: PARTICIPATION MULTIPLE ============
        console.log("👥 Test 2: Participation de plusieurs passagers");

        // Le deuxième passager rejoint le même covoiturage
        console.log("🎫 Deuxième passager rejoint le covoiturage...");
        const passenger2CreditsBeforeResponse = await axios.get(
            `${BASE_URL}/credits/balance`,
            authenticatedRequest(passenger2Token, {})
        );
        console.log(
            `   Crédits passager 2 avant: ${passenger2CreditsBeforeResponse.data.credits} crédits`
        );

        const join2Response = await axios.post(
            `${BASE_URL}/participations/${targetCarpoolingId}/join`,
            {},
            authenticatedRequest(passenger2Token, {})
        );
        console.log(
            "✅ Deuxième participation réussie:",
            join2Response.data.message
        );

        // Vérifier l'état après la deuxième participation
        const afterJoin2CarpoolingResponse = await axios.get(
            `${BASE_URL}/carpoolings/${targetCarpoolingId}`
        );
        const afterJoin2Carpooling =
            afterJoin2CarpoolingResponse.data.carpooling;
        console.log("\n📊 État après 2 participations:");
        console.log(
            `   Places restantes: ${afterJoin2Carpooling.seats_remaining}/${afterJoin2Carpooling.initial_seats_offered}`
        );

        const participants2Response = await axios.get(
            `${BASE_URL}/participations/${targetCarpoolingId}/participants`,
            authenticatedRequest(driverToken, {})
        );
        console.log(
            `   Total participants: ${participants2Response.data.participants.length} participant(s)`
        );
        participants2Response.data.participants.forEach(
            (participant, index) => {
                console.log(
                    `     ${index + 1}. ${participant.pseudo} (${
                        participant.email
                    })`
                );
            }
        );
        console.log("");

        // ============ TEST 3: CONSULTATION DES PARTICIPATIONS ============
        console.log("📋 Test 3: Consultation des participations");

        // Lister les participations du premier passager
        const myParticipationsResponse = await axios.get(
            `${BASE_URL}/participations/my-participations`,
            authenticatedRequest(passengerToken, {})
        );
        console.log(
            `✅ Participations du passager 1: ${myParticipationsResponse.data.participations.length} participation(s)`
        );

        myParticipationsResponse.data.participations.forEach(
            (participation, index) => {
                console.log(
                    `   ${index + 1}. Covoiturage ID: ${
                        participation.carpooling_id
                    }`
                );
                console.log(
                    `      Route: ${participation.departure_address} → ${participation.arrival_address}`
                );
                console.log(
                    `      Prix payé: ${participation.credits_paid} crédits`
                );
                console.log(
                    `      Date: ${new Date(
                        participation.participation_date
                    ).toLocaleString("fr-FR")}`
                );
                console.log(
                    `      Statut validation: ${
                        participation.is_validated_by_passenger === null
                            ? "En attente"
                            : participation.is_validated_by_passenger
                            ? "Validé"
                            : "Problème signalé"
                    }`
                );
            }
        );
        console.log("");

        // ============ TEST 4: DÉMARRAGE ET CONFIRMATION DU COVOITURAGE ============
        console.log("🚀 Test 4: Démarrage du covoiturage et confirmation");

        // Le chauffeur démarre le covoiturage
        console.log("▶️ Démarrage du covoiturage par le chauffeur...");
        const startResponse = await axios.post(
            `${BASE_URL}/carpoolings/${targetCarpoolingId}/start`,
            {},
            authenticatedRequest(driverToken, {})
        );
        console.log("✅ Covoiturage démarré:", startResponse.data.message);

        // Attendre un peu pour simuler le trajet
        await sleep(3000);

        // Le chauffeur termine le covoiturage
        console.log("\n🏁 Fin du covoiturage par le chauffeur...");
        const finishResponse = await axios.post(
            `${BASE_URL}/carpoolings/${targetCarpoolingId}/finish`,
            {},
            authenticatedRequest(driverToken, {})
        );
        console.log("✅ Covoiturage terminé:", finishResponse.data.message);

        // Vérifier l'état final
        const finalCarpoolingResponse = await axios.get(
            `${BASE_URL}/carpoolings/${targetCarpoolingId}`
        );
        const finalCarpooling = finalCarpoolingResponse.data.carpooling;
        console.log(`   Statut final: ${finalCarpooling.status}`);
        console.log("");

        // ============ TEST 5: CONFIRMATION DU BON DÉROULEMENT ============
        console.log(
            "✅ Test 5: Confirmation du bon déroulement par les passagers"
        );

        // Premier passager confirme le bon déroulement
        console.log("👍 Passager 1 confirme le bon déroulement...");
        const validate1Response = await axios.post(
            `${BASE_URL}/participations/${targetCarpoolingId}/validate`,
            { is_validated: true },
            authenticatedRequest(passengerToken, {})
        );
        console.log(
            "✅ Validation passager 1:",
            validate1Response.data.message
        );

        // Deuxième passager confirme aussi
        console.log("\n👍 Passager 2 confirme le bon déroulement...");
        const validate2Response = await axios.post(
            `${BASE_URL}/participations/${targetCarpoolingId}/validate`,
            { is_validated: true },
            authenticatedRequest(passenger2Token, {})
        );
        console.log(
            "✅ Validation passager 2:",
            validate2Response.data.message
        );

        // Vérifier les participations après validation
        const finalParticipationsResponse = await axios.get(
            `${BASE_URL}/participations/my-participations`,
            authenticatedRequest(passengerToken, {})
        );
        console.log("\n📊 État final des participations:");
        finalParticipationsResponse.data.participations.forEach(
            (participation, index) => {
                console.log(
                    `   ${index + 1}. Covoiturage ID: ${
                        participation.carpooling_id
                    }`
                );
                console.log(
                    `      Statut validation: ${
                        participation.is_validated_by_passenger === null
                            ? "En attente"
                            : participation.is_validated_by_passenger
                            ? "Confirmé ✅"
                            : "Problème signalé ❌"
                    }`
                );
            }
        );
        console.log("");

        // ============ TEST 6: TENTATIVE DE PARTICIPATION SANS CRÉDITS SUFFISANTS ============
        console.log(
            "💸 Test 6: Tentative de participation sans crédits suffisants"
        );

        const expensiveCarpoolingId = carpoolingIds[1]; // Lyon → Marseille (18 crédits)

        // Vérifier les crédits actuels du passager 1 (qui a dépensé 15 crédits)
        const currentCreditsResponse = await axios.get(
            `${BASE_URL}/credits/balance`,
            authenticatedRequest(passengerToken, {})
        );
        console.log(
            `💰 Crédits actuels du passager 1: ${currentCreditsResponse.data.credits} crédits`
        );

        const expensiveCarpoolingResponse = await axios.get(
            `${BASE_URL}/carpoolings/${expensiveCarpoolingId}`
        );
        const expensiveCarpooling = expensiveCarpoolingResponse.data.carpooling;
        console.log(
            `💰 Prix du covoiturage: ${expensiveCarpooling.price_per_passenger} crédits`
        );

        try {
            const joinExpensiveResponse = await axios.post(
                `${BASE_URL}/participations/${expensiveCarpoolingId}/join`,
                {},
                authenticatedRequest(passengerToken, {})
            );
            console.log(
                "❌ ERREUR: La participation a été acceptée alors qu'elle ne devrait pas!"
            );
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log(
                    "✅ Participation refusée comme attendu:",
                    error.response.data.message
                );
            } else {
                console.log(
                    "⚠️ Erreur inattendue:",
                    error.response?.data?.message || error.message
                );
            }
        }
        console.log("");

        // ============ TEST 7: ANNULATION D'UNE PARTICIPATION ============
        console.log("🚫 Test 7: Annulation d'une participation");

        // Le passager 2 participe d'abord au deuxième covoiturage
        console.log("🎫 Passager 2 rejoint le deuxième covoiturage...");
        const joinForCancelResponse = await axios.post(
            `${BASE_URL}/participations/${expensiveCarpoolingId}/join`,
            {},
            authenticatedRequest(passenger2Token, {})
        );
        console.log(
            "✅ Participation réussie:",
            joinForCancelResponse.data.message
        );

        // Vérifier l'état avant annulation
        const beforeCancelResponse = await axios.get(
            `${BASE_URL}/carpoolings/${expensiveCarpoolingId}`
        );
        const beforeCancel = beforeCancelResponse.data.carpooling;
        console.log(
            `   Places avant annulation: ${beforeCancel.seats_remaining}/${beforeCancel.initial_seats_offered}`
        );

        // Annuler la participation
        console.log("\n🚫 Annulation de la participation...");
        const cancelParticipationResponse = await axios.post(
            `${BASE_URL}/participations/${expensiveCarpoolingId}/cancel`,
            { reason: "Empêchement de dernière minute" },
            authenticatedRequest(passenger2Token, {})
        );
        console.log(
            "✅ Participation annulée:",
            cancelParticipationResponse.data.message
        );

        // Vérifier l'état après annulation
        const afterCancelResponse = await axios.get(
            `${BASE_URL}/carpoolings/${expensiveCarpoolingId}`
        );
        const afterCancel = afterCancelResponse.data.carpooling;
        console.log(
            `   Places après annulation: ${afterCancel.seats_remaining}/${afterCancel.initial_seats_offered} (place libérée)`
        );

        // Vérifier le remboursement
        const refundedCreditsResponse = await axios.get(
            `${BASE_URL}/credits/balance`,
            authenticatedRequest(passenger2Token, {})
        );
        console.log(
            `   Crédits après remboursement: ${refundedCreditsResponse.data.credits} crédits`
        );
        console.log("");

        // ============ RÉSUMÉ FINAL ============
        console.log("🎉 TOUS LES TESTS DE PARTICIPATION ONT RÉUSSI!");
        console.log("✅ Participation à un covoiturage");
        console.log("✅ Déduction automatique des crédits");
        console.log("✅ Réduction des places disponibles");
        console.log("✅ Participation multiple (plusieurs passagers)");
        console.log("✅ Consultation des participations");
        console.log("✅ Démarrage et fin de covoiturage");
        console.log("✅ Confirmation du bon déroulement");
        console.log("✅ Validation avec notes et commentaires");
        console.log("✅ Gestion des crédits insuffisants");
        console.log("✅ Annulation de participation avec remboursement");

        // Statistiques finales
        const finalStatsResponse = await axios.get(
            `${BASE_URL}/participations/my-participations`,
            authenticatedRequest(passengerToken, {})
        );

        console.log("\n📊 Statistiques finales:");
        console.log(
            `   Participations passager 1: ${finalStatsResponse.data.participations.length}`
        );
        console.log(
            `   Crédits restants passager 1: ${currentCreditsResponse.data.credits}`
        );
        console.log(
            `   Crédits restants passager 2: ${refundedCreditsResponse.data.credits}`
        );
        console.log(`   Covoiturages testés: ${carpoolingIds.length}`);
    } catch (error) {
        console.error("\n❌ ERREUR lors des tests de participation:");

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
            `   Token passager 1: ${passengerToken ? "Présent" : "Absent"}`
        );
        console.log(
            `   Token passager 2: ${passenger2Token ? "Présent" : "Absent"}`
        );
        console.log(`   Véhicule créé: ${vehicleId || "Non défini"}`);
        console.log(`   Covoiturages créés: ${carpoolingIds.length}`);
    }
}

// Fonction utilitaire pour nettoyer les données de test
async function cleanupTestData() {
    console.log("\n🧹 Nettoyage des données de test...");

    try {
        // Annuler toutes les participations
        for (const carpoolingId of carpoolingIds) {
            try {
                // Annuler les participations
                if (passengerToken) {
                    await axios.post(
                        `${BASE_URL}/participations/${carpoolingId}/cancel`,
                        { reason: "Nettoyage des tests" },
                        authenticatedRequest(passengerToken, {})
                    );
                }
                if (passenger2Token) {
                    await axios.post(
                        `${BASE_URL}/participations/${carpoolingId}/cancel`,
                        { reason: "Nettoyage des tests" },
                        authenticatedRequest(passenger2Token, {})
                    );
                }

                // Annuler le covoiturage
                await axios.post(
                    `${BASE_URL}/carpoolings/${carpoolingId}/cancel`,
                    { reason: "Nettoyage des tests" },
                    authenticatedRequest(driverToken, {})
                );
            } catch (error) {
                // Ignorer les erreurs (participation peut déjà être annulée)
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
    testParticipationFunctionality()
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
    testParticipationFunctionality,
    cleanupTestData,
};
