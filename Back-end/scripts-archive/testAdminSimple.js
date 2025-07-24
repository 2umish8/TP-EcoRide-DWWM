const axios = require("axios");

const API_BASE_URL = "http://localhost:3000/api";

// Identifiants avec la règle: pseudo en PascalCase2025
const ADMIN_CREDENTIALS = {
    identifier: "admin@ecoride.com",
    password: "AdminEco2025",
};

const EMPLOYEE_CREDENTIALS = {
    identifier: "jose@ecoride.com",
    password: "EmployeJose2025",
};

let adminToken = null;
let employeeToken = null;
let createdEmployeeId = null;
let testUserId = null;

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

// 1. Test: Créer un compte d'employé
async function createEmployeeAccount() {
    try {
        console.log(
            "\n📝 Test 1: Création d'un compte d'employé par l'admin..."
        );

        const newEmployee = {
            pseudo: `Employe_Test_${Date.now()}`,
            email: `employe_test_${Date.now()}@ecoride.com`,
            password: "EmployeTest2025",
        };

        // Créer l'utilisateur de base
        const createResponse = await axios.post(
            `${API_BASE_URL}/users/register`,
            newEmployee
        );
        console.log("✅ Utilisateur de base créé");

        // Récupérer l'ID de l'utilisateur créé
        const usersResponse = await axios.get(`${API_BASE_URL}/admin/users`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });

        const createdUser = usersResponse.data.users.find(
            (user) => user.email === newEmployee.email
        );

        if (!createdUser) {
            throw new Error("Utilisateur créé non trouvé");
        }

        createdEmployeeId = createdUser.id;
        console.log(`📋 ID de l'utilisateur créé: ${createdEmployeeId}`);

        // Attribuer le rôle d'employé (utiliser 'employe' comme dans la DB)
        const roleResponse = await axios.put(
            `${API_BASE_URL}/admin/users/${createdEmployeeId}/roles`,
            { roles: ["employe", "passager"] },
            { headers: { Authorization: `Bearer ${adminToken}` } }
        );

        console.log("✅ Rôle employé attribué avec succès");
        console.log(
            `📧 Nouvel employé: ${newEmployee.email} / ${newEmployee.password}`
        );

        return {
            id: createdEmployeeId,
            email: newEmployee.email,
            password: newEmployee.password,
            pseudo: newEmployee.pseudo,
        };
    } catch (error) {
        console.error(
            "❌ Erreur lors de la création du compte employé:",
            error.response?.data?.message || error.message
        );
        if (error.response?.data) {
            console.error("Détails:", error.response.data);
        }
        throw error;
    }
}

// 2. Test: Consulter les statistiques (nombre de covoiturages, crédits, etc.)
async function getPlatformStatistics() {
    try {
        console.log(
            "\n📊 Test 2: Consultation des statistiques de la plateforme..."
        );

        const response = await axios.get(`${API_BASE_URL}/admin/stats`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });

        const stats = response.data;
        console.log("✅ Statistiques récupérées avec succès:");
        console.log(`📈 Nombre total d'utilisateurs: ${stats.totalUsers}`);
        console.log(
            `🚗 Nombre total de covoiturages: ${stats.totalCarpoolings}`
        );
        console.log(
            `👥 Nombre total de participations: ${stats.totalParticipations}`
        );
        console.log(
            `💰 Commission totale générée: ${
                stats.totalCommission || 0
            } crédits`
        );
        console.log(`🚙 Nombre total de véhicules: ${stats.totalVehicles}`);

        console.log("\n📋 Répartition par rôle:");
        stats.roleStats.forEach((role) => {
            console.log(`  - ${role.name}: ${role.count} utilisateurs`);
        });

        console.log("\n📊 Covoiturages par statut:");
        stats.carpoolingStats.forEach((status) => {
            console.log(`  - ${status.status}: ${status.count} covoiturages`);
        });

        return stats;
    } catch (error) {
        console.error(
            "❌ Erreur lors de la récupération des statistiques:",
            error.response?.data?.message || error.message
        );
        throw error;
    }
}

// 3. Test: Analyser les covoiturages par jour et crédits gagnés
async function getCarpoolingAnalytics() {
    try {
        console.log(
            "\n📈 Test 3: Analyse des covoiturages par jour et crédits..."
        );

        const response = await axios.get(`${API_BASE_URL}/admin/carpoolings`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });

        const carpoolings = response.data.carpoolings;
        console.log(`✅ ${carpoolings.length} covoiturages analysés`);

        // Analyser par jour
        const dailyStats = {};
        let totalCreditsGenerated = 0;
        let totalPlatformCommission = 0;

        carpoolings.forEach((carpooling) => {
            const date = new Date(carpooling.departure_datetime)
                .toISOString()
                .split("T")[0];

            if (!dailyStats[date]) {
                dailyStats[date] = {
                    count: 0,
                    participantsTotal: 0,
                    creditsGenerated: 0,
                    platformCommission: 0,
                };
            }

            dailyStats[date].count++;

            const participants = carpooling.participants_count || 0;
            const pricePerPassenger = carpooling.price_per_passenger || 0;
            const creditsGenerated = participants * pricePerPassenger;
            const commission = carpooling.platform_commission_earned || 0;

            dailyStats[date].participantsTotal += participants;
            dailyStats[date].creditsGenerated += creditsGenerated;
            dailyStats[date].platformCommission += commission;

            totalCreditsGenerated += creditsGenerated;
            totalPlatformCommission += commission;
        });

        console.log("\n📅 Statistiques par jour:");
        Object.entries(dailyStats)
            .sort()
            .forEach(([date, stats]) => {
                console.log(`  📆 ${date}:`);
                console.log(`    - Covoiturages: ${stats.count}`);
                console.log(
                    `    - Participants total: ${stats.participantsTotal}`
                );
                console.log(`    - Crédits générés: ${stats.creditsGenerated}`);
                console.log(
                    `    - Commission plateforme: ${stats.platformCommission}`
                );
            });

        console.log("\n💰 Totaux généraux:");
        console.log(`  - Crédits totaux générés: ${totalCreditsGenerated}`);
        console.log(
            `  - Commission totale plateforme: ${totalPlatformCommission}`
        );

        return { dailyStats, totalCreditsGenerated, totalPlatformCommission };
    } catch (error) {
        console.error(
            "❌ Erreur lors de l'analyse des covoiturages:",
            error.response?.data?.message || error.message
        );
        throw error;
    }
}

// 4. Test: Suspendre un compte utilisateur
async function suspendUserAccount() {
    try {
        console.log("\n🚫 Test 4: Suspension d'un compte utilisateur...");

        // Créer un utilisateur test à suspendre
        const testUser = {
            pseudo: `UserSuspend_${Date.now()}`,
            email: `suspend_test_${Date.now()}@test.com`,
            password: "TestUser2025",
        };

        await axios.post(`${API_BASE_URL}/users/register`, testUser);
        console.log("✅ Utilisateur test créé pour suspension");

        // Récupérer l'ID de l'utilisateur
        const usersResponse = await axios.get(`${API_BASE_URL}/admin/users`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });

        const createdUser = usersResponse.data.users.find(
            (user) => user.email === testUser.email
        );
        testUserId = createdUser.id;

        // Suspendre l'utilisateur
        const suspendResponse = await axios.put(
            `${API_BASE_URL}/admin/users/${testUserId}/suspension`,
            {
                suspended: true,
                reason: "Test de suspension administrative",
            },
            { headers: { Authorization: `Bearer ${adminToken}` } }
        );

        console.log("✅ Utilisateur suspendu avec succès");
        console.log(`📝 Raison: Test de suspension administrative`);

        // Vérifier la suspension
        const verifyResponse = await axios.get(`${API_BASE_URL}/admin/users`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });

        const suspendedUser = verifyResponse.data.users.find(
            (user) => user.id == testUserId
        );

        if (suspendedUser && suspendedUser.suspended == 1) {
            console.log("✅ Suspension confirmée dans la base de données");
        } else {
            console.log("⚠️ Suspension non confirmée");
        }

        return testUserId;
    } catch (error) {
        console.error(
            "❌ Erreur lors de la suspension:",
            error.response?.data?.message || error.message
        );
        throw error;
    }
}

// 5. Test: Suspendre un compte d'employé
async function suspendEmployeeAccount() {
    try {
        console.log("\n🚫 Test 5: Suspension d'un compte d'employé...");

        if (!createdEmployeeId) {
            console.log("⚠️ Aucun employé créé à suspendre");
            return;
        }

        const response = await axios.put(
            `${API_BASE_URL}/admin/users/${createdEmployeeId}/suspension`,
            {
                suspended: true,
                reason: "Suspension temporaire pour audit",
            },
            { headers: { Authorization: `Bearer ${adminToken}` } }
        );

        console.log("✅ Compte employé suspendu avec succès");
        console.log(`📝 Raison: Suspension temporaire pour audit`);

        return response.data;
    } catch (error) {
        console.error(
            "❌ Erreur lors de la suspension de l'employé:",
            error.response?.data?.message || error.message
        );
        throw error;
    }
}

// 6. Test: Liste de tous les utilisateurs
async function listAllUsers() {
    try {
        console.log("\n📋 Test 6: Liste de tous les utilisateurs...");

        const response = await axios.get(`${API_BASE_URL}/admin/users`, {
            headers: { Authorization: `Bearer ${adminToken}` },
            params: { limit: 20 },
        });

        const users = response.data.users;
        console.log(`✅ ${users.length} utilisateurs récupérés`);

        console.log("\n👥 Aperçu des utilisateurs:");
        users.slice(0, 10).forEach((user) => {
            const status = user.suspended ? "🚫 SUSPENDU" : "✅ ACTIF";
            console.log(
                `  - ${user.pseudo} (${user.email}) - ${
                    user.roles || "Aucun rôle"
                } - ${status}`
            );
        });

        if (users.length > 10) {
            console.log(`  ... et ${users.length - 10} autres utilisateurs`);
        }

        return users;
    } catch (error) {
        console.error(
            "❌ Erreur lors de la récupération des utilisateurs:",
            error.response?.data?.message || error.message
        );
        throw error;
    }
}

// 7. Test: Accès avec compte employé
async function testEmployeeAccess() {
    try {
        console.log("\n🏢 Test 7: Tests d'accès avec compte employé...");

        // Test d'accès aux statistiques
        const statsResponse = await axios.get(`${API_BASE_URL}/admin/stats`, {
            headers: { Authorization: `Bearer ${employeeToken}` },
        });
        console.log("✅ L'employé peut accéder aux statistiques");

        // Test d'accès à la liste des utilisateurs
        const usersResponse = await axios.get(`${API_BASE_URL}/admin/users`, {
            headers: { Authorization: `Bearer ${employeeToken}` },
        });
        console.log("✅ L'employé peut accéder à la liste des utilisateurs");

        // Test de suspension (doit être autorisé)
        if (testUserId) {
            await axios.put(
                `${API_BASE_URL}/admin/users/${testUserId}/suspension`,
                { suspended: false },
                { headers: { Authorization: `Bearer ${employeeToken}` } }
            );
            console.log("✅ L'employé peut gérer les suspensions");
        }

        // Test de gestion des rôles (doit être refusé pour un employé)
        try {
            if (testUserId) {
                await axios.put(
                    `${API_BASE_URL}/admin/users/${testUserId}/roles`,
                    { roles: ["passager"] },
                    { headers: { Authorization: `Bearer ${employeeToken}` } }
                );
                console.log(
                    "⚠️ L'employé a pu modifier les rôles (ne devrait pas être autorisé)"
                );
            }
        } catch (error) {
            if (error.response?.status === 403) {
                console.log(
                    "✅ L'employé ne peut pas modifier les rôles (correct)"
                );
            } else {
                console.log(
                    "⚠️ Erreur inattendue lors du test de gestion des rôles"
                );
            }
        }
    } catch (error) {
        console.error(
            "❌ Erreur lors du test d'accès employé:",
            error.response?.data?.message || error.message
        );
        throw error;
    }
}

// Fonction principale de test
async function runAdminTests() {
    try {
        console.log("🚀 Tests d'administration EcoRide - Janvier 2025\n");

        // Connexions
        console.log("🔐 Phase de connexion...");
        adminToken = await login(ADMIN_CREDENTIALS, "Administrateur");
        employeeToken = await login(EMPLOYEE_CREDENTIALS, "Employé");

        // Tests des fonctionnalités
        await createEmployeeAccount();
        await getPlatformStatistics();
        await getCarpoolingAnalytics();
        await suspendUserAccount();
        await suspendEmployeeAccount();
        await listAllUsers();
        await testEmployeeAccess();

        console.log(
            "\n🎉 Tous les tests d'administration terminés avec succès !"
        );
        console.log("\n📋 Résumé des fonctionnalités testées:");
        console.log("✅ Création de compte d'employé");
        console.log("✅ Consultation des statistiques générales");
        console.log("✅ Analyse des covoiturages par jour");
        console.log("✅ Calcul des crédits gagnés totaux et par jour");
        console.log("✅ Suspension de comptes utilisateur et employé");
        console.log("✅ Gestion des permissions par rôle");
        console.log("✅ Liste et consultation des utilisateurs");
    } catch (error) {
        console.error(
            "\n💥 Erreur pendant les tests d'administration:",
            error.message
        );
        console.log("\n🔧 Points à vérifier:");
        console.log("1. Le serveur EcoRide est démarré (port 3000)");
        console.log("2. La base de données est accessible");
        console.log(
            "3. Les comptes admin/employé existent avec les bons rôles"
        );
        console.log(
            "4. Les mots de passe suivent la règle: PseudoPascalCase2025"
        );
    }
}

// Exécuter les tests
if (require.main === module) {
    runAdminTests();
}

module.exports = { runAdminTests };
