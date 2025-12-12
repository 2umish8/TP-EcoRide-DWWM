import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notification', () => {
  // Une seule notification à la fois
  const current = ref(null)
  let timeoutId = null

  // Affiche une notification
  function show(message, type = 'info', duration = 3000) {
    // Annule le timeout précédent s'il existe
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }

    // Crée une nouvelle notification avec un nouvel ID
    // pour forcer la réinitialisation de l'animation
    current.value = { id: Date.now(), message, type }

    // Auto-fermeture avec son propre timeout
    if (duration > 0) {
      timeoutId = setTimeout(() => {
        current.value = null
        timeoutId = null
      }, duration)
    }
  }

  // Fonctions pratiques
  const showInfo = (message) => show(message, 'info', 3000)
  const showSuccess = (message) => show(message, 'success', 3000)
  const showError = (message) => show(message, 'error', 5000)
  const showWarning = (message) => show(message, 'warning', 4000)

  // Reset manuel
  const clear = () => {
    current.value = null
  }

  return {
    current,
    show,
    showInfo,
    showSuccess,
    showError,
    showWarning,
    clear,
  }
})
