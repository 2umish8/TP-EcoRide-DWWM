/**
 * Utilitaire de validation de mots de passe côté front-end
 * Compatible avec la validation du back-end EcoRide
 */

/**
 * Configuration des critères de mot de passe
 */
export const PASSWORD_CRITERIA = {
  minLength: 8,
  maxLength: 128,
  requireLowercase: true,
  requireUppercase: true,
  requireDigits: true,
  requireSpecialChars: true,
  minDigits: 1,
  minSpecialChars: 1,
  specialCharsPattern: /[!@#$%^&*(),.?":{}|<>_+=\-[\]\\~`]/,
  forbiddenChars: /[<>'"&;]/,
}

/**
 * Analyse la force d'un mot de passe et retourne les critères non respectés
 * @param {string} password - Le mot de passe à analyser
 * @returns {object} - Objet contenant l'analyse complète du mot de passe
 */
export const analyzePasswordStrength = (password) => {
  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      score: 0,
      strength: 'invalid',
      errors: ['Mot de passe manquant ou invalide'],
      requirements: [],
      analysis: {
        length: 0,
        hasLowercase: false,
        hasUppercase: false,
        digitCount: 0,
        specialCharCount: 0,
        hasForbiddenChars: false,
      },
    }
  }

  const errors = []
  const requirements = []
  let score = 0
  const maxScore = 7

  // 1. Longueur minimale
  if (password.length < PASSWORD_CRITERIA.minLength) {
    errors.push(`Au moins ${PASSWORD_CRITERIA.minLength} caractères`)
    requirements.push(`Minimum ${PASSWORD_CRITERIA.minLength} caractères`)
  } else {
    score++
  }

  // 2. Longueur maximale
  if (password.length > PASSWORD_CRITERIA.maxLength) {
    errors.push(`Maximum ${PASSWORD_CRITERIA.maxLength} caractères`)
  } else {
    score++
  }

  // 3. Caractères minuscules
  if (PASSWORD_CRITERIA.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Une lettre minuscule')
    requirements.push('Une lettre minuscule (a-z)')
  } else if (PASSWORD_CRITERIA.requireLowercase) {
    score++
  }

  // 4. Caractères majuscules
  if (PASSWORD_CRITERIA.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Une lettre majuscule')
    requirements.push('Une lettre majuscule (A-Z)')
  } else if (PASSWORD_CRITERIA.requireUppercase) {
    score++
  }

  // 5. Chiffres
  const digitCount = (password.match(/\d/g) || []).length
  if (PASSWORD_CRITERIA.requireDigits && digitCount < PASSWORD_CRITERIA.minDigits) {
    errors.push(`${PASSWORD_CRITERIA.minDigits} chiffre(s)`)
    requirements.push(`Au moins ${PASSWORD_CRITERIA.minDigits} chiffre(s) (0-9)`)
  } else if (PASSWORD_CRITERIA.requireDigits) {
    score++
  }

  // 6. Caractères spéciaux
  const specialCharCount = (password.match(PASSWORD_CRITERIA.specialCharsPattern) || []).length
  if (
    PASSWORD_CRITERIA.requireSpecialChars &&
    specialCharCount < PASSWORD_CRITERIA.minSpecialChars
  ) {
    errors.push(`${PASSWORD_CRITERIA.minSpecialChars} caractère spécial`)
    requirements.push(
      `Au moins ${PASSWORD_CRITERIA.minSpecialChars} caractère spécial (!@#$%^&*...)`,
    )
  } else if (PASSWORD_CRITERIA.requireSpecialChars) {
    score++
  }

  // 7. Caractères interdits
  if (PASSWORD_CRITERIA.forbiddenChars.test(password)) {
    errors.push('Aucun caractère interdit (<>\'"&;)')
  } else {
    score++
  }

  // Calcul de la force
  const percentage = (score / maxScore) * 100
  let strength

  if (score === maxScore) {
    strength = 'excellent'
  } else if (percentage >= 80) {
    strength = 'fort'
  } else if (percentage >= 60) {
    strength = 'moyen'
  } else if (percentage >= 40) {
    strength = 'faible'
  } else {
    strength = 'très faible'
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
  }
}

/**
 * Valide un mot de passe selon les critères EcoRide
 * @param {string} password - Le mot de passe à valider
 * @returns {object} - Résultat de la validation
 */
export const validatePassword = (password) => {
  const analysis = analyzePasswordStrength(password)

  return {
    isValid: analysis.isValid,
    errors: analysis.errors,
    strength: analysis.strength,
    percentage: analysis.percentage,
    suggestions: generatePasswordSuggestions(analysis.analysis),
  }
}

/**
 * Génère des suggestions pour améliorer le mot de passe
 * @param {object} analysis - Analyse du mot de passe
 * @returns {array} - Liste de suggestions
 */
export const generatePasswordSuggestions = (analysis) => {
  const suggestions = []

  if (!analysis.hasLowercase) {
    suggestions.push('Ajoutez des lettres minuscules')
  }

  if (!analysis.hasUppercase) {
    suggestions.push('Ajoutez des lettres majuscules')
  }

  if (analysis.digitCount < PASSWORD_CRITERIA.minDigits) {
    suggestions.push('Ajoutez des chiffres')
  }

  if (analysis.specialCharCount < PASSWORD_CRITERIA.minSpecialChars) {
    suggestions.push('Ajoutez des caractères spéciaux')
  }

  if (analysis.length < PASSWORD_CRITERIA.minLength) {
    suggestions.push('Allongez votre mot de passe')
  }

  if (suggestions.length === 0 && !analysis.isValid) {
    suggestions.push('Vérifiez les caractères utilisés')
  }

  return suggestions
}

/**
 * Obtient un message d'erreur pour l'affichage utilisateur
 * @param {object} validation - Résultat de validatePassword
 * @returns {string|null} - Message d'erreur ou null si valide
 */
export const getPasswordErrorMessage = (validation) => {
  if (validation.isValid) {
    return null
  }

  if (validation.errors.length === 1) {
    return `Manque : ${validation.errors[0]}`
  }

  return `Manque : ${validation.errors.slice(0, 3).join(', ')}${validation.errors.length > 3 ? '...' : ''}`
}

/**
 * Obtient la couleur CSS selon la force du mot de passe
 * @param {string} strength - Force du mot de passe
 * @returns {string} - Classe CSS
 */
export const getPasswordStrengthColor = (strength) => {
  switch (strength) {
    case 'excellent':
      return 'strength-excellent'
    case 'fort':
      return 'strength-good'
    case 'moyen':
      return 'strength-medium'
    case 'faible':
      return 'strength-weak'
    case 'très faible':
      return 'strength-very-weak'
    default:
      return 'strength-invalid'
  }
}

/**
 * Obtient l'icône selon la force du mot de passe
 * @param {string} strength - Force du mot de passe
 * @returns {string} - Emoji d'icône
 */
export const getPasswordStrengthIcon = (strength) => {
  switch (strength) {
    case 'excellent':
      return '🔒'
    case 'fort':
      return '✅'
    case 'moyen':
      return '⚠️'
    case 'faible':
      return '❌'
    case 'très faible':
      return '🚨'
    default:
      return '❓'
  }
}

/**
 * Vérifie si deux mots de passe sont identiques
 * @param {string} password - Premier mot de passe
 * @param {string} confirmPassword - Confirmation du mot de passe
 * @returns {object} - Résultat de la comparaison
 */
export const validatePasswordConfirmation = (password, confirmPassword) => {
  if (!password || !confirmPassword) {
    return {
      isValid: false,
      error: 'Veuillez confirmer votre mot de passe',
    }
  }

  if (password !== confirmPassword) {
    return {
      isValid: false,
      error: 'Les mots de passe ne correspondent pas',
    }
  }

  return {
    isValid: true,
    error: null,
  }
}
