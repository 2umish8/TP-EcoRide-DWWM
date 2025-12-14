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

