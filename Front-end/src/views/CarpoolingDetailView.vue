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
      <p>❌ {{ error }}</p>
      <button @click="$router.go(-1)" class="retry-btn">Retourner à la recherche</button>
    </div>

    <!-- Contenu principal -->
    <div v-else-if="carpooling" class="content">
      <!-- Informations du trajet -->
      <div class="trip-info card">
        <div class="route-header">
          <div class="route">
            <h2>{{ carpooling.departure_address }} → {{ carpooling.arrival_address }}</h2>
            <div class="eco-badge" v-if="carpooling.is_electric">🌱 Voyage écologique</div>
          </div>
          <div class="duration-info">
            <span class="icon">⏱️</span>
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
            <span class="icon">💰</span>
            <span class="value">{{ carpooling.price_per_passenger }}</span>
            <IconCredit class="credit-icon" />
            <span class="label">par personne</span>
          </div>
          <div class="detail-item">
            <span class="icon">👥</span>
            <span class="value">{{ carpooling.seats_remaining }}</span>
            <span class="label">places restantes</span>
          </div>
        </div>
      </div>

      <!-- Informations du chauffeur -->
      <div class="driver-info card">
        <h3>👤 Chauffeur</h3>
        <div class="driver-card">
          <div class="driver-avatar">
            <ClickableAvatar 
              :userId="carpooling.driver_id"
              :profilePictureUrl="carpooling.driver_photo"
              :alt="carpooling.driver_pseudo"
              @click="viewDriverProfile"
            />
          </div>
          <div class="driver-details">
            <h4 class="driver-name" @click="viewDriverProfile">
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
        <h3>🚗 Véhicule</h3>
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
                <span class="eco-vehicle">⚡ Véhicule électrique</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Préférences du chauffeur -->
      <div class="preferences-info card">
        <h3>⚙️ Préférences du chauffeur</h3>
        <div class="preferences-grid">
          <div class="preference-item">
            <span class="pref-icon">🚬</span>
            <span class="pref-label">Fumeur:</span>
            <span class="pref-value">{{
              carpooling.driver_preferences?.allowsSmoking ? 'Autorisé' : 'Non autorisé'
            }}</span>
          </div>
          <div class="preference-item">
            <span class="pref-icon">🐕</span>
            <span class="pref-label">Animaux:</span>
            <span class="pref-value">{{
              carpooling.driver_preferences?.allowsPets ? 'Autorisés' : 'Non autorisés'
            }}</span>
          </div>
          <div class="preference-item">
            <span class="pref-icon">💬</span>
            <span class="pref-label">Conversation:</span>
            <span class="pref-value">{{
              carpooling.driver_preferences?.conversationLevel || 'Modérée'
            }}</span>
          </div>
          <div class="preference-item" v-if="carpooling.driver_preferences?.specialRules">
            <span class="pref-icon">📋</span>
            <span class="pref-label">Règles spéciales:</span>
            <span class="pref-value">{{ carpooling.driver_preferences.specialRules }}</span>
          </div>
        </div>
      </div>

      <!-- Avis récents -->
      <div class="reviews-info card">
        <h3>💬 Avis récents (placeholder)</h3>
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
          <span v-if="isParticipating">⏳ Vérification...</span>
          <span v-else>{{ carpooling.seats_remaining > 0 ? '🎫 Participer' : '❌ Complet' }}</span>
        </button>
        <button class="details-btn" @click="showMoreDetails = !showMoreDetails">
          {{ showMoreDetails ? '📄 Moins de détails' : '📄 Plus de détails' }}
        </button>
      </div>

      <!-- Détails supplémentaires (expandable) -->
      <div v-if="showMoreDetails" class="additional-details card">
        <h3>ℹ️ Informations complémentaires</h3>
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
          <h3>🎫 Confirmer votre participation</h3>
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
              ⚠️ <strong>Attention :</strong> Une fois confirmée, votre participation sera
              définitive et vos crédits seront immédiatement débités.
            </p>
            <p>
              ✅ Cette participation vous donne accès à une place dans le véhicule pour le trajet
              spécifié.
            </p>
          </div>
        </div>

        <div class="modal-actions">
          <button class="cancel-btn" @click="closeConfirmationModal" :disabled="isConfirming">
            ❌ Annuler
          </button>
          <button class="confirm-btn" @click="confirmParticipation" :disabled="isConfirming">
            <span v-if="isConfirming">⏳ Confirmation...</span>
            <span v-else>✅ Confirmer ma participation</span>
          </button>
        </div>
      </div>
    </div>

    <div v-else class="not-found">
      <p>🔍 Aucun covoiturage trouvé.</p>
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
    prévu: '📅 Prévu',
    démarré: '🚗 En cours',
    terminé: '✅ Terminé',
    annulé: '❌ Annulé',
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
      `✅ ${result.message}\n💰 ${result.creditsDebited} crédits débités\n🏦 Crédits restants: ${result.remainingCredits}`,
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
  color: #fff;
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
  background: #1a1a1a;
  color: #fff;
  border: 1px solid #333;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.back-btn:hover {
  background: #333;
  border-color: #555;
}

.header h1 {
  color: #fff;
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
  border: 3px solid #333;
  border-top: 3px solid #00ff88;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error {
  text-align: center;
  padding: 40px 20px;
  color: #ff6b6b;
}

.retry-btn,
.search-btn {
  background: #333;
  color: #fff;
  border: 1px solid #555;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 16px;
  transition: all 0.2s;
}

.retry-btn:hover,
.search-btn:hover {
  background: #555;
}

/* Cards */
.card {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.card h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #00ff88;
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
  color: #fff;
}

.duration-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 16px;
  background: #222;
  border-radius: 8px;
  border: 1px solid #333;
  min-width: 120px;
}

.duration-info .icon {
  font-size: 18px;
  margin-bottom: 4px;
}

.duration-value {
  font-weight: 600;
  color: #00ff88;
  font-size: 16px;
  margin-bottom: 2px;
}

.duration-label {
  font-size: 11px;
  color: #888;
  text-align: center;
}

.eco-badge {
  display: inline-block;
  background: linear-gradient(135deg, #00ff88, #00cc6a);
  color: #000;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-top: 8px;
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
  background: #222;
  border-radius: 8px;
  border: 1px solid #333;
}

.time-slot .label {
  display: block;
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.time-slot .time {
  display: block;
  font-size: 24px;
  font-weight: 600;
  color: #00ff88;
  margin-bottom: 4px;
}

.time-slot .date {
  display: block;
  font-size: 13px;
  color: #ccc;
}

.trip-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #222;
  border-radius: 8px;
  border: 1px solid #333;
}

.detail-item .icon {
  font-size: 18px;
}

.detail-item .value {
  font-weight: 600;
  color: #00ff88;
}

.detail-item .label {
  font-size: 12px;
  color: #888;
}

.credit-icon {
  width: 16px;
  height: 16px;
  margin-left: 2px;
}

/* Driver info */
.driver-card {
  display: flex;
  align-items: center;
  gap: 20px;
}

.driver-avatar img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid #333;
  object-fit: cover;
}

.driver-details h4 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #fff;
}

.rating {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stars {
  color: #ffd700;
  font-size: 16px;
}

.rating-value {
  font-weight: 600;
  color: #00ff88;
}

.review-count {
  font-size: 12px;
  color: #888;
}

/* Vehicle info */
.vehicle-details h4 {
  margin: 0 0 12px 0;
  font-size: 18px;
  color: #fff;
}

.vehicle-specs {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.spec-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #222;
  border-radius: 6px;
  border: 1px solid #333;
  font-size: 13px;
}

.spec-label {
  color: #888;
}

.spec-value {
  color: #fff;
  font-weight: 500;
}

.eco-vehicle {
  color: #00ff88;
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
  background: #222;
  border-radius: 8px;
  border: 1px solid #333;
}

.pref-icon {
  font-size: 16px;
}

.pref-label {
  font-size: 13px;
  color: #888;
  min-width: 70px;
}

.pref-value {
  font-size: 13px;
  color: #fff;
  font-weight: 500;
}

/* Reviews */
.reviews-list {
  max-height: 300px;
  overflow-y: auto;
}

.review-item {
  padding: 16px;
  background: #222;
  border-radius: 8px;
  border: 1px solid #333;
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
  color: #00ff88;
}

.review-rating {
  color: #ffd700;
  font-size: 14px;
}

.review-date {
  font-size: 12px;
  color: #888;
}

.review-comment {
  margin: 0;
  color: #ccc;
  font-size: 14px;
  line-height: 1.4;
}

.no-reviews {
  text-align: center;
  color: #888;
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
  background: linear-gradient(135deg, #00ff88, #00cc6a);
  color: #000;
}

.participate-btn:not(:disabled):hover {
  background: linear-gradient(135deg, #00cc6a, #00aa55);
  transform: translateY(-2px);
}

.participate-btn:disabled {
  background: #444;
  color: #888;
  cursor: not-allowed;
}

.details-btn {
  background: #333;
  color: #fff;
  border: 1px solid #555;
}

.details-btn:hover {
  background: #444;
  border-color: #666;
}

/* Modal de confirmation */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.confirmation-modal {
  background: #1a1a1a;
  border: 1px solid #333;
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
  border-bottom: 1px solid #333;
}

.modal-header h3 {
  margin: 0;
  color: #00ff88;
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
  color: #fff;
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #2a2a2a;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item .label {
  color: #888;
  font-size: 14px;
}

.summary-item .value {
  color: #fff;
  font-weight: 500;
}

.cost-highlight {
  color: #00ff88 !important;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.credits-info {
  background: #242424;
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
  color: #888;
  font-size: 14px;
}

.credits-current .value {
  color: #fff;
  font-weight: 500;
}

.credits-after .value {
  color: #ff9500;
  font-weight: 600;
}

.confirmation-warning {
  background: #2a1a1a;
  border: 1px solid #442;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.confirmation-warning p {
  margin: 0 0 8px;
  color: #ccc;
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
  border-top: 1px solid #333;
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
  background: #333;
  color: #fff;
  border: 1px solid #555;
}

.cancel-btn:hover:not(:disabled) {
  background: #444;
  border-color: #666;
}

.confirm-btn {
  background: linear-gradient(135deg, #00ff88, #00cc6a);
  color: #000;
}

.confirm-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #00cc6a, #00aa55);
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

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.extra-info p {
  margin: 8px 0;
  font-size: 14px;
  color: #ccc;
}

.extra-info strong {
  color: #00ff88;
}

/* Not found */
.not-found {
  text-align: center;
  padding: 60px 20px;
  color: #888;
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

  .driver-name {
    cursor: pointer;
    transition: color 0.3s ease;
  }

  .driver-name:hover {
    color: #667eea;
    text-decoration: underline;
  }

  .vehicle-specs {
    flex-direction: column;
  }

  .preferences-grid {
    grid-template-columns: 1fr;
  }
}
</style>
