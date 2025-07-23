import { defineStore } from 'pinia'

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
    // Connexion avec données réelles du back-end uniquement
    login(user, token) {
      if (!user || !token) {
        throw new Error('Données utilisateur ou token manquants')
      }

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
        // Récupérer les données du localStorage
        const userData = JSON.parse(localStorage.getItem('user') || 'null')
        const token = localStorage.getItem('authToken')

        if (userData && token) {
          this.user = userData
          this.token = token
        } else {
          // Si pas de données valides, déconnecter
          this.logout()
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error)
        this.logout()
      }
    },
  },
})
