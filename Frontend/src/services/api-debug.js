import axios from 'axios'

// Configuration de base pour l'API
console.log('🔧 VITE_API_URL from env:', import.meta.env.VITE_API_URL)
console.log('🔧 All env vars:', import.meta.env)

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

console.log('🔧 Final API_BASE_URL:', API_BASE_URL)

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Test de connexion
console.log('🚀 API configurée avec URL:', api.defaults.baseURL)

// Intercepteur pour ajouter le token JWT automatiquement
api.interceptors.request.use(
  (config) => {
    console.log('📤 Requête vers:', config.baseURL + config.url)
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
    console.error('❌ Erreur API:', error.message, 'URL:', error.config?.url)
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export { API_BASE_URL }
