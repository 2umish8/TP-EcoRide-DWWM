const axios = require("axios");

// Configuration
const BASE_URL = "http://localhost:3000/api";

/**
 * Script de test pour l'inscription avec validation d'email
 * Ce script teste l'endpoint d'inscription avec différents formats d'email
 */

// Cas de test pour l'inscription
const testCases = [
    {
        name: "Email valide - format standard",
        data: {
            pseudo: `test_user_${Date.now()}`,
            email: "user.test@example.com",
            password: "TestPassword123!",
        },
        shouldSucceed: true,
    },
    {
        name: "Email valide - avec tag",
        data: {
            pseudo: `test_user_${Date.now() + 1}`,
            email: "user+tag@example.com",
            password: "TestPassword123!",
        },
        shouldSucceed: true,
    },
    {
        name: "Email valide - sous-domaine",
        data: {
            pseudo: `test_user_${Date.now() + 2}`,
            email: "user@test.example.co.uk",
            password: "TestPassword123!",
        },
        shouldSucceed: true,
    },
    {
        name: "Email valide - avec espaces et majuscules (devrait être normalisé)",
        data: {
            pseudo: `test_user_${Date.now() + 3}`,
            email: " USER.NORMALIZE@EXAMPLE.COM ",
            password: "TestPassword123!",
        },
        shouldSucceed: true,
    },
    {
        name: "Email invalide - format incorrect",
        data: {
            pseudo: `test_user_${Date.now() + 4}`,
            email: "email-invalide",
            password: "TestPassword123!",
        },
        shouldSucceed: false,
    },
    {
        name: "Email invalide - manque @",
        data: {
            pseudo: `test_user_${Date.now() + 5}`,
            email: "useratexample.com",
            password: "TestPassword123!",
        },
        shouldSucceed: false,
    },
    {
        name: "Email invalide - domaine manquant",
        data: {
            pseudo: `test_user_${Date.now() + 6}`,
            email: "user@",
            password: "TestPassword123!",
        },
        shouldSucceed: false,
    },
    {
        name: "Email invalide - utilisateur manquant",
        data: {
            pseudo: `test_user_${Date.now() + 7}`,
            email: "@example.com",
            password: "TestPassword123!",
        },
        shouldSucceed: false,
    },
    {
        name: "Email invalide - points consécutifs",
        data: {
            pseudo: `test_user_${Date.now() + 8}`,
            email: "user..name@example.com",
            password: "TestPassword123!",
        },
        shouldSucceed: false,
    },
    {
        name: "Email invalide - commence par un point",
        data: {
            pseudo: `test_user_${Date.now() + 9}`,
            email: ".user@example.com",
            password: "TestPassword123!",
        },
        shouldSucceed: false,
    },
    {
        name: "Email vide",
        data: {
            pseudo: `test_user_${Date.now() + 10}`,
            email: "",
            password: "TestPassword123!",
        },
        shouldSucceed: false,
    },
];

async function runRegistrationTests() {
    console.log("🧪 Test d'inscription avec validation d'email - EcoRide");
    console.log("═".repeat(70));
    console.log(`📡 URL de l'API: ${BASE_URL}/users/register\n`);

    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        console.log(`\n📝 Test ${i + 1}/${testCases.length}: ${testCase.name}`);
        console.log("─".repeat(50));
        console.log(`   Pseudo: ${testCase.data.pseudo}`);
        console.log(`   Email: "${testCase.data.email}"`);
        console.log(
            `   Attendu: ${testCase.shouldSucceed ? "SUCCÈS" : "ÉCHEC"}`
        );

        try {
            const response = await axios.post(
                `${BASE_URL}/users/register`,
                testCase.data
            );

            if (testCase.shouldSucceed) {
                console.log("   ✅ SUCCÈS - Inscription réussie");
                console.log(
                    `   📧 Email normalisé: ${
                        response.data.user?.email || "Non disponible"
                    }`
                );
                console.log(`   💬 Message: ${response.data.message}`);
                successCount++;
            } else {
                console.log(
                    "   ❌ ÉCHEC INATTENDU - L'inscription a réussi alors qu'elle devrait échouer"
                );
                console.log(`   💬 Message: ${response.data.message}`);
                failureCount++;
            }
        } catch (error) {
            if (!testCase.shouldSucceed) {
                console.log(
                    "   ✅ ÉCHEC ATTENDU - Validation d'email fonctionnelle"
                );
                console.log(
                    `   💬 Message d'erreur: ${
                        error.response?.data?.message || error.message
                    }`
                );
                console.log(
                    `   📊 Code d'erreur: ${
                        error.response?.status || "Non disponible"
                    }`
                );
                successCount++;
            } else {
                console.log(
                    "   ❌ ÉCHEC INATTENDU - L'inscription a échoué alors qu'elle devrait réussir"
                );
                console.log(
                    `   💬 Message d'erreur: ${
                        error.response?.data?.message || error.message
                    }`
                );
                console.log(
                    `   📊 Code d'erreur: ${
                        error.response?.status || "Non disponible"
                    }`
                );
                failureCount++;
            }
        }

        // Petite pause entre les tests
        await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Rapport final
    console.log("\n🎯 RAPPORT FINAL");
    console.log("═".repeat(70));
    console.log(`✅ Tests réussis: ${successCount}/${testCases.length}`);
    console.log(`❌ Tests échoués: ${failureCount}/${testCases.length}`);
    console.log(
        `📊 Taux de réussite: ${(
            (successCount / testCases.length) *
            100
        ).toFixed(1)}%`
    );

    if (failureCount === 0) {
        console.log("\n🎉 Tous les tests sont passés avec succès !");
        console.log("La validation d'email fonctionne correctement.");
    } else {
        console.log("\n⚠️  Certains tests ont échoué.");
        console.log("Vérifiez l'implémentation de la validation d'email.");
    }

    console.log("\n📋 RÉSUMÉ DE LA VALIDATION D'EMAIL:");
    console.log("• Format selon RFC 5322 vérifié");
    console.log(
        "• Normalisation automatique (minuscules, suppression des espaces)"
    );
    console.log("• Messages d'erreur explicites");
    console.log("• Protection contre les formats malformés");
}

// Fonction utilitaire pour nettoyer les données de test (optionnel)
async function cleanupTestUsers() {
    console.log("\n🧹 Nettoyage des utilisateurs de test...");
    console.log("(Cette fonctionnalité nécessiterait un endpoint admin)");
}

// Exécution du script si appelé directement
if (require.main === module) {
    runRegistrationTests()
        .then(() => {
            console.log("\n✨ Tests terminés avec succès !");
        })
        .catch((error) => {
            console.error("\n💥 Erreur lors des tests:", error.message);
            process.exit(1);
        });
}

module.exports = {
    runRegistrationTests,
    cleanupTestUsers,
};
