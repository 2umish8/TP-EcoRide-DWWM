<template>
  <div class="create-trip">
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

          <div class="form-row">
            <div class="form-group">
              <label for="vehicle-model">Modèle du véhicule (optionnel)</label>
              <TextInput
                id="vehicle-model"
                v-model="tripData.model"
                placeholder="Ex: Renault Clio"
              />
            </div>
            <div class="form-group">
              <label for="vehicle-plate">Plaque d'immatriculation (optionnel)</label>
              <TextInput
                id="vehicle-plate"
                v-model="tripData.plate_number"
                placeholder="Ex: AB-123-CD"
              />
            </div>
          </div>
        </div>

        <!-- Récapitulatif -->
        <div class="form-section summary-section">
          <h3 class="section-title">
            <font-awesome-icon :icon="['fas', 'clipboard-list']" /> Récapitulatif
          </h3>

          <div class="trip-summary">
            <div class="summary-route">
              <span class="route-point"
                ><font-awesome-icon :icon="['fas', 'location-dot']" />
                {{ tripData.departure_address || 'Lieu de départ' }}</span
              >
              <div class="route-arrow">→</div>
              <span class="route-point"
                ><font-awesome-icon :icon="['fas', 'bullseye']" />
                {{ tripData.arrival_address || 'Destination' }}</span
              >
            </div>

            <div class="summary-details">
              <div class="summary-item">
                <span class="summary-label">Date et heure :</span>
                <span class="summary-value">
                  {{ formatSummaryDateTime() }}
                </span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Places disponibles :</span>
                <span class="summary-value">{{ tripData.initial_seats_offered || 0 }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Prix par passager :</span>
                <span class="summary-value">{{ tripData.price_per_passenger || 0 }} crédits</span>
              </div>
            </div>
          </div>
        </div>

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
import { carpoolingService } from '@/services/api'
import { useNotificationStore } from '@/stores/notification'
import CityAutocomplete from '@/components/ui/CityAutocomplete.vue'
import TextInput from '@/components/ui/TextInput.vue'
import DateInput from '@/components/ui/DateInput.vue'
import DateTimeInput from '@/components/ui/DateTimeInput.vue'
import DurationInput from '@/components/ui/DurationInput.vue'
import NumberInput from '@/components/ui/NumberInput.vue'
import SelectInput from '@/components/ui/SelectInput.vue'
import TextAreaInput from '@/components/ui/TextAreaInput.vue'
import PrimaryButton from '@/components/ui/PrimaryButton.vue'
import SecondaryButton from '@/components/ui/SecondaryButton.vue'

export default {
  name: 'CreateTripView',
  components: {
    CityAutocomplete,
    TextInput,
    DateInput,
    DateTimeInput,
    DurationInput,
    NumberInput,
    SelectInput,
    TextAreaInput,
    PrimaryButton,
    SecondaryButton,
  },
  setup() {
    const notificationStore = useNotificationStore()
    const router = useRouter()
    const loading = ref(false)

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

    // Formatage de la date et heure pour le récapitulatif
    const formatSummaryDateTime = () => {
      if (!tripData.value.departure_datetime) {
        return 'Date et heure à définir'
      }

      const date = new Date(tripData.value.departure_datetime)
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
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

        // Conversion des types
        const submitData = {
          ...tripData.value,
          initial_seats_offered: parseInt(tripData.value.initial_seats_offered),
          price_per_passenger: parseInt(tripData.value.price_per_passenger),
          seats_remaining: parseInt(tripData.value.initial_seats_offered),
        }

        // Appel API
        await carpoolingService.createTrip(submitData)

        // Redirection vers la liste des trajets
        // Utilisation correcte du store de notifications
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

    // Initialisation
    onMounted(() => {
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
      formatSummaryDateTime,
      createTrip,
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

/* Section récapitulatif */
.summary-section {
  background: linear-gradient(
    135deg,
    var(--color-dark-tertiary) 0%,
    var(--color-dark-secondary) 100%
  );
  border: 2px solid var(--color-success);
  border-radius: 12px;
  padding: 1.5rem;
}

.trip-summary {
  background: var(--color-dark);
  border-radius: 8px;
  padding: 1.5rem;
}

.summary-route {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
  font-size: 1.1rem;
}

.route-point {
  flex: 1;
  color: var(--color-light-secondary);
}

.route-arrow {
  color: var(--color-success);
  font-weight: 700;
  font-size: 1.3rem;
}

.summary-details {
  display: grid;
  gap: 0.75rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-label {
  color: var(--color-gray);
  font-weight: 500;
}

.summary-value {
  color: var(--color-light-secondary);
  font-weight: 600;
}

/* Actions */
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

  .summary-route {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }

  .route-arrow {
    transform: rotate(90deg);
  }
}
</style>
