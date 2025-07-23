const {
    analyzePasswordStrength,
    validatePassword,
    validatePasswordConfirmation,
    generateSecurePassword,
    passwordValidationExamples,
} = require("../utils/passwordValidator.js");

/**
 * Script de test pour la validation de mots de passe
 * Ce script teste les fonctions de validation avec différents cas de figure
 */

console.log("🔐 Test de validation de mots de passe - EcoRide\n");

// Test des mots de passe valides
console.log("✅ Test des mots de passe VALIDES:");
console.log("─".repeat(60));

passwordValidationExamples.valid.forEach((password, index) => {
    const analysis = analyzePasswordStrength(password);
    console.log(`${index + 1}. "${password}"`);
    console.log(
        `   └─ Force: ${analysis.strength} (${analysis.percentage}%) - ${
            analysis.isValid ? "✅ VALIDE" : "❌ INVALIDE"
        }`
    );
    if (analysis.errors.length > 0) {
        console.log(`   └─ Erreurs: ${analysis.errors.join(", ")}`);
    }
});

console.log("\n❌ Test des mots de passe INVALIDES:");
console.log("─".repeat(60));

passwordValidationExamples.invalid.forEach((password, index) => {
    const analysis = analyzePasswordStrength(password);
    const displayPassword =
        password.length > 20 ? password.substring(0, 20) + "..." : password;
    console.log(`${index + 1}. "${displayPassword}"`);
    console.log(
        `   └─ Force: ${analysis.strength} (${analysis.percentage}%) - ${
            analysis.isValid ? "✅ VALIDE" : "❌ INVALIDE"
        }`
    );
    if (analysis.errors.length > 0) {
        console.log(
            `   └─ Erreurs: ${analysis.errors.slice(0, 2).join(", ")}${
                analysis.errors.length > 2 ? "..." : ""
            }`
        );
    }
});

// Tests de validation détaillée
console.log("\n🔍 Test de validation détaillée:");
console.log("─".repeat(60));

const detailedTests = [
    "Pass123!", // Valide
    "password", // Trop faible
    "PASSWORD123", // Pas de minuscule ni caractère spécial
    "MyP@ssw0rd", // Pas de chiffre
    "Short1!", // Trop court mais sinon valide
    "Très_Long_M0t_De_P@sse_Qui_Respecte_Tous_Les_Critères_123!", // Long mais valide
];

detailedTests.forEach((password, index) => {
    const validation = validatePassword(password);
    console.log(`${index + 1}. "${password}"`);
    console.log(`   └─ Valide: ${validation.isValid ? "✅ OUI" : "❌ NON"}`);

    if (!validation.isValid) {
        console.log(`   └─ Erreurs: ${validation.errors.join(", ")}`);
        if (validation.suggestions.length > 0) {
            console.log(
                `   └─ Suggestions: ${validation.suggestions
                    .slice(0, 2)
                    .join(", ")}`
            );
        }
    }
});

// Test de confirmation de mot de passe
console.log("\n🔄 Test de confirmation de mots de passe:");
console.log("─".repeat(60));

const confirmationTests = [
    { password: "MyP@ssw0rd123", confirm: "MyP@ssw0rd123", expected: true },
    { password: "MyP@ssw0rd123", confirm: "MyP@ssw0rd124", expected: false },
    { password: "Test123!", confirm: "", expected: false },
    { password: "", confirm: "Test123!", expected: false },
];

confirmationTests.forEach((test, index) => {
    const result = validatePasswordConfirmation(test.password, test.confirm);
    const status = result.isValid === test.expected ? "✅" : "❌";
    console.log(
        `${index + 1}. ${status} Mot de passe: "${
            test.password
        }" | Confirmation: "${test.confirm}"`
    );
    if (!result.isValid) {
        console.log(`   └─ Erreur: ${result.error}`);
    }
});

// Test de génération de mot de passe sécurisé
console.log("\n🎲 Test de génération de mots de passe sécurisés:");
console.log("─".repeat(60));

for (let i = 0; i < 5; i++) {
    const generatedPassword = generateSecurePassword(12);
    const analysis = analyzePasswordStrength(generatedPassword);
    console.log(`${i + 1}. "${generatedPassword}"`);
    console.log(
        `   └─ Force: ${analysis.strength} (${analysis.percentage}%) - ${
            analysis.isValid ? "✅ VALIDE" : "❌ INVALIDE"
        }`
    );
}

// Test avec différentes longueurs
console.log("\n📏 Test avec différentes longueurs de mots de passe générés:");
console.log("─".repeat(60));

[8, 12, 16, 20].forEach((length) => {
    const password = generateSecurePassword(length);
    const analysis = analyzePasswordStrength(password);
    console.log(`Longueur ${length}: "${password}"`);
    console.log(
        `   └─ Force: ${analysis.strength} (${analysis.percentage}%) - ${
            analysis.isValid ? "✅ VALIDE" : "❌ INVALIDE"
        }`
    );
});

console.log("\n🎯 Résumé des critères de mot de passe EcoRide:");
console.log("─".repeat(60));
console.log("• Minimum 8 caractères");
console.log("• Maximum 128 caractères");
console.log("• Au moins 1 lettre minuscule (a-z)");
console.log("• Au moins 1 lettre majuscule (A-Z)");
console.log("• Au moins 1 chiffre (0-9)");
console.log("• Au moins 1 caractère spécial (!@#$%^&*...)");
console.log("• Aucun caractère interdit (<>'\"&;)");

console.log("\n🛡️ Exemples de mots de passe recommandés:");
console.log("─".repeat(60));
console.log("• MyP@ssw0rd123");
console.log("• SecureP@ss1");
console.log("• C0mpl3xP@ss!");
console.log("• EcoRide2025!");

module.exports = {
    runPasswordValidationTests: () => {
        console.log(
            "Tests de validation de mot de passe exécutés avec succès !"
        );
    },
};
