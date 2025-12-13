/**
 * Composable for checking and managing driver status
 * Handles determining if a user is an active driver
 */

import { ref } from 'vue'
import { carpoolingService } from '@/services/api'

export default function useDriverStatus() {
  const isDriver = ref(false)
  const loading = ref(false)

  /**
   * Check if current user is a driver
   * Attempts to load driver trips; if 403/401, user is not a driver
   */
  const checkDriverStatus = async () => {
    try {
      loading.value = true
      await carpoolingService.getDriverTrips()
      isDriver.value = true
    } catch (err) {
      // If error is authorization-related, user is not a driver
      if (
        err.response?.status === 403 ||
        err.response?.status === 401 ||
        err.response?.data?.message?.includes('conducteur') ||
        err.response?.data?.message?.includes('driver')
      ) {
        isDriver.value = false
      } else {
        // For other errors, assume they could be a driver
        isDriver.value = true
      }
    } finally {
      loading.value = false
    }
  }

  return {
    isDriver,
    loading,
    checkDriverStatus,
  }
}
