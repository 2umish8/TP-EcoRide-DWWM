<template>
  <div class="user-profile-container">
    <!-- Header avec navigation -->
    <div class="profile-header">
      <button @click="goBack" class="back-button">
        <svg class="back-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
        </svg>
        Retour
      </button>
      <h1>Profil de {{ user?.pseudo || 'Utilisateur' }}</h1>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Chargement du profil...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-container">
      <div class="error-card">
        <i class="fas fa-exclamation-triangle error-icon"></i>
        <p>{{ error }}</p>
        <button @click="loadUserProfile" class="retry-button">Réessayer</button>
      </div>
    </div>

    <!-- Profile content -->
    <div v-else-if="user" class="profile-content">
      <!-- User info section -->
      <div class="user-info-card">
        <div class="user-avatar-container">
          <img :src="getUserAvatar()" :alt="user.pseudo" class="user-avatar" />
        </div>
        <div class="user-details">
          <h2>{{ user.pseudo }}</h2>
          <p class="member-since">Membre depuis {{ formatDate(user.creation_date) }}</p>
          <div class="user-stats">
            <div class="stat-item">
              <span class="stat-number">{{ userStats.totalTrips }}</span>
              <span class="stat-label">Trajets</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{
                userStats.rating === '0.0' ? 'Aucune' : userStats.rating || 'N/A'
              }}</span>
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
          <svg
            class="no-reviews-icon"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"
            />
          </svg>
          <p>Aucun avis reçu pour le moment.</p>
        </div>
        <div v-else class="reviews-list">
          <div v-for="review in reviews" :key="review.id" class="review-card">
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
  return `https://i.pravatar.cc/150?img=${user.value?.id % 70}`
}

// Get reviewer avatar
const getReviewerAvatar = (reviewer) => {
  if (reviewer.profile_picture_url) {
    return reviewer.profile_picture_url
  }
  return `https://i.pravatar.cc/150?img=${reviewer.id % 70}`
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
    console.log('Frontend received:', response.data)

    user.value = response.data.user
    reviews.value = response.data.reviews || []

    // Calculate stats
    userStats.value = {
      totalTrips: response.data.stats?.totalTrips || 0,
      rating: response.data.stats?.averageRating || null,
      reviewsCount: reviews.value.length,
    }
    console.log('User stats calculated:', userStats.value)
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
  background: #1a1a1a;
  color: #ffffff;
}

.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  gap: 20px;
}

.back-button {
  background: #2a2a2a;
  border: 2px solid #333;
  color: #ffffff;
  padding: 12px 20px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: #333;
  border-color: #34d399;
  transform: translateX(-2px);
}

.profile-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid #333;
  border-top: 3px solid #34d399;
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

.error-card {
  background: #2d1b1b;
  border: 1px solid #4a2020;
  color: #ff6b6b;
  padding: 30px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  max-width: 400px;
}

.error-icon {
  font-size: 2rem;
  color: #ff6b6b;
}

.retry-button {
  background: #34d399;
  color: #1a1a1a;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.retry-button:hover {
  background: #22c55e;
  transform: translateY(-1px);
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.user-info-card {
  background: #2a2a2a;
  border: 2px solid #333;
  border-radius: 16px;
  padding: 30px;
  display: flex;
  align-items: center;
  gap: 25px;
  transition: all 0.3s ease;
}

.user-info-card:hover {
  border-color: #34d399;
  transform: translateY(-2px);
}

.user-avatar-container {
  flex-shrink: 0;
}

.user-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #34d399;
  box-shadow: 0 4px 20px rgba(52, 211, 153, 0.3);
}

.user-details {
  flex: 1;
}

.user-details h2 {
  margin: 0 0 10px 0;
  font-size: 2rem;
  color: #ffffff;
  font-weight: 700;
}

.member-since {
  color: #cccccc;
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
  color: #34d399;
}

.stat-label {
  font-size: 0.8rem;
  color: #cccccc;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.user-roles {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.role-badge {
  background: #34d399;
  color: #1a1a1a;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 2px solid #34d399;
  transition: all 0.3s ease;
}

.role-badge:hover {
  background: #22c55e;
  border-color: #22c55e;
  transform: translateY(-1px);
}

.reviews-section {
  background: #2a2a2a;
  border: 2px solid #333;
  border-radius: 16px;
  padding: 30px;
}

.reviews-section h3 {
  margin: 0 0 20px 0;
  color: #ffffff;
  font-size: 1.3rem;
  font-weight: 600;
}

.no-reviews {
  text-align: center;
  color: #cccccc;
  padding: 40px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.back-icon {
  width: 16px;
  height: 16px;
}

.no-reviews-icon {
  width: 48px;
  height: 48px;
  color: #666;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-card {
  background: #333;
  border-radius: 12px;
  padding: 20px;
  border-left: 4px solid #34d399;
  transition: all 0.3s ease;
}

.review-card:hover {
  background: #3a3a3a;
  transform: translateX(4px);
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
  border: 2px solid #34d399;
}

.reviewer-name {
  font-weight: 600;
  color: #ffffff;
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
  color: #cccccc;
  line-height: 1.5;
}

.review-date {
  margin: 0;
  font-size: 0.8rem;
  color: #999;
}

@media (max-width: 768px) {
  .user-profile-container {
    padding: 15px;
  }

  .profile-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .profile-header h1 {
    font-size: 1.5rem;
  }

  .user-info-card {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }

  .user-stats {
    justify-content: center;
  }

  .review-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .user-roles {
    justify-content: center;
  }
}
</style>
