<template>
  <div class="user-profile-container">
    <!-- Header avec navigation -->
    <div class="profile-header">
      <button @click="goBack" class="back-button"><span>←</span> Retour</button>
      <h1>Profil de {{ user?.pseudo || 'Utilisateur' }}</h1>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Chargement du profil...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="loadUserProfile" class="retry-button">Réessayer</button>
    </div>

    <!-- Profile content -->
    <div v-else-if="user" class="profile-content">
      <!-- User info section -->
      <div class="user-info-section">
        <div class="user-avatar-container">
          <img :src="getUserAvatar()" :alt="user.pseudo" class="user-avatar" />
        </div>
        <div class="user-details">
          <h2>{{ user.pseudo }}</h2>
          <p class="member-since">Membre depuis {{ formatDate(user.created_at) }}</p>
          <div class="user-stats">
            <div class="stat-item">
              <span class="stat-number">{{ userStats.totalTrips }}</span>
              <span class="stat-label">Trajets</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ userStats.rating || 'N/A' }}</span>
              <span class="stat-label">Note moyenne</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ userStats.reviewsCount }}</span>
              <span class="stat-label">Avis reçus</span>
            </div>
          </div>
        </div>
      </div>

      <!-- User roles -->
      <div class="user-roles">
        <div v-for="role in user.roles" :key="role.id" class="role-badge">
          {{ getRoleLabel(role.name) }}
        </div>
      </div>

      <!-- Reviews section -->
      <div class="reviews-section">
        <h3>Avis reçus ({{ reviews.length }})</h3>
        <div v-if="reviews.length === 0" class="no-reviews">
          <p>Aucun avis reçu pour le moment.</p>
        </div>
        <div v-else class="reviews-list">
          <div v-for="review in reviews" :key="review.id" class="review-item">
            <div class="review-header">
              <div class="reviewer-info">
                <img
                  :src="getReviewerAvatar(review.reviewer)"
                  :alt="review.reviewer.pseudo"
                  class="reviewer-avatar"
                />
                <span class="reviewer-name">{{ review.reviewer.pseudo }}</span>
              </div>
              <div class="review-rating">
                <span v-for="i in 5" :key="i" class="star">
                  {{ i <= review.rating ? '⭐' : '☆' }}
                </span>
              </div>
            </div>
            <p class="review-comment">{{ review.comment }}</p>
            <p class="review-date">{{ formatDate(review.created_at) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api'

const route = useRoute()
const router = useRouter()

// Reactive data
const user = ref(null)
const reviews = ref([])
const userStats = ref({
  totalTrips: 0,
  rating: null,
  reviewsCount: 0,
})
const loading = ref(true)
const error = ref(null)

// Get user avatar
const getUserAvatar = () => {
  if (user.value?.profile_picture_url) {
    return user.value.profile_picture_url
  }
  // Avatar basé sur l'ID de l'utilisateur
  return `https://i.pravatar.cc/150?img=${(user.value?.id % 70) + 1}`
}

// Get reviewer avatar
const getReviewerAvatar = (reviewer) => {
  if (reviewer.profile_picture_url) {
    return reviewer.profile_picture_url
  }
  return `https://i.pravatar.cc/150?img=${(reviewer.id % 70) + 1}`
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Get role label
const getRoleLabel = (roleName) => {
  const roleLabels = {
    passager: 'Passager',
    chauffeur: 'Chauffeur',
    admin: 'Administrateur',
  }
  return roleLabels[roleName] || roleName
}

// Load user profile
const loadUserProfile = async () => {
  try {
    loading.value = true
    error.value = null

    const userId = route.params.userId

    // Vérifier si l'userId est valide
    if (!userId || isNaN(userId)) {
      error.value = 'ID utilisateur invalide'
      return
    }

    const response = await api.get(`/users/${userId}`)

    user.value = response.data.user
    reviews.value = response.data.reviews || []

    // Calculate stats
    userStats.value = {
      totalTrips: response.data.stats?.totalTrips || 0,
      rating: response.data.stats?.averageRating || null,
      reviewsCount: reviews.value.length,
    }
  } catch (err) {
    console.error('Erreur lors du chargement du profil:', err)
    if (err.response?.status === 404) {
      error.value =
        "Utilisateur non trouvé. Cet utilisateur n'existe pas dans notre base de données."
    } else {
      error.value = err.response?.data?.message || 'Erreur lors du chargement du profil'
    }
  } finally {
    loading.value = false
  }
}

// Navigation
const goBack = () => {
  router.go(-1)
}

onMounted(() => {
  loadUserProfile()
})
</script>

<style scoped>
.user-profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  color: white;
}

.back-button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
  margin-right: 20px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateX(-2px);
}

.profile-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: white;
  text-align: center;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.retry-button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 15px;
  backdrop-filter: blur(10px);
}

.profile-content {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.user-info-section {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  gap: 25px;
}

.user-avatar-container {
  flex-shrink: 0;
}

.user-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #667eea;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.user-details {
  flex: 1;
}

.user-details h2 {
  margin: 0 0 10px 0;
  font-size: 2rem;
  color: #333;
}

.member-since {
  color: #666;
  margin: 0 0 20px 0;
  font-size: 0.9rem;
}

.user-stats {
  display: flex;
  gap: 30px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
}

.stat-label {
  font-size: 0.8rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.user-roles {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

.role-badge {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.reviews-section {
  border-top: 1px solid #eee;
  padding-top: 30px;
}

.reviews-section h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.3rem;
}

.no-reviews {
  text-align: center;
  color: #666;
  padding: 40px 0;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-item {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border-left: 4px solid #667eea;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.reviewer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.reviewer-name {
  font-weight: 500;
  color: #333;
}

.review-rating {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 0.9rem;
}

.review-comment {
  margin: 0 0 10px 0;
  color: #555;
  line-height: 1.5;
}

.review-date {
  margin: 0;
  font-size: 0.8rem;
  color: #999;
}

@media (max-width: 768px) {
  .user-info-section {
    flex-direction: column;
    text-align: center;
  }

  .user-stats {
    justify-content: center;
  }

  .review-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
