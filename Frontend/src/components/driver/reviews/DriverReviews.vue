<template>
  <div class="reviews-section">
    <div class="reviews-header">
      <h3>Avis des passagers</h3>
      <div class="rating-summary" v-if="averageRating > 0">
        <span class="average-rating"
          ><font-awesome-icon :icon="['fas', 'star']" /> {{ averageRating }}</span
        >
        <span class="total-reviews">({{ totalReviews }} avis)</span>
      </div>
      <div v-else class="no-rating">
        <span>Aucun avis pour le moment</span>
      </div>
    </div>

    <!-- Liste des avis -->
    <div class="reviews-list" v-if="reviews.length > 0">
      <div v-for="review in reviews" :key="review.id" class="review-item">
        <div class="review-header">
          <div class="reviewer-info">
            <img
              :src="review.reviewer.profilePicture || '/default-avatar.png'"
              :alt="review.reviewer.pseudo"
              class="reviewer-avatar"
            />
            <span class="reviewer-name">{{ review.reviewer.pseudo }}</span>
          </div>
          <div class="review-rating">
            <span class="stars">
              <font-awesome-icon
                v-for="n in Math.floor(review.rating)"
                :key="n"
                :icon="['fas', 'star']"
              />
            </span>
            <span class="rating-value">{{ review.rating }}/5</span>
          </div>
        </div>

        <div class="review-content">
          <p class="review-comment">{{ review.comment }}</p>
          <span class="review-date">{{ formatDate(review.createdAt) }}</span>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="pagination.totalPages > 1">
      <button
        @click="loadPage(pagination.currentPage - 1)"
        :disabled="pagination.currentPage <= 1"
        class="pagination-btn"
      >
        Précédent
      </button>

      <span class="page-info">
        Page {{ pagination.currentPage }} sur {{ pagination.totalPages }}
      </span>

      <button
        @click="loadPage(pagination.currentPage + 1)"
        :disabled="pagination.currentPage >= pagination.totalPages"
        class="pagination-btn"
      >
        Suivant
      </button>
    </div>

    <!-- Message si aucun avis -->
    <div v-if="reviews.length === 0 && !loading" class="no-reviews">
      <p>Ce chauffeur n'a pas encore reçu d'avis.</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <p>Chargement des avis...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { reviewService } from '@/services/mongoServices.js'

const props = defineProps({
  driverId: {
    type: Number,
    required: true,
  },
})

// État réactif
const reviews = ref([])
const averageRating = ref(0)
const totalReviews = ref(0)
const pagination = ref({
  currentPage: 1,
  totalPages: 0,
  totalReviews: 0,
})
const loading = ref(false)
const error = ref(null)

// Méthodes
const loadReviews = async (page = 1) => {
  try {
    loading.value = true
    error.value = null

    const response = await reviewService.getDriverReviews(props.driverId, page, 5)

    reviews.value = response.reviews
    averageRating.value = response.averageRating
    pagination.value = response.pagination
    totalReviews.value = response.pagination.totalReviews
  } catch (err) {
    console.error('Erreur lors du chargement des avis:', err)
    error.value = 'Erreur lors du chargement des avis'
  } finally {
    loading.value = false
  }
}

const loadPage = (page) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    loadReviews(page)
  }
}

// Stars are rendered via FontAwesome icons in the template

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Charger les avis au montage
onMounted(() => {
  loadReviews()
})
</script>

<style scoped>
.reviews-section {
  background: var(--color-dark);
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
}

.reviews-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  padding-bottom: 15px;
}

.reviews-header h3 {
  color: var(--color-primary);
  margin: 0;
}

.rating-summary {
  display: flex;
  align-items: center;
  gap: 10px;
}

.average-rating {
  font-size: 1.2em;
  font-weight: bold;
  color: var(--color-primary);
}

.total-reviews {
  color: var(--color-gray);
}

.no-rating {
  color: var(--color-light-secondary);
  font-style: italic;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.review-item {
  background: var(--color-dark-secondary);
  border-radius: 8px;
  padding: 15px;
  border-left: 3px solid var(--color-primary);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.reviewer-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.reviewer-name {
  font-weight: bold;
  color: var(--color-light);
}

.review-rating {
  display: flex;
  align-items: center;
  gap: 5px;
}

.stars {
  font-size: 0.9em;
  color: var(--color-warning);
}

.rating-value {
  /* use global rating-value style from _cards.css */
}

.review-content {
  color: var(--color-light-secondary);
}

.review-comment {
  margin: 0 0 10px 0;
  line-height: 1.5;
}

.review-date {
  font-size: 0.85em;
  color: var(--color-gray);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;

  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.pagination-btn {
  background: var(--color-primary);
  color: var(--color-dark);
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--color-success);
}

.pagination-btn:disabled {
  background: var(--color-gray);
  color: var(--color-gray);
  cursor: not-allowed;
}

.page-info {
  color: var(--color-light-secondary);
  min-width: 120px;
  text-align: center;
}

.no-reviews {
  text-align: center;
  color: var(--color-light-secondary);
  font-style: italic;
  padding: 40px 20px;
}

.loading {
  text-align: center;
  color: var(--color-primary);
  padding: 40px 20px;
}
</style>





