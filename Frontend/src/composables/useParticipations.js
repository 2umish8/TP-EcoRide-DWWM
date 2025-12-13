/**
 * Composable for participation management (passenger trips)
 * Handles loading, filtering, and actions on user's trip participations
 */

import { ref, computed } from 'vue'
import { participationService } from '@/services/api'
import { filterByStatus, sortByDate, sortByProperty } from '@/utils/helpers'

export default function useParticipations() {
  const participations = ref([])
  const loading = ref(false)
  const error = ref(null)
  const selectedStatus = ref('')
  const sortOrder = ref('date-desc')

  /**
   * Load user's participations from API
   */
  const loadParticipations = async () => {
    try {
      loading.value = true
      error.value = null

      const response = await participationService.getMyParticipations()
      participations.value = response.participations || []
      return participations.value
    } catch (err) {
      console.error('Error loading participations:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Filtered and sorted participations based on current filters
   */
  const filteredAndSortedParticipations = computed(() => {
    let filtered = participations.value

    // Filter by status
    if (selectedStatus.value) {
      filtered = filterByStatus(filtered, selectedStatus.value, 'carpooling_status')
    }

    // Sort
    switch (sortOrder.value) {
      case 'date-asc':
        return sortByDate(filtered, 'asc', 'departure_datetime')
      case 'date-desc':
        return sortByDate(filtered, 'desc', 'departure_datetime')
      case 'status':
        return sortByProperty(filtered, 'carpooling_status')
      default:
        return sortByDate(filtered, 'desc', 'departure_datetime')
    }
  })

  /**
   * Get participations by specific status
   */
  const getParticipationStatsByStatus = (status) => {
    return filterByStatus(participations.value, status, 'carpooling_status')
  }

  /**
   * Get total credits spent across all participations
   */
  const getTotalSpent = () => {
    return participations.value.reduce(
      (total, participation) => total + (participation.credits_paid || 0),
      0,
    )
  }

  /**
   * Cancel a participation
   */
  const cancelParticipation = async (carpoolingId) => {
    try {
      const result = await participationService.cancelParticipation(carpoolingId)
      await loadParticipations() // Reload participations
      return result
    } catch (err) {
      console.error('Error cancelling participation:', err)
      throw err
    }
  }

  /**
   * Check if a participation can be cancelled
   */
  const canCancelParticipation = (participation) => {
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

  return {
    // State
    participations,
    loading,
    error,
    selectedStatus,
    sortOrder,

    // Computed
    filteredAndSortedParticipations,

    // Methods
    loadParticipations,
    getParticipationStatsByStatus,
    getTotalSpent,
    cancelParticipation,
    canCancelParticipation,
  }
}
