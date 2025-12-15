<template>
  <div class="carpooling-detail">
    <!-- En-tête avec bouton retour -->
    <div class="header">
      <button @click="$router.go(-1)" class="back-btn">← Retour</button>
      <h1>Détail du covoiturage</h1>
    </div>

    <!-- Loading et erreurs -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Chargement des détails...</p>
    </div>

    <div v-else-if="error" class="error">
      <p><font-awesome-icon :icon="['fas', 'xmark']" /> {{ error }}</p>
      <button @click="$router.go(-1)" class="retry-btn">Retourner à la recherche</button>
    </div>

    <!-- Contenu principal -->
    <div v-else-if="carpooling" class="content">
      <!-- Informations du trajet -->
      <div class="trip-info card">
        <div class="route-header">
          <div class="route">
            <h2>{{ carpooling.departure_address }} → {{ carpooling.arrival_address }}</h2>
            <div class="eco-badge" v-if="carpooling.is_electric">
              <font-awesome-icon :icon="['fas', 'leaf']" /> Voyage écologique
            </div>
          </div>
          <div class="duration-info">
            <font-awesome-icon :icon="['fas', 'clock-rotate-left']" class="icon" />
            <span class="duration-value">{{ formatDuration(carpooling.duration_minutes) }}</span>
            <span class="duration-label">de trajet</span>
          </div>
        </div>

        <div class="datetime-info">
          <div class="time-slot">
            <span class="label">Départ</span>
            <span class="time">{{ formatTime(carpooling.departure_datetime) }}</span>
            <span class="date">{{ formatDate(carpooling.departure_datetime) }}</span>
          </div>
          <div class="time-slot">
            <span class="label">Arrivée</span>
            <span class="time">{{ formatTime(carpooling.arrival_datetime) }}</span>
            <span class="date">{{ formatDate(carpooling.arrival_datetime) }}</span>
          </div>
        </div>

        <div class="trip-details">
          <div class="detail-item">
            <font-awesome-icon :icon="['fas', 'coins']" class="icon" />
            <span class="value">{{ carpooling.price_per_passenger }}</span>
            <IconCredit class="credit-icon" />
            <span class="label">par personne</span>
          </div>
          <div class="detail-item">
            <font-awesome-icon :icon="['fas', 'user-group']" class="icon" />
            <span class="value">{{ carpooling.seats_remaining }}</span>
            <span class="label">places restantes</span>
          </div>
        </div>
      </div>

      <!-- Informations du chauffeur -->
      <div class="driver-info card">
        <h3><font-awesome-icon :icon="['fas', 'user']" /> Chauffeur</h3>
        <div class="driver-card">
          <div class="driver-avatar">
            <ClickableAvatar
              :userId="carpooling.driver_id"
              :profilePictureUrl="
                carpooling.driver_photo ||
                `https://i.pravatar.cc/150?img=${carpooling.driver_id % 70}`
              "
              :alt="carpooling.driver_pseudo"
              @click="viewDriverProfile"
            />
          </div>
          <div class="driver-details">
            <h4 class="driver-name" @click="viewDriverProfile(carpooling.driver_id)">
              {{ carpooling.driver_pseudo }}
            </h4>
            <div class="rating">
              <span class="stars">{{ getStars(carpooling.driver_rating) }}</span>
              <span class="rating-value">{{ carpooling.driver_rating }}/5</span>
              <span class="review-count">({{ carpooling.total_reviews }} avis)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Informations du véhicule -->
      <div class="vehicle-info card">
        <h3><font-awesome-icon :icon="['fas', 'car']" /> Véhicule</h3>
        <div class="vehicle-details">
          <div class="vehicle-main">
            <h4>{{ carpooling.brand_name }} {{ carpooling.model }}</h4>
            <div class="vehicle-specs">
              <span class="spec-item">
                <span class="spec-label">Couleur:</span>
                <span class="spec-value">{{ carpooling.color_name }}</span>
              </span>
              <span class="spec-item">
                <span class="spec-label">Plaque:</span>
                <span class="spec-value">{{ carpooling.plate_number }}</span>
              </span>
              <span class="spec-item" v-if="carpooling.is_electric">
                <span class="eco-vehicle"
                  ><font-awesome-icon :icon="['fas', 'bolt']" /> Véhicule électrique</span
                >
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Préférences du chauffeur -->
      <div class="preferences-info card">
        <h3><font-awesome-icon :icon="['fas', 'gear']" /> Préférences du chauffeur</h3>
        <div class="preferences-grid">
          <div class="preference-item">
            <font-awesome-icon :icon="['fas', 'smoking']" class="pref-icon" />
            <span class="pref-label">Fumeur:</span>
            <span class="pref-value">{{
              carpooling.driver_preferences?.allowsSmoking ? 'Autorisé' : 'Non autorisé'
            }}</span>
          </div>
          <div class="preference-item">
            <font-awesome-icon :icon="['fas', 'paw']" class="pref-icon" />
            <span class="pref-label">Animaux:</span>
            <span class="pref-value">{{
              carpooling.driver_preferences?.allowsPets ? 'Autorisés' : 'Non autorisés'
            }}</span>
          </div>
          <div class="preference-item">
            <font-awesome-icon :icon="['fas', 'comment']" class="pref-icon" />
            <span class="pref-label">Conversation:</span>
            <span class="pref-value">{{
              carpooling.driver_preferences?.conversationLevel || 'Modérée'
            }}</span>
          </div>
          <div class="preference-item" v-if="carpooling.driver_preferences?.specialRules">
            <font-awesome-icon :icon="['fas', 'clipboard-list']" class="pref-icon" />
            <span class="pref-label">Règles spéciales:</span>
            <span class="pref-value">{{ carpooling.driver_preferences.specialRules }}</span>
          </div>
        </div>
      </div>

      <!-- Avis récents -->
      <div class="reviews-info card">
        <h3><font-awesome-icon :icon="['fas', 'comment']" /> Avis récents (placeholder)</h3>
        <div class="reviews-list">
          <div v-if="carpooling.recent_reviews && carpooling.recent_reviews.length > 0">
            <div
              class="review-item"
              v-for="review in carpooling.recent_reviews"
              :key="review.reviewer_pseudo"
            >
              <div class="review-header">
                <span class="reviewer-name">{{ review.reviewer_pseudo }}</span>
                <span class="review-rating">{{ getStars(review.rating) }}</span>
                <span class="review-date">{{ formatReviewDate(review.createdAt) }}</span>
              </div>
              <p class="review-comment">{{ review.comment }}</p>
            </div>
          </div>
          <div v-else class="no-reviews">
            <p>Aucun avis disponible pour ce chauffeur.</p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="actions">
        <button
          class="participate-btn"
          :disabled="carpooling.seats_remaining <= 0 || isParticipating"
          @click="initiateParticipation"
        >
          <span v-if="isParticipating">
            <font-awesome-icon :icon="['fas', 'hourglass-half']" /> Vérification...</span
          >
          <span v-else>
            <template v-if="carpooling.seats_remaining > 0">
              <font-awesome-icon :icon="['fas', 'ticket']" /> Participer
            </template>
            <template v-else> <font-awesome-icon :icon="['fas', 'xmark']" /> Complet </template>
          </span>
        </button>
        <button class="details-btn" @click="showMoreDetails = !showMoreDetails">
          <span v-if="showMoreDetails"
            ><font-awesome-icon :icon="['fas', 'file-lines']" /> Moins de détails</span
          >
          <span v-else><font-awesome-icon :icon="['fas', 'file-lines']" /> Plus de détails</span>
        </button>
      </div>

      <!-- Détails supplémentaires (expandable) -->
      <div v-if="showMoreDetails" class="additional-details card">
        <h3><font-awesome-icon :icon="['fas', 'circle-info']" /> Informations complémentaires</h3>
        <div class="extra-info">
          <p><strong>ID du covoiturage:</strong> {{ carpooling.id }}</p>
          <p><strong>Statut:</strong> {{ getStatusLabel(carpooling.status) }}</p>
          <p>
            <strong>Places initialement offertes:</strong> {{ carpooling.initial_seats_offered }}
          </p>
          <p>
            <strong>Commission plateforme:</strong>
            {{ carpooling.platform_commission_earned }} crédits
          </p>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation de participation -->
    <div v-if="showConfirmationModal" class="modal-overlay" @click="closeConfirmationModal">
      <div class="confirmation-modal" @click.stop>
        <div class="modal-header">
          <h3><font-awesome-icon :icon="['fas', 'ticket']" /> Confirmer votre participation</h3>
        </div>

        <div class="modal-content">
          <div class="participation-summary">
            <h4>Résumé de votre participation :</h4>
            <div class="summary-item">
              <span class="label">Trajet :</span>
              <span class="value"
                >{{ carpooling.departure_address }} → {{ carpooling.arrival_address }}</span
              >
            </div>
            <div class="summary-item">
              <span class="label">Date :</span>
              <span class="value">{{ formatDate(carpooling.departure_datetime) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Heure de départ :</span>
              <span class="value">{{ formatTime(carpooling.departure_datetime) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Coût :</span>
              <span class="value cost-highlight">
                {{ carpooling.price_per_passenger }}
                <IconCredit class="credit-icon" />
              </span>
            </div>
          </div>

          <div class="credits-info">
            <div class="credits-current">
              <span class="label">Vos crédits actuels :</span>
              <span class="value"
                >{{ participationCheck?.user?.current_credits || 'Chargement...' }} crédits</span
              >
            </div>
            <div class="credits-after">
              <span class="label">Après participation :</span>
              <span class="value"
                >{{
                  participationCheck?.user?.credits_after_participation || 'Chargement...'
                }}
                crédits</span
              >
            </div>
          </div>

          <div class="confirmation-warning">
            <p>
              <font-awesome-icon :icon="['fas', 'triangle-exclamation']" />
              <strong>Attention :</strong> Une fois confirmée, votre participation sera définitive
              et vos crédits seront immédiatement débités.
            </p>
            <p>
              <font-awesome-icon :icon="['fas', 'circle-check']" /> Cette participation vous donne
              accès à une place dans le véhicule pour le trajet spécifié.
            </p>
          </div>
        </div>

        <div class="modal-actions">
          <button class="cancel-btn" @click="closeConfirmationModal" :disabled="isConfirming">
            <font-awesome-icon :icon="['fas', 'xmark']" /> Annuler
          </button>
          <button class="confirm-btn" @click="confirmParticipation" :disabled="isConfirming">
            <span v-if="isConfirming"
              ><font-awesome-icon :icon="['fas', 'hourglass-half']" /> Confirmation...</span
            >
            <span v-else
              ><font-awesome-icon :icon="['fas', 'circle-check']" /> Confirmer ma
              participation</span
            >
          </button>
        </div>
      </div>
    </div>

    <div v-else class="not-found">
      <p><font-awesome-icon :icon="['fas', 'magnifying-glass']" /> Aucun covoiturage trouvé.</p>
      <button @click="$router.push('/search')" class="search-btn">Retourner à la recherche</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api, { participationService } from '@/services/api.js'
import IconCredit from '@/components/icons/IconCredit.vue'
import ClickableAvatar from '@/components/ClickableAvatar.vue'

const route = useRoute()
const router = useRouter()
const carpooling = ref(null)
const loading = ref(true)
const error = ref(null)
const showMoreDetails = ref(false)

// Variables pour la double confirmation
const showConfirmationModal = ref(false)
const participationCheck = ref(null)
const isParticipating = ref(false)
const isConfirming = ref(false)

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatTime = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatDuration = (minutes) => {
  if (!minutes) return 'N/A'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}h${mins > 0 ? mins.toString().padStart(2, '0') : ''}`
  }
  return `${mins}min`
}

const formatReviewDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const getStars = (rating) => {
  if (!rating) return '☆☆☆☆☆'
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  let stars = '★'.repeat(fullStars)
  if (hasHalfStar) stars += '☆'
  stars += '☆'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0))
  return stars
}

// Fonction pour naviguer vers le profil du chauffeur
const viewDriverProfile = (userId) => {
  router.push(`/user/${userId}`)
}

const getStatusLabel = (status) => {
  const statusLabels = {
    prévu: 'Prévu',
    démarré: 'En cours',
    terminé: 'Terminé',
    annulé: 'Annulé',
  }
  return statusLabels[status] || status
}

// Fonction pour initier la participation (première étape)
const initiateParticipation = async () => {
  try {
    isParticipating.value = true
    error.value = null

    // Vérifier les conditions de participation
    const checkResult = await participationService.checkConditions(carpooling.value.id)
    participationCheck.value = checkResult

    // Ouvrir la modal de confirmation
    showConfirmationModal.value = true
  } catch (err) {
    console.error('Erreur lors de la vérification des conditions:', err)
    error.value = err.response?.data?.message || 'Erreur lors de la vérification des conditions'
  } finally {
    isParticipating.value = false
  }
}

// Fonction pour confirmer la participation (deuxième étape)
const confirmParticipation = async () => {
  try {
    isConfirming.value = true
    error.value = null

    // Confirmer la participation avec le flag explicite
    const result = await participationService.joinTrip(carpooling.value.id, true)

    // Fermer la modal
    showConfirmationModal.value = false

    // Afficher un message de succès et rediriger vers les voyages
    alert(
      `${result.message}\nCrédits débités: ${result.creditsDebited}\nCrédits restants: ${result.remainingCredits}`,
    )

    // Rediriger vers la page "Mes voyages"
    router.push('/trips')
  } catch (err) {
    console.error('Erreur lors de la confirmation:', err)
    error.value =
      err.response?.data?.message || 'Erreur lors de la confirmation de la participation'
  } finally {
    isConfirming.value = false
  }
}

// Fonction pour fermer la modal de confirmation
const closeConfirmationModal = () => {
  showConfirmationModal.value = false
  participationCheck.value = null
}

onMounted(async () => {
  try {
    loading.value = true
    error.value = null
    const { id } = route.params

    if (!id) {
      throw new Error('ID du covoiturage manquant')
    }

    const response = await api.get(`/carpoolings/${id}`)
    carpooling.value = response.data.carpooling

    // Vérifier que les données essentielles sont présentes
    if (!carpooling.value) {
      throw new Error('Données du covoiturage non trouvées')
    }
  } catch (err) {
    console.error('Erreur lors du chargement du covoiturage:', err)
    error.value = err.response?.data?.message || err.message || 'Erreur de connexion'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.carpooling-detail {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  color: var(--color-light);
  min-height: 100vh;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  gap: 20px;
}

.back-btn {
  background: var(--color-dark);
  color: var(--color-light);
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: var(--color-gray);
}

.header h1 {
  color: var(--color-light);
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

/* Loading et erreurs */
.loading {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.15);
  border-top: 3px solid var(--eco-green);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

.error {
  text-align: center;
  padding: 40px 20px;
  color: var(--color-error);
}

.retry-btn,
.search-btn {
  background: rgba(255, 255, 255, 0.15);
  color: var(--color-light);
  border: 1px solid var(--color-gray);
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 16px;
  transition: all 0.2s;
}

.retry-btn:hover,
.search-btn:hover {
  background: var(--color-gray);
}

/* Cards */
/* Card styles moved to assets/css/_cards.css (global) */

.grid-route {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 24px;
}

.card h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--eco-green);
}

/* Trip info */
.route-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 20px;
}

.route h2 {
  margin: 0 0 10px 0;
  font-size: 20px;
  color: var(--color-light);
}

.duration-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 16px;
  background: var(--color-dark-secondary);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  min-width: 120px;
}

.duration-info .icon {
  font-size: 18px;
  margin-bottom: 4px;
}

.duration-value {
  font-weight: 600;
  color: var(--eco-green);
  font-size: 16px;
  margin-bottom: 2px;
}

.duration-label {
  font-size: 11px;
  color: var(--color-gray);
  text-align: center;
}

/* eco-badge moved to global utilities — override here if necessary */
.eco-badge {
  margin-top: 8px;
  display: inline-block;
}

.datetime-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin: 20px 0;
}

.time-slot {
  text-align: center;
  padding: 16px;
  background: var(--color-dark-secondary);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.time-slot .label {
  display: block;
  font-size: 12px;
  color: var(--color-gray);
  text-transform: uppercase;
  margin-bottom: 4px;
}

.time-slot .time {
  display: block;
  font-size: 24px;
  font-weight: 600;
  color: var(--eco-green);
  margin-bottom: 4px;
}

.time-slot .date {
  display: block;
  font-size: 13px;
  color: var(--color-light-secondary);
}

/* Trip details, driver & vehicle styles are centralized in /assets/css/_cards.css; only minor view overrides kept here */
.trip-details {
  display: grid;
  gap: 16px;
  margin-top: 20px;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
}

/* Keep view-scoped tweak */
.driver-details h4 {
  margin-bottom: 8px;
}
.review-count {
  font-size: 12px;
  color: var(--text-muted);
}
.spec-value {
  font-weight: 500;
}

.eco-vehicle {
  color: var(--eco-green);
  font-weight: 600;
}

/* Preferences */
.preferences-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.preference-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: var(--color-dark-secondary);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.pref-icon {
  font-size: 16px;
}

.pref-label {
  font-size: 13px;
  color: var(--color-gray);
  min-width: 70px;
}

.pref-value {
  font-size: 13px;
  color: var(--color-light);
  font-weight: 500;
}

/* Reviews */
.reviews-list {
  max-height: 300px;
  overflow-y: auto;
}

.review-item {
  padding: 16px;
  background: var(--color-dark-secondary);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  margin-bottom: 12px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.reviewer-name {
  font-weight: 600;
  color: var(--eco-green);
}

.review-rating {
  color: var(--color-warning);
  font-size: 14px;
}

.review-date {
  font-size: 12px;
  color: var(--color-gray);
}

.review-comment {
  margin: 0;
  color: var(--color-light-secondary);
  font-size: 14px;
  line-height: 1.4;
}

.no-reviews {
  text-align: center;
  color: var(--color-gray);
  font-style: italic;
  padding: 20px;
}

/* Actions */
.actions {
  display: flex;
  gap: 16px;
  margin: 30px 0;
  justify-content: center;
}

.participate-btn,
.details-btn {
  padding: 16px 32px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.participate-btn {
  background: linear-gradient(135deg, var(--eco-green), var(--eco-green-hover));
  color: var(--color-dark);
}

.participate-btn:not(:disabled):hover {
  background: linear-gradient(135deg, var(--eco-green-hover), var(--eco-green));
  transform: translateY(-2px);
}

.participate-btn:disabled {
  background: rgba(255, 255, 255, 0.2);
  color: var(--color-gray);
  cursor: not-allowed;
}

.details-btn {
  background: rgba(255, 255, 255, 0.15);
  color: var(--color-light);
  border: 1px solid var(--color-gray);
}

.details-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: var(--color-gray);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.confirmation-modal {
  background: var(--color-dark);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 0;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.modal-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.modal-header h3 {
  margin: 0;
  color: var(--eco-green);
  font-size: 20px;
  font-weight: 600;
}

.modal-content {
  padding: 24px;
}

.participation-summary {
  margin-bottom: 24px;
}

.participation-summary h4 {
  color: var(--color-light);
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-dark-secondary);
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item .label {
  color: var(--color-gray);
  font-size: 14px;
}

.summary-item .value {
  color: var(--color-light);
  font-weight: 500;
}

.cost-highlight {
  color: var(--eco-green) !important;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.credits-info {
  background: var(--color-dark-secondary);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.credits-current,
.credits-after {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.credits-current .label,
.credits-after .label {
  color: var(--color-gray);
  font-size: 14px;
}

.credits-current .value {
  color: var(--color-light);
  font-weight: 500;
}

.credits-after .value {
  color: var(--color-warning);
  font-weight: 600;
}

.confirmation-warning {
  background: rgba(205, 101, 112, 0.1);
  border: 1px solid rgba(205, 101, 112, 0.2);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.confirmation-warning p {
  margin: 0 0 8px;
  color: var(--color-light-secondary);
  font-size: 13px;
  line-height: 1.4;
}

.confirmation-warning p:last-child {
  margin-bottom: 0;
}

.modal-actions {
  display: flex;
  gap: 12px;
  padding: 16px 24px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.15);
  color: var(--color-light);
  border: 1px solid var(--color-gray);
}

.cancel-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  border-color: var(--color-gray);
}

.confirm-btn {
  background: linear-gradient(135deg, var(--eco-green), var(--eco-green-hover));
  color: var(--color-dark);
}

.confirm-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--eco-green-hover), var(--eco-green));
}

.cancel-btn:disabled,
.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Additional details */
.additional-details {
  animation: slideDown 0.3s ease-out;
}

.extra-info p {
  margin: 8px 0;
  font-size: 14px;
  color: var(--color-light-secondary);
}

.extra-info strong {
  color: var(--eco-green);
}

/* Not found */
.not-found {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-gray);
}

/* Driver name clickable styling */
.driver-name {
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--eco-green);
  text-decoration: underline;
  text-decoration-color: transparent;
  text-underline-offset: 2px;
}

.driver-name:hover {
  color: var(--bs-primary);
  text-decoration-color: var(--bs-primary);
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 768px) {
  .carpooling-detail {
    padding: 16px;
    margin: 10px;
  }

  .route-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .duration-info {
    align-self: flex-end;
    min-width: auto;
    flex-direction: row;
    gap: 8px;
    padding: 8px 12px;
  }

  .duration-info .icon {
    margin-bottom: 0;
  }

  .datetime-info {
    grid-template-columns: 1fr;
  }

  .trip-details {
    grid-template-columns: 1fr;
  }

  .actions {
    flex-direction: column;
  }

  .driver-card {
    flex-direction: column;
    text-align: center;
  }

  .vehicle-specs {
    flex-direction: column;
  }

  .preferences-grid {
    grid-template-columns: 1fr;
  }
}
</style>
