<template>
  <div class="preview-section">
    <h3 class="section-title">
      <font-awesome-icon :icon="['fas', 'clipboard-list']" /> Récapitulatif
    </h3>

    <TripCard :trip="previewTrip" />
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue'
import TripCard from '@/components/trips/cards/TripCard.vue'

const props = defineProps({
  tripData: {
    type: Object,
    required: true,
    default: () => ({
      id: 0,
      departure_address: '',
      arrival_address: '',
      departure_datetime: '',
      arrival_datetime: '',
      initial_seats_offered: 0,
      seats_remaining: 0,
      price_per_passenger: 0,
      status: 'prévu',
      participants_count: 0,
      model: '',
      plate_number: '',
    }),
  },
})

const previewTrip = computed(() => ({
  id: props.tripData.id || 0,
  departure_address: props.tripData.departure_address || 'Lieu de départ',
  arrival_address: props.tripData.arrival_address || 'Destination',
  departure_datetime: props.tripData.departure_datetime || new Date().toISOString(),
  arrival_datetime: props.tripData.arrival_datetime || new Date().toISOString(),
  initial_seats_offered: props.tripData.initial_seats_offered || 0,
  seats_remaining: props.tripData.seats_remaining || props.tripData.initial_seats_offered || 0,
  price_per_passenger: props.tripData.price_per_passenger || 0,
  status: 'prévu',
  participants_count: 0,
  model: props.tripData.model || '',
  plate_number: props.tripData.plate_number || '',
  cancellation_date: null,
  credits_paid: 0,
}))
</script>

<style scoped>
.preview-section {
  background: linear-gradient(
    135deg,
    var(--color-dark-tertiary) 0%,
    var(--color-dark-secondary) 100%
  );
  border: 2px solid var(--color-success);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--color-success);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .preview-section {
    padding: 1.5rem;
  }
}
</style>
