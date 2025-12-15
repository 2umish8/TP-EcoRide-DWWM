<template>
  <div class="carpooling-detail">
    <!-- En-tête avec bouton retour -->
    <div class="header">
      <NavButton @click="$router.go(-1)">← Retour</NavButton>
      <h1>Détail du covoiturage</h1>
    </div>

    <!-- Loading et erreurs -->
    <LoadingState
      v-if="loading"
      title="Chargement du covoiturage"
      message="Veuillez patienter..."
    />

    <ErrorState
      v-else-if="error"
      :message="error"
      title="Erreur lors du chargement"
      :show-retry="true"
      @retry="$router.go(-1)"
    />

    <!-- Contenu principal -->
    <div v-else-if="carpooling">
      <!-- Ligne supérieure: Route & Chauffeur -->
      <div class="top-section">
        <!-- Informations du trajet -->
        <div class="trip-info">
          <div class="route-header">
            <h2>{{ carpooling.departure_address }} → {{ carpooling.arrival_address }}</h2>
            <div class="eco-badge" v-if="carpooling.is_electric">
              <font-awesome-icon :icon="['fas', 'leaf']" /> Écologique
            </div>
          </div>

          <div class="datetime-compact">
            <div class="time-slot-compact">
              <span class="label">Départ</span>
              <span class="time-compact">{{ formatTime(carpooling.departure_datetime) }}</span>
              <span class="date-compact">{{ formatDate(carpooling.departure_datetime) }}</span>
            </div>
            <div class="arrow-separator">→</div>
            <div class="time-slot-compact">
              <span class="label">Arrivée</span>
              <span class="time-compact">{{ formatTime(carpooling.arrival_datetime) }}</span>
              <span class="date-compact">{{ formatDate(carpooling.arrival_datetime) }}</span>
            </div>
            <div class="duration-compact">
              <font-awesome-icon :icon="['fas', 'clock-rotate-left']" />
              <span>{{ formatDuration(carpooling.duration_minutes) }}</span>
            </div>
          </div>

          <div class="trip-highlights">
            <div class="highlight-item price">
              <span class="label"><font-awesome-icon :icon="['fas', 'coins']" /> Prix</span>
              <span class="value">{{ carpooling.price_per_passenger }} €</span>
            </div>
            <div class="highlight-item seats">
              <span class="label"><font-awesome-icon :icon="['fas', 'chair']" /> Places</span>
              <span class="value">{{ carpooling.seats_remaining }}</span>
            </div>
          </div>
        </div>

        <!-- Informations du chauffeur et avis -->
        <div class="driver-info">
          <!-- Chauffeur (gauche) -->
          <div class="driver-left">
            <div class="driver-card-compact">
              <ClickableAvatar
                :userId="carpooling.driver_id"
                :profilePictureUrl="
                  carpooling.driver_photo ||
                  `https://i.pravatar.cc/150?img=${carpooling.driver_id % 70}`
                "
                :alt="carpooling.driver_pseudo"
                class="driver-avatar-compact"
                @click="viewDriverProfile"
              />
              <div class="driver-details-compact">
                <h4 class="driver-name" @click="viewDriverProfile(carpooling.driver_id)">
                  {{ carpooling.driver_pseudo }}
                </h4>
                <div class="rating-compact">
                  <span class="stars">{{ getStars(carpooling.driver_rating) }}</span>
                  <span class="rating-value">{{ carpooling.driver_rating }}/5</span>
                </div>
                <span class="review-count">({{ carpooling.total_reviews }} avis)</span>
              </div>
            </div>
          </div>

          <!-- Avis (droite) -->
          <div class="driver-right">
            <h4><font-awesome-icon :icon="['fas', 'comment']" /> Avis récents</h4>
            <div class="reviews-scroll-container">
              <div v-if="carpooling.recent_reviews && carpooling.recent_reviews.length > 0">
                <div
                  class="review-item-compact"
                  v-for="review in carpooling.recent_reviews"
                  :key="review.reviewer_pseudo"
                >
                  <div class="review-header-compact">
                    <span class="reviewer-name">{{ review.reviewer_pseudo }}</span>
                    <span class="review-rating">{{ getStars(review.rating) }}</span>
                  </div>
                  <p class="review-comment-compact">{{ review.comment }}</p>
                  <span class="review-date">{{ formatReviewDate(review.createdAt) }}</span>
                </div>
              </div>
              <div v-else class="no-reviews-compact">
                <p>Aucun avis disponible.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Véhicule & Préférences en ligne -->
      <div class="middle-section">
        <!-- Informations du véhicule -->
        <div class="vehicle-info">
          <h3><font-awesome-icon :icon="['fas', 'car']" /> Véhicule</h3>
          <div class="vehicle-compact">
            <div>
              <h4>{{ carpooling.brand_name }} {{ carpooling.model }}</h4>
              <div class="vehicle-specs-compact">
                <span class="spec-compact">
                  <strong>Couleur:</strong> {{ carpooling.color_name }}
                </span>
                <span class="spec-compact">
                  <strong>Plaque:</strong> <code>{{ carpooling.plate_number }}</code>
                </span>
                <span v-if="carpooling.is_electric" class="eco-vehicle">
                  <font-awesome-icon :icon="['fas', 'bolt']" /> Électrique
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Préférences du chauffeur -->
        <div class="preferences-info">
          <h3><font-awesome-icon :icon="['fas', 'gear']" /> Préférences</h3>
          <div class="preferences-compact">
            <div class="pref-item-compact">
              <font-awesome-icon :icon="['fas', 'smoking']" class="pref-icon" />
              <span>{{
                carpooling.driver_preferences?.allowsSmoking ? '✓ Fumeur' : '✗ Non-fumeur'
              }}</span>
            </div>
            <div class="pref-item-compact">
              <font-awesome-icon :icon="['fas', 'paw']" class="pref-icon" />
              <span>{{
                carpooling.driver_preferences?.allowsPets ? '✓ Animaux' : "✗ Pas d'animaux"
              }}</span>
            </div>
            <div class="pref-item-compact">
              <font-awesome-icon :icon="['fas', 'comment']" class="pref-icon" />
              <span>{{ carpooling.driver_preferences?.conversationLevel || 'Modérée' }}</span>
            </div>
            <div v-if="carpooling.driver_preferences?.specialRules" class="pref-item-compact">
              <font-awesome-icon :icon="['fas', 'clipboard-list']" class="pref-icon" />
              <span>{{ carpooling.driver_preferences.specialRules }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="actions">
        <SecondaryButton @click="showMoreDetails = !showMoreDetails">
          <span v-if="showMoreDetails"
            ><font-awesome-icon :icon="['fas', 'file-lines']" /> Moins de détails</span
          >
          <span v-else><font-awesome-icon :icon="['fas', 'file-lines']" /> Plus de détails</span>
        </SecondaryButton>
        <PrimaryButton
          :disabled="carpooling.seats_remaining <= 0 || isParticipating || isUserDriver"
          :title="isUserDriver ? buttonDisabledReason : ''"
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
        </PrimaryButton>
      </div>

      <!-- Détails supplémentaires (expandable) -->
      <div v-if="showMoreDetails" class="additional-details">
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

      <!-- Modal de confirmation de participation -->
      <BaseModal :show="showConfirmationModal" @close="closeConfirmationModal">
        <template #header>
          <div class="modal-header-content">
            <font-awesome-icon :icon="['fas', 'ticket']" /> Confirmer votre participation
          </div>
        </template>

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
            <strong>Attention :</strong> Une fois confirmée, votre participation sera définitive et
            vos crédits seront immédiatement débités.
          </p>
          <p>
            <font-awesome-icon :icon="['fas', 'circle-check']" /> Cette participation vous donne
            accès à une place dans le véhicule pour le trajet spécifié.
          </p>
        </div>

        <template #footer>
          <div class="modal-actions">
            <SecondaryButton @click="closeConfirmationModal" :disabled="isConfirming">
              <font-awesome-icon :icon="['fas', 'xmark']" /> Annuler
            </SecondaryButton>
            <PrimaryButton @click="confirmParticipation" :disabled="isConfirming">
              <span v-if="isConfirming"
                ><font-awesome-icon :icon="['fas', 'hourglass-half']" /> Confirmation...</span
              >
              <span v-else
                ><font-awesome-icon :icon="['fas', 'circle-check']" /> Confirmer ma
                participation</span
              >
            </PrimaryButton>
          </div>
        </template>
      </BaseModal>
    </div>

    <div v-else class="not-found">
      <div class="no-carpooling" v-if="!driverTrips || driverTrips.length === 0">
        <p v-if="driverIsActive" class="no-trips-message">
          <font-awesome-icon :icon="['fas', 'inbox']" /> Ce chauffeur n'a aucun covoiturage prévu ou
          en cours
        </p>
        <p v-else class="no-driver-message">
          <font-awesome-icon :icon="['fas', 'magnifying-glass']" /> Aucun covoiturage trouvé
        </p>
        <PrimaryButton @click="$router.push('/search')">Retourner à la recherche</PrimaryButton>
      </div>

      <div class="driver-trips" v-else>
        <h2><font-awesome-icon :icon="['fas', 'car']" /> Autres voyages de ce chauffeur</h2>
        <div class="trips-grid">
          <TripCard
            v-for="trip in driverTrips"
            :key="trip.id"
            :trip="trip"
            @select="selectTrip"
            @view-driver-profile="viewDriverProfile"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api, { participationService } from '@/services/api.js'
import IconCredit from '@/components/icons/IconCredit.vue'
import ClickableAvatar from '@/components/ClickableAvatar.vue'
import SecondaryButton from '@/components/ui/SecondaryButton.vue'
import PrimaryButton from '@/components/ui/PrimaryButton.vue'
import NavButton from '@/components/ui/NavButton.vue'
import TripCard from '@/components/TripCard.vue'
import LoadingState from '@/components/LoadingState.vue'
import ErrorState from '@/components/ErrorState.vue'
import BaseModal from '@/components/BaseModal.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const carpooling = ref(null)
const loading = ref(true)
const error = ref(null)
const showMoreDetails = ref(false)

// Variables pour la double confirmation
const showConfirmationModal = ref(false)
const participationCheck = ref(null)
const isParticipating = ref(false)
const isConfirming = ref(false)

// Variables pour afficher les voyages du chauffeur
const driverTrips = ref(null)
const driverIsActive = ref(false)

// Vérifie si l'utilisateur est le chauffeur du covoiturage
const isUserDriver = computed(() => {
  return carpooling.value && authStore.currentUser?.id === carpooling.value.driver_id
})

// Message de tooltip en fonction de la raison de désactivation
const buttonDisabledReason = computed(() => {
  if (isUserDriver.value) {
    return 'Vous ne pouvez pas rejoindre votre propre covoiturage'
  }
  return null
})

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

// Fonction pour charger les voyages du chauffeur
const loadDriverTrips = async (driverId) => {
  try {
    // Endpoint pour obtenir tous les covoiturages du chauffeur
    // Si l'endpoint n'existe pas encore, on peut l'implémenter dans le backend
    // Pour l'instant, on initialise les variables
    const response = await api.get(`/carpoolings/driver/${driverId}`)
    driverTrips.value = response.data.carpoolings || []
    driverIsActive.value = true
  } catch {
    // L'endpoint n'existe peut-être pas encore
    // On initialise simplement sans afficher d'erreur
    if (import.meta.env.DEV) {
      console.log('[CarpoolingDetailView] Endpoint carpoolings/driver/ non disponible')
    }
    driverTrips.value = []
    driverIsActive.value = true // Le chauffeur est actif si on peut voir ses détails
  }
}

// Fonction pour sélectionner un autre voyage du chauffeur
const selectTrip = (trip) => {
  router.push(`/carpooling/${trip.id}`)
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

    // Charger les autres voyages du chauffeur
    if (carpooling.value.driver_id) {
      await loadDriverTrips(carpooling.value.driver_id)
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
  max-width: 1400px;
  margin: 20px auto;
  padding: 20px;
  color: var(--color-light);
  min-height: 100vh;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  margin-bottom: 25px;
  gap: 20px;
  padding: 0 10px;
}

.header h1 {
  color: var(--color-light);
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

/* Top Section: Route + Chauffeur */
.top-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.vehicle-info h3,
.preferences-info h3,
.additional-details h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--eco-primary);
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Trip Info Compact */
.trip-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.route-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.route h2 {
  margin: 0;
  font-size: 18px;
  color: var(--color-light);
  font-weight: 600;
}

.eco-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(143, 218, 179, 0.15);
  color: var(--eco-primary);
}

/* Datetime Compact */
.datetime-compact {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.time-slot-compact {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.time-slot-compact .label {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.2px;
}

.time-compact {
  font-size: 14px;
  font-weight: 600;
  color: var(--eco-primary);
}

.date-compact {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
}

.arrow-separator {
  color: var(--eco-primary);
  font-size: 16px;
  font-weight: bold;
  opacity: 0.6;
}

.duration-compact {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: rgba(143, 218, 179, 0.1);
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--eco-primary);
}

/* Trip Highlights */
.trip-highlights {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.highlight-item {
  display: flex;
  flex-direction: column;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--color-dark);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.highlight-item.price {
  border-left: 3px solid #ffd700;
}

.highlight-item.price .value {
  color: #ffd700;
}

.highlight-item.seats {
  border-left: 3px solid #ff69b4;
}

.highlight-item.seats .value {
  color: #ff69b4;
}

.highlight-item .label {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.highlight-item .value {
  font-size: 16px;
  font-weight: 700;
}

/* Driver Info Compact */
.driver-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.driver-info h3 {
  display: none;
}

/* Driver Left Column */
.driver-left {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.driver-card-compact {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.driver-avatar-compact {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--eco-primary);
  cursor: pointer;
}

.driver-details-compact {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.driver-name {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--eco-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.driver-name:hover {
  color: var(--color-light);
}

.rating-compact {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 0.85rem;
}

.rating-compact .stars {
  color: var(--eco-primary);
  font-size: 0.8rem;
  letter-spacing: 1px;
}

.rating-compact .rating-value {
  font-weight: 600;
  color: var(--color-light);
}

.review-count {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

/* Driver Right Column - Reviews */
.driver-right {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.driver-right h4 {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--eco-primary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.reviews-scroll-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 280px;
  overflow-y: auto;
  padding-right: 4px;
  scroll-behavior: smooth;
}

/* Scrollbar styling - only visible when overflowing */
.reviews-scroll-container::-webkit-scrollbar {
  width: 6px;
}

.reviews-scroll-container::-webkit-scrollbar-track {
  background: transparent;
}

.reviews-scroll-container::-webkit-scrollbar-thumb {
  background: rgba(143, 218, 179, 0.4);
  border-radius: 3px;
}

.reviews-scroll-container::-webkit-scrollbar-thumb:hover {
  background: rgba(143, 218, 179, 0.6);
}

.review-item-compact {
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  border-left: 2px solid var(--eco-primary);
  font-size: 0.75rem;
  flex-shrink: 0;
}

.review-header-compact {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  gap: 6px;
}

.reviewer-name {
  font-weight: 600;
  color: var(--eco-primary);
  font-size: 0.8rem;
}

.review-rating {
  color: #ffd700;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
}

.review-comment-compact {
  margin: 4px 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
  line-height: 1.2;
}

.review-date {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.4);
}

.no-reviews-compact {
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
  font-style: italic;
  padding: 12px 0;
  font-size: 0.75rem;
}

/* Middle Section: Vehicle + Preferences */
.middle-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

/* Vehicle Compact */
.vehicle-compact {
  display: flex;
  gap: 12px;
}

.vehicle-compact h4 {
  margin: 0 0 6px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-light);
}

.vehicle-specs-compact {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.spec-compact {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

.spec-compact strong {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
}

.spec-compact code {
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  color: var(--eco-primary);
  font-weight: 600;
}

.eco-vehicle {
  color: var(--eco-primary);
  font-weight: 600;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Preferences Compact */
.preferences-compact {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.pref-item-compact {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: var(--color-dark);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
}

.pref-item-compact .pref-icon {
  font-size: 0.9rem;
  color: var(--eco-primary);
  flex-shrink: 0;
}

.pref-item-compact span {
  white-space: nowrap;
}

/* Actions */
.actions {
  display: flex;
  gap: 12px;
  margin: 16px 0;
  justify-content: center;
  flex-wrap: wrap;
}

/* Additional details */
.additional-details {
  animation: slideDown 0.3s ease-out;
  margin-top: 16px;
}

.extra-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.extra-info p {
  margin: 0;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  padding: 8px;
  background: var(--color-dark);
  border-left: 2px solid var(--eco-primary);
  border-radius: 4px;
}

.extra-info strong {
  color: var(--color-light);
}

.participate-btn,
.details-btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.participate-btn {
  background: linear-gradient(135deg, var(--eco-primary), #6bc26b);
  color: var(--color-dark);
}

.participate-btn:not(:disabled):hover {
  background: linear-gradient(135deg, #6bc26b, var(--eco-primary));
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
  border-color: var(--eco-primary);
}

.modal-header-content {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--eco-green);
  font-size: 18px;
  font-weight: 600;
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

.modal-actions {
  display: flex;
  gap: 12px;
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
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.no-carpooling {
  text-align: center;
  padding: 40px 20px;
  background: var(--color-dark-secondary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.no-trips-message,
.no-driver-message {
  margin: 0 0 20px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.no-trips-message svg,
.no-driver-message svg {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.5);
}

.driver-trips {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.driver-trips h2 {
  margin: 0;
  color: var(--color-light);
  font-size: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
}

.driver-trips h2 svg {
  color: var(--eco-primary);
  font-size: 22px;
}

.trips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
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
/* Responsive Design */
@media (max-width: 1200px) {
  .carpooling-detail {
    max-width: 100%;
  }

  .top-section {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .middle-section {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .driver-info {
    grid-template-columns: 1fr;
  }

  .driver-right {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 12px;
  }
}

@media (max-width: 768px) {
  .carpooling-detail {
    padding: 12px;
    margin: 8px;
  }

  .top-section {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .trip-highlights {
    grid-template-columns: 1fr;
  }

  .middle-section {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .preferences-compact {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .actions {
    flex-direction: column;
    gap: 8px;
  }

  .participate-btn,
  .details-btn {
    width: 100%;
  }

  .driver-card-compact {
    gap: 12px;
  }

  .extra-info {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .reviews-list {
    max-height: 200px;
  }

  .review-item {
    padding: 10px;
    margin-bottom: 6px;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .carpooling-detail {
    padding: 10px;
    margin: 5px;
  }

  h2 {
    font-size: 1.25rem;
    margin: 0 0 10px 0;
  }

  h3 {
    font-size: 1rem;
    margin: 0 0 10px 0;
  }

  .trip-highlights {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .preferences-compact {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .driver-avatar {
    width: 60px;
    height: 60px;
    font-size: 28px;
  }

  .reviews-list {
    max-height: 180px;
  }
}

/* Animations */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideDown {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
