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
            <font-awesome-icon :icon="['fas', 'star']" />
          </button>
        </div>
        <span class="rating-text">{{ getRatingText(form.rating) }}</span>
      </div>
      <!-- Commentaire -->
      <div class="form-group">
        <label for="comment">Commentaire *</label
        ><textarea
          id="comment"
          v-model="form.comment"
          placeholder="Décrivez votre expérience avec ce chauffeur..."
          rows="4"
          required
          maxlength="500"
        ></textarea
        ><span class="char-count">{{ form.comment.length }}/500</span>
      </div>
      <!-- Boutons -->
      <div class="form-actions">
        <button type="button" @click="$emit('cancel')" class="btn-cancel" :disabled="loading">
          Annuler</button
        ><button type="submit" class="btn-submit" :disabled="!isFormValid || loading">
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
