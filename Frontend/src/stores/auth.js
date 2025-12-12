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
  },

  actions: {
    // Connexion avec données réelles du backend uniquement
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
  },
})
