/**
 * Shared helper functions across the application
 * Handles calculations, filters, and utility logic
 */

/**
 * Calculate earnings from a trip
 * @param {Object} trip - Trip object with participants_count, price_per_passenger, platform_commission_earned
 * @returns {number} Net earnings in credits
 */
export const calculateEarnings = (trip) => {
  const participants = trip.participants_count || 0
  const pricePerPassenger = trip.price_per_passenger || 0
  const platformCommission = trip.platform_commission_earned || 2 // Commission de la plateforme par passager

  return Math.max(0, participants * pricePerPassenger - participants * platformCommission)
}

/**
 * Calculate carbon saved from carpooling trips
 * Estimation: 120g CO₂ per km per passenger avoided
 * Distance estimation: 1h ≈ 60km average
 * @param {Array} trips - Array of completed trips with participants
 * @returns {number} Total CO₂ saved in kg (rounded)
 */
export const calculateCarbonSaved = (trips) => {
  let totalCarbonSaved = 0

  trips.forEach((trip) => {
    if (trip.status === 'terminé' && trip.participants_count > 0) {
      // Estimer la distance basée sur la durée
      const start = new Date(trip.departure_datetime)
      const end = new Date(trip.arrival_datetime)
      const durationHours = (end - start) / (1000 * 60 * 60)
      const estimatedDistance = durationHours * 60 // 60km/h moyenne

      // CO₂ économisé = distance × participants × 0.12kg CO₂/km
      const carbonSavedForTrip = estimatedDistance * trip.participants_count * 0.12
      totalCarbonSaved += carbonSavedForTrip
    }
  })

  return Math.round(totalCarbonSaved)
}

/**
 * Filter array of items by a specific status
 * @param {Array} items - Items to filter
 * @param {string} status - Status to filter by
 * @param {string} statusKey - Key name for status property (default: 'status')
 * @returns {Array} Filtered items
 */
export const filterByStatus = (items, status, statusKey = 'status') => {
  if (!status) return items
  return items.filter((item) => item[statusKey] === status)
}

/**
 * Sort items by date
 * @param {Array} items - Items to sort
 * @param {string} order - 'asc' for ascending, 'desc' for descending (default)
 * @param {string} dateKey - Key name for date property (default: 'departure_datetime')
 * @returns {Array} Sorted items
 */
export const sortByDate = (items, order = 'desc', dateKey = 'departure_datetime') => {
  const sorted = [...items]
  return sorted.sort((a, b) => {
    const dateA = new Date(a[dateKey])
    const dateB = new Date(b[dateKey])
    return order === 'asc' ? dateA - dateB : dateB - dateA
  })
}

/**
 * Sort items by a string property
 * @param {Array} items - Items to sort
 * @param {string} key - Property key to sort by
 * @returns {Array} Sorted items
 */
export const sortByProperty = (items, key) => {
  const sorted = [...items]
  return sorted.sort((a, b) => {
    const valA = a[key] || ''
    const valB = b[key] || ''
    return valA.localeCompare(valB)
  })
}

/**
 * Get count of items with a specific status
 * @param {Array} items - Items to count
 * @param {string} status - Status to count
 * @param {string} statusKey - Key name for status property (default: 'status')
 * @returns {number} Count of items with that status
 */
export const getStatusCount = (items, status, statusKey = 'status') => {
  return items.filter((item) => item[statusKey] === status).length
}

/**
 * Format duration in minutes to hours and minutes format
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration (e.g., '2h30', '1h', '45min')
 */
export const formatDurationMinutes = (minutes) => {
  if (!minutes) return 'N/A'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}h${mins > 0 ? mins.toString().padStart(2, '0') : ''}`
  }
  return `${mins}min`
}

/**
 * Sum a numeric property across all items
 * @param {Array} items - Items to sum
 * @param {string} key - Property key to sum
 * @returns {number} Sum total
 */
export const sumProperty = (items, key) => {
  return items.reduce((total, item) => total + (item[key] || 0), 0)
}

/**
 * Check if a participation can be cancelled
 * @param {Object} participation - Participation object
 * @returns {boolean} True if can be cancelled
 */
export const canCancelParticipation = (participation) => {
  // Cannot cancel if already cancelled
  if (participation.cancellation_date) {
    return false
  }

  // Cannot cancel if carpooling is already started or finished
  if (participation.carpooling_status !== 'prévu') {
    return false
  }

  return true
}

/**
 * Pluralize word based on count
 * @param {number} count - Count for pluralization
 * @param {string} singular - Singular form
 * @param {string} plural - Plural form (default: singular + 's')
 * @returns {string} Correct form based on count
 */
export const pluralize = (count, singular, plural = null) => {
  if (count <= 1) return singular
  return plural || `${singular}s`
}
