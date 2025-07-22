import { defineStore } from 'pinia'
import { authService } from '../services/api'

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
    async login(credentials) {
      try {
        const response = await authService.login(credentials)

        this.token = response.token
        this.user = response.user
        this.isAuthenticated = true

        localStorage.setItem('authToken', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))

        return { success: true, user: response.user }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Erreur de connexion',
        }
      }
    },

    async register(userData) {
      try {
        await authService.register(userData)
        return { success: true, message: 'Inscription réussie' }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || "Erreur d'inscription",
        }
      }
    },

    async logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false

      await authService.logout()
    },

    async loadUserProfile() {
      if (!this.isAuthenticated) return

      try {
        const response = await authService.getProfile()
        this.user = response.user
        localStorage.setItem('user', JSON.stringify(response.user))
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error)
        this.logout()
      }
    },
  },
})
