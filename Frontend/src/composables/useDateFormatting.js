/**
 * composable for date and time formatting utilities
 * Centralizes all date/time formatting logic used across views
 * Eliminates duplicate implementations in MyTripsView, ProfileView, SearchResults, CarpoolingDetail
 */

/**
 * Format date to localized string (e.g., "jeu. 13 déc. 2025")
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Format time to HH:MM (e.g., "14:30")
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Formatted time
 */
export const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format duration between two dates (e.g., "2h30" or "45min")
 * @param {string|Date} startDate - Start date string or Date object
 * @param {string|Date} endDate - End date string or Date object
 * @returns {string} Formatted duration
 */
export const formatDuration = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffMinutes = Math.round((end - start) / (1000 * 60))

  const hours = Math.floor(diffMinutes / 60)
  const minutes = diffMinutes % 60

  if (hours > 0) {
    return `${hours}h${minutes > 0 ? minutes.toString().padStart(2, '0') : ''}`
  }
  return `${minutes}min`
}

/**
 * Format date and time together (e.g., "jeu. 13 déc. 2025 à 14:30")
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Formatted date and time
 */
export const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  const dateFormatted = formatDate(date)
  const timeFormatted = formatTime(date)
  return `${dateFormatted} à ${timeFormatted}`
}

/**
 * Composable for date formatting utilities
 * @returns {Object} Object containing all formatting functions
 */
export default function useDateFormatting() {
  return {
    formatDate,
    formatTime,
    formatDuration,
    formatDateTime,
  }
}
