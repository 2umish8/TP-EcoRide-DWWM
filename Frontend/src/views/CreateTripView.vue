<template>
  <div class="create-trip">
    <!-- Become driver confirmation modal -->
    <ConfirmActionModal
      :show="showBecomeDriverConfirm"
      title="Devenir chauffeur"
      message="Pour créer un trajet, vous devez d'abord devenir chauffeur. Voulez-vous lancer le processus maintenant ?"
      @confirm="startBecomeDriver"
      @cancel="cancelBecomeDriver"
    />

    <!-- Add vehicle modal -->
    <AddVehicleModal
      :show="showAddVehicleModal"
      @close="showAddVehicleModal = false"
      @vehicle-added="handleVehicleAdded"
    />

    <!-- Header -->
    <div class="create-trip-header">
      <h1 class="page-title">Proposer un trajet</h1>
      <p class="page-subtitle">Partagez votre itinéraire et réduisez votre empreinte carbone</p>
    </div>

    <!-- Formulaire principal -->
    <div class="create-trip-container">
      <form @submit.prevent="createTrip" class="trip-form">
        <!-- Section Itinéraire -->
        <div class="form-section">
          <h3 class="section-title">
            <font-awesome-icon :icon="['fas', 'location-dot']" /> Itinéraire
          </h3>

          <div class="form-row">
            <div class="form-group">
              <label for="departure">Lieu de départ</label>
              <CityAutocomplete
                id="departure"
                v-model="tripData.departure_address"
                placeholder="Ex: Paris, Gare du Nord"
              />
            </div>
            <div class="form-group">
              <label for="destination">Destination</label>
              <CityAutocomplete
                id="destination"
                v-model="tripData.arrival_address"
                placeholder="Ex: Lyon, Part-Dieu"
              />
            </div>
          </div>
        </div>

        <!-- Section Date et Heure -->
        <div class="form-section">
          <h3 class="section-title">
            <font-awesome-icon :icon="['fas', 'clock']" /> Date et Heure
          </h3>

          <div class="form-row">
            <div class="form-group">
              <label for="departure-datetime">Date et heure de départ</label>
              <DateTimeInput
                id="departure-datetime"
                v-model="tripData.departure_datetime"
                :min="today"
              />
            </div>
            <div class="form-group">
              <label for="trip-duration">Durée estimée du trajet</label>
              <DurationInput id="trip-duration" v-model="tripDuration" />
            </div>
          </div>
        </div>

        <!-- Section Détails du trajet -->
        <div class="form-section">
          <h3 class="section-title">
            <font-awesome-icon :icon="['fas', 'car']" /> Détails du trajet
          </h3>

          <div class="form-row">
            <div class="form-group">
              <label for="seats">Nombre de places disponibles</label>
              <NumberInput
                id="seats"
                v-model="tripData.initial_seats_offered"
                :min="1"
                :max="8"
                placeholder="0"
                unit="places"
              />
            </div>
            <div class="form-group">
              <label for="price">Prix par passager</label>
              <NumberInput
                id="price"
                v-model="tripData.price_per_passenger"
                :min="0"
                placeholder="0"
                unit="crédits"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="description">Description du trajet (optionnel)</label>
            <TextAreaInput
              id="description"
              v-model="tripData.description"
              placeholder="Ajoutez des détails sur votre trajet, points de rendez-vous, préférences..."
            ></TextAreaInput>
          </div>
        </div>

        <!-- Section Véhicule -->
        <div class="form-section">
          <h3 class="section-title"><font-awesome-icon :icon="['fas', 'car']" /> Véhicule</h3>

          <div class="form-group">
            <label for="vehicle-select">Sélectionner un véhicule</label>
            <div class="vehicle-select-wrapper">
              <SelectInput id="vehicle-select" v-model="selectedVehicleId" class="vehicle-select">
                <option value="">-- Sélectionner un véhicule --</option>
                <option v-for="vehicle in userVehicles" :key="vehicle.id" :value="vehicle.id">
                  {{ vehicle.brand_name || vehicle.brand }} {{ vehicle.model }} -
                  {{ vehicle.plate_number }}
                </option>
              </SelectInput>
              <button
                type="button"
                @click="showAddVehicleModal = true"
                class="add-vehicle-btn"
                title="Ajouter un nouveau véhicule"
              >
                <font-awesome-icon :icon="['fas', 'plus']" /> Ajouter un véhicule
              </button>
            </div>
          </div>
        </div>

        <!-- Récapitulatif -->
        <TripPreview
          :trip-data="tripData"
          :selected-vehicle="selectedVehicle"
          :duration-minutes="durationMinutes"
        />

        <!-- Actions -->
        <div class="form-actions">
          <router-link to="/my-trips" class="router-link-wrapper">
            <SecondaryButton>Annuler</SecondaryButton>
          </router-link>
          <PrimaryButton type="submit" :disabled="loading">
            <span v-if="loading" class="loading-spinner"></span>
            {{ loading ? 'Création...' : 'Créer le trajet' }}
          </PrimaryButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { carpoolingService, vehicleService } from '@/services/api'
import { useNotificationStore } from '@/stores/notification'
import useDriverStatus from '@/composables/useDriverStatus'
import ConfirmActionModal from '@/components/shared/modals/ConfirmActionModal.vue'
import AddVehicleModal from '@/components/user/vehicles/modals/AddVehicleModal.vue'
import CityAutocomplete from '@/components/ui/inputs/CityAutocomplete.vue'
import SelectInput from '@/components/ui/inputs/SelectInput.vue'
import DateTimeInput from '@/components/ui/inputs/DateTimeInput.vue'
import DurationInput from '@/components/ui/inputs/DurationInput.vue'
import NumberInput from '@/components/ui/inputs/NumberInput.vue'
import TextAreaInput from '@/components/ui/inputs/TextAreaInput.vue'
import PrimaryButton from '@/components/ui/buttons/PrimaryButton.vue'
import SecondaryButton from '@/components/ui/buttons/SecondaryButton.vue'
import TripPreview from '@/components/trips/preview/TripPreview.vue'

export default {
  name: 'CreateTripView',
  components: {
    ConfirmActionModal,
    AddVehicleModal,
    CityAutocomplete,
    SelectInput,
    DateTimeInput,
    DurationInput,
    NumberInput,
    TextAreaInput,
    PrimaryButton,
    SecondaryButton,
    TripPreview,
  },
  setup() {
    const notificationStore = useNotificationStore()
    const router = useRouter()
    const loading = ref(false)
    const showBecomeDriverConfirm = ref(false)
    const showAddVehicleModal = ref(false)
    const { isDriver, checkDriverStatus } = useDriverStatus()

    // Véhicules de l'utilisateur
    const userVehicles = ref([])
    const selectedVehicleId = ref('')

    // Données du formulaire
    const tripData = ref({
      departure_address: '',
      arrival_address: '',
      departure_datetime: '',
      arrival_datetime: '',
      initial_seats_offered: '',
      price_per_passenger: '',
      description: '',
      model: '',
      plate_number: '',
    })

    // Duration du trajet (format HH:MM)
    const tripDuration = ref('02:00')

    // Date d'aujourd'hui pour la validation
    const today = computed(() => {
      return new Date().toISOString().split('T')[0]
    })

    // Véhicule sélectionné
    const selectedVehicle = computed(() => {
      return userVehicles.value.find((vehicle) => vehicle.id === selectedVehicleId.value)
    })

    // Durée en minutes (pour TripPreview)
    const durationMinutes = computed(() => {
      const [hours, minutes] = tripDuration.value.split(':').map(Number)
      return hours * 60 + minutes
    })

    // Charger les véhicules de l'utilisateur
    const loadUserVehicles = async () => {
      try {
        const response = await vehicleService.getUserVehicles()
        if (import.meta.env.DEV) {
          console.log('API Response for vehicles:', response)
        }

        // Handle different response structures
        const vehiclesArray = Array.isArray(response)
          ? response
          : response.data || response.vehicles || []
        userVehicles.value = vehiclesArray

        if (import.meta.env.DEV) {
          console.log('Loaded vehicles:', userVehicles.value)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des véhicules:', error)
        notificationStore.showError('Impossible de charger vos véhicules')
      }
    }

    // Calcul de la date/heure d'arrivée basée sur la durée
    const calculateArrivalDateTime = () => {
      if (!tripData.value.departure_datetime) {
        return
      }

      const [hours, minutes] = tripDuration.value.split(':').map(Number)
      const departureDate = new Date(tripData.value.departure_datetime)
      const arrivalDate = new Date(departureDate)

      arrivalDate.setHours(arrivalDate.getHours() + hours)
      arrivalDate.setMinutes(arrivalDate.getMinutes() + minutes)

      // Format: YYYY-MM-DDTHH:MM:00
      tripData.value.arrival_datetime = arrivalDate.toISOString().slice(0, 19)
    }

    // Création du trajet
    const createTrip = async () => {
      try {
        loading.value = true

        // Calcul de la date/heure d'arrivée
        calculateArrivalDateTime()

        // Validation basique
        if (!tripData.value.departure_address || !tripData.value.arrival_address) {
          notificationStore.showError('Veuillez renseigner le départ et la destination')
          return
        }

        if (!tripData.value.departure_datetime) {
          notificationStore.showError("Veuillez renseigner la date et l'heure de départ")
          return
        }

        if (!selectedVehicleId.value) {
          notificationStore.showError('Veuillez sélectionner un véhicule')
          return
        }

        // Conversion des types - match backend contract
        const submitData = {
          departure_address: tripData.value.departure_address,
          arrival_address: tripData.value.arrival_address,
          departure_datetime: tripData.value.departure_datetime,
          arrival_datetime: tripData.value.arrival_datetime,
          seats_offered: parseInt(tripData.value.initial_seats_offered),
          price_per_passenger: parseFloat(tripData.value.price_per_passenger),
          vehicle_id: parseInt(selectedVehicleId.value),
        }

        // Appel API
        await carpoolingService.createTrip(submitData)

        // Redirection vers la liste des trajets
        notificationStore.showInfo('Trajet créé avec succès !', 'Succès')
        router.push('/my-trips?tab=driver')
      } catch (error) {
        console.error('Erreur lors de la création du trajet:', error)
        notificationStore.showError(
          'Erreur lors de la création du trajet : ' +
            (error.response?.data?.message || error.message),
        )
      } finally {
        loading.value = false
      }
    }

    const handleVehicleAdded = () => {
      loadUserVehicles()
    }

    const startBecomeDriver = async () => {
      showBecomeDriverConfirm.value = false
      await router.push('/become-driver')
    }

    const cancelBecomeDriver = () => {
      showBecomeDriverConfirm.value = false
      router.push('/my-trips')
    }

    // Initialisation
    onMounted(async () => {
      // Vérifier si l'utilisateur est chauffeur
      await checkDriverStatus()

      if (!isDriver.value) {
        showBecomeDriverConfirm.value = true
        return
      }

      // Charger les véhicules de l'utilisateur
      await loadUserVehicles()

      // Pré-remplir avec la date d'aujourd'hui et heure actuelle
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const todayDate = today.value
      tripData.value.departure_datetime = `${todayDate}T${hours}:${minutes}`
    })

    return {
      tripData,
      tripDuration,
      today,
      loading,
      createTrip,
      isDriver,
      showBecomeDriverConfirm,
      startBecomeDriver,
      cancelBecomeDriver,
      userVehicles,
      selectedVehicleId,
      selectedVehicle,
      durationMinutes,
      showAddVehicleModal,
      handleVehicleAdded,
    }
  },
}
</script>

<style scoped>
/* Vue principale */
.create-trip {
  min-height: 100vh;
  background-color: var(--color-dark);
  color: var(--color-light-secondary);
  padding: 2rem 1rem;
}

/* Header */
.create-trip-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-light);
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1.1rem;
  color: var(--color-gray);
  margin: 0;
}

/* Container principal */
.create-trip-container {
  max-width: 800px;
  margin: 0 auto;
}

/* Formulaire */
.trip-form {
  background: var(--color-dark-secondary);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

/* Sections du formulaire */
.form-section {
  margin-bottom: 2.5rem;
}

.form-section:last-of-type {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--color-success);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Rangées de formulaire */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: var(--color-light-secondary);
  font-size: 0.9rem;
}

/* Vehicle select wrapper */
.vehicle-select-wrapper {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.vehicle-select {
  flex: 1;
}

.add-vehicle-btn {
  background: var(--color-success);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  white-space: nowrap;
}

.add-vehicle-btn:hover {
  background: var(--color-primary);
  transform: translateY(-2px);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.router-link-wrapper {
  text-decoration: none;
}

/* Loading spinner */
.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .create-trip {
    padding: 1rem 0.5rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .trip-form {
    padding: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .vehicle-select-wrapper {
    flex-direction: column;
    align-items: stretch;
  }

  .add-vehicle-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
