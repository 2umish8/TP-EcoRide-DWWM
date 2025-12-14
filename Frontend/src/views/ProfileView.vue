<template>
  <div class="profile-page">
    <div class="profile-container">
      <!-- En-tête du profil -->
      <div class="profile-header">
        <h1 class="profile-title">Mon Profil</h1>
        <div v-if="currentUser" class="user-info">
          <div class="user-avatar">
            <img
              v-if="currentUser.profile_picture_url"
              :src="currentUser.profile_picture_url"
              :alt="currentUser.pseudo"
              class="avatar-img"
            />
            <div v-else class="avatar-placeholder">
              {{ currentUser.pseudo.charAt(0).toUpperCase() }}
            </div>
          </div>
          <div class="user-details">
            <h2 class="user-name">{{ currentUser.pseudo }}</h2>
            <p class="user-email">{{ currentUser.email }}</p>
          </div>
        </div>
      </div>

      <!-- Sélection du rôle -->
      <div class="role-selection-card">
        <h3 class="card-title">Mon rôle sur EcoRide</h3>

        <!-- Indicateur de chargement -->
        <div v-if="isLoadingProfile" class="loading-indicator">
          <font-awesome-icon :icon="['fas', 'hourglass-half']" class="loading-spinner" />
          <p>Chargement de votre profil...</p>
        </div>

        <!-- Options de rôle -->
        <div v-else class="role-options">
          <label class="role-option" :class="{ active: selectedRoles.includes('passager') }">
            <input type="checkbox" value="passager" v-model="selectedRoles" @change="updateRole" />
            <div class="role-content">
              <span class="role-icon"><font-awesome-icon :icon="['fas', 'car']" /></span>
              <div class="role-text">
                <h4>Passager</h4>
                <p>Je cherche des trajets à partager</p>
              </div>
            </div>
          </label>

          <label class="role-option" :class="{ active: selectedRoles.includes('chauffeur') }">
            <input type="checkbox" value="chauffeur" v-model="selectedRoles" @change="updateRole" />
            <div class="role-content">
              <span class="role-icon"><font-awesome-icon :icon="['fas', 'truck']" /></span>
              <div class="role-text">
                <h4>Chauffeur</h4>
                <p>Je propose mes véhicules pour covoiturer</p>
              </div>
            </div>
          </label>
        </div>
      </div>

      <!-- Section Proposer un trajet (si chauffeur sélectionné) -->
      <div v-if="selectedRoles.includes('chauffeur')" class="propose-ride-card">
        <h3 class="card-title">Proposer un EcoRide</h3>
        <div class="propose-ride-form">
          <div class="form-group" v-if="vehicles.length > 0">
            <label class="form-label"
              ><font-awesome-icon :icon="['fas', 'car']" /> Véhicule à utiliser</label
            >
            <select v-model="newRide.vehicleId" class="form-input" required>
              <option value="">Sélectionner un véhicule</option>
              <option v-for="vehicle in vehicles" :key="vehicle.id" :value="vehicle.id">
                {{ vehicle.brand_name || vehicle.brand }} {{ vehicle.model }} -
                {{ vehicle.plate_number }}
              </option>
            </select>
          </div>

          <div v-if="vehicles.length === 0" class="no-vehicle-warning">
            <span class="warning-icon"
              ><font-awesome-icon :icon="['fas', 'triangle-exclamation']"
            /></span>
            <p>Vous devez d'abord ajouter un véhicule pour proposer un trajet.</p>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label"
                ><font-awesome-icon :icon="['fas', 'location-dot']" /> Lieu de départ</label
              >
              <input
                type="text"
                v-model="newRide.departure"
                class="form-input"
                placeholder="Entrez le lieu de départ"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label"
                ><font-awesome-icon :icon="['fas', 'flag-checkered']" /> Lieu d'arrivée</label
              >
              <input
                type="text"
                v-model="newRide.destination"
                class="form-input"
                placeholder="Entrez le lieu d'arrivée"
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label"
                ><font-awesome-icon :icon="['fas', 'calendar']" /> Date de départ</label
              >
              <input
                type="date"
                v-model="newRide.date"
                :min="minDate"
                class="form-input"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label"
                ><font-awesome-icon :icon="['fas', 'clock']" /> Heure de départ</label
              >
              <input type="time" v-model="newRide.time" class="form-input" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label"
                ><font-awesome-icon :icon="['fas', 'coins']" /> Prix par passager (€)</label
              >
              <input
                type="number"
                v-model="newRide.price"
                class="form-input"
                placeholder="15"
                min="0"
                step="0.50"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label"
                ><font-awesome-icon :icon="['fas', 'user-group']" /> Places offertes</label
              >
              <div class="select-container">
                <select
                  v-model="newRide.seats"
                  class="form-input"
                  required
                  :disabled="!newRide.vehicleId"
                >
                  <option value="">Sélectionner</option>
                  <option v-for="n in availableSeats" :key="n" :value="n">
                    {{ n }} place{{ n > 1 ? 's' : '' }}
                  </option>
                </select>

                <!-- Tooltip orange quand aucun véhicule n'est sélectionné -->
                <div v-if="!newRide.vehicleId" class="tooltip-orange">
                  <span class="tooltip-icon"
                    ><font-awesome-icon :icon="['fas', 'triangle-exclamation']"
                  /></span>
                  <span class="tooltip-text">Choisissez d'abord un véhicule</span>
                </div>
              </div>
            </div>
          </div>

          <div class="propose-ride-actions">
            <button
              @click="proposeRide"
              class="propose-btn"
              :disabled="!canProposeRide || vehicles.length === 0"
            >
              <font-awesome-icon :icon="['fas', 'car']" class="propose-icon" />
              Proposer un EcoRide
            </button>
          </div>
        </div>
      </div>

      <!-- Section Chauffeur (si chauffeur sélectionné) -->
      <div v-if="selectedRoles.includes('chauffeur')" class="driver-section">
        <!-- Véhicules -->
        <div class="vehicles-card">
          <div class="card-header">
            <h3 class="card-title">Mes Véhicules</h3>
            <button @click="showAddVehicle = true" class="add-btn">
              <font-awesome-icon :icon="['fas', 'plus']" class="add-icon" />
              Ajouter un véhicule
            </button>
          </div>

          <div v-if="vehicles.length === 0" class="empty-state">
            <span class="empty-icon"><font-awesome-icon :icon="['fas', 'car']" /></span>
            <p>Aucun véhicule enregistré</p>
            <small>Ajoutez votre premier véhicule pour proposer des trajets</small>
          </div>

          <div v-else class="vehicles-list">
            <div v-for="vehicle in vehicles" :key="vehicle.id" class="vehicle-item">
              <div class="vehicle-info">
                <h4>{{ vehicle.brand_name || vehicle.brand }} {{ vehicle.model }}</h4>
                <p class="vehicle-details">
                  {{ vehicle.plate_number }} • {{ vehicle.seats_available }} places
                  <span v-if="vehicle.is_electric" class="eco-badge"
                    ><font-awesome-icon :icon="['fas', 'bolt']" /> Électrique</span
                  >
                </p>
              </div>
              <button @click="removeVehicle(vehicle.id)" class="remove-btn">
                <font-awesome-icon :icon="['fas', 'trash']" />
              </button>
            </div>
          </div>
        </div>

        <!-- Préférences du chauffeur (composant) -->
        <DriverPreferencesSection
          :preferences="driverPreferences"
          @update="
            (newPrefs) => {
              driverPreferences.value = newPrefs
              updatePreferences()
            }
          "
        />
      </div>
    </div>

    <!-- Modal d'ajout de véhicule -->
    <div v-if="showAddVehicle" class="modal-overlay" @click="showAddVehicle = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Ajouter un véhicule</h3>
          <button @click="showAddVehicle = false" class="close-btn">×</button>
        </div>

        <form @submit.prevent="addVehicle" class="vehicle-form">
          <div class="form-group">
            <label class="form-label">Plaque d'immatriculation</label>
            <input
              type="text"
              v-model="newVehicle.plate_number"
              class="form-input"
              placeholder="AA-123-BB"
              required
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Marque</label>
              <input
                type="text"
                v-model="newVehicle.brand"
                class="form-input"
                placeholder="Peugeot"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label">Modèle</label>
              <input
                type="text"
                v-model="newVehicle.model"
                class="form-input"
                placeholder="308"
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Nombre de places</label>
              <select v-model="newVehicle.seats_available" class="form-select" required>
                <option value="">Sélectionner</option>
                <option value="1">1 place</option>
                <option value="2">2 places</option>
                <option value="3">3 places</option>
                <option value="4">4 places</option>
                <option value="5">5 places</option>
                <option value="6">6 places</option>
                <option value="7">7 places</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Couleur</label>
              <input
                type="text"
                v-model="newVehicle.color"
                class="form-input"
                placeholder="Blanc"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="newVehicle.is_electric" />
              <span><font-awesome-icon :icon="['fas', 'bolt']" /> Véhicule électrique</span>
            </label>
          </div>

          <div class="modal-actions">
            <button type="button" @click="showAddVehicle = false" class="cancel-btn">
              Annuler
            </button>
            <button type="submit" class="submit-btn" :disabled="isSubmitting">
              <span v-if="isSubmitting">⏳</span>
              <span v-else>Ajouter</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de succès après création d'un trajet -->
    <div v-if="showSuccessModal" class="modal-overlay" @click="showSuccessModal = false">
      <div class="modal-content success-modal" @click.stop>
        <div class="modal-header">
          <h3><font-awesome-icon :icon="['fas', 'circle-check']" /> Trajet créé avec succès !</h3>
          <button @click="showSuccessModal = false" class="close-btn">×</button>
        </div>

        <div class="success-content">
          <div class="success-message">
            <p>Votre EcoRide a été proposé avec succès !</p>
            <div v-if="lastCreatedTrip" class="trip-summary">
              <p>
                <strong><font-awesome-icon :icon="['fas', 'location-dot']" /> Départ :</strong>
                {{ lastCreatedTrip.departure }}
              </p>
              <p>
                <strong><font-awesome-icon :icon="['fas', 'flag-checkered']" /> Arrivée :</strong>
                {{ lastCreatedTrip.destination }}
              </p>
              <p>
                <strong><font-awesome-icon :icon="['fas', 'calendar']" /> Date :</strong>
                {{ formatDate(lastCreatedTrip.date) }}
              </p>
              <p>
                <strong><font-awesome-icon :icon="['fas', 'clock']" /> Heure :</strong>
                {{ lastCreatedTrip.time }}
              </p>
            </div>
          </div>

          <div class="success-actions">
            <button @click="viewCreatedTrip" class="view-trip-btn">
              <font-awesome-icon :icon="['fas', 'eye']" class="btn-icon" />
              Voir mon trajet
            </button>
            <button @click="showSuccessModal = false" class="dismiss-btn">Non merci</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { carpoolingService, authService, vehicleService } from '@/services/api'
import { preferencesService } from '@/services/mongoServices'
import DriverPreferencesSection from '@/components/DriverPreferencesSection.vue'
import { useNotificationStore } from '@/stores/notification'

export default {
  name: 'ProfileView',
  components: {
    DriverPreferencesSection,
  },
  setup() {
    const authStore = useAuthStore()
    const notificationStore = useNotificationStore()
    const currentUser = computed(() => authStore.currentUser)

    // États
    const selectedRoles = ref(['passager']) // Par défaut passager
    const vehicles = ref([])
    const showAddVehicle = ref(false)
    const isSubmitting = ref(false)
    const showSuccessModal = ref(false)
    const lastCreatedTrip = ref(null)

    // Date minimale pour le formulaire (aujourd'hui)
    const minDate = computed(() => {
      const today = new Date()
      return today.toISOString().split('T')[0]
    })

    // Préférences du chauffeur
    const driverPreferences = ref({
      allowsSmoking: false,
      allowsPets: true,
      conversationLevel: 'modéré',
      preferredMusicGenre: '',
      specialRules: '',
    })

    // Nouveau véhicule
    const newVehicle = ref({
      plate_number: '',
      brand: '',
      model: '',
      seats_available: '',
      color: '',
      is_electric: false,
    })

    // Nouveau trajet
    const newRide = ref({
      departure: '',
      destination: '',
      date: '',
      time: '',
      price: '',
      seats: '',
      vehicleId: '',
    })

    // Computed pour vérifier si on peut proposer un trajet
    const canProposeRide = computed(() => {
      return (
        newRide.value.departure &&
        newRide.value.destination &&
        newRide.value.date &&
        newRide.value.time &&
        newRide.value.price &&
        newRide.value.seats &&
        newRide.value.vehicleId
      )
    })

    // Computed pour calculer le nombre de places disponibles selon le véhicule sélectionné
    const availableSeats = computed(() => {
      if (!newRide.value.vehicleId) {
        return 0 // Aucun véhicule sélectionné
      }

      const selectedVehicle = vehicles.value.find((v) => v.id == newRide.value.vehicleId)
      if (!selectedVehicle) {
        return 0
      }

      // Retourner un array de 1 à nombre de places disponibles
      const maxSeats = parseInt(selectedVehicle.seats_available)
      return Array.from({ length: maxSeats }, (_, i) => i + 1)
    })

    // Watcher pour réinitialiser les places sélectionnées quand le véhicule change
    watch(
      () => newRide.value.vehicleId,
      () => {
        // Réinitialiser le nombre de places sélectionnées quand on change de véhicule
        newRide.value.seats = ''
      },
    )

    // État de chargement du profil
    const isLoadingProfile = ref(true)

    // Charger les véhicules de l'utilisateur
    const loadUserVehicles = async () => {
      try {
        const response = await vehicleService.getUserVehicles()
        vehicles.value = response.vehicles || []
      } catch (error) {
        console.error('Erreur lors du chargement des véhicules:', error)
        vehicles.value = []
      }
    }

    // Charger le profil utilisateur
    const loadUserProfile = async () => {
      try {
        const profileData = await authService.getProfile()

        // Initialiser les rôles selon les données de l'API
        const userRoles = ['passager'] // Tous les utilisateurs sont passagers par défaut

        // Vérifier si l'utilisateur est chauffeur en cherchant dans le tableau des rôles
        if (profileData.user.roles && profileData.user.roles.includes('chauffeur')) {
          userRoles.push('chauffeur')
        }

        selectedRoles.value = userRoles

        // Si l'utilisateur est chauffeur, charger ses véhicules et préférences
        if (userRoles.includes('chauffeur')) {
          await loadUserVehicles()
          try {
            const prefsResp = await preferencesService.getMyPreferences()
            const prefs = prefsResp.preferences || prefsResp || {}

            // Map server keys (snake_case) to frontend structure if needed
            driverPreferences.value = {
              allowsSmoking:
                prefs.allowsSmoking ??
                prefs.allows_smoking ??
                driverPreferences.value.allowsSmoking,
              allowsPets:
                prefs.allowsPets ?? prefs.allows_pets ?? driverPreferences.value.allowsPets,
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
            // Silently ignore preference load errors but log for debugging
            console.error('Erreur lors du chargement des préférences:', err)
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error)

        // Si erreur d'authentification, rediriger vers login
        if (error.response?.status === 401 || error.response?.status === 403) {
          notificationStore.showError('Session expirée. Veuillez vous reconnecter.')
          authStore.logout()
          window.location.href = '/login'
          return
        }

        // Garder les rôles par défaut en cas d'erreur
        selectedRoles.value = ['passager']
      } finally {
        isLoadingProfile.value = false
      }
    }

    // Méthodes
    const updateRole = async () => {
      // Si l'utilisateur sélectionne le rôle chauffeur et n'était pas déjà chauffeur
      if (selectedRoles.value.includes('chauffeur')) {
        try {
          // Vérifier d'abord si l'utilisateur est déjà chauffeur
          const profileData = await authService.getProfile()
          const isAlreadyDriver =
            profileData.user.roles && profileData.user.roles.includes('chauffeur')

          if (!isAlreadyDriver) {
            await authService.becomeDriver()

            // Message informatif et redirection pour un nouveau token
            // Utilisation correcte du store de notifications
            notificationStore.showSuccess(
              'Félicitations ! Vous êtes maintenant chauffeur. Reconnectez-vous pour accéder à toutes les fonctionnalités de chauffeur.',
            )
            authStore.logout()
            window.location.href = '/login'
            return
          } else {
            // Charger les véhicules si pas déjà fait
            if (vehicles.value.length === 0) {
              await loadUserVehicles()
            }
          }
        } catch (error) {
          console.error('Erreur lors de la mise à jour du rôle:', error)
          console.error("Détails de l'erreur:", error.response?.data)

          // Si erreur d'authentification, rediriger vers login
          if (error.response?.status === 401 || error.response?.status === 403) {
            notificationStore.showError('Session expirée. Veuillez vous reconnecter.')
            authStore.logout()
            window.location.href = '/login'
            return
          }

          // Si l'utilisateur est déjà chauffeur, ne pas afficher d'erreur
          if (error.response?.data?.message?.includes('déjà chauffeur')) {
            return
          }

          // Pour les autres erreurs, afficher le message
          notificationStore.showError(
            'Erreur lors de la mise à jour du rôle: ' +
              (error.response?.data?.message || error.message),
          )

          // Revenir à l'état précédent
          selectedRoles.value = selectedRoles.value.filter((role) => role !== 'chauffeur')
        }
      }
    }

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

    const addVehicle = async () => {
      isSubmitting.value = true

      try {
        // Préparer les données selon le format attendu par l'API
        const vehicleData = {
          plate_number: newVehicle.value.plate_number,
          model: newVehicle.value.model,
          seats_available: parseInt(newVehicle.value.seats_available),
          is_electric: newVehicle.value.is_electric || false,
          brand_name: newVehicle.value.brand, // L'API attend brand_name
          color_name: newVehicle.value.color, // L'API attend color_name
          first_registration_date: null, // Optionnel selon l'API
        }

        // Appel API pour ajouter le véhicule
        await vehicleService.addVehicle(vehicleData)

        // Recharger la liste des véhicules
        await loadUserVehicles()

        // Reset du formulaire
        newVehicle.value = {
          plate_number: '',
          brand: '',
          model: '',
          seats_available: '',
          color: '',
          is_electric: false,
        }

        showAddVehicle.value = false
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
        // Appel API pour supprimer le véhicule
        await vehicleService.removeVehicle(vehicleId)

        // Recharger la liste des véhicules
        await loadUserVehicles()
      } catch (error) {
        console.error('Erreur lors de la suppression du véhicule:', error)
        notificationStore.showError(
          'Erreur lors de la suppression du véhicule: ' +
            (error.response?.data?.message || error.message),
        )
      }
    }

    const proposeRide = async () => {
      try {
        // Construire les dates et heures complètes
        const departureDateTime = `${newRide.value.date}T${newRide.value.time}:00`

        // Calculer une heure d'arrivée estimée (2h après le départ par défaut)
        const departureDate = new Date(departureDateTime)
        const arrivalDate = new Date(departureDate.getTime() + 2 * 60 * 60 * 1000) // +2h

        // Formater les dates au même format que departure_datetime
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

        // Validation des dates côté frontend
        if (departureDate <= new Date()) {
          notificationStore.showError('La date de départ doit être dans le futur.')
          return
        }

        if (arrivalDate <= departureDate) {
          notificationStore.showError('Erreur de calcul des dates. Veuillez réessayer.')
          return
        }

        // Préparer les données pour l'API
        const tripData = {
          departure_address: newRide.value.departure,
          arrival_address: newRide.value.destination,
          departure_datetime: departureDateTime,
          arrival_datetime: arrivalDateTime,
          price_per_passenger: parseFloat(newRide.value.price),
          seats_offered: parseInt(newRide.value.seats),
          vehicle_id: parseInt(newRide.value.vehicleId),
        }

        // Appel API
        await carpoolingService.createTrip(tripData)

        // Sauvegarder les données du trajet créé pour le modal
        lastCreatedTrip.value = {
          departure: newRide.value.departure,
          destination: newRide.value.destination,
          date: newRide.value.date,
          time: newRide.value.time,
          price: newRide.value.price,
          seats: newRide.value.seats,
        }

        // Reset du formulaire après proposition
        newRide.value = {
          departure: '',
          destination: '',
          date: '',
          time: '',
          price: '',
          seats: '',
          vehicleId: '',
        }

        // Afficher un message de confirmation avec un lien vers la recherche
        if (
          confirm(
            'Trajet proposé avec succès ! Voulez-vous voir votre trajet dans la liste des recherches ?',
          )
        ) {
          // Rediriger vers la page de recherche pour voir le trajet
          window.open('/search', '_blank')
        }
      } catch (error) {
        console.error('Erreur lors de la proposition du trajet:', error)
        notificationStore.showError(
          'Erreur lors de la proposition du trajet: ' +
            (error.response?.data?.message || error.message),
        )
      }
    }

    // Fonction pour formater la date de manière lisible
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    }

    // Fonction pour aller voir le trajet créé
    const viewCreatedTrip = () => {
      if (lastCreatedTrip.value) {
        // Préparer les paramètres de recherche avec les données du trajet créé
        const searchParams = new URLSearchParams({
          departure: lastCreatedTrip.value.departure,
          destination: lastCreatedTrip.value.destination,
          date: lastCreatedTrip.value.date,
          showMyTrips: 'true', // Flag pour mettre en évidence les trajets de l'utilisateur
        })

        // Rediriger vers la page de recherche avec les paramètres
        window.location.href = `/search?${searchParams.toString()}`
      }
      showSuccessModal.value = false
    }

    onMounted(async () => {
      // Vérifier l'état de l'authentification au montage

      // Si pas authentifié, rediriger vers login
      if (!authStore.isAuthenticated) {
        // Afficher une notification utilisateur plutôt qu'un console.warn
        notificationStore.showError('Utilisateur non authentifié. Veuillez vous reconnecter.')
        authStore.logout()
        window.location.href = '/login'
        return
      }

      // Charger le profil utilisateur pour récupérer le rôle actuel
      await loadUserProfile()
    })

    return {
      currentUser,
      selectedRoles,
      vehicles,
      showAddVehicle,
      isSubmitting,
      isLoadingProfile,
      showSuccessModal,
      lastCreatedTrip,
      minDate,
      driverPreferences,
      newVehicle,
      newRide,
      canProposeRide,
      availableSeats,
      updateRole,
      updatePreferences,
      addVehicle,
      removeVehicle,
      proposeRide,
      loadUserProfile,
      formatDate,
      viewCreatedTrip,
    }
  },
}
</script>

