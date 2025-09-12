<template>
  <div class="review-form">
    <div class="form-header">
      <h3>Laisser un avis</h3>
      <p>Évaluez votre expérience avec ce chauffeur</p>
    </div>

    <form @submit.prevent="submitReview" class="review-form-content">
      <!-- Note -->
      <div class="rating-input">
        <label for="rating">Note *</label>
        <div class="star-rating">
          <button
            v-for="star in 5"
            :key="star"
            type="button"
            class="star-btn"
            :class="{ active: star <= form.rating, hover: star <= hoverRating }"
            @click="setRating(star)"
            @mouseenter="hoverRating = star"
            @mouseleave="hoverRating = 0"
          >
            ⭐
          </button>
        </div>
        <span class="rating-text">{{ getRatingText(form.rating) }}</span>
      </div>

      <!-- Commentaire -->
      <div class="form-group">
        <label for="comment">Commentaire *</label>
        <textarea
          id="comment"
          v-model="form.comment"
          placeholder="Décrivez votre expérience avec ce chauffeur..."
          rows="4"
          required
          maxlength="500"
        ></textarea>
        <span class="char-count">{{ form.comment.length }}/500</span>
      </div>

      <!-- Boutons -->
      <div class="form-actions">
        <button type="button" @click="$emit('cancel')" class="btn-cancel" :disabled="loading">
          Annuler
        </button>
        <button type="submit" class="btn-submit" :disabled="!isFormValid || loading">
          {{ loading ? 'Envoi...' : "Publier l'avis" }}
        </button>
      </div>
    </form>

    <!-- Message d'erreur -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- Message de succès -->
    <div v-if="success" class="success-message">Votre avis a été publié avec succès !</div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { reviewService } from '@/services/mongoServices.js'

const props = defineProps({
  driverId: {
    type: Number,
    required: true,
  },
  carpoolingId: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['review-submitted', 'cancel'])

// État réactif
const form = ref({
  rating: 0,
  comment: '',
})

const hoverRating = ref(0)
const loading = ref(false)
const error = ref(null)
const success = ref(false)

// Computed
const isFormValid = computed(() => {
  return (
    form.value.rating > 0 &&
    form.value.comment.trim().length >= 10 &&
    form.value.comment.length <= 500
  )
})

// Méthodes
const setRating = (rating) => {
  form.value.rating = rating
  error.value = null
}

const getRatingText = (rating) => {
  const texts = {
    0: 'Sélectionnez une note',
    1: 'Très mauvais',
    2: 'Mauvais',
    3: 'Moyen',
    4: 'Bon',
    5: 'Excellent',
  }
  return texts[rating] || ''
}

const submitReview = async () => {
  if (!isFormValid.value) {
    error.value = 'Veuillez remplir tous les champs correctement'
    return
  }

  try {
    loading.value = true
    error.value = null
    success.value = false

    const reviewData = {
      driverId: props.driverId,
      carpoolingId: props.carpoolingId,
      rating: form.value.rating,
      comment: form.value.comment.trim(),
    }

    await reviewService.createReview(reviewData)

    success.value = true

    // Réinitialiser le formulaire
    form.value = {
      rating: 0,
      comment: '',
    }

    // Émettre l'événement de succès
    emit('review-submitted')

    // Masquer le message de succès après 3 secondes
    setTimeout(() => {
      success.value = false
    }, 3000)
  } catch (err) {
    console.error("Erreur lors de la création de l'avis:", err)

    if (err.response?.status === 400) {
      error.value = err.response.data.message || 'Données invalides'
    } else if (err.response?.status === 409) {
      error.value = 'Vous avez déjà laissé un avis pour ce trajet'
    } else if (err.response?.status === 403) {
      error.value = 'Vous ne pouvez pas évaluer ce chauffeur'
    } else {
      error.value = "Erreur lors de la publication de l'avis"
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.review-form {
  background: #1a1a1a;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
}

.form-header {
  margin-bottom: 25px;
  text-align: center;
}

.form-header h3 {
  color: #34d399;
  margin: 0 0 10px 0;
}

.form-header p {
  color: #888;
  margin: 0;
}

.review-form-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Rating Input */
.rating-input {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rating-input label {
  color: #fff;
  font-weight: bold;
}

.star-rating {
  display: flex;
  gap: 5px;
}

.star-btn {
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
  transition: all 0.3s;
  filter: grayscale(100%);
  opacity: 0.3;
}

.star-btn.active,
.star-btn.hover {
  filter: grayscale(0%);
  opacity: 1;
  transform: scale(1.1);
}

.rating-text {
  color: #34d399;
  font-weight: bold;
  margin-top: 5px;
}

/* Form Group */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: #fff;
  font-weight: bold;
}

.form-group textarea {
  background: #2a2a2a;
  border: 2px solid #333;
  border-radius: 8px;
  padding: 12px;
  color: #fff;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.3s;
}

.form-group textarea:focus {
  outline: none;
  border-color: #34d399;
}

.form-group textarea::placeholder {
  color: #666;
}

.char-count {
  color: #888;
  font-size: 0.85em;
  text-align: right;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 10px;
}

.btn-cancel,
.btn-submit {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cancel {
  background: #333;
  color: #fff;
}

.btn-cancel:hover:not(:disabled) {
  background: #444;
}

.btn-submit {
  background: #34d399;
  color: #000;
}

.btn-submit:hover:not(:disabled) {
  background: #10b981;
}

.btn-cancel:disabled,
.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Messages */
.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid #ef4444;
  color: #ef4444;
  padding: 12px;
  border-radius: 8px;
  margin-top: 15px;
}

.success-message {
  background: rgba(52, 211, 153, 0.1);
  border: 1px solid #34d399;
  color: #34d399;
  padding: 12px;
  border-radius: 8px;
  margin-top: 15px;
  text-align: center;
}

/* Responsive */
@media (max-width: 768px) {
  .form-actions {
    flex-direction: column;
  }

  .btn-cancel,
  .btn-submit {
    width: 100%;
  }
}
</style>
