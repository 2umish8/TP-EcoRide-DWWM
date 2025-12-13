<template>
  <div
    class="trip-card"
    :class="[
      `status-${trip.status}`,
      { 'has-participants': trip.participants_count > 0 },
      { 'is-cancelled': trip.cancellation_date },
    ]"
  >
    <!-- Header -->
    <div class="trip-card-header">
      <div class="trip-status">
        <span :class="['status-badge', `status-${trip.status}`]">
          <font-awesome-icon :icon="['fas', getStatusIcon(trip.status)]" />
          {{ getStatusLabel(trip.status) }}
        </span>
        <span v-if="trip.cancellation_date" class="cancellation-badge"> Annulée </span>
      </div>
      <div class="trip-actions">
        <slot name="actions"></slot>
      </div>
    </div>

    <!-- Route -->
    <div class="trip-route">
      <div class="route-info">
        <div class="route-addresses">
          <div class="departure">
            <font-awesome-icon :icon="['fas', 'check']" class="icon" />
            <span class="address">{{ trip.departure_address }}</span>
          </div>
          <div class="route-arrow">
            <span class="arrow">→</span>
          </div>
          <div class="arrival">
            <font-awesome-icon :icon="['fas', 'check']" class="icon" />
            <span class="address">{{ trip.arrival_address }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Details -->
    <div class="trip-details">
      <div class="detail-item">
        <font-awesome-icon :icon="['fas', 'calendar']" class="detail-icon" />
        <div class="detail-content">
          <span class="detail-label">Date</span>
          <span class="detail-value">{{ formatDate(trip.departure_datetime) }}</span>
          <span class="detail-time">{{ formatTime(trip.departure_datetime) }}</span>
        </div>
      </div>

      <div class="detail-item">
        <font-awesome-icon :icon="['fas', 'clock-rotate-left']" class="detail-icon" />
        <div class="detail-content">
          <span class="detail-label">Durée</span>
          <span class="detail-value">
            {{ formatDuration(trip.departure_datetime, trip.arrival_datetime) }}
          </span>
        </div>
      </div>

      <div class="detail-item">
        <font-awesome-icon :icon="['fas', 'coins']" class="detail-icon" />
        <div class="detail-content">
          <span class="detail-label">Prix</span>
          <span class="detail-value">{{ trip.price_per_passenger }} crédits</span>
        </div>
      </div>

      <div class="detail-item">
        <font-awesome-icon :icon="['fas', 'user-group']" class="detail-icon" />
        <div class="detail-content">
          <span class="detail-label">Participants</span>
          <span class="detail-value">
            {{ trip.participants_count || 0 }} / {{ trip.initial_seats_offered }}
            <span class="seats-remaining"
              >({{ trip.seats_remaining }} restante{{ trip.seats_remaining > 1 ? 's' : '' }})</span
            >
          </span>
        </div>
      </div>
    </div>

    <!-- Vehicle -->
    <div v-if="trip.model" class="trip-vehicle">
      <font-awesome-icon :icon="['fas', 'car']" class="vehicle-icon" />
      <span class="vehicle-info">{{ trip.model }} ({{ trip.plate_number }})</span>
    </div>

    <!-- Footer -->
    <div class="trip-card-footer">
      <div
        v-if="showEarnings && trip.status === 'terminé' && trip.participants_count > 0"
        class="trip-earnings"
      >
        <font-awesome-icon :icon="['fas', 'coins']" class="earnings-icon" />
        <span class="earnings-text"> Revenus : {{ calculateEarnings(trip) }} crédits </span>
      </div>
      <div v-if="showPrice && showEarnings" class="trip-price">
        <font-awesome-icon :icon="['fas', 'coins']" class="price-icon" />
        <span class="price-text">{{ trip.credits_paid }} crédits</span>
      </div>
      <div class="trip-id">
        <span class="id-label">ID :</span>
        <span class="id-value">#{{ trip.id }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { formatDate, formatTime, formatDuration } from '@/composables/useDateFormatting'
import { getStatusLabel, getStatusIcon } from '@/utils/formatters'
import { calculateEarnings } from '@/utils/helpers'

export default {
  name: 'TripCard',
  props: {
    /**
     * Trip object with all trip details
     */
    trip: {
      type: Object,
      required: true,
    },
    /**
     * Show earnings information (driver view)
     */
    showEarnings: {
      type: Boolean,
      default: false,
    },
    /**
     * Show price information (passenger view)
     */
    showPrice: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    return {
      formatDate,
      formatTime,
      formatDuration,
      getStatusLabel,
      getStatusIcon,
      calculateEarnings,
    }
  },
}
</script>

<style scoped>
/* Component-specific overrides moved to assets/css/_cards.css */
/* Keep this block for future tweaks that are truly local to TripCard */
</style>
