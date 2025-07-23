/**
 * Utilitaire de validation d'email côté front-end
 * Compatible avec la validation du back-end EcoRide
 */

/**
 * Valide le format d'une adresse email
 * @param {string} email - L'adresse email à valider
 * @returns {boolean} - True si l'email est valide, false sinon
 */
export const isValidEmail = (email) => {
  // Vérifier que l'email existe et est une chaîne de caractères
  if (!email || typeof email !== 'string') {
    return false
  }

  // Expression régulière pour valider le format d'email selon RFC 5322
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  const trimmedEmail = email.trim()

  // Vérifier la longueur maximale (320 caractères selon RFC 5321)
  if (trimmedEmail.length > 320) {
    return false
  }

  // Vérifier qu'il n'y a qu'un seul @
  const atCount = (trimmedEmail.match(/@/g) || []).length
  if (atCount !== 1) {
    return false
  }

  // Diviser en partie locale et domaine
  const [localPart, domain] = trimmedEmail.split('@')

  // Vérifier la longueur de la partie locale (64 caractères max)
  if (localPart.length > 64) {
    return false
  }

  // Vérifier la longueur du domaine (253 caractères max)
  if (domain.length > 253) {
    return false
  }

  // Vérifier que la partie locale ne commence/finit pas par un point
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return false
  }

  // Vérifier qu'il n'y a pas de points consécutifs dans la partie locale
  if (localPart.includes('..')) {
    return false
  }

  // Vérifier que le domaine contient au moins un point
  if (!domain.includes('.')) {
    return false
  }

  // Vérifier avec l'expression régulière
  return emailRegex.test(trimmedEmail)
}

/**
 * Valide et normalise une adresse email
 * @param {string} email - L'adresse email à valider et normaliser
 * @returns {object} - Objet contenant isValid, normalizedEmail et error
 */
export const validateAndNormalizeEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return {
      isValid: false,
      normalizedEmail: null,
      error: 'Email manquant ou invalide',
    }
  }

  const trimmedEmail = email.trim().toLowerCase()
  const isValid = isValidEmail(trimmedEmail)

  return {
    isValid,
    normalizedEmail: isValid ? trimmedEmail : null,
    error: isValid ? null : "Format d'email invalide",
  }
}

/**
 * Obtient un message d'erreur descriptif pour l'email
 * @param {string} email - L'adresse email à analyser
 * @returns {string|null} - Message d'erreur ou null si valide
 */
export const getEmailErrorMessage = (email) => {
  if (!email || typeof email !== 'string') {
    return 'Veuillez saisir une adresse email'
  }

  const trimmedEmail = email.trim()

  if (trimmedEmail.length === 0) {
    return 'Veuillez saisir une adresse email'
  }

  if (trimmedEmail.length > 320) {
    return "L'adresse email est trop longue (maximum 320 caractères)"
  }

  const atCount = (trimmedEmail.match(/@/g) || []).length
  if (atCount === 0) {
    return "L'adresse email doit contenir le symbole @"
  }

  if (atCount > 1) {
    return "L'adresse email ne peut contenir qu'un seul symbole @"
  }

  const [localPart, domain] = trimmedEmail.split('@')

  if (!localPart) {
    return 'Partie utilisateur manquante avant le @'
  }

  if (!domain) {
    return 'Nom de domaine manquant après le @'
  }

  if (localPart.length > 64) {
    return 'La partie utilisateur est trop longue (maximum 64 caractères)'
  }

  if (domain.length > 253) {
    return 'Le nom de domaine est trop long (maximum 253 caractères)'
  }

  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return 'La partie utilisateur ne peut pas commencer ou finir par un point'
  }

  if (localPart.includes('..')) {
    return 'La partie utilisateur ne peut pas contenir de points consécutifs'
  }

  if (!domain.includes('.')) {
    return 'Le domaine doit contenir au moins un point'
  }

  if (domain.startsWith('-') || domain.endsWith('-')) {
    return 'Le domaine ne peut pas commencer ou finir par un tiret'
  }

  if (domain.startsWith('.') || domain.endsWith('.')) {
    return 'Le domaine ne peut pas commencer ou finir par un point'
  }

  // Si on arrive ici et que l'email n'est toujours pas valide, c'est un format général incorrect
  if (!isValidEmail(trimmedEmail)) {
    return "Format d'email invalide (ex: utilisateur@exemple.com)"
  }

  return null
}
