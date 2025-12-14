import { useNotificationStore } from '@/stores/notification'

export default function useParticipationActions() {
  const notificationStore = useNotificationStore()

  const handleCancelParticipation = async (cancelParticipationFn, carpoolingId) => {
    try {
      const result = await cancelParticipationFn(carpoolingId)
      let message = result.message
      if (result.creditsRefunded !== undefined) {
        message += `\nCrédits remboursés: ${result.creditsRefunded}`
      }
      if (result.penalty && result.penalty > 0) {
        message += `\nPénalité appliquée: ${result.penalty} crédits`
      }
      notificationStore.showSuccess(message)
    } catch (err) {
      notificationStore.showError(
        "Erreur lors de l'annulation de la participation : " +
          (err.response?.data?.message || err.message),
      )
    }
  }

  return {
    handleCancelParticipation,
  }
}
