const axios = require("axios");

// Configuration
const BASE_URL = "http://localhost:3000/api";

/**
 * Script de test pour l'inscription avec validation de mot de passe fort
 * Ce script teste l'endpoint d'inscription avec différents mots de passe
 */

// Cas de test pour l'inscription avec mots de passe
const testCases = [
    {
        name: "Mot de passe valide - Fort",
        data: {
            pseudo: `test_strong_${Date.now()}`,
            email: `strong.password.${Date.now()}@example.com`,
            password: "MyStr0ng!P@ss",
        },
        shouldSucceed: true,
    },
    {
        name: "Mot de passe valide - Complexe",
        data: {
            pseudo: `test_complex_${Date.now() + 1}`,
            email: `complex.password.${Date.now() + 1}@example.com`,
            password: "C0mpl3x!P@ssw0rd",
        },
        shouldSucceed: true,
    },
    {
        name: "Mot de passe valide - Minimum requis",
        data: {
            pseudo: `test_minimum_${Date.now() + 2}`,
            email: `minimum.password.${Date.now() + 2}@example.com`,
            password: "MinPass1!",
        },
        shouldSucceed: true,
    },
    {
        name: "Mot de passe invalide - Pas de majuscule",
        data: {
            pseudo: `test_no_upper_${Date.now() + 3}`,
            email: "no.upper@example.com",
            password: "mypassword123!",
        },
        shouldSucceed: false,
    },
    {
        name: "Mot de passe invalide - Pas de minuscule",
        data: {
            pseudo: `test_no_lower_${Date.now() + 4}`,
            email: "no.lower@example.com",
            password: "MYPASSWORD123!",
        },
        shouldSucceed: false,
    },
    {
        name: "Mot de passe invalide - Pas de chiffre",
        data: {
            pseudo: `test_no_digit_${Date.now() + 5}`,
            email: "no.digit@example.com",
            password: "MyPassword!",
        },
        shouldSucceed: false,
    },
    {
        name: "Mot de passe invalide - Pas de caractère spécial",
        data: {
            pseudo: `test_no_special_${Date.now() + 6}`,
            email: "no.special@example.com",
            password: "MyPassword123",
        },
        shouldSucceed: false,
    },
    {
        name: "Mot de passe invalide - Trop court",
        data: {
            pseudo: `test_short_${Date.now() + 7}`,
            email: "short.password@example.com",
            password: "Pass1!",
        },
        shouldSucceed: false,
    },
    {
        name: "Mot de passe invalide - Très faible",
        data: {
            pseudo: `test_weak_${Date.now() + 8}`,
            email: "weak.password@example.com",
            password: "password",
        },
        shouldSucceed: false,
    },
    {
        name: "Mot de passe invalide - Caractères interdits",
        data: {
            pseudo: `test_forbidden_${Date.now() + 9}`,
            email: "forbidden.chars@example.com",
            password: "MyP@ss<w0rd>",
        },
        shouldSucceed: false,
    },
    {
        name: "Mot de passe vide",
        data: {
            pseudo: `test_empty_${Date.now() + 10}`,
            email: "empty.password@example.com",
            password: "",
        },
        shouldSucceed: false,
    },
];

async function runPasswordRegistrationTests() {
    console.log(
        "🔐 Test d'inscription avec validation de mot de passe fort - EcoRide"
    );
    console.log("═".repeat(80));
    console.log(`📡 URL de l'API: ${BASE_URL}/users/register\n`);

    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        console.log(`\n📝 Test ${i + 1}/${testCases.length}: ${testCase.name}`);
        console.log("─".repeat(60));
        console.log(`   Pseudo: ${testCase.data.pseudo}`);
        console.log(`   Email: ${testCase.data.email}`);
        console.log(`   Mot de passe: "${testCase.data.password}"`);
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
                    `   👤 Utilisateur créé: ${response.data.user?.pseudo}`
                );
                console.log(`   📧 Email: ${response.data.user?.email}`);
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
                    "   ✅ ÉCHEC ATTENDU - Validation de mot de passe fonctionnelle"
                );
                console.log(
                    `   💬 Message d'erreur: ${
                        error.response?.data?.message || error.message
                    }`
                );

                // Afficher les suggestions si disponibles
                if (
                    error.response?.data?.suggestions &&
                    error.response.data.suggestions.length > 0
                ) {
                    console.log(
                        `   💡 Suggestions: ${error.response.data.suggestions.join(
                            ", "
                        )}`
                    );
                }

                // Afficher les erreurs détaillées si disponibles
                if (
                    error.response?.data?.errors &&
                    error.response.data.errors.length > 0
                ) {
                    console.log(
                        `   🔍 Détails: ${error.response.data.errors
                            .slice(0, 2)
                            .join(", ")}${
                            error.response.data.errors.length > 2 ? "..." : ""
                        }`
                    );
                }

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
        await new Promise((resolve) => setTimeout(resolve, 300));
    }

    // Rapport final
    console.log("\n🎯 RAPPORT FINAL");
    console.log("═".repeat(80));
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
        console.log(
            "🔒 La validation de mot de passe fort fonctionne correctement."
        );
    } else {
        console.log("\n⚠️  Certains tests ont échoué.");
        console.log(
            "🔍 Vérifiez l'implémentation de la validation de mot de passe."
        );
    }

    console.log("\n📋 CRITÈRES DE MOT DE PASSE VALIDÉS:");
    console.log("• ✅ Longueur minimale (8 caractères)");
    console.log("• ✅ Au moins une lettre minuscule");
    console.log("• ✅ Au moins une lettre majuscule");
    console.log("• ✅ Au moins un chiffre");
    console.log("• ✅ Au moins un caractère spécial");
    console.log("• ✅ Aucun caractère interdit");
    console.log("• ✅ Messages d'erreur détaillés avec suggestions");
}

// Test spécifique pour le changement de mot de passe
async function testPasswordChange() {
    console.log("\n🔄 Test de changement de mot de passe");
    console.log("═".repeat(80));

    // D'abord, créer un utilisateur de test
    let userToken = null;
    const timestamp = Date.now();

    try {
        const testUser = {
            pseudo: `pwd_change_test_${timestamp}`,
            email: `pwd.change.test.${timestamp}@example.com`,
            password: "InitialP@ss123!",
        };

        console.log("📝 Création d'un utilisateur de test...");
        await axios.post(`${BASE_URL}/users/register`, testUser);

        // Se connecter pour obtenir le token
        const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
            identifier: testUser.email,
            password: testUser.password,
        });

        userToken = loginResponse.data.token;
        console.log("🔐 Connexion réussie, token obtenu");
    } catch (error) {
        console.log("❌ Impossible de créer l'utilisateur de test");
        console.log(
            `💬 Erreur: ${error.response?.data?.message || error.message}`
        );
        return;
    }

    // Tests de changement de mot de passe
    const changePasswordTests = [
        {
            name: "Changement avec mot de passe fort valide",
            data: {
                currentPassword: "InitialP@ss123!",
                newPassword: "N3wStr0ng!P@ss",
            },
            shouldSucceed: true,
        },
        {
            name: "Changement avec mot de passe faible",
            data: {
                currentPassword: "InitialP@ss123!",
                newPassword: "weakpass",
            },
            shouldSucceed: false,
        },
        {
            name: "Changement avec mauvais mot de passe actuel",
            data: {
                currentPassword: "WrongPassword123!",
                newPassword: "ValidN3w!P@ss",
            },
            shouldSucceed: false,
        },
    ];

    for (const test of changePasswordTests) {
        console.log(`\n🔄 ${test.name}`);
        console.log("─".repeat(50));

        try {
            const response = await axios.post(
                `${BASE_URL}/users/change-password`,
                test.data,
                { headers: { Authorization: `Bearer ${userToken}` } }
            );

            if (test.shouldSucceed) {
                console.log("   ✅ SUCCÈS - Changement de mot de passe réussi");
                console.log(`   💬 Message: ${response.data.message}`);
            } else {
                console.log("   ❌ ÉCHEC INATTENDU - Le changement a réussi");
            }
        } catch (error) {
            if (!test.shouldSucceed) {
                console.log("   ✅ ÉCHEC ATTENDU - Validation fonctionnelle");
                console.log(`   💬 Erreur: ${error.response?.data?.message}`);

                if (error.response?.data?.suggestions) {
                    console.log(
                        `   💡 Suggestions: ${error.response.data.suggestions.join(
                            ", "
                        )}`
                    );
                }
            } else {
                console.log("   ❌ ÉCHEC INATTENDU - Le changement a échoué");
                console.log(`   💬 Erreur: ${error.response?.data?.message}`);
            }
        }

        await new Promise((resolve) => setTimeout(resolve, 200));
    }
}

// Fonction principale
async function runCompletePasswordTests() {
    try {
        await runPasswordRegistrationTests();
        await testPasswordChange();

        console.log("\n✨ Tests de validation de mot de passe terminés !");
    } catch (error) {
        console.error("\n💥 Erreur lors des tests:", error.message);
        process.exit(1);
    }
}

// Exécution si appelé directement
if (require.main === module) {
    runCompletePasswordTests().catch((error) => {
        console.error("\n💥 Erreur critique:", error.message);
        process.exit(1);
    });
}

module.exports = {
    runPasswordRegistrationTests,
    testPasswordChange,
    runCompletePasswordTests,
};
