import { defineStore } from 'pinia'
// import { authService } from '../services/api' // Temporairement désactivé

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('authToken'),
    isAuthenticated: !!localStorage.getItem('authToken'),
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated,
    currentUser: (state) => state.user,
    userRole: (state) => state.user?.role || null,
  },

  actions: {
    // Version simplifiée pour la démo (à remplacer par l'API plus tard)
    login(user) {
      const token = 'demo-token-' + Date.now()

      this.token = token
      this.user = user
      this.isAuthenticated = true

      localStorage.setItem('authToken', token)
      localStorage.setItem('user', JSON.stringify(user))

      return { success: true, user }
    },

    async logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false

      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
    },

    async loadUserProfile() {
      if (!this.isAuthenticated) return

      try {
        // Pour l'instant, on garde les données du localStorage
        const userData = JSON.parse(localStorage.getItem('user') || 'null')
        if (userData) {
          this.user = userData
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error)
        this.logout()
      }
    },
  },
})
