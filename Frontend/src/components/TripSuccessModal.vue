<template>
  <BaseModal :show="show" @close="$emit('close')">
    <template #header>
      <div class="success-header">
        <font-awesome-icon :icon="['fas', 'circle-check']" class="check-icon" />
        <h3>Trajet créé avec succès !</h3>
      </div>
    </template>

    <div class="success-content">
      <div class="success-message">
        <p class="main-message">Votre EcoRide a été proposé avec succès !</p>

        <div v-if="trip" class="trip-summary">
          <p>
            <strong><font-awesome-icon :icon="['fas', 'location-dot']" /> Départ :</strong>
            {{ trip.departure }}
          </p>
          <p>
            <strong><font-awesome-icon :icon="['fas', 'flag-checkered']" /> Arrivée :</strong>
            {{ trip.destination }}
          </p>
          <p>
            <strong><font-awesome-icon :icon="['fas', 'calendar']" /> Date :</strong>
            {{ formatDate(trip.date) }}
          </p>
          <p>
            <strong><font-awesome-icon :icon="['fas', 'clock']" /> Heure :</strong>
            {{ trip.time }}
          </p>
        </div>
      </div>
    </div>

    <template #footer>
      <PrimaryButton @click="$emit('view-trip')">
        <font-awesome-icon :icon="['fas', 'eye']" class="btn-icon" />
        Voir mon trajet
      </PrimaryButton>
      <SecondaryButton @click="$emit('close')">Non merci</SecondaryButton>
    </template>
  </BaseModal>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import BaseModal from './BaseModal.vue'
import PrimaryButton from '@/components/ui/PrimaryButton.vue'
import SecondaryButton from '@/components/ui/SecondaryButton.vue'

defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  trip: {
    type: Object,
    default: null,
  },
})

defineEmits(['close', 'view-trip'])

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<style scoped>
.success-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin: 0;
}

.check-icon {
  font-size: 2rem;
  color: var(--color-primary);
}

.success-header h3 {
  color: var(--color-primary);
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.success-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.success-message {
  color: var(--color-light);
}

.main-message {
  font-size: 1.1rem;
  margin-bottom: 15px;
  margin-top: 0;
}

.trip-summary {
  background: var(--color-dark-secondary);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  text-align: left;
}

.trip-summary p {
  margin: 8px 0;
  color: var(--color-light-secondary);
  font-size: 0.95rem;
}

.trip-summary strong {
  color: var(--color-light);
}

.view-trip-btn {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-success) 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(52, 211, 153, 0.3);
}

.view-trip-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(52, 211, 153, 0.4);
}

.dismiss-btn {
  background: var(--color-gray);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dismiss-btn:hover {
  opacity: 0.8;
  transform: translateY(-1px);
}

.btn-icon {
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .view-trip-btn,
  .dismiss-btn {
    width: 100%;
  }
}
</style>
