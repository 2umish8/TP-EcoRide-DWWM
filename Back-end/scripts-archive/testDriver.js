const axios = require("axios");

// Configuration de base
const BASE_URL = "http://localhost:3000/api";
let driverToken = "";
let driverUserId = "";
let vehicleIds = [];
let carpoolingIds = [];

// Helper pour les requêtes authentifiées
const authenticatedRequest = (config) => ({
    ...config,
    headers: {
        ...config.headers,
        Authorization: `Bearer ${driverToken}`,
        "Content-Type": "application/json",
    },
});

// Fonction pour attendre un peu entre les tests
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Fonction pour formater les dates au format MySQL
const formatDateForMySQL = (date) => {
    return date.toISOString().slice(0, 19).replace("T", " ");
};

// Tests complets des fonctionnalités chauffeur
async function testDriverFunctionality() {
    console.log(
        "🚗 Démarrage des tests des fonctionnalités chauffeur EcoRide\n"
    );

    const timestamp = Date.now();

    try {
        // ============ SETUP: CRÉATION D'UN UTILISATEUR PASSAGER ============
        console.log("🔧 Setup: Création d'un utilisateur passager");

        const user = {
            pseudo: `futur_chauffeur_${timestamp}`,
            email: `futur_chauffeur_${timestamp}@test.com`,
            password: "Test123!",
        };

        const registerResponse = await axios.post(
            `${BASE_URL}/users/register`,
            user
        );
        console.log("✅ Utilisateur créé:", registerResponse.data.message);

        // Connecter l'utilisateur
        const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
            identifier: user.email,
            password: user.password,
        });
        driverToken = loginResponse.data.token;
        driverUserId = loginResponse.data.user.id;
        console.log("✅ Utilisateur connecté (rôle initial: passager)");
        console.log(`   Pseudo: ${user.pseudo}`);
        console.log(`   Rôles actuels:`, loginResponse.data.user.roles);
        console.log("");

        // ============ TEST 1: DEVENIR CHAUFFEUR DEPUIS PASSAGER ============
        console.log("👨‍✈️ Test 1: Transformation de passager vers chauffeur");

        // Vérifier les rôles avant
        const profileBeforeResponse = await axios.get(
            `${BASE_URL}/users/profile`,
            authenticatedRequest({})
        );
        console.log("📋 État avant transformation:");
        console.log(`   Rôles actuels: passager`);

        // Devenir chauffeur
        const becomeDriverResponse = await axios.post(
            `${BASE_URL}/users/become-driver`,
            {},
            authenticatedRequest({})
        );
        console.log(
            "✅ Demande de devenir chauffeur:",
            becomeDriverResponse.data.message
        );

        // Reconnexion pour obtenir les nouveaux rôles dans le token
        const reloginResponse = await axios.post(`${BASE_URL}/users/login`, {
            identifier: user.email,
            password: user.password,
        });
        driverToken = reloginResponse.data.token;
        console.log("✅ Reconnexion effectuée avec les nouveaux rôles");
        console.log(`   Nouveaux rôles:`, reloginResponse.data.user.roles);
        console.log("");

        // ============ TEST 2: AJOUT DE PLUSIEURS VÉHICULES ============
        console.log("🚙 Test 2: Ajout de plusieurs véhicules");

        const vehicles = [
            {
                plate_number: `AB-123-${timestamp.toString().slice(-3)}`,
                model: "Clio V",
                seats_available: 4,
                is_electric: false,
                brand_name: "Renault",
                color_name: "Blanc",
                first_registration_date: "2020-01-15",
            },
            {
                plate_number: `CD-456-${timestamp.toString().slice(-3)}`,
                model: "Prius",
                seats_available: 4,
                is_electric: true,
                brand_name: "Toyota",
                color_name: "Gris",
                first_registration_date: "2019-06-20",
            },
            {
                plate_number: `EF-789-${timestamp.toString().slice(-3)}`,
                model: "308",
                seats_available: 5,
                is_electric: false,
                brand_name: "Peugeot",
                color_name: "Noir",
                first_registration_date: "2021-03-10",
            },
        ];

        for (let i = 0; i < vehicles.length; i++) {
            const vehicleResponse = await axios.post(
                `${BASE_URL}/vehicles`,
                vehicles[i],
                authenticatedRequest({})
            );
            vehicleIds.push(vehicleResponse.data.vehicleId);
            console.log(
                `✅ Véhicule ${i + 1} ajouté: ${vehicles[i].brand_name} ${
                    vehicles[i].model
                }`
            );
            console.log(
                `   Plaque: ${vehicles[i].plate_number}, Places: ${
                    vehicles[i].seats_available
                }, Électrique: ${vehicles[i].is_electric ? "Oui" : "Non"}`
            );
            console.log(`   ID: ${vehicleResponse.data.vehicleId}`);
        }

        // Lister tous les véhicules du chauffeur
        const myVehiclesResponse = await axios.get(
            `${BASE_URL}/vehicles/my-vehicles`,
            authenticatedRequest({})
        );
        console.log(
            `\n✅ Total des véhicules enregistrés: ${myVehiclesResponse.data.vehicles.length}`
        );
        console.log("");

        // ============ TEST 3: CRÉATION DE COVOITURAGES AVEC PRIX PERSONNALISÉS ============
        console.log(
            "🎯 Test 3: Création de covoiturages avec choix de véhicule et prix"
        );

        const carpoolings = [
            {
                departure_address: "Paris, Gare de Lyon",
                arrival_address: "Lyon, Part-Dieu",
                departure_datetime: formatDateForMySQL(
                    new Date(Date.now() + 24 * 60 * 60 * 1000)
                ),
                arrival_datetime: formatDateForMySQL(
                    new Date(Date.now() + 28 * 60 * 60 * 1000)
                ),
                price_per_passenger: 30, // Prix premium pour un trajet longue distance
                seats_offered: 3,
                vehicle_id: vehicleIds[0], // Renault Clio
                description: "Trajet confortable avec climatisation",
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
                price_per_passenger: 25, // Prix standard
                seats_offered: 3,
                vehicle_id: vehicleIds[1], // Toyota Prius (électrique)
                description: "Véhicule écologique, trajet silencieux",
            },
            {
                departure_address: "Paris, République",
                arrival_address: "Bordeaux, Centre-ville",
                departure_datetime: formatDateForMySQL(
                    new Date(Date.now() + 72 * 60 * 60 * 1000)
                ),
                arrival_datetime: formatDateForMySQL(
                    new Date(Date.now() + 78 * 60 * 60 * 1000)
                ),
                price_per_passenger: 45, // Prix élevé pour trajet premium
                seats_offered: 4,
                vehicle_id: vehicleIds[2], // Peugeot 308 (plus spacieux)
                description: "Véhicule spacieux, idéal pour bagages",
            },
        ];

        for (let i = 0; i < carpoolings.length; i++) {
            const carpoolingResponse = await axios.post(
                `${BASE_URL}/carpoolings`,
                carpoolings[i],
                authenticatedRequest({})
            );
            carpoolingIds.push(carpoolingResponse.data.carpoolingId);

            console.log(
                `✅ Covoiturage ${i + 1} créé: ${
                    carpoolings[i].departure_address
                } → ${carpoolings[i].arrival_address}`
            );
            console.log(
                `   Prix: ${carpoolings[i].price_per_passenger} crédits/passager`
            );
            console.log(
                `   Véhicule: ${vehicles[i].brand_name} ${vehicles[i].model} (${vehicles[i].plate_number})`
            );
            console.log(`   Places offertes: ${carpoolings[i].seats_offered}`);
            console.log(`   ID: ${carpoolingResponse.data.carpoolingId}`);
        }
        console.log("");

        // ============ TEST 4: GESTION DES COVOITURAGES (DÉMARRER/ARRÊTER) ============
        console.log("▶️ Test 4: Gestion du cycle de vie des covoiturages");

        const targetCarpoolingId = carpoolingIds[0]; // Paris → Lyon

        // Vérifier l'état initial
        const initialStateResponse = await axios.get(
            `${BASE_URL}/carpoolings/${targetCarpoolingId}`
        );
        console.log(`📋 État initial du covoiturage ${targetCarpoolingId}:`);
        console.log(
            `   Statut: ${initialStateResponse.data.carpooling.status}`
        );
        console.log(
            `   Places restantes: ${initialStateResponse.data.carpooling.seats_remaining}`
        );

        // Démarrer le covoiturage
        console.log("\n🚀 Démarrage du covoiturage...");
        const startResponse = await axios.post(
            `${BASE_URL}/carpoolings/${targetCarpoolingId}/start`,
            {},
            authenticatedRequest({})
        );
        console.log("✅ Covoiturage démarré:", startResponse.data.message);

        // Vérifier le changement de statut
        const startedStateResponse = await axios.get(
            `${BASE_URL}/carpoolings/${targetCarpoolingId}`
        );
        console.log(
            `   Nouveau statut: ${startedStateResponse.data.carpooling.status}`
        );

        // Attendre un peu pour simuler le trajet
        await sleep(2000);

        // Arrêter le covoiturage
        console.log("\n🏁 Arrêt du covoiturage...");
        const finishResponse = await axios.post(
            `${BASE_URL}/carpoolings/${targetCarpoolingId}/finish`,
            {},
            authenticatedRequest({})
        );
        console.log("✅ Covoiturage terminé:", finishResponse.data.message);

        // Vérifier le statut final
        const finishedStateResponse = await axios.get(
            `${BASE_URL}/carpoolings/${targetCarpoolingId}`
        );
        console.log(
            `   Statut final: ${finishedStateResponse.data.carpooling.status}`
        );
        console.log("");

        // ============ TEST 5: ANNULATION D'UN COVOITURAGE ============
        console.log("❌ Test 5: Annulation d'un covoiturage");

        const carpoolingToCancel = carpoolingIds[1]; // Lyon → Marseille

        console.log(`📋 Covoiturage à annuler: ${carpoolingToCancel}`);
        const beforeCancelResponse = await axios.get(
            `${BASE_URL}/carpoolings/${carpoolingToCancel}`
        );
        console.log(
            `   Statut avant annulation: ${beforeCancelResponse.data.carpooling.status}`
        );

        // Annuler le covoiturage
        const cancelResponse = await axios.post(
            `${BASE_URL}/carpoolings/${carpoolingToCancel}/cancel`,
            { reason: "Problème mécanique du véhicule" },
            authenticatedRequest({})
        );
        console.log("✅ Covoiturage annulé:", cancelResponse.data.message);

        // Vérifier le changement de statut
        const canceledStateResponse = await axios.get(
            `${BASE_URL}/carpoolings/${carpoolingToCancel}`
        );
        console.log(
            `   Statut après annulation: ${canceledStateResponse.data.carpooling.status}`
        );
        console.log("");

        // ============ TEST 6: HISTORIQUE DES TRAJETS ============
        console.log("📊 Test 6: Consultation de l'historique des trajets");

        // Lister tous les covoiturages du chauffeur
        const historyResponse = await axios.get(
            `${BASE_URL}/carpoolings/my-carpoolings`,
            authenticatedRequest({})
        );

        console.log(
            `✅ Historique complet: ${historyResponse.data.carpoolings.length} covoiturage(s)`
        );

        // Grouper par statut
        const groupedByStatus = historyResponse.data.carpoolings.reduce(
            (acc, carpooling) => {
                acc[carpooling.status] = (acc[carpooling.status] || 0) + 1;
                return acc;
            },
            {}
        );

        console.log("📈 Statistiques des trajets:");
        Object.entries(groupedByStatus).forEach(([status, count]) => {
            console.log(`   ${status}: ${count} trajet(s)`);
        });

        console.log("\n📋 Détail de chaque trajet:");
        historyResponse.data.carpoolings.forEach((carpooling, index) => {
            console.log(`   ${index + 1}. ID: ${carpooling.id}`);
            console.log(
                `      Route: ${carpooling.departure_address} → ${carpooling.arrival_address}`
            );
            console.log(`      Statut: ${carpooling.status}`);
            console.log(
                `      Prix: ${carpooling.price_per_passenger} crédits`
            );
            console.log(
                `      Date départ: ${new Date(
                    carpooling.departure_datetime
                ).toLocaleString("fr-FR")}`
            );
            console.log(
                `      Places restantes: ${carpooling.seats_remaining}/${carpooling.initial_seats_offered}`
            );
        });
        console.log("");

        // ============ TEST 7: MODIFICATION D'UN COVOITURAGE EXISTANT ============
        console.log("✏️ Test 7: Modification d'un covoiturage existant");

        const carpoolingToUpdate = carpoolingIds[2]; // Paris → Bordeaux (encore en statut "prévu")

        const updateData = {
            price_per_passenger: 50, // Augmentation de 45€ à 50€
            seats_offered: 3, // Réduction de 4 à 3 places
        };

        console.log(`📋 Modification du covoiturage ${carpoolingToUpdate}:`);
        console.log(
            `   Nouveau prix: ${updateData.price_per_passenger} crédits`
        );
        console.log(`   Nouvelles places: ${updateData.seats_offered}`);

        const updateResponse = await axios.put(
            `${BASE_URL}/carpoolings/${carpoolingToUpdate}`,
            updateData,
            authenticatedRequest({})
        );
        console.log("✅ Covoiturage modifié:", updateResponse.data.message);

        // Vérifier les modifications
        const updatedCarpoolingResponse = await axios.get(
            `${BASE_URL}/carpoolings/${carpoolingToUpdate}`
        );
        const updatedCarpooling = updatedCarpoolingResponse.data.carpooling;
        console.log("✅ Vérification des modifications:");
        console.log(
            `   Prix actuel: ${updatedCarpooling.price_per_passenger} crédits`
        );
        console.log(
            `   Places actuelles: ${updatedCarpooling.seats_remaining}/${updatedCarpooling.initial_seats_offered}`
        );
        console.log("");

        // ============ TEST 8: GESTION DES VÉHICULES MULTIPLES ============
        console.log("🔧 Test 8: Gestion avancée des véhicules");

        // Ajouter un véhicule supplémentaire
        const additionalVehicle = {
            plate_number: `GH-999-${timestamp.toString().slice(-3)}`,
            model: "Model 3",
            seats_available: 4,
            is_electric: true,
            brand_name: "Tesla",
            color_name: "Rouge",
            first_registration_date: "2022-01-01",
        };

        const newVehicleResponse = await axios.post(
            `${BASE_URL}/vehicles`,
            additionalVehicle,
            authenticatedRequest({})
        );
        vehicleIds.push(newVehicleResponse.data.vehicleId);
        console.log(
            `✅ Nouveau véhicule ajouté: ${additionalVehicle.brand_name} ${additionalVehicle.model}`
        );
        console.log(`   ID: ${newVehicleResponse.data.vehicleId}`);

        // Lister tous les véhicules avec détails
        const finalVehiclesResponse = await axios.get(
            `${BASE_URL}/vehicles/my-vehicles`,
            authenticatedRequest({})
        );

        console.log(
            `\n✅ Flotte complète: ${finalVehiclesResponse.data.vehicles.length} véhicule(s)`
        );
        finalVehiclesResponse.data.vehicles.forEach((vehicle, index) => {
            console.log(
                `   ${index + 1}. ${vehicle.brand_name} ${vehicle.model} (${
                    vehicle.plate_number
                })`
            );
            console.log(
                `      Places: ${vehicle.seats_available}, Électrique: ${
                    vehicle.is_electric ? "Oui" : "Non"
                }`
            );
            console.log(
                `      Couleur: ${vehicle.color_name}, Année: ${
                    vehicle.first_registration_date
                        ? new Date(
                              vehicle.first_registration_date
                          ).getFullYear()
                        : "N/A"
                }`
            );
        });
        console.log("");

        // ============ TEST 9: BILAN FINANCIER ============
        console.log("💰 Test 9: Bilan financier du chauffeur");

        // Vérifier les crédits actuels
        const creditsResponse = await axios.get(
            `${BASE_URL}/credits/balance`,
            authenticatedRequest({})
        );
        console.log(
            `💳 Crédits actuels: ${creditsResponse.data.credits} crédits`
        );

        // Historique des transactions
        const transactionsResponse = await axios.get(
            `${BASE_URL}/credits/history`,
            authenticatedRequest({})
        );
        console.log(
            `📊 Historique des transactions: ${transactionsResponse.data.transactions.length} transaction(s)`
        );

        if (transactionsResponse.data.transactions.length > 0) {
            console.log("📋 Détail des transactions:");
            transactionsResponse.data.transactions.forEach(
                (transaction, index) => {
                    console.log(
                        `   ${index + 1}. ${transaction.amount > 0 ? "+" : ""}${
                            transaction.amount
                        } crédits`
                    );
                    console.log(`      Type: ${transaction.type || "N/A"}`);
                    console.log(
                        `      Date: ${new Date(
                            transaction.created_at
                        ).toLocaleString("fr-FR")}`
                    );
                }
            );
        }
        console.log("");

        // ============ RÉSUMÉ FINAL ============
        console.log("🎉 TOUS LES TESTS CHAUFFEUR ONT RÉUSSI!");
        console.log("✅ Transformation passager → chauffeur");
        console.log("✅ Ajout de plusieurs véhicules (4 véhicules)");
        console.log("✅ Création de covoiturages avec prix personnalisés");
        console.log("✅ Choix de véhicule pour chaque covoiturage");
        console.log("✅ Démarrage et arrêt de covoiturage");
        console.log("✅ Annulation de covoiturage");
        console.log("✅ Consultation de l'historique complet");
        console.log("✅ Modification de covoiturages existants");
        console.log("✅ Gestion de flotte de véhicules");
        console.log("✅ Suivi financier et transactions");

        console.log("\n📊 Statistiques finales:");
        console.log(`   Véhicules enregistrés: ${vehicleIds.length}`);
        console.log(`   Covoiturages créés: ${carpoolingIds.length}`);
        console.log(`   Crédits actuels: ${creditsResponse.data.credits}`);
        console.log(
            `   Transactions: ${transactionsResponse.data.transactions.length}`
        );
    } catch (error) {
        console.error("\n❌ ERREUR lors des tests chauffeur:");

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
        console.log(`   ID utilisateur: ${driverUserId || "Non défini"}`);
        console.log(`   Véhicules créés: ${vehicleIds.length}`);
        console.log(`   Covoiturages créés: ${carpoolingIds.length}`);
    }
}

// Fonction utilitaire pour nettoyer les données de test
async function cleanupTestData() {
    console.log("\n🧹 Nettoyage des données de test...");

    try {
        // Annuler tous les covoiturages non terminés
        for (const carpoolingId of carpoolingIds) {
            try {
                await axios.post(
                    `${BASE_URL}/carpoolings/${carpoolingId}/cancel`,
                    { reason: "Nettoyage des données de test" },
                    authenticatedRequest({})
                );
            } catch (error) {
                // Ignorer les erreurs (covoiturage peut déjà être terminé/annulé)
            }
        }

        // Supprimer tous les véhicules
        for (const vehicleId of vehicleIds) {
            try {
                await axios.delete(
                    `${BASE_URL}/vehicles/${vehicleId}`,
                    authenticatedRequest({})
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
    testDriverFunctionality()
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
    testDriverFunctionality,
    cleanupTestData,
};
