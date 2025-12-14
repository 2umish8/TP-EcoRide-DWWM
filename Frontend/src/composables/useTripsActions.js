import { useNotificationStore } from '@/stores/notification'

export default function useTripsActions() {
  const notificationStore = useNotificationStore()

  const handleStartTrip = async (startTripFn, tripId) => {
    notificationStore.showInfo('Démarrage du trajet...')
    try {
      await startTripFn(tripId)
    } catch (err) {
      notificationStore.showError(
        'Erreur lors du démarrage du trajet : ' + (err.response?.data?.message || err.message),
      )
    }
  }

  const handleFinishTrip = async (finishTripFn, tripId) => {
    notificationStore.showInfo('Fin du trajet...')
    try {
      await finishTripFn(tripId)
    } catch (err) {
      notificationStore.showError(
        'Erreur lors de la fin du trajet : ' + (err.response?.data?.message || err.message),
      )
    }
  }

  const handleCancelTrip = async (cancelTripFn, tripId) => {
    notificationStore.showInfo('Annulation du trajet...')
    try {
      await cancelTripFn(tripId)
    } catch (err) {
      notificationStore.showError(
        "Erreur lors de l'annulation du trajet : " + (err.response?.data?.message || err.message),
      )
    }
  }

  return {
    handleStartTrip,
    handleFinishTrip,
    handleCancelTrip,
  }
}
