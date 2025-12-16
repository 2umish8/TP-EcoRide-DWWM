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
      <!-- Trip & Driver Row -->
      <div class="top-row">
        <!-- Trip Information -->
        <div class="trip-card">
          <div class="route-header">
            <h2>{{ carpooling.departure_address }} → {{ carpooling.arrival_address }}</h2>
          </div>

          <div class="trip-times">
            <div class="time-slot">
              <span class="time">{{ formatTime(carpooling.departure_datetime) }}</span>
              <span class="date">{{ formatDate(carpooling.departure_datetime) }}</span>
            </div>
            <span class="arrow">→</span>
            <div class="time-slot">
              <span class="time">{{ formatTime(carpooling.arrival_datetime) }}</span>
              <span class="date">{{ formatDate(carpooling.arrival_datetime) }}</span>
            </div>
          </div>

          <div class="trip-stats">
            <div class="stat">
              <span class="label">Durée</span>
              <span class="value">{{ formatDuration(carpooling.duration_minutes) }}</span>
            </div>
            <div class="stat">
              <span class="label">Prix</span>
              <span class="value">{{ carpooling.price_per_passenger }} €</span>
            </div>
            <div class="stat">
              <span class="label">Places</span>
              <span class="value">{{ carpooling.seats_remaining }}</span>
            </div>
            <div v-if="carpooling.is_electric" class="stat eco">
              <font-awesome-icon :icon="['fas', 'leaf']" /> Électrique
            </div>
          </div>
        </div>

        <!-- Driver Card -->
        <div class="driver-card">
          <div class="driver-info-simple">
            <ClickableAvatar
              :userId="carpooling.driver_id"
              :profilePictureUrl="
                carpooling.driver_photo ||
                `https://i.pravatar.cc/150?img=${carpooling.driver_id % 70}`
              "
              :alt="carpooling.driver_pseudo"
              class="driver-avatar"
              @click="viewDriverProfile"
            />
            <div class="driver-details">
              <h4 class="driver-name" @click="viewDriverProfile(carpooling.driver_id)">
                {{ carpooling.driver_pseudo }}
              </h4>
              <div class="rating">
                <span class="stars">{{ getStars(carpooling.driver_rating) }}</span>
                <span>{{ carpooling.driver_rating }}/5</span>
              </div>
              <span class="review-count">({{ carpooling.total_reviews }} avis)</span>
            </div>
          </div>

          <div class="reviews-list">
            <h5>Avis récents</h5>
            <div class="reviews-scroll">
              <div v-if="carpooling.recent_reviews && carpooling.recent_reviews.length > 0">
                <div
                  class="review-item"
                  v-for="review in carpooling.recent_reviews"
                  :key="review.reviewer_pseudo"
                >
                  <div class="review-header">
                    <span class="reviewer-name">{{ review.reviewer_pseudo }}</span>
                    <span class="rating-stars">{{ getStars(review.rating) }}</span>
                  </div>
                  <p class="review-text">{{ review.comment }}</p>
                </div>
              </div>
              <div v-else class="no-reviews">
                <p>Aucun avis.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vehicle & Preferences -->
      <div class="info-row">
        <div class="vehicle-info">
          <h3><font-awesome-icon :icon="['fas', 'car']" /> Véhicule</h3>
          <p>{{ carpooling.brand_name }} {{ carpooling.model }}</p>
          <p class="small">
            {{ carpooling.color_name }} - <code>{{ carpooling.plate_number }}</code>
          </p>
          <p v-if="carpooling.is_electric" class="small eco-tag">
            <font-awesome-icon :icon="['fas', 'bolt']" /> Électrique
          </p>
        </div>

        <div class="preferences-info">
          <h3><font-awesome-icon :icon="['fas', 'gear']" /> Préférences</h3>
          <div class="prefs">
            <span>{{
              carpooling.driver_preferences?.allowsSmoking ? '✓ Fumeur' : '✗ Non-fumeur'
            }}</span>
            <span>{{
              carpooling.driver_preferences?.allowsPets ? '✓ Animaux' : "✗ Pas d'animaux"
            }}</span>
            <span>{{ carpooling.driver_preferences?.conversationLevel || 'Modérée' }}</span>
            <span v-if="carpooling.driver_preferences?.specialRules">
              {{ carpooling.driver_preferences.specialRules }}
            </span>
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
      <BaseCard v-if="showMoreDetails" class="additional-details-card">
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
      </BaseCard>

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
      <div class="no-carpooling">
        <p class="no-driver-message">
          <font-awesome-icon :icon="['fas', 'magnifying-glass']" /> Aucun covoiturage trouvé
        </p>
        <PrimaryButton @click="$router.push('/search')">Retourner à la recherche</PrimaryButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api, { participationService } from '@/services/api.js'
import IconCredit from '@/components/shared/icons/IconCredit.vue'
import ClickableAvatar from '@/components/user/profile/ClickableAvatar.vue'
import SecondaryButton from '@/components/ui/buttons/SecondaryButton.vue'
import PrimaryButton from '@/components/ui/buttons/PrimaryButton.vue'
import NavButton from '@/components/ui/buttons/NavButton.vue'
import LoadingState from '@/components/shared/states/LoadingState.vue'
import ErrorState from '@/components/shared/states/ErrorState.vue'
import BaseModal from '@/components/shared/modals/BaseModal.vue'
import BaseCard from '@/components/ui/cards/BaseCard.vue'

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
  max-width: 100%;
  padding: 16px;
  color: var(--color-light);
}

/* Header */
.header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.header h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}

/* Top Row: Trip + Driver */
.top-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 8px;
}

/* Trip Card */
.trip-card {
  padding: 16px;
  background: var(--color-dark-secondary);
  border-radius: 4px;
}

.route-header h2 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.3;
}

.trip-times {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 0.9rem;
}

.time-slot {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.time-slot .time {
  font-weight: 700;
  font-size: 0.95rem;
}

.time-slot .date {
  font-size: 0.75rem;
  color: var(--color-gray);
}

.arrow {
  opacity: 0.5;
  font-weight: 600;
}

.trip-stats {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 0.9rem;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat .label {
  font-size: 0.75rem;
  color: var(--color-gray);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat .value {
  font-weight: 700;
}

.stat.eco {
  color: var(--color-primary);
  font-weight: 600;
  align-items: flex-start;
}

/* Driver Card */
.driver-card {
  padding: 16px;
  background: var(--color-dark-secondary);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.driver-info-simple {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.driver-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  cursor: pointer;
}

.driver-details {
  flex: 1;
  font-size: 0.9rem;
}

.driver-name {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  color: var(--color-primary);
}

.rating {
  display: flex;
  gap: 4px;
  font-size: 0.85rem;
  font-weight: 600;
}

.rating .stars {
  letter-spacing: 1px;
}

.review-count {
  display: block;
  font-size: 0.75rem;
  color: var(--color-gray);
  margin-top: 2px;
}

.reviews-list {
  flex: 1;
}

.reviews-list h5 {
  margin: 0 0 8px 0;
  font-size: 0.9rem;
  font-weight: 700;
}

.reviews-scroll {
  max-height: 150px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.reviews-scroll::-webkit-scrollbar {
  width: 3px;
}

.reviews-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.review-item {
  font-size: 0.8rem;
  padding: 6px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3px;
  gap: 4px;
}

.reviewer-name {
  font-weight: 600;
  font-size: 0.8rem;
}

.rating-stars {
  font-size: 0.75rem;
}

.review-text {
  margin: 0;
  line-height: 1.3;
  color: rgba(255, 255, 255, 0.8);
}

.no-reviews {
  font-size: 0.8rem;
  color: var(--color-gray);
  text-align: center;
  padding: 8px;
}

/* Info Row: Vehicle + Preferences */
.info-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 20px;
}

.vehicle-info,
.preferences-info {
  padding: 12px;
  background: var(--color-dark-secondary);
  border-radius: 4px;
  font-size: 0.9rem;
}

.vehicle-info h3,
.preferences-info h3 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 700;
}

.vehicle-info p,
.preferences-info p {
  margin: 4px 0;
  line-height: 1.4;
}

.vehicle-info code {
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 4px;
  border-radius: 2px;
  font-family: monospace;
  font-size: 0.85rem;
}

.small {
  font-size: 0.85rem;
  color: var(--color-gray);
}

.eco-tag {
  color: var(--color-primary);
  font-weight: 600;
  margin-top: 4px;
}

.prefs {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.9rem;
}

.prefs span {
  line-height: 1.3;
}

/* Actions */
.actions {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

/* Additional details */
.additional-details-card {
  padding: 12px;
  background: var(--color-dark-secondary);
  border-radius: 4px;
  margin-bottom: 20px;
}

.additional-details-card h3 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 700;
}

.extra-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  font-size: 0.85rem;
}

.extra-info p {
  margin: 0;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.9);
}

.extra-info strong {
  display: block;
  font-weight: 700;
  margin-bottom: 2px;
}

/* Modal */
.modal-header-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
}

.participation-summary {
  margin-bottom: 16px;
  padding: 12px;
  background: var(--color-dark-secondary);
  border-radius: 4px;
}

.participation-summary h4 {
  margin: 0 0 8px 0;
  font-size: 13px;
  font-weight: 700;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 0.9rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item .label {
  color: var(--color-gray);
}

.summary-item .value {
  font-weight: 600;
}

.cost-highlight {
  color: var(--color-primary) !important;
  font-weight: 700;
}

.credits-info {
  margin-bottom: 16px;
  padding: 12px;
  background: var(--color-dark-secondary);
  border-radius: 4px;
  font-size: 0.9rem;
}

.credits-current,
.credits-after {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
}

.credits-after .value {
  color: var(--color-primary);
  font-weight: 700;
}

.confirmation-warning {
  padding: 12px;
  background: rgba(255, 193, 7, 0.1);
  border-left: 3px solid var(--color-warning);
  border-radius: 3px;
  margin-bottom: 16px;
  font-size: 0.9rem;
}

.confirmation-warning p {
  margin: 4px 0;
  line-height: 1.4;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

/* Not found */
.not-found {
  margin-top: 20px;
}

.no-carpooling {
  text-align: center;
  padding: 40px 20px;
  background: var(--color-dark-secondary);
  border-radius: 4px;
}

.no-driver-message {
  margin: 0 0 16px 0;
  font-size: 15px;
  color: var(--color-gray);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* Responsive */
@media (max-width: 1024px) {
  .top-row,
  .info-row {
    grid-template-columns: 1fr;
  }

  .driver-info-simple {
    flex-direction: column;
  }

  .driver-avatar {
    width: 50px;
    height: 50px;
  }
}

@media (max-width: 640px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 16px;
  }

  .header h1 {
    font-size: 18px;
  }

  .route-header h2 {
    font-size: 15px;
  }

  .trip-times {
    font-size: 0.85rem;
  }

  .top-row,
  .info-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .extra-info {
    grid-template-columns: 1fr;
  }
}
</style>
