<template>
  <div
    class="trip-card"
    :class="[
      `status-${trip.status || 'prévu'}`,
      { 'has-participants': (trip.participants_count || trip._count?.participations || 0) > 0 },
      { 'is-cancelled': trip.cancellation_date },
    ]"
  >
    <!-- Header -->
    <div class="trip-card-header">
      <span :class="['status-badge', `status-${trip.status || 'prévu'}`]">
        <font-awesome-icon :icon="['fas', getStatusIcon(trip.status || 'prévu')]" />
        {{ getStatusLabel(trip.status || 'prévu') }}
      </span>
      <div class="trip-actions">
        <slot name="actions"></slot>
      </div>
    </div>

    <!-- Route -->
    <div class="trip-route">
      <div class="route-addresses">
        <div class="departure">
          <font-awesome-icon :icon="['fas', 'circle']" class="icon" />
          <span class="address">{{ trip.departure_address }}</span>
        </div>
        <div class="route-arrow">
          <span class="arrow">→</span>
        </div>
        <div class="arrival">
          <font-awesome-icon :icon="['fas', 'location-dot']" class="icon" />
          <span class="address">{{ trip.arrival_address }}</span>
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
            {{ trip.duration_minutes ? `${trip.duration_minutes}min` : 'N/A' }}
          </span>
        </div>
      </div>

      <div class="detail-item">
        <font-awesome-icon :icon="['fas', 'coins']" class="detail-icon" />
        <div class="detail-content">
          <span class="detail-label">Prix</span>
          <span class="detail-value">{{ trip.price_per_passenger || 'N/A' }} crédits</span>
        </div>
      </div>

      <div class="detail-item">
        <font-awesome-icon :icon="['fas', 'user-group']" class="detail-icon" />
        <div class="detail-content">
          <span class="detail-label">Participants</span>
          <span class="detail-value">
            {{ trip.participants_count || trip._count?.participations || 0 }} /
            {{ trip.initial_seats_offered || trip.seats_remaining || 'N/A' }}
            <span class="seats-remaining"
              >({{ trip.seats_remaining || 0 }} restante{{
                (trip.seats_remaining || 0) > 1 ? 's' : ''
              }})</span
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
        v-if="
          showEarnings &&
          (trip.status === 'terminé' || trip.status === 'completed') &&
          (trip.participants_count || trip._count?.participations || 0) > 0
        "
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
  created() {
    if (import.meta.env.DEV) {
      console.log('[TripCard DEBUG] Trip data received:', this.trip)
      console.log('[TripCard DEBUG] Keys available:', Object.keys(this.trip))
      console.log('[TripCard DEBUG] departure_datetime:', this.trip.departure_datetime)
      console.log('[TripCard DEBUG] price_per_passenger:', this.trip.price_per_passenger)
      console.log('[TripCard DEBUG] participants_count:', this.trip.participants_count)
      console.log('[TripCard DEBUG] initial_seats_offered:', this.trip.initial_seats_offered)
      console.log('[TripCard DEBUG] seats_remaining:', this.trip.seats_remaining)
    }
  },
}
</script>

<style scoped>
.trip-card {
  background: var(--color-dark-tertiary);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.trip-card:hover {
  border-color: rgba(255, 255, 255, 0.16);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.trip-card.is-cancelled {
  opacity: 0.7;
  filter: grayscale(0.3);
}

/* Header */
.trip-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.6rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
}

.status-badge.status-terminé {
  background: rgba(67, 197, 97, 0.15);
  color: #43c561;
}

.status-badge.status-annulé {
  background: rgba(205, 101, 112, 0.15);
  color: #cd6570;
}

.status-badge.status-en\ cours {
  background: rgba(241, 213, 129, 0.15);
  color: #f1d581;
}

.trip-actions {
  display: flex;
  gap: 0.5rem;
}

/* Route */
.trip-route {
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
}

.route-addresses {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.departure,
.arrival {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 0 1 auto;
}

.icon {
  color: var(--eco-primary);
  font-size: 0.9rem;
}

.address {
  font-weight: 500;
  color: var(--color-light);
}

.route-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.arrow {
  color: var(--eco-secondary);
  font-size: 1.2rem;
  font-weight: bold;
}

/* Details */
.trip-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  gap: 0.4rem;
}

.detail-icon {
  color: var(--eco-primary);
  font-size: 0.95rem;
  min-width: 1rem;
  margin-top: 0.1rem;
  flex-shrink: 0;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.detail-label {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  font-weight: 600;
  line-height: 1;
}

.detail-value {
  font-size: 0.85rem;
  color: var(--color-light);
  font-weight: 500;
  line-height: 1.1;
}

.detail-time {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1;
}

.seats-remaining {
  display: block;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 0.1rem;
}

/* Vehicle */
.trip-vehicle {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  font-size: 0.8rem;
}

.vehicle-icon {
  color: var(--eco-secondary);
  font-size: 1rem;
}

.vehicle-info {
  color: var(--color-light);
  font-weight: 500;
}

/* Footer */
.trip-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  gap: 0.5rem;
  flex-wrap: wrap;
  font-size: 0.85rem;
}

.trip-earnings,
.trip-price {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  font-weight: 500;
}

.earnings-icon,
.price-icon {
  color: var(--eco-primary);
  font-size: 1rem;
}

.earnings-text,
.price-text {
  color: var(--color-light);
}

.trip-id {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.id-label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
}

.id-value {
  font-size: 0.95rem;
  color: var(--eco-primary);
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

/* Responsive */
@media (max-width: 768px) {
  .trip-card {
    padding: 1rem;
  }

  .trip-details {
    grid-template-columns: 1fr;
  }

  .route-addresses {
    flex-direction: column;
    align-items: flex-start;
  }

  .trip-card-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .trip-id {
    margin-left: 0;
  }
}
</style>
