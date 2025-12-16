<template>
  <div class="profile-page">
    <div class="profile-container">
      <!-- Profile header with role display and become driver button -->
      <ProfileHeader :user="currentUser" />

      <!-- Create trip button (driver only) -->
      <div v-if="selectedRoles.includes('chauffeur')" class="create-trip-section">
        <PrimaryButton @click="goToCreateTrip">
          <font-awesome-icon :icon="['fas', 'plus']" />
          Créer un trajet
        </PrimaryButton>
      </div>

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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authService, vehicleService } from '@/services/api'
import { preferencesService } from '@/services/mongoServices'
import { useNotificationStore } from '@/stores/notification'

// Components
import ProfileHeader from '@/components/user/profile/ProfileHeader.vue'
import PrimaryButton from '@/components/ui/buttons/PrimaryButton.vue'
import VehicleListCard from '@/components/user/vehicles/VehicleListCard.vue'
import AddVehicleModal from '@/components/user/vehicles/modals/AddVehicleModal.vue'
import DriverPreferencesSection from '@/components/driver/preferences/DriverPreferencesSection.vue'

// Stores
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const router = useRouter()
const currentUser = computed(() => authStore.currentUser)

// State
const selectedRoles = ref(['passager'])
const vehicles = ref([])
const showAddVehicle = ref(false)
const isSubmitting = ref(false)
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

    // Synchroniser les rôles dans localStorage avec les rôles frais de la DB
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
    if (storedUser && profileData.user.roles) {
      storedUser.roles = profileData.user.roles
      localStorage.setItem('user', JSON.stringify(storedUser))
    }

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

// Navigation
const goToCreateTrip = () => {
  router.push('/create-trip')
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

.create-trip-section {
  display: flex;
  justify-content: center;
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
