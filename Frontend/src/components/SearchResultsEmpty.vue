<template>
  <div class="state-container">
    <div class="no-results-content">
      <h2 v-if="nextAvailableDate">
        <font-awesome-icon :icon="['fas', 'magnifying-glass']" /> Aucun trajet trouvé pour cette
        date
      </h2>
      <h2 v-else><font-awesome-icon :icon="['fas', 'magnifying-glass']" /> Aucun trajet trouvé</h2>

      <p v-if="nextAvailableDate">
        Cependant, nous avons trouvé des trajets pour le
        <strong>{{ formatDate(nextAvailableDate) }}</strong>
      </p>
      <p v-else>
        Essayez de modifier vos critères de recherche ou créez une alerte pour être notifié quand un
        trajet correspondant sera publié.
      </p>

      <div class="no-results-actions">
        <button
          v-if="nextAvailableDate"
          class="btn-primary"
          @click="$emit('search-alternative-date')"
        >
          Voir ces trajets
        </button>
        <button v-else class="btn-primary" @click="$emit('create-alert')">Créer une alerte</button>
        <button class="btn-secondary" @click="$emit('new-search')">
          {{ nextAvailableDate ? 'Nouvelle recherche' : 'Nouvelle recherche' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineEmits(['search-alternative-date', 'create-alert', 'new-search'])

defineProps({
  nextAvailableDate: {
    type: String,
    default: null,
  },
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<style scoped>
.state-container {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  padding: 60px 20px;
}

.no-results-content {
  background: var(--color-dark-secondary);
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.no-results-content h2 {
  font-size: 1.8rem;
  color: white;
  margin-bottom: 16px;
}

.no-results-content p {
  color: var(--color-light-secondary);
  font-size: 1.1rem;
  margin-bottom: 24px;
  line-height: 1.6;
}

.no-results-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-primary:hover {
  background: var(--color-primary);
  color: var(--color-light);
}

.btn-secondary {
  background: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: var(--color-primary);
  color: var(--color-light);
  border-color: var(--color-primary);
}

@media (max-width: 600px) {
  .no-results-content {
    padding: 24px;
  }

  .no-results-content h2 {
    font-size: 1.3rem;
  }

  .no-results-content p {
    font-size: 0.95rem;
  }

  .no-results-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>





