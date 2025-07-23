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
          <span class="loading-spinner">⏳</span>
          <p>Chargement de votre profil...</p>
        </div>

        <!-- Options de rôle -->
        <div v-else class="role-options">
          <label class="role-option" :class="{ active: selectedRoles.includes('passager') }">
            <input type="checkbox" value="passager" v-model="selectedRoles" @change="updateRole" />
            <div class="role-content">
              <span class="role-icon">🚗</span>
              <div class="role-text">
                <h4>Passager</h4>
                <p>Je cherche des trajets à partager</p>
              </div>
            </div>
          </label>

          <label class="role-option" :class="{ active: selectedRoles.includes('chauffeur') }">
            <input type="checkbox" value="chauffeur" v-model="selectedRoles" @change="updateRole" />
            <div class="role-content">
              <span class="role-icon">🛻</span>
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
            <label class="form-label">🚗 Véhicule à utiliser</label>
            <select v-model="newRide.vehicleId" class="form-input" required>
              <option value="">Sélectionner un véhicule</option>
              <option v-for="vehicle in vehicles" :key="vehicle.id" :value="vehicle.id">
                {{ vehicle.brand_name || vehicle.brand }} {{ vehicle.model }} -
                {{ vehicle.plate_number }}
              </option>
            </select>
          </div>

          <div v-if="vehicles.length === 0" class="no-vehicle-warning">
            <span class="warning-icon">⚠️</span>
            <p>Vous devez d'abord ajouter un véhicule pour proposer un trajet.</p>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">🚩 Lieu de départ</label>
              <input
                type="text"
                v-model="newRide.departure"
                class="form-input"
                placeholder="Entrez le lieu de départ"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label">🏁 Lieu d'arrivée</label>
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
              <label class="form-label">📅 Date de départ</label>
              <input type="date" v-model="newRide.date" class="form-input" required />
            </div>
            <div class="form-group">
              <label class="form-label">🕐 Heure de départ</label>
              <input type="time" v-model="newRide.time" class="form-input" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">💰 Prix par passager (€)</label>
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
              <label class="form-label">👥 Places offertes</label>
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
                  <span class="tooltip-icon">⚠️</span>
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
              <span class="propose-icon">🚗</span>
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
              <span class="add-icon">+</span>
              Ajouter un véhicule
            </button>
          </div>

          <div v-if="vehicles.length === 0" class="empty-state">
            <span class="empty-icon">🚗</span>
            <p>Aucun véhicule enregistré</p>
            <small>Ajoutez votre premier véhicule pour proposer des trajets</small>
          </div>

          <div v-else class="vehicles-list">
            <div v-for="vehicle in vehicles" :key="vehicle.id" class="vehicle-item">
              <div class="vehicle-info">
                <h4>{{ vehicle.brand_name || vehicle.brand }} {{ vehicle.model }}</h4>
                <p class="vehicle-details">
                  {{ vehicle.plate_number }} • {{ vehicle.seats_available }} places
                  <span v-if="vehicle.is_electric" class="eco-badge">⚡ Électrique</span>
                </p>
              </div>
              <button @click="removeVehicle(vehicle.id)" class="remove-btn">
                <span>🗑️</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Préférences du chauffeur -->
        <div class="preferences-card">
          <h3 class="card-title">Mes Préférences de Conduite</h3>
          <div class="preferences-grid">
            <label class="preference-item">
              <input
                type="checkbox"
                v-model="driverPreferences.allowsSmoking"
                @change="updatePreferences"
              />
              <span class="preference-label">🚬 Fumeur autorisé</span>
            </label>

            <label class="preference-item">
              <input
                type="checkbox"
                v-model="driverPreferences.allowsPets"
                @change="updatePreferences"
              />
              <span class="preference-label">🐕 Animaux autorisés</span>
            </label>

            <div class="preference-select">
              <label class="form-label">🎵 Genre musical préféré</label>
              <select
                v-model="driverPreferences.preferredMusicGenre"
                @change="updatePreferences"
                class="form-select"
              >
                <option value="">Aucune préférence</option>
                <option value="pop">Pop</option>
                <option value="rock">Rock</option>
                <option value="jazz">Jazz</option>
                <option value="classique">Classique</option>
                <option value="electronic">Électronique</option>
                <option value="rap">Rap</option>
              </select>
            </div>

            <div class="preference-select">
              <label class="form-label">💬 Niveau de conversation</label>
              <select
                v-model="driverPreferences.conversationLevel"
                @change="updatePreferences"
                class="form-select"
              >
                <option value="silencieux">Silencieux</option>
                <option value="modéré">Modéré</option>
                <option value="bavard">Bavard</option>
              </select>
            </div>
          </div>

          <div class="custom-rules">
            <textarea
              v-model="driverPreferences.specialRules"
              @input="updatePreferences"
              class="form-textarea"
              placeholder="Règles spéciales (ex: pas de musique, climatisation à 22°C...)"
              rows="3"
            ></textarea>
          </div>
        </div>
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
              <span>⚡ Véhicule électrique</span>
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
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/counter'
import { carpoolingService, authService, vehicleService } from '../services/api'

export default {
  name: 'ProfileView',
  setup() {
    const authStore = useAuthStore()
    const currentUser = computed(() => authStore.currentUser)

    // États
    const selectedRoles = ref(['passager']) // Par défaut passager
    const vehicles = ref([])
    const showAddVehicle = ref(false)
    const isSubmitting = ref(false)

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
        console.log('Chargement des véhicules...')
        const response = await vehicleService.getUserVehicles()
        vehicles.value = response.vehicles || []
        console.log('Véhicules chargés:', vehicles.value)
      } catch (error) {
        console.error('Erreur lors du chargement des véhicules:', error)
        vehicles.value = []
      }
    }

    // Charger le profil utilisateur
    const loadUserProfile = async () => {
      try {
        console.log('Chargement du profil utilisateur...')
        const profileData = await authService.getProfile()
        console.log('Profil récupéré:', profileData)

        // Initialiser les rôles selon les données de l'API
        const userRoles = ['passager'] // Tous les utilisateurs sont passagers par défaut

        // Vérifier si l'utilisateur est chauffeur en cherchant dans le tableau des rôles
        if (profileData.user.roles && profileData.user.roles.includes('chauffeur')) {
          userRoles.push('chauffeur')
          console.log('Utilisateur déjà chauffeur')
        }

        selectedRoles.value = userRoles
        console.log('Rôles initialisés:', userRoles)

        // Si l'utilisateur est chauffeur, charger ses véhicules
        if (userRoles.includes('chauffeur')) {
          await loadUserVehicles()
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error)

        // Si erreur d'authentification, rediriger vers login
        if (error.response?.status === 401 || error.response?.status === 403) {
          alert('Session expirée. Veuillez vous reconnecter.')
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
      console.log('Rôles sélectionnés:', JSON.stringify(selectedRoles.value))

      // Si l'utilisateur sélectionne le rôle chauffeur et n'était pas déjà chauffeur
      if (selectedRoles.value.includes('chauffeur')) {
        try {
          // Vérifier d'abord si l'utilisateur est déjà chauffeur
          const profileData = await authService.getProfile()
          const isAlreadyDriver =
            profileData.user.roles && profileData.user.roles.includes('chauffeur')

          if (!isAlreadyDriver) {
            console.log("Tentative d'appel API becomeDriver...")
            await authService.becomeDriver()
            console.log('Utilisateur maintenant chauffeur')

            // Message informatif et redirection pour un nouveau token
            alert(
              'Félicitations ! Vous êtes maintenant chauffeur. Reconnectez-vous pour accéder à toutes les fonctionnalités de chauffeur.',
            )
            authStore.logout()
            window.location.href = '/login'
            return
          } else {
            console.log('Utilisateur déjà chauffeur, chargement des véhicules...')
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
            alert('Session expirée. Veuillez vous reconnecter.')
            authStore.logout()
            window.location.href = '/login'
            return
          }

          // Si l'utilisateur est déjà chauffeur, ne pas afficher d'erreur
          if (error.response?.data?.message?.includes('déjà chauffeur')) {
            console.log("Utilisateur déjà chauffeur, pas d'erreur à afficher")
            return
          }

          // Pour les autres erreurs, afficher le message
          alert(
            'Erreur lors de la mise à jour du rôle: ' +
              (error.response?.data?.message || error.message),
          )

          // Revenir à l'état précédent
          selectedRoles.value = selectedRoles.value.filter((role) => role !== 'chauffeur')
        }
      }
    }

    const updatePreferences = () => {
      console.log('Préférences mises à jour:', JSON.stringify(driverPreferences.value))
      // TODO: Envoyer au back-end
    }

    const addVehicle = async () => {
      isSubmitting.value = true

      try {
        console.log("Ajout d'un nouveau véhicule:", newVehicle.value)

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

        console.log("Données envoyées à l'API:", vehicleData)

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
        console.log('Véhicule ajouté avec succès')
      } catch (error) {
        console.error("Erreur lors de l'ajout du véhicule:", error)
        alert(
          "Erreur lors de l'ajout du véhicule: " + (error.response?.data?.message || error.message),
        )
      } finally {
        isSubmitting.value = false
      }
    }

    const removeVehicle = async (vehicleId) => {
      try {
        console.log('Suppression du véhicule:', vehicleId)

        // Appel API pour supprimer le véhicule
        await vehicleService.removeVehicle(vehicleId)

        // Recharger la liste des véhicules
        await loadUserVehicles()

        console.log('Véhicule supprimé avec succès')
      } catch (error) {
        console.error('Erreur lors de la suppression du véhicule:', error)
        alert(
          'Erreur lors de la suppression du véhicule: ' +
            (error.response?.data?.message || error.message),
        )
      }
    }

    const proposeRide = async () => {
      try {
        console.log('Nouveau trajet proposé:', JSON.stringify(newRide.value))

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

        console.log('Dates formatées:')
        console.log('Départ:', departureDateTime)
        console.log('Arrivée:', arrivalDateTime)

        // Validation des dates côté frontend
        if (departureDate <= new Date()) {
          alert('La date de départ doit être dans le futur.')
          return
        }

        if (arrivalDate <= departureDate) {
          alert('Erreur de calcul des dates. Veuillez réessayer.')
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
        const response = await carpoolingService.createTrip(tripData)

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
        console.log('Réponse API:', response)
      } catch (error) {
        console.error('Erreur lors de la proposition du trajet:', error)
        alert(
          'Erreur lors de la proposition du trajet: ' +
            (error.response?.data?.message || error.message),
        )
      }
    }

    onMounted(async () => {
      // Vérifier l'état de l'authentification au montage
      console.log("=== État de l'authentification au montage ===")
      console.log('Store isAuthenticated:', authStore.isAuthenticated)
      console.log('Store user:', authStore.currentUser)
      console.log('Token localStorage:', !!localStorage.getItem('authToken'))

      // Si pas authentifié, rediriger vers login
      if (!authStore.isAuthenticated) {
        console.warn('Utilisateur non authentifié, redirection vers login')
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
    }
  },
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d3748 100%);
  padding: 100px 20px 40px;
}

.profile-container {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.profile-header {
  background: #1a1a1a;
  border-radius: 20px;
  padding: 30px;
  border: 1px solid #333;
}

.profile-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 20px;
  text-align: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #34d399;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: #34d399;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  color: white;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 5px;
}

.user-email {
  color: #cccccc;
  font-size: 1rem;
}

.role-selection-card,
.propose-ride-card,
.vehicles-card,
.preferences-card {
  background: #1a1a1a;
  border-radius: 20px;
  padding: 30px;
  border: 1px solid #333;
}

.card-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 20px;
}

.role-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.role-option {
  border: 2px solid #333;
  border-radius: 15px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #2a2a2a;
}

.role-option.active {
  border-color: #34d399;
  background: rgba(52, 211, 153, 0.1);
}

.role-option input[type='checkbox'] {
  display: none;
}

.role-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.role-icon {
  font-size: 2rem;
}

.role-text h4 {
  color: #ffffff;
  font-size: 1.1rem;
  margin-bottom: 5px;
}

.role-text p {
  color: #cccccc;
  font-size: 0.9rem;
}

.loading-indicator {
  text-align: center;
  padding: 40px 20px;
  color: #cccccc;
}

.loading-spinner {
  font-size: 2rem;
  display: block;
  margin-bottom: 15px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-indicator p {
  margin: 0;
  font-size: 1rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.add-btn {
  background: #34d399;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.add-btn:hover {
  background: #22c55e;
  transform: translateY(-1px);
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #cccccc;
}

.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 15px;
}

.vehicles-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.driver-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 60px;
}

.vehicle-item {
  background: #2a2a2a;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #333;
}

.vehicle-info h4 {
  color: #ffffff;
  font-size: 1.1rem;
  margin-bottom: 5px;
}

.vehicle-details {
  color: #cccccc;
  font-size: 0.9rem;
}

.eco-badge {
  background: #34d399;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-left: 10px;
}

.remove-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.remove-btn:hover {
  background: #c82333;
}

.preferences-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
  justify-items: center;
}

.preference-item {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  justify-content: center;
}

.preference-item input[type='checkbox'] {
  accent-color: #34d399;
}

.preference-label {
  color: #ffffff;
  font-size: 0.95rem;
}

.preference-select {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  text-align: center;
}

.form-label {
  color: #ffffff;
  font-weight: 600;
  font-size: 0.9rem;
}

.form-select,
.form-input,
.form-textarea {
  padding: 12px 16px;
  border: 2px solid #333;
  border-radius: 10px;
  background: #2a2a2a;
  color: #ffffff;
  font-size: 0.95rem;
  width: 100%;
  max-width: 250px;
}

/* Styles spécifiques pour les inputs de la section proposer un trajet */
.propose-ride-form .form-input,
.propose-ride-form .form-select {
  max-width: none;
  width: 100%;
}

.form-select:focus,
.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #34d399;
  box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.2);
}

.custom-rules {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.custom-rules .form-textarea {
  width: 100%;
  max-width: 600px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #1a1a1a;
  border-radius: 20px;
  padding: 30px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid #333;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.modal-header h3 {
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: #cccccc;
  font-size: 2rem;
  cursor: pointer;
  padding: 5px;
  border-radius: 5px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #333;
  color: #ffffff;
}

.vehicle-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #ffffff;
  cursor: pointer;
}

.checkbox-label input[type='checkbox'] {
  accent-color: #34d399;
}

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 10px;
}

.cancel-btn {
  background: #6b7280;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: #555;
}

.submit-btn {
  background: #34d399;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.submit-btn:hover:not(:disabled) {
  background: #22c55e;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.propose-ride-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.propose-ride-form .form-row {
  gap: 20px;
}

.propose-ride-actions {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.propose-btn {
  background: linear-gradient(135deg, #34d399 0%, #22c55e 100%);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 15px;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 15px rgba(52, 211, 153, 0.3);
}

.propose-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(52, 211, 153, 0.4);
}

.propose-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.propose-icon {
  font-size: 1.2rem;
}

.no-vehicle-warning {
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid #ffc107;
  border-radius: 10px;
  padding: 15px;
  text-align: center;
  color: #ffc107;
  margin: 10px 0;
}

.warning-icon {
  font-size: 1.5rem;
  display: block;
  margin-bottom: 8px;
}

.no-vehicle-warning p {
  margin: 0;
  font-size: 0.9rem;
}

.select-container {
  position: relative;
}

.tooltip-orange {
  position: absolute;
  top: -35px;
  left: 0;
  background: rgba(255, 152, 0, 0.95);
  color: #fff;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
  z-index: 10;
  animation: tooltipFadeIn 0.3s ease;
}

.tooltip-orange::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 20px;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid rgba(255, 152, 0, 0.95);
}

.tooltip-icon {
  font-size: 0.9rem;
}

.tooltip-text {
  white-space: nowrap;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .profile-container {
    padding: 80px 15px 20px;
  }

  .role-options {
    grid-template-columns: 1fr;
  }

  .preferences-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .user-info {
    flex-direction: column;
    text-align: center;
  }
}
</style>
