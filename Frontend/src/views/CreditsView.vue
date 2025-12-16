<template>
  <div class="credits-view">
    <div class="page-header">
      <h1>Mes Crédits EcoRide</h1>
    </div>

    <div v-if="loading && !balance" class="loading-container">
      <font-awesome-icon :icon="['fas', 'spinner']" spin size="2x" />
      <p>Chargement...</p>
    </div>

    <div v-else-if="error && !balance" class="error-container">
      <font-awesome-icon :icon="['fas', 'exclamation-triangle']" size="2x" />
      <p>{{ error }}</p>
      <button @click="loadAllData" class="btn-retry">Réessayer</button>
    </div>

    <div v-else class="content">
      <!-- Balance Card -->
      <div class="balance-card">
        <div class="balance-icon">
          <font-awesome-icon :icon="['fas', 'wallet']" />
        </div>
        <div class="balance-content">
          <h2>Solde Actuel</h2>
          <div class="balance-amount">{{ balance }} crédits</div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div v-if="stats" class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon spent">
            <font-awesome-icon :icon="['fas', 'arrow-down']" />
          </div>
          <div class="stat-content">
            <div class="stat-label">Dépensés</div>
            <div class="stat-value">{{ stats.totalSpent || 0 }} crédits</div>
            <div class="stat-detail">{{ stats.totalParticipations || 0 }} trajets</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon earned">
            <font-awesome-icon :icon="['fas', 'arrow-up']" />
          </div>
          <div class="stat-content">
            <div class="stat-label">Gagnés</div>
            <div class="stat-value">{{ stats.totalEarned || 0 }} crédits</div>
            <div class="stat-detail">{{ stats.createdCarpoolings || 0 }} trajets créés</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon commission">
            <font-awesome-icon :icon="['fas', 'chart-line']" />
          </div>
          <div class="stat-content">
            <div class="stat-label">Commission</div>
            <div class="stat-value">{{ stats.totalCommission || 0 }} crédits</div>
            <div class="stat-detail">Contribution plateforme</div>
          </div>
        </div>
      </div>

      <!-- Transaction History -->
      <div class="transactions-section">
        <div class="section-header">
          <h2>Historique des Transactions</h2>
          <span v-if="pagination.total" class="transaction-count"
            >{{ pagination.total }} transaction{{ pagination.total > 1 ? 's' : '' }}</span
          >
        </div>

        <div v-if="transactions.length === 0" class="empty-transactions">
          <font-awesome-icon :icon="['fas', 'receipt']" size="3x" />
          <p>Aucune transaction pour le moment</p>
        </div>

        <div v-else class="transactions-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Description</th>
                <th class="text-right">Montant</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="transaction in transactions"
                :key="transaction.id"
                :class="{ debit: transaction.transaction_type === 'débit' }"
              >
                <td class="transaction-date">
                  {{ formatDate(transaction.transaction_date) }}
                </td>
                <td>
                  <span :class="['transaction-type', transaction.transaction_type]">
                    <font-awesome-icon
                      :icon="[
                        'fas',
                        transaction.transaction_type === 'crédit' ? 'plus-circle' : 'minus-circle',
                      ]"
                    />
                    {{ transaction.transaction_type }}
                  </span>
                </td>
                <td class="transaction-description">{{ transaction.description }}</td>
                <td class="text-right">
                  <span :class="['transaction-amount', transaction.transaction_type]">
                    {{ transaction.transaction_type === 'crédit' ? '+' : '-'
                    }}{{ transaction.amount }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="pagination">
          <button
            @click="loadTransactions(pagination.page - 1, pagination.limit)"
            :disabled="pagination.page === 1"
            class="pagination-btn"
          >
            <font-awesome-icon :icon="['fas', 'chevron-left']" />
          </button>
          <span class="pagination-info"
            >Page {{ pagination.page }} sur {{ pagination.totalPages }}</span
          >
          <button
            @click="loadTransactions(pagination.page + 1, pagination.limit)"
            :disabled="pagination.page >= pagination.totalPages"
            class="pagination-btn"
          >
            <font-awesome-icon :icon="['fas', 'chevron-right']" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useCredits } from '@/composables/useCredits'

const { loading, error, balance, transactions, stats, pagination, loadAllData, loadTransactions } =
  useCredits()

onMounted(() => {
  loadAllData()
})

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
.credits-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  background-color: var(--color-dark);
  min-height: 100vh;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-light);
  margin: 0;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
  color: var(--color-light-secondary);
}

.error-container {
  color: var(--color-error);
}

.btn-retry {
  padding: 0.75rem 1.5rem;
  background-color: var(--color-primary);
  color: var(--color-dark);
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-retry:hover {
  background-color: var(--color-primary-hover);
  transform: scale(1.05);
}

.content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Balance Card */
.balance-card {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.balance-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-dark);
  border-radius: 50%;
  font-size: 2rem;
  color: var(--color-primary);
}

.balance-content h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-dark);
}

.balance-amount {
  font-size: 3rem;
  font-weight: 700;
  color: var(--color-dark);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background-color: var(--color-dark-secondary);
  border: 2px solid var(--color-dark-tertiary);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
}

.stat-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 1.5rem;
  color: var(--color-light);
}

.stat-icon.spent {
  background-color: var(--color-error);
}

.stat-icon.earned {
  background-color: var(--color-success);
}

.stat-icon.commission {
  background-color: var(--color-warning);
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-light-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-primary);
  margin: 0.25rem 0;
}

.stat-detail {
  font-size: 0.875rem;
  color: var(--color-light-secondary);
}

/* Transactions Section */
.transactions-section {
  background-color: var(--color-dark-secondary);
  border-radius: 12px;
  padding: 2rem;
  border: 2px solid var(--color-dark-tertiary);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-light);
  margin: 0;
}

.transaction-count {
  font-size: 0.875rem;
  color: var(--color-light-secondary);
  font-weight: 600;
}

.empty-transactions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: var(--color-light-secondary);
  gap: 1rem;
}

.transactions-table {
  overflow-x: auto;
}

.transactions-table table {
  width: 100%;
  border-collapse: collapse;
}

.transactions-table th {
  text-align: left;
  padding: 1rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-light-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid var(--color-dark-tertiary);
}

.transactions-table th.text-right {
  text-align: right;
}

.transactions-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--color-dark-tertiary);
  color: var(--color-light);
}

.transactions-table td.text-right {
  text-align: right;
}

.transactions-table tbody tr:hover {
  background-color: var(--color-dark-tertiary);
}

.transaction-date {
  font-size: 0.875rem;
  color: var(--color-light-secondary);
  font-weight: 500;
}

.transaction-type {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: capitalize;
}

.transaction-type.crédit {
  background-color: var(--color-success);
  color: var(--color-dark);
}

.transaction-type.débit {
  background-color: var(--color-error);
  color: var(--color-light);
}

.transaction-description {
  font-size: 0.9375rem;
  color: var(--color-light);
}

.transaction-amount {
  font-size: 1.125rem;
  font-weight: 700;
}

.transaction-amount.crédit {
  color: var(--color-success);
}

.transaction-amount.débit {
  color: var(--color-error);
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid var(--color-dark-tertiary);
}

.pagination-btn {
  padding: 0.5rem 1rem;
  background-color: var(--color-dark-tertiary);
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}

.pagination-btn:hover:not(:disabled) {
  background-color: var(--color-primary);
  color: var(--color-dark);
  transform: scale(1.05);
}

.pagination-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 0.9375rem;
  color: var(--color-light-secondary);
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .credits-view {
    padding: 1rem;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }

  .balance-card {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .balance-amount {
    font-size: 2rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .transactions-section {
    padding: 1rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .transactions-table {
    font-size: 0.875rem;
  }

  .transactions-table th,
  .transactions-table td {
    padding: 0.75rem 0.5rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }
}
</style>
