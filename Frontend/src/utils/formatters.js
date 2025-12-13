/**
 * Shared formatting utilities across the application
 * Handles status labels, icons, currency, and other text transformations
 */

/**
 * Get status label for display
 * @param {string} status - Status code (prévu, démarré, terminé, annulé)
 * @returns {string} Formatted status label
 */
export const getStatusLabel = (status) => {
  const labels = {
    prévu: 'Prévu',
    démarré: 'En cours',
    terminé: 'Terminé',
    annulé: 'Annulé',
  }
  return labels[status] || status
}

/**
 * Get status icon name for FontAwesome
 * @param {string} status - Status code
 * @returns {string} Icon name
 */
export const getStatusIcon = (status) => {
  const icons = {
    prévu: 'calendar',
    démarré: 'car',
    terminé: 'circle-check',
    annulé: 'xmark',
  }
  return icons[status] || 'question'
}

/**
 * Get empty state message for a status
 * @param {string} status - Status code
 * @returns {string} Message text
 */
export const getStatusEmptyMessage = (status) => {
  const messages = {
    prévu: 'prévu',
    démarré: 'en cours',
    terminé: 'terminé',
    annulé: 'annulé',
  }
  return messages[status] || status
}

/**
 * Convert decimal rating (0-5) to star display
 * @param {number} rating - Rating value
 * @returns {string} Star string (e.g., "★★★★☆")
 */
export const getStars = (rating) => {
  if (!rating || rating < 0) return '☆☆☆☆☆'
  const filled = Math.floor(rating)
  const empty = 5 - filled
  return '★'.repeat(filled) + '☆'.repeat(empty)
}

/**
 * Format credits/currency value
 * @param {number} value - Credit value
 * @returns {string} Formatted value with unit
 */
export const formatCredits = (value) => {
  return `${value} crédits`
}

/**
 * Format percentage
 * @param {number} value - Percentage value (0-100)
 * @param {number} decimals - Number of decimal places (default: 0)
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, decimals = 0) => {
  return `${value.toFixed(decimals)}%`
}

/**
 * Format distance in kilometers
 * @param {number} distance - Distance in kilometers
 * @returns {string} Formatted distance
 */
export const formatDistance = (distance) => {
  if (distance >= 1000) {
    return `${(distance / 1000).toFixed(1)} km`
  }
  return `${distance} m`
}
