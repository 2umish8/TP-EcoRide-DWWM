import { ref } from 'vue'

// État global pour gérer les modales
const modals = ref([])

/**
 * Fonction utilitaire pour créer et afficher une modale
 */
function createModal(options) {
  return new Promise((resolve) => {
    const modalId = Date.now()

    const modalOptions = {
      id: modalId,
      isVisible: true,
      type: options.type || 'alert',
      title: options.title || 'Information',
      message: options.message || '',
      confirmText: options.confirmText || 'OK',
      cancelText: options.cancelText || 'Annuler',
      hideCloseButton: options.hideCloseButton || false,
      closeOnOverlay: options.closeOnOverlay !== false,
      onConfirm: () => {
        removeModal(modalId)
        resolve(true)
      },
      onCancel: () => {
        removeModal(modalId)
        resolve(false)
      },
      onClose: () => {
        removeModal(modalId)
        resolve(false)
      },
    }

    modals.value.push(modalOptions)
  })
}

/**
 * Supprime une modale de la liste
 */
function removeModal(id) {
  const index = modals.value.findIndex((modal) => modal.id === id)
  if (index > -1) {
    modals.value.splice(index, 1)
  }
}

/**
 * Affiche une alerte d'information
 */
export function showInfo(message, title = 'Information', options = {}) {
  return createModal({
    type: 'alert',
    title,
    message,
    confirmText: 'OK',
    ...options,
  })
}

/**
 * Affiche une alerte (équivalent de alert())
 */
export function showAlert(message, title = 'Information', options = {}) {
  return createModal({
    type: 'alert',
    title,
    message,
    confirmText: 'OK',
    ...options,
  })
}

/**
 * Affiche une alerte d'erreur
 */
export function showError(message, title = 'Erreur', options = {}) {
  return createModal({
    type: 'error',
    title,
    message,
    confirmText: 'OK',
    ...options,
  })
}

/**
 * Affiche une alerte de succès
 */
export function showSuccess(message, title = 'Succès', options = {}) {
  return createModal({
    type: 'success',
    title,
    message,
    confirmText: 'OK',
    ...options,
  })
}

/**
 * Affiche une confirmation (équivalent de confirm())
 */
export function showConfirm(message, title = 'Confirmation', options = {}) {
  return createModal({
    type: 'confirm',
    title,
    message,
    confirmText: options.confirmText || 'Oui',
    cancelText: options.cancelText || 'Non',
    ...options,
  })
}

/**
 * Composable pour utiliser les modales dans les composants Vue
 */
export function useModal() {
  return {
    modals,
    showAlert,
    showInfo,
    showError,
    showSuccess,
    showConfirm,
    removeModal,
  }
}

// Export par défaut pour la compatibilité
export default {
  showAlert,
  showInfo,
  showError,
  showSuccess,
  showConfirm,
  useModal,
}
