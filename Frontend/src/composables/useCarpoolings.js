import { ref, computed } from 'vue'
import { carpoolingService } from '@/services/api.js'
import { useAuthStore } from '@/stores/auth'

export const useCarpoolings = () => {
  const loading = ref(false)
  const error = ref(null)
  const nextAvailableDate = ref(null)
  const carpoolings = ref([])
  const authStore = useAuthStore()

  const loadCarpoolings = async (queryParams) => {
    try {
      loading.value = true
      error.value = null
      nextAvailableDate.value = null

      const data = await carpoolingService.getAvailableTrips(queryParams)
      if (import.meta.env.DEV) {
        console.log('[useCarpoolings DEBUG] Raw response from backend:', data)
        console.log('[useCarpoolings DEBUG] Carpoolings array:', data.carpoolings)
        if (data.carpoolings && data.carpoolings.length > 0) {
          console.log('[useCarpoolings DEBUG] First carpooling from backend:', data.carpoolings[0])
        }
      }
      carpoolings.value = data.carpoolings || []
      nextAvailableDate.value = data.nextAvailableDate
    } catch (err) {
      console.error('Erreur lors du chargement des covoiturages:', err)
      error.value = err.response?.data?.message || 'Erreur de connexion au serveur'
    } finally {
      loading.value = false
    }
  }

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h${mins > 0 ? mins.toString().padStart(2, '0') : ''}` : `${mins}min`
  }

  const getFeatures = (carpooling) => {
    const features = []
    if (carpooling.is_electric) {
      features.push('Voyage écologique')
    }
    return features
  }

  const formattedResults = computed(() => {
    const results = carpoolings.value.map((carpooling) => ({
      // Keep all raw fields for TripCard compatibility
      ...carpooling,
      // Add formatted fields for sorting references
      driverId: carpooling.driver_id,
      departure: carpooling.departure_address,
      destination: carpooling.arrival_address,
      departureTime: new Date(carpooling.departure_datetime).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      arrivalTime: new Date(carpooling.arrival_datetime).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      duration: formatDuration(carpooling.duration_minutes),
      price: carpooling.price_per_passenger,
      seatsAvailable: carpooling.seats_remaining,
      formattedDriver: {
        name: carpooling.driver_pseudo,
        avatar:
          carpooling.driver_photo || 'https://i.pravatar.cc/150?img=' + (carpooling.driver_id % 70),
        rating: carpooling.driver_rating ? parseFloat(carpooling.driver_rating).toFixed(1) : 'N/A',
        ridesCount: 0,
      },
      formattedVehicle: {
        model: carpooling.model,
        brand: carpooling.brand_name,
        color: carpooling.color_name,
        isElectric: carpooling.is_electric,
      },
      features: getFeatures(carpooling),
    }))

    // Tri par priorité
    return results.sort((a, b) => {
      const aIsMyTrip = authStore.currentUser && a.driver_id === authStore.currentUser.id
      const bIsMyTrip = authStore.currentUser && b.driver_id === authStore.currentUser.id

      if (aIsMyTrip && !bIsMyTrip) return -1
      if (!aIsMyTrip && bIsMyTrip) return 1

      if (a.is_electric && !b.is_electric) return -1
      if (!a.is_electric && b.is_electric) return 1

      const aRating = a.driver_rating === 'N/A' ? 0 : parseFloat(a.driver_rating)
      const bRating = b.driver_rating === 'N/A' ? 0 : parseFloat(b.driver_rating)
      return bRating - aRating
    })
  })

  return {
    loading,
    error,
    nextAvailableDate,
    carpoolings,
    loadCarpoolings,
    formattedResults,
  }
}
