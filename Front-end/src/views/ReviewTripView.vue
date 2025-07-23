<template>
  <div class="review-trip-page">
    <div class="container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="logo-section">
            <img src="@/assets/Logo ecoride transparent.PNG" alt="EcoRide" class="logo" />
          </div>
          <div class="title-section">
            <h1>🌟 Évaluer votre trajet</h1>
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
          <h3>❌ Erreur</h3>
          <p>{{ error }}</p>
          <router-link to="/" class="btn-primary">Retour à l'accueil</router-link>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else class="review-content">
        <!-- Trip Information -->
        <div class="trip-info-card" v-if="tripInfo">
          <h3>📍 Informations du trajet</h3>
          <div class="trip-details">
            <div class="detail-row">
              <span class="label">🚀 Départ :</span>
              <span class="value">{{ tripInfo.departure_address }}</span>
            </div>
            <div class="detail-row">
              <span class="label">🎯 Arrivée :</span>
              <span class="value">{{ tripInfo.arrival_address }}</span>
            </div>
            <div class="detail-row">
              <span class="label">📅 Date :</span>
              <span class="value">{{ formatTripDate(tripInfo.departure_datetime) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">👤 Chauffeur :</span>
              <span class="value">{{ tripInfo.driver_pseudo }}</span>
            </div>
          </div>
        </div>

        <!-- Review Form -->
        <div class="review-form-card">
          <div class="form-header">
            <h3>⭐ Votre évaluation</h3>
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
                  ⭐
                </button>
              </div>
              <span class="rating-text">{{ getRatingText(reviewForm.rating) }}</span>
            </div>

            <!-- Comment -->
            <div class="form-group">
              <label for="comment" class="form-label">Votre commentaire *</label>
              <textarea
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
                />
                <label for="hasIssue" class="checkbox-label">
                  ⚠️ J'ai rencontré un problème pendant ce trajet
                </label>
              </div>
            </div>

            <!-- Problème Details -->
            <div v-if="reviewForm.isReported" class="form-group problem-details">
              <label for="reportReason" class="form-label">Décrivez le problème *</label>
              <textarea
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
              <router-link to="/" class="btn-secondary"> Retour à l'accueil </router-link>
              <button type="submit" class="btn-primary" :disabled="!isFormValid || submitting">
                <span v-if="submitting">Envoi en cours...</span>
                <span v-else>📝 Publier mon avis</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Success Message -->
        <div v-if="submitted" class="success-container">
          <div class="success-content">
            <h3>✅ Merci pour votre avis !</h3>
            <p>Votre évaluation a été soumise avec succès.</p>
            <p><strong>Elle sera examinée par notre équipe avant publication.</strong></p>
            <div class="success-actions">
              <router-link to="/" class="btn-primary">Retour à l'accueil</router-link>
              <router-link to="/my-trips" class="btn-secondary">Mes trajets</router-link>
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
    console.log('✅ Avis soumis avec succès')
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

<style scoped>
.review-trip-page {
  min-height: 100vh;
  background-color: #1a1a1a;
  color: #e9ecef;
  padding: 20px 0;
  padding-top: 100px; /* Pour compenser la navbar fixe */
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  background: #2d3748;
  border: 1px solid #4a5568;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  margin-bottom: 30px;
  overflow: hidden;
}

.header-content {
  display: flex;
  align-items: center;
  padding: 30px;
  gap: 20px;
}

.logo {
  height: 60px;
  width: auto;
}

.title-section h1 {
  margin: 0 0 10px 0;
  color: #ffffff;
  font-size: 2rem;
}

.title-section p {
  margin: 0;
  color: #adb5bd;
  font-size: 1.1rem;
}

.loading-container,
.error-container {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 20px;
  border: 4px solid #374151;
  border-top: 4px solid #28a745;
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

.error-content {
  background: #2d3748;
  border: 1px solid #4a5568;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.trip-info-card,
.review-form-card {
  background: #2d3748;
  border: 1px solid #4a5568;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  margin-bottom: 30px;
  overflow: hidden;
}

.trip-info-card {
  padding: 25px;
}

.trip-info-card h3 {
  margin: 0 0 20px 0;
  color: #ffffff;
  font-size: 1.3rem;
}

.trip-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.detail-row .label {
  font-weight: bold;
  min-width: 100px;
  color: #adb5bd;
}

.detail-row .value {
  color: #e9ecef;
}

.review-form-card {
  padding: 30px;
}

.form-header {
  margin-bottom: 30px;
  text-align: center;
}

.form-header h3 {
  margin: 0 0 10px 0;
  color: #ffffff;
  font-size: 1.4rem;
}

.form-header p {
  margin: 0;
  color: #adb5bd;
  font-size: 1rem;
}

.form-group {
  margin-bottom: 25px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #e9ecef;
}

.star-rating {
  display: flex;
  gap: 5px;
  margin-bottom: 10px;
}

.star-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  transition: transform 0.2s;
  opacity: 0.3;
}

.star-btn.active,
.star-btn.hover {
  opacity: 1;
  transform: scale(1.1);
}

.rating-text {
  font-size: 0.9rem;
  color: #adb5bd;
  font-style: italic;
}

.form-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #4a5568;
  border-radius: 8px;
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.5;
  resize: vertical;
  transition: border-color 0.3s;
  background-color: #374151;
  color: #e9ecef;
}

.form-textarea:focus {
  outline: none;
  border-color: #28a745;
}

.char-count {
  text-align: right;
  font-size: 0.8rem;
  color: #adb5bd;
  margin-top: 5px;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.form-checkbox {
  width: 18px;
  height: 18px;
}

.checkbox-label {
  margin: 0;
  cursor: pointer;
  color: #f39c12;
  font-weight: normal;
}

.problem-details {
  background: #2d1b1b;
  border: 1px solid #e74c3c;
  border-radius: 8px;
  padding: 20px;
  margin-top: 15px;
}

.problem-textarea {
  border-color: #e74c3c;
}

.problem-note {
  margin-top: 10px;
  padding: 10px;
  background: #3d2525;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #f8d7da;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
}

.btn-primary,
.btn-secondary {
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: #28a745;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #218838;
  transform: translateY(-2px);
}

.btn-primary:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.btn-secondary {
  background: #374151;
  color: #e9ecef;
  border: 2px solid #4a5568;
}

.btn-secondary:hover {
  background: #4a5568;
  transform: translateY(-2px);
}

.success-container {
  text-align: center;
  padding: 40px;
}

.success-content {
  background: #2d3748;
  border: 1px solid #4a5568;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  border: 3px solid #28a745;
}

.success-content h3 {
  color: #28a745;
  margin-bottom: 15px;
}

.success-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 25px;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
    padding: 20px;
  }

  .container {
    padding: 0 15px;
  }

  .trip-info-card,
  .review-form-card {
    padding: 20px;
  }

  .form-actions,
  .success-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
