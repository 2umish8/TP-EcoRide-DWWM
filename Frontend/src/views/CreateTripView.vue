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
              <label for="departure">Lieu de départ</label
              ><input
                id="departure"
                v-model="tripData.departure_address"
                type="text"
                class="form-input"
                placeholder="Ex: Paris, Gare du Nord"
                required
              />
            </div>
            <div class="form-group">
              <label for="destination">Destination</label
              ><input
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
          <h3 class="section-title">
            <font-awesome-icon :icon="['fas', 'clock']" /> Date et Heure
          </h3>
          <div class="form-row">
            <div class="form-group">
              <label for="departure-date">Date de départ</label
              ><input
                id="departure-date"
                v-model="departureDate"
                type="date"
                class="form-input"
                :min="today"
                required
              />
            </div>
            <div class="form-group">
              <label for="departure-time">Heure de départ</label
              ><input
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
              <label for="arrival-date">Date d'arrivée estimée</label
              ><input
                id="arrival-date"
                v-model="arrivalDate"
                type="date"
                class="form-input"
                :min="departureDate || today"
              />
            </div>
            <div class="form-group">
              <label for="arrival-time">Heure d'arrivée estimée</label
              ><input id="arrival-time" v-model="arrivalTime" type="time" />
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
              <label for="seats">Nombre de places disponibles</label
              ><select
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
              <label for="price">Prix par passager (crédits)</label
              ><input
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
            <label for="description">Description du trajet (optionnel)</label
            ><textarea
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
          <h3 class="section-title"><font-awesome-icon :icon="['fas', 'car']" /> Véhicule</h3>
          <div class="form-row">
            <div class="form-group">
              <label for="vehicle-model">Modèle du véhicule (optionnel)</label
              ><input
                id="vehicle-model"
                v-model="tripData.model"
                type="text"
                class="form-input"
                placeholder="Ex: Renault Clio"
              />
            </div>
            <div class="form-group">
              <label for="vehicle-plate">Plaque d'immatriculation (optionnel)</label
              ><input
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
                <span class="summary-label">Date et heure :</span
                ><span class="summary-value">
                  {{ formatSummaryDateTime() }}
                </span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Places disponibles :</span
                ><span class="summary-value">{{ tripData.initial_seats_offered || 0 }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Prix par passager :</span
                ><span class="summary-value">{{ tripData.price_per_passenger || 0 }} crédits</span>
              </div>
            </div>
          </div>
        </div>
        <!-- Actions -->
        <div class="form-actions">
          <router-link to="/my-trips" class="btn btn-secondary"> Annuler </router-link
          ><button type="submit" class="btn btn-primary" :disabled="loading">
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
import { useNotificationStore } from '@/stores/notification'

export default {
  name: 'CreateTripView',
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
