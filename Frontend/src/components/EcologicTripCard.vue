<template>
  <div class="ecologic-trip-card-wrapper">
    <!-- Ecologic Badge -->
    <div class="ecologic-badge">
      <font-awesome-icon :icon="['fas', 'leaf']" />
      Écologique
    </div>

    <!-- Base Trip Card with Ecologic Styling -->
    <TripCard
      :trip="trip"
      :show-earnings="showEarnings"
      :show-price="showPrice"
      @select="$emit('select', $event)"
      @view-driver-profile="$emit('view-driver-profile', $event)"
    >
      <template #actions>
        <slot name="actions"></slot>
      </template>
    </TripCard>
  </div>
</template>

<script>
import TripCard from './TripCard.vue'

export default {
  name: 'EcologicTripCard',
  components: {
    TripCard,
  },
  props: {
    trip: {
      type: Object,
      required: true,
    },
    showEarnings: {
      type: Boolean,
      default: false,
    },
    showPrice: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['select', 'view-driver-profile'],
}
</script>

<style scoped>
/* Wrapper with ecologic styling */
.ecologic-trip-card-wrapper {
  position: relative;
}

.ecologic-trip-card-wrapper :deep(.trip-card) {
  background:
    radial-gradient(
      400px 150px at 50% 100%,
      rgba(143, 218, 179, 0.15) 0%,
      var(--color-dark-tertiary) 70%
    ),
    var(--color-dark-tertiary);
  border: 2px solid var(--eco-primary);
  box-shadow:
    0 0 20px rgba(143, 218, 179, 0.3),
    0 4px 12px rgba(0, 0, 0, 0.3);
}

.ecologic-trip-card-wrapper :deep(.trip-card:hover) {
  border-color: var(--eco-primary);
  box-shadow:
    0 0 30px rgba(143, 218, 179, 0.5),
    0 6px 16px rgba(0, 0, 0, 0.4);
}

.ecologic-trip-card-wrapper :deep(.trip-card.is-cancelled) {
  opacity: 0.7;
  filter: grayscale(0.3);
}

/* Ecologic Badge */
.ecologic-badge {
  position: absolute;
  top: -10px;
  right: 12px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.3rem 0.6rem;
  border-radius: 20px;
  font-size: 0.65rem;
  font-weight: 700;
  background: rgba(0, 255, 140, 0.13);
  color: var(--bg-dark);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  box-shadow: 0 2px 8px rgba(143, 218, 179, 0.4);
  backdrop-filter: blur(10px);
}

.ecologic-badge svg {
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 768px) {
  .ecologic-badge {
    top: 8px;
    right: 8px;
  }
}
</style>
