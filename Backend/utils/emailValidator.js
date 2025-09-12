/**
 * Utilitaire de validation d'email
 * Vérifie si le format d'un email est conforme aux standards RFC 5322
 */

/**
 * Valide le format d'une adresse email
 * @param {string} email - L'adresse email à valider
 * @returns {boolean} - True si l'email est valide, false sinon
 */
const isValidEmail = (email) => {
    // Vérifier que l'email existe et est une chaîne de caractères
    if (!email || typeof email !== "string") {
        return false;
    }

    // Expression régulière pour valider le format d'email selon RFC 5322
    // Cette regex couvre la plupart des cas d'usage courants
    const emailRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    // Vérifications supplémentaires
    const trimmedEmail = email.trim();

    // Vérifier la longueur maximale (320 caractères selon RFC 5321)
    if (trimmedEmail.length > 320) {
        return false;
    }

    // Vérifier qu'il n'y a qu'un seul @
    const atCount = (trimmedEmail.match(/@/g) || []).length;
    if (atCount !== 1) {
        return false;
    }

    // Diviser en partie locale et domaine
    const [localPart, domain] = trimmedEmail.split("@");

    // Vérifier la longueur de la partie locale (64 caractères max)
    if (localPart.length > 64) {
        return false;
    }

    // Vérifier la longueur du domaine (253 caractères max)
    if (domain.length > 253) {
        return false;
    }

    // Vérifier que la partie locale ne commence/finit pas par un point
    if (localPart.startsWith(".") || localPart.endsWith(".")) {
        return false;
    }

    // Vérifier qu'il n'y a pas de points consécutifs dans la partie locale
    if (localPart.includes("..")) {
        return false;
    }

    // Vérifier que le domaine contient au moins un point (pour éviter des domaines comme "com")
    if (!domain.includes(".")) {
        return false;
    }

    // Vérifier avec l'expression régulière
    return emailRegex.test(trimmedEmail);
};

/**
 * Valide et normalise une adresse email
 * @param {string} email - L'adresse email à valider et normaliser
 * @returns {object} - Objet contenant isValid (boolean) et normalizedEmail (string)
 */
const validateAndNormalizeEmail = (email) => {
    if (!email || typeof email !== "string") {
        return {
            isValid: false,
            normalizedEmail: null,
            error: "Email manquant ou invalide",
        };
    }

    const trimmedEmail = email.trim().toLowerCase();
    const isValid = isValidEmail(trimmedEmail);

    return {
        isValid,
        normalizedEmail: isValid ? trimmedEmail : null,
        error: isValid ? null : "Format d'email invalide",
    };
};

/**
 * Exemples d'emails valides et invalides pour les tests
 */
const emailValidationExamples = {
    valid: [
        "user@example.com",
        "user.name@example.com",
        "user+tag@example.com",
        "user_name@example.co.uk",
        "test123@test-domain.com",
        "a@b.co",
    ],
    invalid: [
        "plainaddress",
        "@missingusername.com",
        "username@.com",
        "username@com",
        "username..double.dot@example.com",
        "username@-example.com",
        "username@example-.com",
        ".username@example.com",
        "username.@example.com",
        "username@",
        "username@example.",
        "user name@example.com", // espace non autorisé
        "username@@example.com", // double @
    ],
};

module.exports = {
    isValidEmail,
    validateAndNormalizeEmail,
    emailValidationExamples,
};
