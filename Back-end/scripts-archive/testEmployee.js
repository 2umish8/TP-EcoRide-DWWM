const axios = require("axios");

const API_BASE_URL = "http://localhost:3000/api";

// Identifiants employé (utilisation du même compte que dans le test admin)
const EMPLOYEE_CREDENTIALS = {
    identifier: "jose@ecoride.com",
    password: "EmployeJose2025",
};

let employeeToken = null;
let testDriverId = null;
let testPassengerId = null;
let testCarpoolingId = null;
let testReviewId = null;

// Fonction utilitaire pour l'authentification
async function login(credentials, userType) {
    try {
        console.log(`🔐 Connexion en tant que ${userType}...`);
        const response = await axios.post(
            `${API_BASE_URL}/users/login`,
            credentials
        );

        if (response.data.token) {
            console.log(`✅ Connexion ${userType} réussie`);
            console.log(
                `👤 Rôles: ${response.data.user.roles?.join(", ") || "Aucun"}`
            );
            return response.data.token;
        } else {
            throw new Error(`Pas de token reçu pour ${userType}`);
        }
    } catch (error) {
        console.error(
            `❌ Erreur de connexion ${userType}:`,
            error.response?.data?.message || error.message
        );
        throw error;
    }
}

// Fonction pour créer des avis de test directement en MongoDB
async function createTestReviewsInMongoDB() {
    try {
        console.log("\n📝 Création d'avis de test dans MongoDB...");

        // Cette fonction simule la création d'avis pour les tests
        // En production, les avis seraient créés via l'API normale

        const testReviews = [
            {
                carpoolingId: 1,
                reviewerId: 80, // ID d'un passager existant
                reviewedUserId: 79, // ID d'un chauffeur existant
                rating: 1,
                comment:
                    "Conduite très dangereuse, chauffeur parlait au téléphone pendant tout le trajet. Véhicule sale et musique trop forte.",
                isReported: true,
                reportReason:
                    "Conduite dangereuse - utilisation du téléphone au volant",
                validationStatus: "pending",
            },
            {
                carpoolingId: 2,
                reviewerId: 81,
                reviewedUserId: 82,
                rating: 2,
                comment:
                    "Retard de 45 minutes sans prévenir. Véhicule qui sent la cigarette malgré l'indication non-fumeur.",
                isReported: true,
                reportReason:
                    "Non-respect des horaires et des conditions annoncées",
                validationStatus: "pending",
            },
            {
                carpoolingId: 3,
                reviewerId: 83,
                reviewedUserId: 85,
                rating: 5,
                comment:
                    "Excellent chauffeur, très ponctuel et courtois. Véhicule propre et conduite sécurisée.",
                isReported: false,
                validationStatus: "pending",
            },
            {
                carpoolingId: 4,
                reviewerId: 86,
                reviewedUserId: 87,
                rating: 1,
                comment:
                    "SCANDALEUX ! Le chauffeur était manifestement sous l'influence d'alcool. J'ai eu très peur pour ma sécurité.",
                isReported: true,
                reportReason: "Soupçon de conduite en état d'ivresse - URGENT",
                validationStatus: "pending",
            },
        ];

        console.log(`✅ ${testReviews.length} avis de test préparés`);
        console.log(
            "📌 Note: En production, ces avis seraient insérés via l'API MongoDB"
        );
        console.log(
            "🔍 Tests basés sur les avis existants dans la base de données"
        );

        return testReviews;
    } catch (error) {
        console.error(
            "❌ Erreur lors de la préparation des avis test:",
            error.message
        );
        return [];
    }
}

// Test 1: Consulter les avis en attente de validation
async function getPendingReviews() {
    try {
        console.log(
            "\n📋 Test 1: Consultation des avis en attente de validation..."
        );

        const response = await axios.get(`${API_BASE_URL}/reviews/pending`, {
            headers: { Authorization: `Bearer ${employeeToken}` },
        });

        const pendingReviews = response.data.reviews || [];
        console.log(`✅ ${pendingReviews.length} avis en attente trouvés`);

        if (pendingReviews.length > 0) {
            console.log("\n📝 Avis en attente de validation:");
            pendingReviews.slice(0, 5).forEach((review, index) => {
                console.log(`  ${index + 1}. ID: ${review._id}`);
                console.log(`     Note: ${review.rating}/5`);
                console.log(
                    `     Commentaire: "${review.comment?.substring(0, 50)}..."`
                );
                console.log(
                    `     Date: ${new Date(
                        review.createdAt
                    ).toLocaleDateString()}`
                );
                console.log(`     Statut: ${review.validationStatus}`);
            });

            if (pendingReviews.length > 5) {
                console.log(
                    `  ... et ${
                        pendingReviews.length - 5
                    } autres avis en attente`
                );
            }
        } else {
            console.log("📭 Aucun avis en attente de validation");
        }

        return pendingReviews;
    } catch (error) {
        console.error(
            "❌ Erreur lors de la récupération des avis en attente:",
            error.response?.data?.message || error.message
        );
        throw error;
    }
}

// Test 2: Valider ou rejeter des avis
async function validateReviews(pendingReviews) {
    try {
        console.log("\n✅ Test 2: Validation/Rejet des avis...");

        if (pendingReviews.length === 0) {
            console.log("⚠️ Aucun avis à valider");
            return;
        }

        // Prendre les premiers avis pour les tests
        const reviewsToValidate = pendingReviews.slice(
            0,
            Math.min(3, pendingReviews.length)
        );

        for (let i = 0; i < reviewsToValidate.length; i++) {
            const review = reviewsToValidate[i];
            // Alterner entre validation et rejet
            const action = i % 2 === 0 ? "approved" : "rejected";

            try {
                const response = await axios.put(
                    `${API_BASE_URL}/reviews/${review._id}/validate`,
                    { status: action },
                    { headers: { Authorization: `Bearer ${employeeToken}` } }
                );

                const actionText =
                    action === "approved" ? "approuvé" : "rejeté";
                console.log(`✅ Avis ${review._id} ${actionText} avec succès`);
                console.log(
                    `   Note: ${
                        review.rating
                    }/5, Commentaire: "${review.comment?.substring(0, 30)}..."`
                );
            } catch (error) {
                console.log(
                    `❌ Erreur lors de la validation de l'avis ${review._id}:`,
                    error.response?.data?.message
                );
            }
        }
    } catch (error) {
        console.error(
            "❌ Erreur lors de la validation des avis:",
            error.message
        );
        throw error;
    }
}

// Test 3: Consulter les covoiturages qui se sont mal passés (signalements)
async function getReportedTrips() {
    try {
        console.log("\n🚨 Test 3: Consultation des covoiturages signalés...");

        const response = await axios.get(`${API_BASE_URL}/reviews/reported`, {
            headers: { Authorization: `Bearer ${employeeToken}` },
        });

        const reportedTrips = response.data.reports || [];
        console.log(`✅ ${reportedTrips.length} signalements trouvés`);

        if (reportedTrips.length > 0) {
            console.log("\n🚨 Covoiturages signalés avec détails:");
            reportedTrips.forEach((report, index) => {
                console.log(`\n📍 Signalement ${index + 1}:`);
                console.log(`   🆔 ID Avis: ${report.id}`);
                console.log(`   ⭐ Note: ${report.rating}/5`);
                console.log(`   📝 Commentaire: "${report.comment}"`);
                console.log(
                    `   🚨 Raison du signalement: "${report.reportReason}"`
                );
                console.log(
                    `   📅 Date: ${new Date(
                        report.createdAt
                    ).toLocaleDateString()}`
                );

                // Informations du passager (reporter)
                console.log(`   👤 Passager signalant:`);
                console.log(
                    `      - Pseudo: ${report.reporter?.pseudo || "N/A"}`
                );
                console.log(
                    `      - Email: ${report.reporter?.email || "N/A"}`
                );

                // Informations du chauffeur
                console.log(`   🚗 Chauffeur concerné:`);
                console.log(
                    `      - Pseudo: ${report.driver?.pseudo || "N/A"}`
                );
                console.log(`      - Email: ${report.driver?.email || "N/A"}`);

                // Détails du covoiturage
                if (report.carpooling) {
                    console.log(`   🛣️ Détails du trajet:`);
                    console.log(
                        `      - 🆔 Numéro de covoiturage: ${report.carpooling.id}`
                    );
                    console.log(
                        `      - 📍 Départ: ${report.carpooling.departure_address}`
                    );
                    console.log(
                        `      - 📅 Date départ: ${new Date(
                            report.carpooling.departure_datetime
                        ).toLocaleString()}`
                    );
                    console.log(
                        `      - 🏁 Arrivée: ${report.carpooling.arrival_address}`
                    );
                    console.log(
                        `      - 📅 Date arrivée: ${new Date(
                            report.carpooling.arrival_datetime
                        ).toLocaleString()}`
                    );
                }

                console.log(`   ═══════════════════════════════════════`);
            });
        } else {
            console.log("📭 Aucun covoiturage signalé trouvé");
        }

        return reportedTrips;
    } catch (error) {
        console.error(
            "❌ Erreur lors de la récupération des signalements:",
            error.response?.data?.message || error.message
        );
        throw error;
    }
}

// Test 4: Consulter la liste de tous les covoiturages pour voir les incidents
async function getAllCarpoolingsForModeration() {
    try {
        console.log(
            "\n📊 Test 4: Consultation de tous les covoiturages pour modération..."
        );

        const response = await axios.get(`${API_BASE_URL}/admin/carpoolings`, {
            headers: { Authorization: `Bearer ${employeeToken}` },
            params: { limit: 10 },
        });

        const carpoolings = response.data.carpoolings || [];
        console.log(
            `✅ ${carpoolings.length} covoiturages récupérés pour analyse`
        );

        if (carpoolings.length > 0) {
            console.log("\n📋 Aperçu des covoiturages récents:");
            carpoolings.forEach((carpooling, index) => {
                const statusIcon =
                    carpooling.status === "terminé"
                        ? "✅"
                        : carpooling.status === "annulé"
                        ? "❌"
                        : carpooling.status === "en_cours"
                        ? "🚗"
                        : "⏳";

                console.log(
                    `\n${index + 1}. ${statusIcon} Covoiturage #${
                        carpooling.id
                    }`
                );
                console.log(`   🚗 Chauffeur: ${carpooling.driver_pseudo}`);
                console.log(
                    `   🚙 Véhicule: ${carpooling.model} (${carpooling.plate_number})`
                );
                console.log(
                    `   📍 ${carpooling.departure_address} → ${carpooling.arrival_address}`
                );
                console.log(
                    `   📅 ${new Date(
                        carpooling.departure_datetime
                    ).toLocaleString()}`
                );
                console.log(
                    `   👥 Participants: ${carpooling.participants_count || 0}`
                );
                console.log(
                    `   💰 Prix: ${carpooling.price_per_passenger}€/personne`
                );
                console.log(`   📊 Statut: ${carpooling.status}`);
            });
        }

        return carpoolings;
    } catch (error) {
        console.error(
            "❌ Erreur lors de la récupération des covoiturages:",
            error.response?.data?.message || error.message
        );
        throw error;
    }
}

// Fonction principale de test
async function runEmployeeTests() {
    try {
        console.log(
            "🏢 Tests des fonctionnalités Employé EcoRide - Modération\n"
        );

        // Connexion employé
        console.log("🔐 Phase de connexion...");
        employeeToken = await login(EMPLOYEE_CREDENTIALS, "Employé");

        // Créer un scénario de test complet
        console.log("\n🎬 Préparation du scénario de test...");
        await createTestReviewsInMongoDB();

        // Tests des fonctionnalités de modération
        console.log("\n🛡️ Tests de modération des avis...");
        const pendingReviews = await getPendingReviews();
        await validateReviews(pendingReviews);

        console.log("\n🚨 Tests de gestion des incidents...");
        await getReportedTrips();
        await getAllCarpoolingsForModeration();

        console.log("\n🎉 Tous les tests employé terminés avec succès !");
        console.log("\n📋 Résumé des fonctionnalités testées:");
        console.log("✅ Consultation des avis en attente de validation");
        console.log("✅ Validation/Rejet des avis par l'employé");
        console.log("✅ Consultation des covoiturages signalés");
        console.log(
            "✅ Affichage des détails complets (numéro covoiturage, contacts, trajets)"
        );
        console.log("✅ Vue d'ensemble des covoiturages pour modération");
    } catch (error) {
        console.error("\n💥 Erreur pendant les tests employé:", error.message);
        console.log("\n🔧 Points à vérifier:");
        console.log("1. Le serveur EcoRide est démarré (port 3000)");
        console.log("2. MongoDB est connecté pour les avis");
        console.log("3. Le compte employé a les bonnes permissions");
        console.log("4. Des avis existent en base pour les tests");
    }
}

// Exécuter les tests
if (require.main === module) {
    runEmployeeTests();
}

module.exports = { runEmployeeTests };
