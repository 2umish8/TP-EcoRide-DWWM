import axios from 'axios'

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://tp-ecoride-dwwm-production.up.railway.app/api'

// Service pour les avis (Reviews)
export const reviewService = {
  // Créer un avis
  async createReview(reviewData) {
    const response = await axios.post(`${API_BASE_URL}/reviews`, reviewData)
    return response.data
  },

  // Récupérer les avis d'un chauffeur
  async getDriverReviews(driverId, page = 1, limit = 10) {
    const response = await axios.get(`${API_BASE_URL}/reviews/driver/${driverId}`, {
      params: { page, limit },
    })
    return response.data
  },

  // Avis en attente (pour employés)
  async getPendingReviews(page = 1, limit = 20) {
    const response = await axios.get(`${API_BASE_URL}/reviews/pending`, {
      params: { page, limit },
    })
    return response.data
  },

  // Valider/rejeter un avis (pour employés)
  async validateReview(reviewId, status) {
    const response = await axios.put(`${API_BASE_URL}/reviews/${reviewId}/validate`, {
      status,
    })
    return response.data
  },

  // Signalements (pour employés)
  async getReportedTrips() {
    const response = await axios.get(`${API_BASE_URL}/reviews/reported`)
    return response.data
  },
}

// Service pour les préférences chauffeur
export const preferencesService = {
  // Mes préférences (chauffeur connecté)
  async getMyPreferences() {
    const response = await axios.get(`${API_BASE_URL}/preferences/my-preferences`)
    return response.data
  },

  // Préférences d'un chauffeur spécifique
  async getDriverPreferences(driverId) {
    const response = await axios.get(`${API_BASE_URL}/preferences/driver/${driverId}`)
    return response.data
  },

  // Créer/modifier préférences
  async updatePreferences(preferencesData) {
    const response = await axios.post(`${API_BASE_URL}/preferences`, preferencesData)
    return response.data
  },

  // Ajouter préférence personnalisée
  async addCustomPreference(preferenceData) {
    const response = await axios.post(`${API_BASE_URL}/preferences/custom`, preferenceData)
    return response.data
  },

  // Supprimer préférence personnalisée
  async removeCustomPreference(preferenceId) {
    const response = await axios.delete(`${API_BASE_URL}/preferences/custom/${preferenceId}`)
    return response.data
  },
}
