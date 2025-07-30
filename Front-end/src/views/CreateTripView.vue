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
          <h3 class="section-title">📍 Itinéraire</h3>

          <div class="form-row">
            <div class="form-group">
              <label for="departure">Lieu de départ</label>
              <input
                id="departure"
                v-model="tripData.departure_address"
                type="text"
                class="form-input"
                placeholder="Ex: Paris, Gare du Nord"
                required
              />
            </div>
            <div class="form-group">
              <label for="destination">Destination</label>
              <input
                id="destination"
                v-model="tripData.arrival_address"
                type="text"
                class="form-input"
                placeholder="Ex: Lyon, Part-Dieu"
                required
              />
            </div>
          </div>
        </div>

        <!-- Section Date et Heure -->
        <div class="form-section">
          <h3 class="section-title">🕒 Date et Heure</h3>

          <div class="form-row">
            <div class="form-group">
              <label for="departure-date">Date de départ</label>
              <input
                id="departure-date"
                v-model="departureDate"
                type="date"
                class="form-input"
                :min="today"
                required
              />
            </div>
            <div class="form-group">
              <label for="departure-time">Heure de départ</label>
              <input
                id="departure-time"
                v-model="departureTime"
                type="time"
                class="form-input"
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="arrival-date">Date d'arrivée estimée</label>
              <input
                id="arrival-date"
                v-model="arrivalDate"
                type="date"
                class="form-input"
                :min="departureDate || today"
              />
            </div>
            <div class="form-group">
              <label for="arrival-time">Heure d'arrivée estimée</label>
              <input id="arrival-time" v-model="arrivalTime" type="time" class="form-input" />
            </div>
          </div>
        </div>

        <!-- Section Détails du trajet -->
        <div class="form-section">
          <h3 class="section-title">🚗 Détails du trajet</h3>

          <div class="form-row">
            <div class="form-group">
              <label for="seats">Nombre de places disponibles</label>
              <select
                id="seats"
                v-model="tripData.initial_seats_offered"
                class="form-select"
                required
              >
                <option value="">Sélectionnez...</option>
                <option value="1">1 place</option>
                <option value="2">2 places</option>
                <option value="3">3 places</option>
                <option value="4">4 places</option>
              </select>
            </div>
            <div class="form-group">
              <label for="price">Prix par passager (crédits)</label>
              <input
                id="price"
                v-model="tripData.price_per_passenger"
                type="number"
                min="0"
                step="1"
                class="form-input"
                placeholder="Ex: 15"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="description">Description du trajet (optionnel)</label>
            <textarea
              id="description"
              v-model="tripData.description"
              class="form-textarea"
              placeholder="Ajoutez des détails sur votre trajet, points de rendez-vous, préférences..."
              rows="4"
            ></textarea>
          </div>
        </div>

        <!-- Section Véhicule -->
        <div class="form-section">
          <h3 class="section-title">🚙 Véhicule</h3>

          <div class="form-row">
            <div class="form-group">
              <label for="vehicle-model">Modèle du véhicule (optionnel)</label>
              <input
                id="vehicle-model"
                v-model="tripData.model"
                type="text"
                class="form-input"
                placeholder="Ex: Renault Clio"
              />
            </div>
            <div class="form-group">
              <label for="vehicle-plate">Plaque d'immatriculation (optionnel)</label>
              <input
                id="vehicle-plate"
                v-model="tripData.plate_number"
                type="text"
                class="form-input"
                placeholder="Ex: AB-123-CD"
              />
            </div>
          </div>
        </div>

        <!-- Récapitulatif -->
        <div class="form-section summary-section">
          <h3 class="section-title">📋 Récapitulatif</h3>

          <div class="trip-summary">
            <div class="summary-route">
              <span class="route-point"
                >📍 {{ tripData.departure_address || 'Lieu de départ' }}</span
              >
              <div class="route-arrow">→</div>
              <span class="route-point">🎯 {{ tripData.arrival_address || 'Destination' }}</span>
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
          <router-link to="/my-trips" class="btn btn-secondary"> Annuler </router-link>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            <span v-if="loading" class="loading-spinner"></span>
            {{ loading ? 'Création...' : 'Créer le trajet' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { carpoolingService } from '@/services/api'
import { showAlert, showError } from '@/composables/useModal'

export default {
  name: 'CreateTripView',
  setup() {
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

    // Champs séparés pour la date et l'heure
    const departureDate = ref('')
    const departureTime = ref('')
    const arrivalDate = ref('')
    const arrivalTime = ref('')

    // Date d'aujourd'hui pour la validation
    const today = computed(() => {
      return new Date().toISOString().split('T')[0]
    })

    // Formatage de la date et heure pour le récapitulatif
    const formatSummaryDateTime = () => {
      if (!departureDate.value || !departureTime.value) {
        return 'Date et heure à définir'
      }

      const date = new Date(`${departureDate.value}T${departureTime.value}`)
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    // Mise à jour des datetime quand les champs changent
    const updateDateTime = () => {
      if (departureDate.value && departureTime.value) {
        tripData.value.departure_datetime = `${departureDate.value}T${departureTime.value}:00`
      }

      if (arrivalDate.value && arrivalTime.value) {
        tripData.value.arrival_datetime = `${arrivalDate.value}T${arrivalTime.value}:00`
      } else if (departureDate.value && departureTime.value) {
        // Si pas d'heure d'arrivée spécifiée, estimer +2h
        const depDateTime = new Date(`${departureDate.value}T${departureTime.value}`)
        depDateTime.setHours(depDateTime.getHours() + 2)
        tripData.value.arrival_datetime = depDateTime.toISOString().slice(0, 19)
      }
    }

    // Watcher pour mettre à jour les datetime
    const watchDateTimeFields = () => {
      updateDateTime()
    }

    // Création du trajet
    const createTrip = async () => {
      try {
        loading.value = true

        // Mise à jour des datetime avant envoi
        updateDateTime()

        // Validation basique
        if (!tripData.value.departure_address || !tripData.value.arrival_address) {
          showError('Veuillez renseigner le départ et la destination')
          return
        }

        if (!tripData.value.departure_datetime) {
          showError("Veuillez renseigner la date et l'heure de départ")
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
        showAlert('Trajet créé avec succès !', 'Succès')
        router.push('/my-trips?tab=driver')
      } catch (error) {
        console.error('Erreur lors de la création du trajet:', error)
        showError(
          'Erreur lors de la création du trajet : ' +
            (error.response?.data?.message || error.message),
        )
      } finally {
        loading.value = false
      }
    }

    // Initialisation
    onMounted(() => {
      // Pré-remplir avec la date d'aujourd'hui
      departureDate.value = today.value
      arrivalDate.value = today.value
    })

    return {
      tripData,
      departureDate,
      departureTime,
      arrivalDate,
      arrivalTime,
      today,
      loading,
      formatSummaryDateTime,
      createTrip,
      watchDateTimeFields,
    }
  },
}
</script>

<style scoped>
/* Vue principale */
.create-trip {
  min-height: 100vh;
  background-color: #1a1a1a;
  color: #e9ecef;
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
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #adb5bd;
  margin: 0;
}

/* Container principal */
.create-trip-container {
  max-width: 800px;
  margin: 0 auto;
}

/* Formulaire */
.trip-form {
  background: #2d3748;
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
  color: #28a745;
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
  color: #e9ecef;
  font-size: 0.9rem;
}

/* Champs de saisie */
.form-input,
.form-select,
.form-textarea {
  padding: 0.75rem;
  border: 2px solid #4a5568;
  border-radius: 8px;
  background: #374151;
  color: #e9ecef;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #28a745;
}

.form-input::placeholder {
  color: #9ca3af;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

/* Section récapitulatif */
.summary-section {
  background: linear-gradient(135deg, #374151 0%, #2d3748 100%);
  border: 2px solid #28a745;
  border-radius: 12px;
  padding: 1.5rem;
}

.trip-summary {
  background: #1a1a1a;
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
  color: #e9ecef;
}

.route-arrow {
  color: #28a745;
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
  border-bottom: 1px solid #4a5568;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-label {
  color: #adb5bd;
  font-weight: 500;
}

.summary-value {
  color: #e9ecef;
  font-weight: 600;
}

/* Actions */
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;

  border-top: 1px solid #4a5568;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-primary {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  0% {
    transform: rotate(0deg);
  }
  100% {
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
