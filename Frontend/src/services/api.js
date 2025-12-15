import axios from 'axios'

// Logique intelligente pour l'URL de l'API
const getApiUrl = () => {
  // Si VITE_API_URL est défini dans .env, l'utiliser en priorité
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }

  // En production (mode production), utiliser l'URL relative pour nginx proxy
  if (import.meta.env.MODE === 'production') {
    return '/api'
  }

  // En développement, détecter si on est sur localhost
  if (import.meta.env.MODE === 'development' || window.location.hostname === 'localhost') {
    // Si on est sur le port 80 (nginx/Docker), utiliser le proxy
    if (window.location.port === '' || window.location.port === '80') {
      return '/api'
    }
    // Sinon, connexion directe au backend (dev local)
    return 'http://localhost:3000/api'
  }

  // URL de production par défaut (fallback)
  return 'https://tp-ecoride-dwwm.onrender.com/api'
}

const API_BASE_URL = getApiUrl()

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteur pour ajouter le token JWT automatiquement
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Erreur API:', error.message, 'URL:', error.config?.url)
    if (error.response?.status === 401) {
      // 401 UNIQUEMENT sur les requêtes protégées (pas /login)
      // Ne pas rediriger si on est déjà en train d'essayer de se connecter
      const isLoginRoute = error.config?.url?.includes('/users/login')

      if (!isLoginRoute) {
        // Token expiré ou invalide sur une route protégée
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

// Services d'authentification
export const authService = {
  async login(credentials) {
    const response = await api.post('/users/login', credentials)
    return response.data
  },

  async register(userData) {
    const response = await api.post('/users/register', userData)
    return response.data
  },

  async logout() {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  },

  async getProfile() {
    const response = await api.get('/users/profile')
    return response.data
  },

  async becomeDriver() {
    const response = await api.post('/users/become-driver')
    return response.data
  },
}

// Services de véhicules
export const vehicleService = {
  async getUserVehicles() {
    const response = await api.get('/vehicles/my-vehicles')
    return response.data
  },

  async addVehicle(vehicleData) {
    const response = await api.post('/vehicles', vehicleData)
    return response.data
  },

  async removeVehicle(vehicleId) {
    const response = await api.delete(`/vehicles/${vehicleId}`)
    return response.data
  },
}

// Services de covoiturage
export const carpoolingService = {
  async getAvailableTrips(filters = {}) {
    const response = await api.get('/search/advanced', { params: filters })
    return response.data
  },

  async getTripDetails(tripId) {
    const response = await api.get(`/carpoolings/${tripId}`)
    return response.data
  },

  async createTrip(tripData) {
    const response = await api.post('/carpoolings', tripData)
    return response.data
  },

  async getDriverTrips() {
    const response = await api.get('/carpoolings/my-carpoolings')
    return response.data
  },

  async updateTrip(tripId, tripData) {
    const response = await api.put(`/carpoolings/${tripId}`, tripData)
    return response.data
  },

  async cancelTrip(tripId) {
    const response = await api.post(`/carpoolings/${tripId}/cancel`)
    return response.data
  },

  async startTrip(tripId) {
    const response = await api.post(`/carpoolings/${tripId}/start`)
    return response.data
  },

  async finishTrip(tripId) {
    const response = await api.post(`/carpoolings/${tripId}/finish`)
    return response.data
  },
}

// Services de participations
export const participationService = {
  async checkConditions(tripId) {
    const response = await api.get(`/participations/${tripId}/check`)
    return response.data
  },

  async joinTrip(tripId, confirmed = true) {
    const response = await api.post(`/participations/${tripId}/join`, { confirmed })
    return response.data
  },

  async cancelParticipation(tripId) {
    const response = await api.post(`/participations/${tripId}/cancel`)
    return response.data
  },

  async getMyParticipations() {
    const response = await api.get('/participations/my-participations')
    return response.data
  },

  async validateTrip(tripId, isValidated) {
    const response = await api.post(`/participations/${tripId}/validate`, {
      is_validated: isValidated,
    })
    return response.data
  },

  // Récupérer l'historique complet (chauffeur + passager)
  async getFullHistory() {
    try {
      const [driverHistory, passengerHistory] = await Promise.allSettled([
        carpoolingService.getDriverTrips(),
        this.getMyParticipations(),
      ])

      const result = {
        asDriver: driverHistory.status === 'fulfilled' ? driverHistory.value.carpoolings || [] : [],
        asPassenger:
          passengerHistory.status === 'fulfilled'
            ? passengerHistory.value.participations || []
            : [],
        errors: [],
      }

      // Collecter les erreurs éventuelles
      if (driverHistory.status === 'rejected') {
        result.errors.push({ type: 'driver', error: driverHistory.reason })
      }
      if (passengerHistory.status === 'rejected') {
        result.errors.push({ type: 'passenger', error: passengerHistory.reason })
      }

      return result
    } catch (error) {
      console.error("Erreur lors de la récupération de l'historique complet:", error)
      throw error
    }
  },
}

// Services de crédits
export const creditsService = {
  async getBalance() {
    const response = await api.get('/credits/balance')
    return response.data
  },

  async getTransactions() {
    const response = await api.get('/credits/transactions')
    return response.data
  },
}

export default api
