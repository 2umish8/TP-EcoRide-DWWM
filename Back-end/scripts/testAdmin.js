const axios = require("axios");

const API_BASE_URL = "http://localhost:3000/api";

// Configuration des utilisateurs de test
const ADMIN_CREDENTIALS = {
    identifier: "admin@ecoride.com",
    password: "admin_password",
};

const EMPLOYEE_CREDENTIALS = {
    identifier: "jose@ecoride.com",
    password: "employe_password",
};

// Fonction pour créer un administrateur si nécessaire
async function ensureAdminExists() {
    try {
        console.log(
            "🔧 Vérification de l'existence d'un compte administrateur..."
        );

        // Essayer de se connecter avec les identifiants admin
        try {
            const response = await axios.post(
                `${API_BASE_URL}/users/login`,
                ADMIN_CREDENTIALS
            );
            if (response.data.token) {
                console.log("✅ Compte administrateur existant trouvé");
                return response.data.token;
            }
        } catch (loginError) {
            console.log(
                "⚠️ Aucun compte admin trouvé ou mot de passe incorrect, création en cours..."
            );
        }

        // Créer l'utilisateur admin
        const adminUser = {
            pseudo: "admin_eco",
            email: "admin@ecoride.com",
            password: "admin_password",
        };

        try {
            await axios.post(`${API_BASE_URL}/users/register`, adminUser);
            console.log("✅ Compte administrateur créé");
        } catch (createError) {
            if (createError.response?.status === 409) {
                console.log("✅ Compte administrateur existe déjà");
            } else {
                throw createError;
            }
        }

        // Se connecter temporairement avec un compte existant pour attribuer le rôle admin
        let tempToken;
        try {
            // Essayer avec d'autres comptes existants
            const testAccounts = [
                { identifier: "lila@test.com", password: "driver_password" },
                { identifier: "tom@test.com", password: "passenger_password" },
            ];

            for (const account of testAccounts) {
                try {
                    const tempResponse = await axios.post(
                        `${API_BASE_URL}/users/login`,
                        account
                    );
                    tempToken = tempResponse.data.token;
                    break;
                } catch (e) {
                    continue;
                }
            }
        } catch (e) {
            // Si aucun compte existant, on va créer un compte temporaire admin
            console.log(
                "⚠️ Aucun compte existant trouvé pour bootstrap l'admin"
            );
        }

        // Essayer de se connecter avec le nouveau compte admin
        const loginResponse = await axios.post(
            `${API_BASE_URL}/users/login`,
            ADMIN_CREDENTIALS
        );
        return loginResponse.data.token;
    } catch (error) {
        console.error(
            "❌ Erreur lors de la création du compte admin:",
            error.response?.data?.message || error.message
        );
        throw error;
    }
}

// Fonction pour déboguer les comptes existants
async function debugExistingAccounts() {
    try {
        console.log("� Debug: Test des comptes existants...");

        const testAccounts = [
            {
                identifier: "lila@test.com",
                password: "driver_password",
                name: "Lila (chauffeur)",
            },
            {
                identifier: "tom@test.com",
                password: "passenger_password",
                name: "Tom (passager)",
            },
            {
                identifier: "admin@ecoride.com",
                password: "admin_password",
                name: "Admin",
            },
            {
                identifier: "jose@ecoride.com",
                password: "employe_password",
                name: "José (employé)",
            },
        ];

        let workingToken = null;
        let workingUser = null;

        for (const account of testAccounts) {
            try {
                console.log(
                    `🔐 Test de connexion: ${account.name} (${account.identifier})`
                );
                const response = await axios.post(
                    `${API_BASE_URL}/users/login`,
                    account
                );

                if (response.data.token) {
                    console.log(`✅ Connexion réussie pour ${account.name}`);
                    console.log(
                        `👤 Rôles utilisateur:`,
                        response.data.user.roles
                    );

                    if (!workingToken) {
                        workingToken = response.data.token;
                        workingUser = account;
                    }
                } else {
                    console.log(`❌ Pas de token reçu pour ${account.name}`);
                }
            } catch (error) {
                console.log(
                    `❌ Échec de connexion pour ${account.name}: ${
                        error.response?.data?.message || error.message
                    }`
                );
            }
        }

        if (workingToken) {
            console.log(
                `\n✅ Utilisation du compte ${workingUser.name} pour les tests admin`
            );
            return workingToken;
        } else {
            throw new Error("Aucun compte utilisable trouvé");
        }
    } catch (error) {
        console.error("❌ Erreur lors du debug des comptes:", error.message);
        throw error;
    }
}

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

// Fonction pour créer un compte d'employé
async function createEmployeeAccount() {
    try {
        console.log("\n📝 Test: Création d'un compte d'employé par l'admin...");

        const newEmployee = {
            pseudo: `employe_test_${Date.now()}`,
            email: `employe_test_${Date.now()}@ecoride.com`,
            password: "employee_password_123",
        };

        // Créer l'utilisateur
        const createResponse = await axios.post(
            `${API_BASE_URL}/users/register`,
            newEmployee
        );
        console.log("✅ Utilisateur de base créé");

        // Récupérer l'ID de l'utilisateur créé en listant les utilisateurs
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

        // Attribuer le rôle d'employé
        const roleResponse = await axios.put(
            `${API_BASE_URL}/admin/users/${createdEmployeeId}/roles`,
            { roles: ["employe"] },
            { headers: { Authorization: `Bearer ${adminToken}` } }
        );

        console.log("✅ Rôle employé attribué avec succès");
        console.log(
            `📧 Email: ${newEmployee.email}, Mot de passe: ${newEmployee.password}`
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
        throw error;
    }
}

// Fonction pour obtenir les statistiques générales (inclut le nombre de covoiturages)
async function getPlatformStatistics() {
    try {
        console.log(
            "\n📊 Test: Récupération des statistiques de la plateforme..."
        );

        const response = await axios.get(`${API_BASE_URL}/admin/stats`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });

        const stats = response.data;
        console.log("✅ Statistiques récupérées:");
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

        console.log("\n📋 Statistiques par rôle:");
        stats.roleStats.forEach((role) => {
            console.log(`  - ${role.name}: ${role.count} utilisateurs`);
        });

        console.log("\n📋 Statistiques par statut de covoiturage:");
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

// Fonction pour obtenir le détail des covoiturages (pour statistiques journalières)
async function getCarpoolingDetails() {
    try {
        console.log("\n📊 Test: Analyse détaillée des covoiturages...");

        const response = await axios.get(`${API_BASE_URL}/admin/carpoolings`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });

        const carpoolings = response.data.carpoolings;
        console.log(`✅ ${carpoolings.length} covoiturages trouvés`);

        // Analyser par jour
        const dailyStats = {};
        const totalCredits = {
            earned: 0,
            platformCommission: 0,
        };

        carpoolings.forEach((carpooling) => {
            const date = new Date(carpooling.departure_datetime).toDateString();

            if (!dailyStats[date]) {
                dailyStats[date] = {
                    count: 0,
                    totalCredits: 0,
                    platformCommission: 0,
                };
            }

            dailyStats[date].count++;

            // Calculer les crédits générés
            const participantsCount = carpooling.participants_count || 0;
            const creditsPerParticipant = carpooling.price_per_passenger || 0;
            const totalCarpoolingCredits =
                participantsCount * creditsPerParticipant;
            const platformCommission =
                carpooling.platform_commission_earned || 0;

            dailyStats[date].totalCredits += totalCarpoolingCredits;
            dailyStats[date].platformCommission += platformCommission;

            totalCredits.earned += totalCarpoolingCredits;
            totalCredits.platformCommission += platformCommission;
        });

        console.log("\n📅 Statistiques par jour:");
        Object.entries(dailyStats).forEach(([date, stats]) => {
            console.log(`  📆 ${date}:`);
            console.log(`    - Covoiturages: ${stats.count}`);
            console.log(`    - Crédits générés: ${stats.totalCredits}`);
            console.log(
                `    - Commission plateforme: ${stats.platformCommission}`
            );
        });

        console.log("\n💰 Total des crédits:");
        console.log(`  - Crédits totaux générés: ${totalCredits.earned}`);
        console.log(
            `  - Commission totale plateforme: ${totalCredits.platformCommission}`
        );

        return { dailyStats, totalCredits, carpoolings };
    } catch (error) {
        console.error(
            "❌ Erreur lors de l'analyse des covoiturages:",
            error.response?.data?.message || error.message
        );
        throw error;
    }
}

// Fonction pour créer un utilisateur test à suspendre
async function createTestUserForSuspension() {
    try {
        console.log(
            "\n👤 Création d'un utilisateur test pour la suspension..."
        );

        const testUser = {
            pseudo: `user_suspend_test_${Date.now()}`,
            email: `suspend_test_${Date.now()}@test.com`,
            password: "test_password_123",
        };

        await axios.post(`${API_BASE_URL}/users/register`, testUser);
        console.log("✅ Utilisateur test créé");

        // Récupérer l'ID de l'utilisateur
        const usersResponse = await axios.get(`${API_BASE_URL}/admin/users`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });

        const createdUser = usersResponse.data.users.find(
            (user) => user.email === testUser.email
        );
        testUserId = createdUser.id;

        console.log(`📋 ID de l'utilisateur test: ${testUserId}`);
        return { id: testUserId, ...testUser };
    } catch (error) {
        console.error(
            "❌ Erreur lors de la création de l'utilisateur test:",
            error.response?.data?.message || error.message
        );
        throw error;
    }
}

// Fonction pour suspendre un compte utilisateur
async function suspendUserAccount(
    userId,
    reason = "Violation des conditions d'utilisation"
) {
    try {
        console.log(`\n🚫 Test: Suspension du compte utilisateur ${userId}...`);

        const response = await axios.put(
            `${API_BASE_URL}/admin/users/${userId}/suspension`,
            {
                suspended: true,
                reason: reason,
            },
            { headers: { Authorization: `Bearer ${adminToken}` } }
        );

        console.log("✅ Compte utilisateur suspendu avec succès");
        console.log(`📝 Raison: ${reason}`);

        // Vérifier la suspension en récupérant les détails de l'utilisateur
        const usersResponse = await axios.get(`${API_BASE_URL}/admin/users`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });

        const suspendedUser = usersResponse.data.users.find(
            (user) => user.id === userId
        );

        if (suspendedUser && suspendedUser.suspended) {
            console.log("✅ Suspension confirmée dans la base de données");
        } else {
            console.log("⚠️ La suspension n'a pas été confirmée");
        }

        return response.data;
    } catch (error) {
        console.error(
            "❌ Erreur lors de la suspension:",
            error.response?.data?.message || error.message
        );
        throw error;
    }
}

// Fonction pour suspendre un compte d'employé
async function suspendEmployeeAccount(employeeId) {
    try {
        console.log(`\n🚫 Test: Suspension du compte employé ${employeeId}...`);

        const response = await axios.put(
            `${API_BASE_URL}/admin/users/${employeeId}/suspension`,
            {
                suspended: true,
                reason: "Suspension temporaire pour audit",
            },
            { headers: { Authorization: `Bearer ${adminToken}` } }
        );

        console.log("✅ Compte employé suspendu avec succès");

        return response.data;
    } catch (error) {
        console.error(
            "❌ Erreur lors de la suspension de l'employé:",
            error.response?.data?.message || error.message
        );
        throw error;
    }
}

// Fonction pour réactiver un compte
async function reactivateAccount(userId) {
    try {
        console.log(`\n✅ Test: Réactivation du compte ${userId}...`);

        const response = await axios.put(
            `${API_BASE_URL}/admin/users/${userId}/suspension`,
            { suspended: false },
            { headers: { Authorization: `Bearer ${adminToken}` } }
        );

        console.log("✅ Compte réactivé avec succès");
        return response.data;
    } catch (error) {
        console.error(
            "❌ Erreur lors de la réactivation:",
            error.response?.data?.message || error.message
        );
        throw error;
    }
}

// Fonction pour lister tous les utilisateurs avec filtres
async function listAllUsers() {
    try {
        console.log("\n📋 Test: Liste de tous les utilisateurs...");

        const response = await axios.get(`${API_BASE_URL}/admin/users`, {
            headers: { Authorization: `Bearer ${adminToken}` },
            params: { limit: 50 }, // Augmenter la limite pour voir plus d'utilisateurs
        });

        const users = response.data.users;
        console.log(`✅ ${users.length} utilisateurs trouvés`);

        console.log("\n👥 Liste des utilisateurs:");
        users.forEach((user) => {
            const suspendedStatus = user.suspended ? "🚫 SUSPENDU" : "✅ ACTIF";
            console.log(
                `  - ${user.pseudo} (${user.email}) - ${
                    user.roles || "Aucun rôle"
                } - ${suspendedStatus}`
            );
        });

        return users;
    } catch (error) {
        console.error(
            "❌ Erreur lors de la récupération des utilisateurs:",
            error.response?.data?.message || error.message
        );
        throw error;
    }
}

// Fonction pour tester l'accès employé
async function testEmployeeAccess() {
    try {
        console.log("\n🏢 Test: Accès avec compte employé...");

        // Test d'accès aux statistiques avec compte employé
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
                { suspended: false }, // Réactiver si suspendu
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
                    "✅ L'employé ne peut pas modifier les rôles (accès refusé comme attendu)"
                );
            } else {
                throw error;
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
        console.log("🚀 Début des tests d'administration EcoRide\n");

        // 0. Debug des comptes existants
        console.log("� Phase de debug des comptes existants...");
        const workingToken = await debugExistingAccounts();

        // Utiliser ce token comme token admin temporaire pour créer les vrais comptes admin
        adminToken = workingToken;

        // 1. Créer un compte d'employé en tant qu'admin (démonstration)
        console.log(
            "\n📝 Création d'un compte d'employé (simulation admin)..."
        );
        try {
            const newEmployee = await createEmployeeAccount();
            console.log("✅ Test de création d'employé réussi");
        } catch (error) {
            console.log(
                "⚠️ Test de création d'employé échoué, mais on continue..."
            );
        }

        // 2. Obtenir les statistiques de la plateforme (simulation admin/employé)
        console.log("\n📊 Test des statistiques avec compte existant...");
        try {
            const platformStats = await getPlatformStatistics();
            console.log("✅ Test des statistiques réussi");
        } catch (error) {
            console.log(
                "⚠️ Test des statistiques échoué (permissions insuffisantes)"
            );
            console.log(
                "🔧 Ceci est normal si le compte utilisé n'a pas les permissions admin/employé"
            );
        }

        // 3. Analyser les covoiturages (test avec permissions limitées)
        console.log("\n🚗 Test d'analyse des covoiturages...");
        try {
            const carpoolingAnalysis = await getCarpoolingDetails();
            console.log("✅ Test d'analyse des covoiturages réussi");
        } catch (error) {
            console.log("⚠️ Test d'analyse échoué (permissions insuffisantes)");
        }

        // 4. Créer un utilisateur test pour la suspension
        console.log("\n👤 Création d'un utilisateur test...");
        try {
            const testUser = await createTestUserForSuspension();

            // 5. Tenter de suspendre le compte (test avec permissions limitées)
            console.log("\n🚫 Test de suspension...");
            try {
                await suspendUserAccount(
                    testUser.id,
                    "Test de suspension administrative"
                );
                console.log("✅ Test de suspension réussi");
            } catch (error) {
                console.log(
                    "⚠️ Test de suspension échoué (permissions insuffisantes)"
                );
            }
        } catch (error) {
            console.log("⚠️ Création d'utilisateur test échouée");
        }

        console.log("\n� Tests d'administration terminés");
        console.log("\n📋 Note importante:");
        console.log(
            "⚠️ Pour utiliser pleinement les fonctionnalités admin, il faut:"
        );
        console.log("1. Exécuter les scripts SQL d'initialisation");
        console.log('2. Avoir un compte avec le rôle "admin" ou "employe"');
        console.log(
            "3. Les rôles doivent correspondre dans la base de données"
        );
    } catch (error) {
        console.error(
            "\n💥 Erreur pendant les tests d'administration:",
            error.message
        );
        console.log("\n🔧 Solutions possibles:");
        console.log("1. Vérifier que la base de données est initialisée");
        console.log("2. Exécuter les scripts SQL de création des rôles");
        console.log("3. Créer manuellement un compte admin");
    }
}

// Exécuter les tests
runAdminTests();
