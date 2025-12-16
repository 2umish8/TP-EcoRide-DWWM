<template>
  <div class="filter-container">
    <div class="filter-group">
      <label>Filtrer par statut :</label>
      <div class="status-buttons">
        <TabButton @click="$emit('update:selectedStatus', '')" :active="selectedStatus === ''">
          Tous
        </TabButton>
        <TabButton
          v-for="status in statuses"
          :key="status"
          @click="$emit('update:selectedStatus', status)"
          :active="selectedStatus === status"
        >
          <font-awesome-icon v-if="statusIcons[status]" :icon="statusIcons[status]" />
          {{ formatStatusLabel(status) }}
        </TabButton>
      </div>
    </div>
    <div class="filter-group">
      <label :for="sortSelectId">Trier par :</label>
      <select
        :id="sortSelectId"
        :value="sortOrder"
        @change="$emit('update:sortOrder', $event.target.value)"
        class="filter-select"
      >
        <option value="date-desc">Plus récents</option>
        <option value="date-asc">Plus anciens</option>
        <option value="status">Statut</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import TabButton from '@/components/ui/buttons/TabButton.vue'

defineProps({
  selectedStatus: {
    type: String,
    default: '',
  },
  sortOrder: {
    type: String,
    default: 'date-desc',
  },
  statuses: {
    type: Array,
    default: () => ['prévu', 'démarré', 'terminé', 'annulé'],
  },
  sortSelectId: {
    type: String,
    default: 'sort-filter',
  },
})

defineEmits(['update:selectedStatus', 'update:sortOrder'])

const statusIcons = {
  prévu: ['fas', 'calendar'],
  démarré: ['fas', 'car'],
  terminé: ['fas', 'circle-check'],
  annulé: ['fas', 'xmark'],
}

const formatStatusLabel = (status) => {
  const labels = {
    prévu: 'Prévus',
    démarré: 'En cours',
    terminé: 'Terminés',
    annulé: 'Annulés',
  }
  return labels[status] || status
}
</script>

<style scoped>
.filter-container {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  background: var(--color-dark-secondary);
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 600;
  color: var(--color-light-secondary);
  font-size: 0.9rem;
}

.filter-select {
  padding: 0.5rem;
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  font-size: 0.9rem;
  min-width: 150px;
  background: var(--color-dark-tertiary);
  color: var(--color-light-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-select:hover {
  border-color: var(--bs-primary);
}

.filter-select:focus {
  outline: none;
  border-color: var(--bs-primary);
  box-shadow: 0 0 4px rgba(143, 218, 179, 0.3);
}

.status-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.status-btn {
  padding: 0.5rem 1rem;
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  background: var(--color-dark-tertiary);
  color: var(--color-gray);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.status-btn:hover {
  border-color: var(--bs-primary);
  color: var(--bs-primary);
  background: var(--color-dark-secondary);
}

.status-btn.active {
  border-color: var(--bs-primary);
  background: var(--bs-primary);
  color: white;
  box-shadow: 0 2px 4px rgba(143, 218, 179, 0.3);
}
</style>
