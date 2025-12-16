import { api } from './api'

// Service pour les avis (Reviews)
export const reviewService = {
  // Créer un avis
  async createReview(reviewData) {
    const response = await api.post('/reviews', reviewData)
    return response.data
  },

  // Récupérer les avis d'un chauffeur
  async getDriverReviews(driverId, page = 1, limit = 10) {
    const response = await api.get(`/reviews/driver/${driverId}`, {
      params: { page, limit },
    })
    return response.data
  },

  // Avis en attente (pour employés)
  async getPendingReviews(page = 1, limit = 20) {
    const response = await api.get('/reviews/pending', {
      params: { page, limit },
    })
    return response.data
  },

  // Valider/rejeter un avis (pour employés)
  async validateReview(reviewId, status) {
    const response = await api.put(`/reviews/${reviewId}/validate`, {
      status,
    })
    return response.data
  },

  // Signalements (pour employés)
  async getReportedTrips() {
    const response = await api.get('/reviews/reported')
    return response.data
  },
}

// Service pour les préférences chauffeur
export const preferencesService = {
  // Mes préférences (chauffeur connecté)
  async getMyPreferences() {
    const response = await api.get('/preferences/my-preferences')
    return response.data
  },

  // Préférences d'un chauffeur spécifique
  async getDriverPreferences(driverId) {
    const response = await api.get(`/preferences/driver/${driverId}`)
    return response.data
  },

  // Créer/modifier préférences
  async updatePreferences(preferencesData) {
    const response = await api.post('/preferences', preferencesData)
    return response.data
  },

  // Ajouter préférence personnalisée
  async addCustomPreference(preferenceData) {
    const response = await api.post('/preferences/custom', preferenceData)
    return response.data
  },

  // Supprimer préférence personnalisée
  async removeCustomPreference(preferenceId) {
    const response = await api.delete(`/preferences/custom/${preferenceId}`)
    return response.data
  },
}
