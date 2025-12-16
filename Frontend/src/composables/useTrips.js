/**
 * Composable for trip management (driver trips)
 * Handles loading, filtering, sorting, and actions on driver's trips
 */

import { ref, computed } from 'vue'
import { carpoolingService } from '@/services/api'
import { filterByStatus, sortByDate, sortByProperty, sumProperty } from '@/utils/helpers'

export default function useTrips() {
  const trips = ref([])
  const loading = ref(false)
  const error = ref(null)
  const selectedStatus = ref('')
  const sortOrder = ref('date-desc')

  /**
   * Load driver trips from API
   */
  const loadTrips = async () => {
    try {
      loading.value = true
      error.value = null

      const response = await carpoolingService.getDriverTrips()
      if (import.meta.env.DEV) {
        console.log('Loaded driver trips response:', response)
      }
      trips.value = response.carpoolings || []
      return trips.value
    } catch (err) {
      error.value = err.message || 'Failed to load trips'
      if (import.meta.env.DEV) {
        console.error('Error loading trips:', err)
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Filtered and sorted trips based on current filters
   */
  const filteredAndSortedTrips = computed(() => {
    let filtered = trips.value

    // Filter by status
    if (selectedStatus.value) {
      filtered = filterByStatus(filtered, selectedStatus.value, 'status')
    }

    // Sort
    switch (sortOrder.value) {
      case 'date-asc':
        return sortByDate(filtered, 'asc', 'departure_datetime')
      case 'date-desc':
        return sortByDate(filtered, 'desc', 'departure_datetime')
      case 'status':
        return sortByProperty(filtered, 'status')
      default:
        return sortByDate(filtered, 'desc', 'departure_datetime')
    }
  })

  /**
   * Get trips by specific status
   */
  const getStatsByStatus = (status) => {
    return filterByStatus(trips.value, status, 'status')
  }

  /**
   * Get total number of participants across all trips
   */
  const getTotalParticipants = () => {
    return sumProperty(trips.value, 'participants_count')
  }

  /**
   * Start a trip (change status from 'prévu' to 'démarré')
   */
  const startTrip = async (tripId) => {
    try {
      await carpoolingService.startTrip(tripId)
      await loadTrips() // Reload trips
    } catch (err) {
      console.error('Error starting trip:', err)
      throw err
    }
  }

  /**
   * Finish a trip (change status to 'terminé')
   */
  const finishTrip = async (tripId) => {
    try {
      await carpoolingService.finishTrip(tripId)
      await loadTrips() // Reload trips
    } catch (err) {
      console.error('Error finishing trip:', err)
      throw err
    }
  }

  /**
   * Cancel a trip
   */
  const cancelTrip = async (tripId) => {
    try {
      await carpoolingService.cancelTrip(tripId)
      await loadTrips() // Reload trips
    } catch (err) {
      console.error('Error cancelling trip:', err)
      throw err
    }
  }

  return {
    // State
    trips,
    loading,
    error,
    selectedStatus,
    sortOrder,

    // Computed
    filteredAndSortedTrips,

    // Methods
    loadTrips,
    getStatsByStatus,
    getTotalParticipants,
    startTrip,
    finishTrip,
    cancelTrip,
  }
}
