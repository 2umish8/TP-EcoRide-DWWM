/**
 * Utilitaire de validation de mots de passe forts
 * Vérifie la robustesse des mots de passe selon les critères de sécurité EcoRide
 */

/**
 * Configuration des critères de mot de passe
 */
const PASSWORD_CRITERIA = {
    minLength: 8,
    maxLength: 128,
    requireLowercase: true,
    requireUppercase: true,
    requireDigits: true,
    requireSpecialChars: true,
    minDigits: 1,
    minSpecialChars: 1,
    specialCharsPattern: /[!@#$%^&*(),.?":{}|<>_+=\-\[\]\\\/~`]/,
    // Caractères spéciaux interdits pour éviter les problèmes d'injection
    forbiddenChars: /[<>'"&;]/,
};

/**
 * Analyse la force d'un mot de passe et retourne les critères non respectés
 * @param {string} password - Le mot de passe à analyser
 * @returns {object} - Objet contenant l'analyse complète du mot de passe
 */
const analyzePasswordStrength = (password) => {
    if (!password || typeof password !== "string") {
        return {
            isValid: false,
            score: 0,
            strength: "invalid",
            errors: ["Mot de passe manquant ou invalide"],
            requirements: [],
        };
    }

    const errors = [];
    const requirements = [];
    let score = 0;
    const maxScore = 7; // Nombre total de critères

    // 1. Longueur minimale
    if (password.length < PASSWORD_CRITERIA.minLength) {
        errors.push(
            `Le mot de passe doit contenir au moins ${PASSWORD_CRITERIA.minLength} caractères`
        );
        requirements.push(`Minimum ${PASSWORD_CRITERIA.minLength} caractères`);
    } else {
        score++;
    }

    // 2. Longueur maximale (sécurité et performance)
    if (password.length > PASSWORD_CRITERIA.maxLength) {
        errors.push(
            `Le mot de passe ne peut pas dépasser ${PASSWORD_CRITERIA.maxLength} caractères`
        );
    } else {
        score++;
    }

    // 3. Caractères minuscules
    if (PASSWORD_CRITERIA.requireLowercase && !/[a-z]/.test(password)) {
        errors.push(
            "Le mot de passe doit contenir au moins une lettre minuscule"
        );
        requirements.push("Une lettre minuscule (a-z)");
    } else if (PASSWORD_CRITERIA.requireLowercase) {
        score++;
    }

    // 4. Caractères majuscules
    if (PASSWORD_CRITERIA.requireUppercase && !/[A-Z]/.test(password)) {
        errors.push(
            "Le mot de passe doit contenir au moins une lettre majuscule"
        );
        requirements.push("Une lettre majuscule (A-Z)");
    } else if (PASSWORD_CRITERIA.requireUppercase) {
        score++;
    }

    // 5. Chiffres
    const digitCount = (password.match(/\d/g) || []).length;
    if (
        PASSWORD_CRITERIA.requireDigits &&
        digitCount < PASSWORD_CRITERIA.minDigits
    ) {
        errors.push(
            `Le mot de passe doit contenir au moins ${PASSWORD_CRITERIA.minDigits} chiffre(s)`
        );
        requirements.push(
            `Au moins ${PASSWORD_CRITERIA.minDigits} chiffre(s) (0-9)`
        );
    } else if (PASSWORD_CRITERIA.requireDigits) {
        score++;
    }

    // 6. Caractères spéciaux
    const specialCharCount = (
        password.match(PASSWORD_CRITERIA.specialCharsPattern) || []
    ).length;
    if (
        PASSWORD_CRITERIA.requireSpecialChars &&
        specialCharCount < PASSWORD_CRITERIA.minSpecialChars
    ) {
        errors.push(
            `Le mot de passe doit contenir au moins ${PASSWORD_CRITERIA.minSpecialChars} caractère(s) spécial(aux)`
        );
        requirements.push(
            `Au moins ${PASSWORD_CRITERIA.minSpecialChars} caractère spécial (!@#$%^&*...)`
        );
    } else if (PASSWORD_CRITERIA.requireSpecialChars) {
        score++;
    }

    // 7. Caractères interdits (sécurité)
    if (PASSWORD_CRITERIA.forbiddenChars.test(password)) {
        errors.push(
            "Le mot de passe contient des caractères interdits (<>'\"&;)"
        );
    } else {
        score++;
    }

    // Calcul de la force
    const percentage = (score / maxScore) * 100;
    let strength;

    if (score === maxScore) {
        strength = "excellent";
    } else if (percentage >= 80) {
        strength = "fort";
    } else if (percentage >= 60) {
        strength = "moyen";
    } else if (percentage >= 40) {
        strength = "faible";
    } else {
        strength = "très faible";
    }

    return {
        isValid: errors.length === 0,
        score,
        maxScore,
        percentage: Math.round(percentage),
        strength,
        errors,
        requirements,
        analysis: {
            length: password.length,
            hasLowercase: /[a-z]/.test(password),
            hasUppercase: /[A-Z]/.test(password),
            digitCount,
            specialCharCount,
            hasForbiddenChars: PASSWORD_CRITERIA.forbiddenChars.test(password),
        },
    };
};

/**
 * Valide un mot de passe selon les critères EcoRide
 * @param {string} password - Le mot de passe à valider
 * @returns {object} - Résultat de la validation
 */
const validatePassword = (password) => {
    const analysis = analyzePasswordStrength(password);

    return {
        isValid: analysis.isValid,
        errors: analysis.errors,
        suggestions: generatePasswordSuggestions(analysis),
    };
};

/**
 * Génère des suggestions pour améliorer le mot de passe
 * @param {object} analysis - Analyse du mot de passe
 * @returns {array} - Liste de suggestions
 */
const generatePasswordSuggestions = (analysis) => {
    const suggestions = [];

    if (!analysis.analysis.hasLowercase) {
        suggestions.push("Ajoutez des lettres minuscules (a, b, c...)");
    }

    if (!analysis.analysis.hasUppercase) {
        suggestions.push("Ajoutez des lettres majuscules (A, B, C...)");
    }

    if (analysis.analysis.digitCount < PASSWORD_CRITERIA.minDigits) {
        suggestions.push("Ajoutez des chiffres (0, 1, 2...)");
    }

    if (
        analysis.analysis.specialCharCount < PASSWORD_CRITERIA.minSpecialChars
    ) {
        suggestions.push("Ajoutez des caractères spéciaux (!@#$%^&*...)");
    }

    if (analysis.analysis.length < PASSWORD_CRITERIA.minLength) {
        suggestions.push(
            `Allongez votre mot de passe (minimum ${PASSWORD_CRITERIA.minLength} caractères)`
        );
    }

    if (suggestions.length === 0 && !analysis.isValid) {
        suggestions.push("Vérifiez les caractères utilisés");
    }

    return suggestions;
};

/**
 * Génère un mot de passe sécurisé aléatoire
 * @param {number} length - Longueur souhaitée (défaut: 12)
 * @returns {string} - Mot de passe généré
 */
const generateSecurePassword = (length = 12) => {
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const digits = "0123456789";
    const specialChars = "!@#$%^*()_+-=[]{}|:,.<>?~`"; // Suppression des caractères interdits

    // S'assurer qu'on a au moins un caractère de chaque type requis
    let password = "";
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += digits[Math.floor(Math.random() * digits.length)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];

    // Compléter avec des caractères aléatoires
    const allChars = lowercase + uppercase + digits + specialChars;
    for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Mélanger les caractères
    return password
        .split("")
        .sort(() => Math.random() - 0.5)
        .join("");
};

/**
 * Vérifie si deux mots de passe sont identiques
 * @param {string} password - Premier mot de passe
 * @param {string} confirmPassword - Confirmation du mot de passe
 * @returns {object} - Résultat de la comparaison
 */
const validatePasswordConfirmation = (password, confirmPassword) => {
    if (!password || !confirmPassword) {
        return {
            isValid: false,
            error: "Veuillez saisir et confirmer votre mot de passe",
        };
    }

    if (password !== confirmPassword) {
        return {
            isValid: false,
            error: "Les mots de passe ne correspondent pas",
        };
    }

    return {
        isValid: true,
        error: null,
    };
};

/**
 * Obtient un message d'erreur pour l'affichage utilisateur
 * @param {object} validation - Résultat de validatePassword
 * @returns {string|null} - Message d'erreur ou null si valide
 */
const getPasswordErrorMessage = (validation) => {
    if (validation.isValid) {
        return null;
    }

    if (validation.errors.length === 1) {
        return validation.errors[0];
    }

    return `Votre mot de passe doit respecter les critères suivants : ${validation.errors.join(
        ", "
    )}`;
};

/**
 * Configuration et exemples pour les tests
 */
const passwordValidationExamples = {
    valid: ["MyP@ssw0rd123", "SecurePass1!", "C0mpl3x!P@ss", "Str0ngP@ssw0rd!"],
    invalid: [
        "password", // Pas de majuscule, chiffre, caractère spécial
        "PASSWORD123", // Pas de minuscule, caractère spécial
        "Password", // Pas de chiffre, caractère spécial
        "Pass1!", // Trop court
        "password123", // Pas de majuscule, caractère spécial
        "PASSWORD!", // Pas de minuscule, chiffre
        "MyPassword123", // Pas de caractère spécial
        "MyP@ssword", // Pas de chiffre
        "", // Vide
        "a".repeat(130), // Trop long
    ],
};

module.exports = {
    analyzePasswordStrength,
    validatePassword,
    validatePasswordConfirmation,
    generateSecurePassword,
    getPasswordErrorMessage,
    generatePasswordSuggestions,
    PASSWORD_CRITERIA,
    passwordValidationExamples,
};
