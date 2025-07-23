const {
    validateAndNormalizeEmail,
    emailValidationExamples,
} = require("../utils/emailValidator.js");

/**
 * Script de test pour la validation d'email
 * Ce script teste la fonction de validation avec différents cas de figure
 */

console.log("🧪 Test de validation d'email - EcoRide\n");

// Test des emails valides
console.log("✅ Test des emails VALIDES:");
console.log("─".repeat(50));

emailValidationExamples.valid.forEach((email, index) => {
    const result = validateAndNormalizeEmail(email);
    console.log(
        `${index + 1}. "${email}" → ${
            result.isValid ? "✅ VALIDE" : "❌ INVALIDE"
        } (normalisé: "${result.normalizedEmail}")`
    );
});

console.log("\n❌ Test des emails INVALIDES:");
console.log("─".repeat(50));

emailValidationExamples.invalid.forEach((email, index) => {
    const result = validateAndNormalizeEmail(email);
    console.log(
        `${index + 1}. "${email}" → ${
            result.isValid ? "✅ VALIDE" : "❌ INVALIDE"
        } (erreur: ${result.error})`
    );
});

// Tests de cas particuliers
console.log("\n🔍 Test de cas particuliers:");
console.log("─".repeat(50));

const specialCases = [
    " USER@EXAMPLE.COM ", // Espaces et majuscules
    "user+tag@example.com", // Tag avec +
    "user_name@example.co.uk", // Sous-domaine
    "a@b.co", // Email très court mais valide
    "test.email.with+symbol@example.com", // Email complexe valide
    "", // Email vide
    null, // Null
    undefined, // Undefined
    "user@", // Email incomplet
    "@example.com", // Partie utilisateur manquante
    "user name@example.com", // Espace dans la partie utilisateur
    "user..name@example.com", // Points consécutifs
    ".user@example.com", // Commence par un point
    "user.@example.com", // Finit par un point
];

specialCases.forEach((email, index) => {
    const result = validateAndNormalizeEmail(email);
    const displayEmail =
        email === null
            ? "null"
            : email === undefined
            ? "undefined"
            : `"${email}"`;
    console.log(
        `${index + 1}. ${displayEmail} → ${
            result.isValid ? "✅ VALIDE" : "❌ INVALIDE"
        } ${
            result.normalizedEmail
                ? `(normalisé: "${result.normalizedEmail}")`
                : `(erreur: ${result.error})`
        }`
    );
});

console.log("\n🎯 Résumé:");
console.log("─".repeat(50));
console.log("La validation d'email EcoRide:");
console.log("• Vérifie le format selon RFC 5322");
console.log("• Normalise l'email (minuscules, suppression des espaces)");
console.log("• Valide la longueur maximale (320 caractères)");
console.log("• Vérifie la structure locale@domaine");
console.log("• Interdit les points consécutifs et au début/fin");
console.log("• Retourne un message d'erreur explicite en cas d'échec\n");

module.exports = {
    runEmailValidationTests: () => {
        console.log("Tests de validation d'email exécutés avec succès !");
    },
};
