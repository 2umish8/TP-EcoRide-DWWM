<template>
  <div class="review-trip-page">
    <div class="container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="logo-section">
            <img src="@/assets/Logo ecoride transparent.PNG" alt="EcoRide" />
          </div>
          <div class="title-section">
            <h1><font-awesome-icon :icon="['fas', 'star']" /> Évaluer votre trajet</h1>
            <p>Votre avis compte pour améliorer l'expérience EcoRide</p>
          </div>
        </div>
      </div>
      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Chargement des informations du trajet...</p>
      </div>
      <!-- Error State -->
      <div v-else-if="error" class="error-container">
        <div class="error-content">
          <h3><font-awesome-icon :icon="['fas', 'xmark']" /> Erreur</h3>
          <p>{{ error }}</p>
          <router-link to="/" class="btn-primary">Retour à l'accueil</router-link>
        </div>
      </div>
      <!-- Main Content -->
      <div v-else class="review-content">
        <!-- Trip Information -->
        <div v-if="tripInfo">
          <h3><font-awesome-icon :icon="['fas', 'location-dot']" /> Informations du trajet</h3>
          <div class="trip-details">
            <div class="detail-row">
              <span class="label"
                ><font-awesome-icon :icon="['fas', 'location-dot']" /> Départ :</span
              ><span class="value">{{ tripInfo.departure_address }}</span>
            </div>
            <div class="detail-row">
              <span class="label"><font-awesome-icon :icon="['fas', 'bullseye']" /> Arrivée :</span
              ><span class="value">{{ tripInfo.arrival_address }}</span>
            </div>
            <div class="detail-row">
              <span class="label"><font-awesome-icon :icon="['fas', 'calendar']" /> Date :</span
              ><span class="value">{{ formatTripDate(tripInfo.departure_datetime) }}</span>
            </div>
            <div class="detail-row">
              <span class="label"><font-awesome-icon :icon="['fas', 'user']" /> Chauffeur :</span
              ><span class="value">{{ tripInfo.driver_pseudo }}</span>
            </div>
          </div>
        </div>
        <!-- Review Form -->
        <div class="card">
          <div class="form-header">
            <h3><font-awesome-icon :icon="['fas', 'star']" /> Votre évaluation</h3>
            <p>Comment s'est passé votre trajet avec {{ tripInfo?.driver_pseudo }} ?</p>
          </div>
          <form @submit.prevent="submitReview" class="review-form">
            <!-- Rating -->
            <div class="form-group">
              <label for="rating" class="form-label">Note globale *</label>
              <div class="star-rating">
                <button
                  v-for="star in 5"
                  :key="star"
                  type="button"
                  class="star-btn"
                  :class="{ active: star <= reviewForm.rating, hover: star <= hoverRating }"
                  @click="setRating(star)"
                  @mouseenter="hoverRating = star"
                  @mouseleave="hoverRating = 0"
                >
                  <font-awesome-icon :icon="['fas', 'star']" />
                </button>
              </div>
              <span class="rating-text">{{ getRatingText(reviewForm.rating) }}</span>
            </div>
            <!-- Comment -->
            <div class="form-group">
              <label for="comment" class="form-label">Votre commentaire *</label
              ><textarea
                id="comment"
                v-model="reviewForm.comment"
                placeholder="Décrivez votre expérience : ponctualité, conduite, véhicule, ambiance..."
                rows="5"
                required
                maxlength="500"
                class="form-textarea"
              ></textarea>
              <div class="char-count">{{ reviewForm.comment.length }}/500 caractères</div>
            </div>
            <!-- Problème -->
            <div class="form-group">
              <div class="checkbox-container">
                <input
                  type="checkbox"
                  id="hasIssue"
                  v-model="reviewForm.isReported"
                  class="form-checkbox"
                /><label for="hasIssue" class="checkbox-label"
                  ><font-awesome-icon :icon="['fas', 'triangle-exclamation']" /> J'ai rencontré un
                  problème pendant ce trajet
                </label>
              </div>
            </div>
            <!-- Problème Details -->
            <div v-if="reviewForm.isReported" class="form-group problem-details">
              <label for="reportReason" class="form-label">Décrivez le problème *</label
              ><textarea
                id="reportReason"
                v-model="reviewForm.reportReason"
                placeholder="Décrivez précisément le problème rencontré (retard important, conduite dangereuse, véhicule non conforme, etc.)"
                rows="4"
                :required="reviewForm.isReported"
                maxlength="500"
                class="form-textarea problem-textarea"
              ></textarea>
              <div class="char-count">{{ reviewForm.reportReason.length }}/500 caractères</div>
              <div class="problem-note">
                <p>
                  <strong>Note :</strong> Les signalements sont examinés par notre équipe avant
                  validation. Les crédits du chauffeur seront ajustés si le problème est avéré.
                </p>
              </div>
            </div>
            <!-- Form Actions -->
            <div class="form-actions">
              <router-link to="/" class="btn-secondary"> Retour à l'accueil </router-link
              ><button type="submit" class="btn-primary" :disabled="!isFormValid || submitting">
                <span v-if="submitting"
                  ><font-awesome-icon :icon="['fas', 'spinner']" spin /> Envoi en cours...</span
                ><span v-else><font-awesome-icon :icon="['fas', 'pen']" /> Publier mon avis</span>
              </button>
            </div>
          </form>
        </div>
        <!-- Success Message -->
        <div v-if="submitted" class="success-container">
          <div class="success-content">
            <h3><font-awesome-icon :icon="['fas', 'circle-check']" /> Merci pour votre avis !</h3>
            <p>Votre évaluation a été soumise avec succès.</p>
            <p><strong>Elle sera examinée par notre équipe avant publication.</strong></p>
            <div class="success-actions">
              <router-link to="/" class="btn-primary">Retour à l'accueil</router-link
              ><router-link to="/my-trips" class="btn-secondary">Mes trajets</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { reviewService } from '@/services/mongoServices'
import { carpoolingService } from '@/services/api'

const route = useRoute()

// Props from router
const carpoolingId = ref(route.params.carpoolingId)
const driverId = ref(route.query.driverId)

// State
const loading = ref(true)
const submitting = ref(false)
const submitted = ref(false)
const error = ref('')
const tripInfo = ref(null)
const hoverRating = ref(0)

// Form data
const reviewForm = ref({
  rating: 0,
  comment: '',
  isReported: false,
  reportReason: '',
})

// Computed
const isFormValid = computed(() => {
  return (
    reviewForm.value.rating > 0 &&
    reviewForm.value.comment.trim().length > 0 &&
    (!reviewForm.value.isReported || reviewForm.value.reportReason.trim().length > 0)
  )
})

// Methods
const setRating = (rating) => {
  reviewForm.value.rating = rating
}

const getRatingText = (rating) => {
  const texts = {
    0: 'Sélectionnez une note',
    1: 'Très décevant',
    2: 'Décevant',
    3: 'Correct',
    4: 'Bien',
    5: 'Excellent',
  }
  return texts[rating] || ''
}

const formatTripDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const loadTripInfo = async () => {
  try {
    loading.value = true

    // Get trip information
    const response = await carpoolingService.getCarpoolingById(carpoolingId.value)
    tripInfo.value = response.data.carpooling

    // Validate that the trip is completed
    if (tripInfo.value.status !== 'terminé') {
      throw new Error("Ce trajet n'est pas encore terminé ou n'existe pas.")
    }
  } catch (err) {
    console.error('Erreur lors du chargement du trajet:', err)
    error.value =
      err.response?.data?.message || err.message || 'Erreur lors du chargement du trajet'
  } finally {
    loading.value = false
  }
}

const submitReview = async () => {
  if (!isFormValid.value) return

  try {
    submitting.value = true

    const reviewData = {
      reviewedUserId: parseInt(driverId.value),
      carpoolingId: parseInt(carpoolingId.value),
      rating: reviewForm.value.rating,
      comment: reviewForm.value.comment.trim(),
      isReported: reviewForm.value.isReported,
      reportReason: reviewForm.value.isReported ? reviewForm.value.reportReason.trim() : '',
    }

    await reviewService.createReview(reviewData)

    submitted.value = true
  } catch (err) {
    console.error("Erreur lors de la soumission de l'avis:", err)
    error.value = err.response?.data?.message || "Erreur lors de la soumission de l'avis"
  } finally {
    submitting.value = false
  }
}

// Lifecycle
onMounted(() => {
  if (!carpoolingId.value || !driverId.value) {
    error.value = 'Paramètres manquants pour évaluer ce trajet'
    loading.value = false
    return
  }

  loadTripInfo()
})
</script>
