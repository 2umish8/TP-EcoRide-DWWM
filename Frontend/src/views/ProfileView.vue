<template>
  <div class="profile-page">
    <div class="profile-container">
      <!-- Profile header -->
      <ProfileHeader :user="currentUser" />

      <!-- Role selection -->
      <RoleSelectionCard
        v-model="selectedRoles"
        :is-loading="isLoadingProfile"
        @role-changed="updateRole"
      />

      <!-- Propose ride form (driver only) -->
      <ProposeRideForm
        v-if="selectedRoles.includes('chauffeur')"
        :vehicles="vehicles"
        @submit="handleProposeRide"
      />

      <!-- Driver section (driver only) -->
      <div v-if="selectedRoles.includes('chauffeur')" class="driver-section">
        <!-- Vehicles -->
        <VehicleListCard
          :vehicles="vehicles"
          @add-vehicle="showAddVehicle = true"
          @remove-vehicle="removeVehicle"
        />

        <!-- Driver preferences -->
        <DriverPreferencesSection
          :preferences="driverPreferences"
          @update="
            (newPrefs) => {
              driverPreferences = newPrefs
              updatePreferences()
            }
          "
        />
      </div>
    </div>

    <!-- Add vehicle modal -->
    <AddVehicleModal
      :show="showAddVehicle"
      :is-submitting="isSubmitting"
      @submit="addVehicle"
      @close="showAddVehicle = false"
    />

    <!-- Success modal -->
    <TripSuccessModal
      :show="showSuccessModal"
      :trip="lastCreatedTrip"
      @close="showSuccessModal = false"
      @view-trip="viewCreatedTrip"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { carpoolingService, authService, vehicleService } from '@/services/api'
import { preferencesService } from '@/services/mongoServices'
import { useNotificationStore } from '@/stores/notification'

// Components
import ProfileHeader from '@/components/ProfileHeader.vue'
import RoleSelectionCard from '@/components/RoleSelectionCard.vue'
import ProposeRideForm from '@/components/ProposeRideForm.vue'
import VehicleListCard from '@/components/VehicleListCard.vue'
import AddVehicleModal from '@/components/AddVehicleModal.vue'
import TripSuccessModal from '@/components/TripSuccessModal.vue'
import DriverPreferencesSection from '@/components/DriverPreferencesSection.vue'

// Stores
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const currentUser = computed(() => authStore.currentUser)

// State
const selectedRoles = ref(['passager'])
const vehicles = ref([])
const showAddVehicle = ref(false)
const isSubmitting = ref(false)
const showSuccessModal = ref(false)
const lastCreatedTrip = ref(null)
const isLoadingProfile = ref(true)

let driverPreferences = ref({
  allowsSmoking: false,
  allowsPets: true,
  conversationLevel: 'modéré',
  preferredMusicGenre: '',
  specialRules: '',
})

// Data loading methods
const loadUserVehicles = async () => {
  try {
    const response = await vehicleService.getUserVehicles()
    vehicles.value = response.vehicles || []
  } catch (error) {
    console.error('Erreur lors du chargement des véhicules:', error)
    vehicles.value = []
  }
}

const loadUserProfile = async () => {
  try {
    const profileData = await authService.getProfile()

    const userRoles = ['passager']
    if (profileData.user.roles && profileData.user.roles.includes('chauffeur')) {
      userRoles.push('chauffeur')
    }

    selectedRoles.value = userRoles

    if (userRoles.includes('chauffeur')) {
      await loadUserVehicles()
      try {
        const prefsResp = await preferencesService.getMyPreferences()
        const prefs = prefsResp.preferences || prefsResp || {}

        driverPreferences.value = {
          allowsSmoking:
            prefs.allowsSmoking ?? prefs.allows_smoking ?? driverPreferences.value.allowsSmoking,
          allowsPets: prefs.allowsPets ?? prefs.allows_pets ?? driverPreferences.value.allowsPets,
          conversationLevel:
            prefs.conversationLevel ??
            prefs.conversation_level ??
            driverPreferences.value.conversationLevel,
          preferredMusicGenre:
            prefs.preferredMusicGenre ??
            prefs.preferred_music_genre ??
            driverPreferences.value.preferredMusicGenre,
          specialRules:
            prefs.specialRules ?? prefs.special_rules ?? driverPreferences.value.specialRules,
        }
      } catch (err) {
        console.error('Erreur lors du chargement des préférences:', err)
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement du profil:', error)

    if (error.response?.status === 401 || error.response?.status === 403) {
      notificationStore.showError('Session expirée. Veuillez vous reconnecter.')
      authStore.logout()
      window.location.href = '/login'
      return
    }

    selectedRoles.value = ['passager']
  } finally {
    isLoadingProfile.value = false
  }
}

// Role management
const updateRole = async () => {
  if (selectedRoles.value.includes('chauffeur')) {
    try {
      const profileData = await authService.getProfile()
      const isAlreadyDriver = profileData.user.roles && profileData.user.roles.includes('chauffeur')

      if (!isAlreadyDriver) {
        await authService.becomeDriver()
        notificationStore.showSuccess(
          'Félicitations ! Vous êtes maintenant chauffeur. Reconnectez-vous pour accéder à toutes les fonctionnalités de chauffeur.',
        )
        authStore.logout()
        window.location.href = '/login'
        return
      } else {
        if (vehicles.value.length === 0) {
          await loadUserVehicles()
        }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error)

      if (error.response?.status === 401 || error.response?.status === 403) {
        notificationStore.showError('Session expirée. Veuillez vous reconnecter.')
        authStore.logout()
        window.location.href = '/login'
        return
      }

      if (error.response?.data?.message?.includes('déjà chauffeur')) {
        return
      }

      notificationStore.showError(
        'Erreur lors de la mise à jour du rôle: ' +
          (error.response?.data?.message || error.message),
      )

      selectedRoles.value = selectedRoles.value.filter((role) => role !== 'chauffeur')
    }
  }
}

// Preferences
const updatePreferences = async () => {
  try {
    await preferencesService.updatePreferences({
      allowsSmoking: driverPreferences.value.allowsSmoking,
      allowsPets: driverPreferences.value.allowsPets,
      conversationLevel: driverPreferences.value.conversationLevel,
      preferredMusicGenre: driverPreferences.value.preferredMusicGenre,
      specialRules: driverPreferences.value.specialRules,
    })

    notificationStore.showSuccess('Préférences mises à jour.')
  } catch (err) {
    console.error('Erreur lors de la mise à jour des préférences:', err)
    notificationStore.showError(
      'Impossible de mettre à jour les préférences: ' +
        (err.response?.data?.message || err.message),
    )
  }
}

// Vehicle management
const addVehicle = async (vehicleData) => {
  isSubmitting.value = true

  try {
    await vehicleService.addVehicle(vehicleData)
    await loadUserVehicles()
    showAddVehicle.value = false
    notificationStore.showSuccess('Véhicule ajouté avec succès.')
  } catch (error) {
    console.error("Erreur lors de l'ajout du véhicule:", error)
    notificationStore.showError(
      "Erreur lors de l'ajout du véhicule: " + (error.response?.data?.message || error.message),
    )
  } finally {
    isSubmitting.value = false
  }
}

const removeVehicle = async (vehicleId) => {
  try {
    await vehicleService.removeVehicle(vehicleId)
    await loadUserVehicles()
    notificationStore.showSuccess('Véhicule supprimé avec succès.')
  } catch (error) {
    console.error('Erreur lors de la suppression du véhicule:', error)
    notificationStore.showError(
      'Erreur lors de la suppression du véhicule: ' +
        (error.response?.data?.message || error.message),
    )
  }
}

// Trip proposal
const handleProposeRide = async (formData) => {
  try {
    const departureDateTime = `${formData.date}T${formData.time}:00`
    const departureDate = new Date(departureDateTime)
    const arrivalDate = new Date(departureDate.getTime() + 2 * 60 * 60 * 1000)

    const formatDateTime = (date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
    }

    const arrivalDateTime = formatDateTime(arrivalDate)

    if (departureDate <= new Date()) {
      notificationStore.showError('La date de départ doit être dans le futur.')
      return
    }

    if (arrivalDate <= departureDate) {
      notificationStore.showError('Erreur de calcul des dates. Veuillez réessayer.')
      return
    }

    const tripData = {
      departure_address: formData.departure,
      arrival_address: formData.destination,
      departure_datetime: departureDateTime,
      arrival_datetime: arrivalDateTime,
      price_per_passenger: parseFloat(formData.price),
      seats_offered: parseInt(formData.seats),
      vehicle_id: parseInt(formData.vehicleId),
    }

    await carpoolingService.createTrip(tripData)

    lastCreatedTrip.value = {
      departure: formData.departure,
      destination: formData.destination,
      date: formData.date,
      time: formData.time,
      price: formData.price,
      seats: formData.seats,
    }

    showSuccessModal.value = true

    // Reset form through component ref if needed
  } catch (error) {
    console.error('Erreur lors de la proposition du trajet:', error)
    notificationStore.showError(
      'Erreur lors de la proposition du trajet: ' +
        (error.response?.data?.message || error.message),
    )
  }
}

const viewCreatedTrip = () => {
  if (lastCreatedTrip.value) {
    const searchParams = new URLSearchParams({
      departure: lastCreatedTrip.value.departure,
      destination: lastCreatedTrip.value.destination,
      date: lastCreatedTrip.value.date,
      showMyTrips: 'true',
    })

    window.location.href = `/search?${searchParams.toString()}`
  }
}

// Lifecycle
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    notificationStore.showError('Utilisateur non authentifié. Veuillez vous reconnecter.')
    authStore.logout()
    window.location.href = '/login'
    return
  }

  await loadUserProfile()
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-dark) 0%, var(--color-dark-secondary) 100%);
  padding: 1rem 20px 40px;
}

.profile-container {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.driver-section {
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding-bottom: 60px;
}

@media (max-width: 768px) {
  .profile-container {
    padding: 80px 15px 20px;
  }
}
</style>
