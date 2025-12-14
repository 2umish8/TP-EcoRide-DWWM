<template>
  <div class="user-profile-container">
    <!-- Header avec navigation -->
    <div class="profile-header">
      <button @click="goBack" class="back-button">
        <font-awesome-icon :icon="['fas', 'arrow-left']" />
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
      <div class="card">
        <i class="fas fa-exclamation-triangle error-icon"></i>
        <p>{{ error }}</p>
        <button @click="loadUserProfile" class="retry-button">Réessayer</button>
      </div>
    </div>
    <!-- Profile content -->
    <div v-else-if="user" class="profile-content">
      <!-- User info section -->
      <div class="card">
        <div class="user-avatar-container">
          <img :src="getUserAvatar()" :alt="user.pseudo" />
        </div>
        <div class="user-details">
          <h2>{{ user.pseudo }}</h2>
          <p class="member-since">Membre depuis {{ formatDate(user.creation_date) }}</p>
          <div class="user-stats">
            <div class="stat-item">
              <span class="stat-number">{{ userStats.totalTrips }}</span
              ><span class="stat-label">Trajets</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{
                userStats.rating === '0.0' ? 'Aucune' : userStats.rating || 'N/A'
              }}</span
              ><span class="stat-label">Note moyenne</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ userStats.reviewsCount }}</span
              ><span class="stat-label">Avis reçus</span>
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
          <font-awesome-icon
            :icon="['fas', 'comment']"
            class="no-reviews-icon"
            aria-hidden="true"
          />
          <p>Aucun avis reçu pour le moment.</p>
        </div>
        <div v-else class="reviews-list">
          <div v-for="review in reviews" :key="review.id" class="card review-card">
            <div class="review-header">
              <div class="reviewer-info">
                <img
                  :src="getReviewerAvatar(review.reviewer)"
                  :alt="review.reviewer.pseudo"
                  class="reviewer-avatar"
                /><span class="reviewer-name">{{ review.reviewer.pseudo }}</span>
              </div>
              <div class="review-rating">
                <span v-for="i in 5" :key="i" class="star"
                  ><font-awesome-icon
                    :icon="['fas', 'star']"
                    :class="{ inactive: i > review.rating }"
                /></span>
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
