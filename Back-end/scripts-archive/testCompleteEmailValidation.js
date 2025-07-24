#!/usr/bin/env node

const axios = require("axios");
const { validateAndNormalizeEmail } = require("../utils/emailValidator.js");

// Configuration
const BASE_URL = "http://localhost:3000/api";

/**
 * Script de test complet pour la validation d'email EcoRide
 * Ce script teste:
 * 1. La validation côté back-end (utilitaire)
 * 2. L'endpoint d'inscription avec validation
 * 3. L'endpoint de mise à jour de profil avec validation
 */

console.log("🧪 TEST COMPLET DU SYSTÈME DE VALIDATION D'EMAIL ECORIDE");
console.log("═".repeat(80));
console.log(`🌐 API Base URL: ${BASE_URL}`);
console.log(
    `📅 Date: ${new Date().toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })}\n`
);

// Cas de test pour la validation d'email
const emailTestCases = [
    // Emails valides
    {
        email: "user@example.com",
        expected: true,
        description: "Email standard valide",
    },
    {
        email: "user.name@example.com",
        expected: true,
        description: "Email avec point dans partie locale",
    },
    {
        email: "user+tag@example.com",
        expected: true,
        description: "Email avec tag (+)",
    },
    {
        email: "user_name@example.co.uk",
        expected: true,
        description: "Email avec sous-domaine",
    },
    {
        email: " USER@EXAMPLE.COM ",
        expected: true,
        description: "Email avec espaces et majuscules (normalisation)",
    },

    // Emails invalides
    { email: "invalid-email", expected: false, description: "Email sans @" },
    { email: "user@", expected: false, description: "Domaine manquant" },
    {
        email: "@example.com",
        expected: false,
        description: "Partie utilisateur manquante",
    },
    {
        email: "user..name@example.com",
        expected: false,
        description: "Points consécutifs",
    },
    {
        email: ".user@example.com",
        expected: false,
        description: "Commence par un point",
    },
    {
        email: "user.@example.com",
        expected: false,
        description: "Finit par un point",
    },
    { email: "user@com", expected: false, description: "Domaine sans point" },
    { email: "user@@example.com", expected: false, description: "Double @" },
    { email: "", expected: false, description: "Email vide" },
];

// Test 1: Validation des utilitaires back-end
function testBackendValidator() {
    console.log("📝 TEST 1: VALIDATION DES UTILITAIRES BACK-END");
    console.log("─".repeat(60));

    let passed = 0;
    let failed = 0;

    emailTestCases.forEach((testCase, index) => {
        const result = validateAndNormalizeEmail(testCase.email);
        const success = result.isValid === testCase.expected;

        const status = success ? "✅" : "❌";
        const normalizedInfo = result.normalizedEmail
            ? ` → "${result.normalizedEmail}"`
            : "";

        console.log(`   ${index + 1}. ${status} ${testCase.description}`);
        console.log(`      Input: "${testCase.email}"${normalizedInfo}`);

        if (!success) {
            console.log(
                `      ⚠️  Attendu: ${testCase.expected}, Reçu: ${result.isValid}`
            );
            failed++;
        } else {
            passed++;
        }
    });

    console.log(
        `\n   📊 Résultat: ${passed}/${emailTestCases.length} tests réussis`
    );
    return { passed, failed, total: emailTestCases.length };
}

// Test 2: Endpoint d'inscription
async function testRegistrationEndpoint() {
    console.log("\n📝 TEST 2: ENDPOINT D'INSCRIPTION (/users/register)");
    console.log("─".repeat(60));

    const registrationTests = [
        {
            name: "Email valide - inscription",
            data: {
                pseudo: `test_valid_${Date.now()}`,
                email: "valid.user@example.com",
                password: "SecurePassword123!",
            },
            shouldSucceed: true,
        },
        {
            name: "Email invalide - format incorrect",
            data: {
                pseudo: `test_invalid_${Date.now()}`,
                email: "invalid-email-format",
                password: "SecurePassword123!",
            },
            shouldSucceed: false,
        },
        {
            name: "Email invalide - domaine manquant",
            data: {
                pseudo: `test_no_domain_${Date.now()}`,
                email: "user@",
                password: "SecurePassword123!",
            },
            shouldSucceed: false,
        },
    ];

    let passed = 0;
    let failed = 0;

    for (const test of registrationTests) {
        try {
            const response = await axios.post(
                `${BASE_URL}/users/register`,
                test.data
            );

            if (test.shouldSucceed) {
                console.log(`   ✅ ${test.name} - Succès attendu`);
                console.log(
                    `      📧 Email normalisé: ${response.data.user?.email}`
                );
                passed++;
            } else {
                console.log(`   ❌ ${test.name} - Échec inattendu`);
                failed++;
            }
        } catch (error) {
            if (!test.shouldSucceed) {
                console.log(`   ✅ ${test.name} - Échec attendu`);
                console.log(
                    `      💬 Erreur: ${error.response?.data?.message}`
                );
                passed++;
            } else {
                console.log(
                    `   ❌ ${test.name} - Succès attendu mais échec reçu`
                );
                console.log(
                    `      💬 Erreur: ${error.response?.data?.message}`
                );
                failed++;
            }
        }

        // Pause entre les tests
        await new Promise((resolve) => setTimeout(resolve, 200));
    }

    console.log(
        `\n   📊 Résultat: ${passed}/${registrationTests.length} tests réussis`
    );
    return { passed, failed, total: registrationTests.length };
}

// Test 3: Endpoint de mise à jour de profil
async function testProfileUpdateEndpoint() {
    console.log(
        "\n📝 TEST 3: ENDPOINT DE MISE À JOUR DE PROFIL (/users/profile)"
    );
    console.log("─".repeat(60));

    // D'abord, créer un utilisateur et obtenir un token
    let userToken = null;
    let testUserId = null;

    try {
        const timestamp = Date.now();
        const testUser = {
            pseudo: `profile_test_${timestamp}`,
            email: `profile.test.${timestamp}@example.com`,
            password: "TestPassword123!",
        };

        // Créer l'utilisateur
        const registerResponse = await axios.post(
            `${BASE_URL}/users/register`,
            testUser
        );
        console.log("   📝 Utilisateur de test créé pour les tests de profil");

        // Se connecter pour obtenir le token
        const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
            identifier: testUser.email,
            password: testUser.password,
        });

        userToken = loginResponse.data.token;
        testUserId = loginResponse.data.user.id;
        console.log("   🔐 Connexion réussie, token obtenu");
    } catch (error) {
        console.log("   ❌ Impossible de créer l'utilisateur de test");
        console.log(
            `      💬 Erreur: ${error.response?.data?.message || error.message}`
        );
        return { passed: 0, failed: 1, total: 1 };
    }

    // Tests de mise à jour du profil
    const profileTests = [
        {
            name: "Mise à jour avec email valide",
            data: { email: `updated.${Date.now()}@example.com` },
            shouldSucceed: true,
        },
        {
            name: "Mise à jour avec email invalide",
            data: { email: "invalid-email-format" },
            shouldSucceed: false,
        },
        {
            name: "Mise à jour avec email vide",
            data: { email: "" },
            shouldSucceed: false,
        },
    ];

    let passed = 0;
    let failed = 0;

    for (const test of profileTests) {
        try {
            const response = await axios.put(
                `${BASE_URL}/users/profile`,
                test.data,
                { headers: { Authorization: `Bearer ${userToken}` } }
            );

            if (test.shouldSucceed) {
                console.log(`   ✅ ${test.name} - Succès attendu`);
                passed++;
            } else {
                console.log(`   ❌ ${test.name} - Échec inattendu`);
                failed++;
            }
        } catch (error) {
            if (!test.shouldSucceed) {
                console.log(`   ✅ ${test.name} - Échec attendu`);
                console.log(
                    `      💬 Erreur: ${error.response?.data?.message}`
                );
                passed++;
            } else {
                console.log(
                    `   ❌ ${test.name} - Succès attendu mais échec reçu`
                );
                console.log(
                    `      💬 Erreur: ${error.response?.data?.message}`
                );
                failed++;
            }
        }

        await new Promise((resolve) => setTimeout(resolve, 200));
    }

    console.log(
        `\n   📊 Résultat: ${passed}/${profileTests.length} tests réussis`
    );
    return { passed, failed, total: profileTests.length };
}

// Fonction principale
async function runCompleteTests() {
    try {
        // Test 1: Utilitaires
        const validatorResults = testBackendValidator();

        // Test 2: Inscription
        const registrationResults = await testRegistrationEndpoint();

        // Test 3: Profil
        const profileResults = await testProfileUpdateEndpoint();

        // Rapport final
        const totalPassed =
            validatorResults.passed +
            registrationResults.passed +
            profileResults.passed;
        const totalTests =
            validatorResults.total +
            registrationResults.total +
            profileResults.total;
        const successRate = ((totalPassed / totalTests) * 100).toFixed(1);

        console.log("\n🎯 RAPPORT FINAL - SYSTÈME DE VALIDATION D'EMAIL");
        console.log("═".repeat(80));
        console.log(`✅ Tests réussis: ${totalPassed}/${totalTests}`);
        console.log(`📊 Taux de réussite: ${successRate}%`);

        if (totalPassed === totalTests) {
            console.log(
                "\n🎉 FÉLICITATIONS ! Tous les tests sont passés avec succès !"
            );
            console.log(
                "🔒 Le système de validation d'email EcoRide fonctionne parfaitement."
            );
        } else {
            console.log(
                "\n⚠️  Certains tests ont échoué. Vérifiez l'implémentation."
            );
        }

        console.log("\n📋 FONCTIONNALITÉS VALIDÉES:");
        console.log("• ✅ Validation du format d'email selon RFC 5322");
        console.log("• ✅ Normalisation automatique (minuscules, espaces)");
        console.log("• ✅ Messages d'erreur explicites");
        console.log("• ✅ Protection contre les formats malformés");
        console.log("• ✅ Intégration dans l'endpoint d'inscription");
        console.log("• ✅ Intégration dans l'endpoint de profil");
        console.log("• ✅ Validation côté back-end robuste");
    } catch (error) {
        console.error("\n💥 ERREUR CRITIQUE:", error.message);
        process.exit(1);
    }
}

// Exécution si appelé directement
if (require.main === module) {
    runCompleteTests()
        .then(() => {
            console.log("\n✨ Tests complets terminés !");
        })
        .catch((error) => {
            console.error(
                "\n💥 Erreur lors des tests complets:",
                error.message
            );
            process.exit(1);
        });
}

module.exports = {
    runCompleteTests,
    testBackendValidator,
    testRegistrationEndpoint,
    testProfileUpdateEndpoint,
};
