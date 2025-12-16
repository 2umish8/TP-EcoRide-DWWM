import { ref } from 'vue'
import { creditsService } from '@/services/api.js'
import { useNotificationStore } from '@/stores/notification'

export const useCredits = () => {
  const loading = ref(false)
  const error = ref(null)
  const balance = ref(0)
  const transactions = ref([])
  const stats = ref(null)
  const pagination = ref({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  const notificationStore = useNotificationStore()

  const loadBalance = async () => {
    try {
      loading.value = true
      error.value = null

      const data = await creditsService.getBalance()
      balance.value = data.credits

      if (import.meta.env.DEV) {
        console.log('[useCredits] Balance loaded:', data.credits)
      }
    } catch (err) {
      console.error('Erreur lors du chargement du solde:', err)
      error.value = err.response?.data?.message || 'Erreur de chargement du solde'
      notificationStore.showError(error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  const loadTransactions = async (page = 1, limit = 20) => {
    try {
      loading.value = true
      error.value = null

      const data = await creditsService.getTransactions({ page, limit })
      transactions.value = data.transactions || []

      if (data.pagination) {
        pagination.value = data.pagination
      }

      if (import.meta.env.DEV) {
        console.log('[useCredits] Transactions loaded:', transactions.value.length, 'items')
      }
    } catch (err) {
      console.error('Erreur lors du chargement des transactions:', err)
      error.value = err.response?.data?.message || 'Erreur de chargement des transactions'
      notificationStore.showError(error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  const loadStats = async () => {
    try {
      loading.value = true
      error.value = null

      const data = await creditsService.getStats()
      stats.value = data

      if (import.meta.env.DEV) {
        console.log('[useCredits] Stats loaded:', data)
      }
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err)
      error.value = err.response?.data?.message || 'Erreur de chargement des statistiques'
      notificationStore.showError(error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  const loadAllData = async () => {
    try {
      loading.value = true
      error.value = null

      await Promise.all([loadBalance(), loadTransactions(1, 20), loadStats()])
    } catch (err) {
      // Errors already handled in individual functions
      if (import.meta.env.DEV) {
        console.log('[useCredits] Error loading data:', err)
      }
    } finally {
      loading.value = false
    }
  }

  const purchaseCredits = async (amount) => {
    try {
      loading.value = true
      error.value = null

      if (!amount || amount <= 0) {
        throw new Error('Le montant doit être positif')
      }

      const data = await creditsService.purchaseCredits(amount)
      balance.value = data.newBalance

      notificationStore.showSuccess(`${amount} crédits ajoutés avec succès`)

      // Reload transactions to show the new purchase
      await loadTransactions(pagination.value.page, pagination.value.limit)

      if (import.meta.env.DEV) {
        console.log('[useCredits] Credits purchased:', amount)
      }

      return data
    } catch (err) {
      console.error("Erreur lors de l'achat de crédits:", err)
      error.value = err.response?.data?.message || "Erreur lors de l'achat"
      notificationStore.showError(error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  const transferCredits = async (recipientId, amount) => {
    try {
      loading.value = true
      error.value = null

      if (!recipientId || !amount || amount <= 0) {
        throw new Error('Paramètres invalides')
      }

      const data = await creditsService.transferCredits(recipientId, amount)
      balance.value = data.newBalance

      notificationStore.showSuccess(`${amount} crédits transférés avec succès`)

      // Reload transactions to show the transfer
      await loadTransactions(pagination.value.page, pagination.value.limit)

      if (import.meta.env.DEV) {
        console.log('[useCredits] Credits transferred:', amount, 'to user', recipientId)
      }

      return data
    } catch (err) {
      console.error('Erreur lors du transfert de crédits:', err)
      error.value = err.response?.data?.message || 'Erreur lors du transfert'
      notificationStore.showError(error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    balance,
    transactions,
    stats,
    pagination,
    loadBalance,
    loadTransactions,
    loadStats,
    loadAllData,
    purchaseCredits,
    transferCredits,
  }
}
