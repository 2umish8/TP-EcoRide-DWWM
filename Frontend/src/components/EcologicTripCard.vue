<template>
  <div
    class="ecologic-trip-card"
    :class="[
      `status-${trip.status}`,
      { 'has-participants': trip.participants_count > 0 },
      { 'is-cancelled': trip.cancellation_date },
    ]"
  >
    <!-- Ecologic Badge -->
    <div class="ecologic-badge">
      <font-awesome-icon :icon="['fas', 'leaf']" />
      Écologique
    </div>

    <!-- Header -->
    <div class="trip-card-header">
      <span :class="['status-badge', `status-${trip.status}`]">
        <font-awesome-icon :icon="['fas', getStatusIcon(trip.status)]" />
        {{ getStatusLabel(trip.status) }}
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
  name: 'EcologicTripCard',
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
.ecologic-trip-card {
  background:
    radial-gradient(
      400px 150px at 50% 100%,
      rgba(143, 218, 179, 0.15) 0%,
      var(--color-dark-tertiary) 70%
    ),
    var(--color-dark-tertiary);
  border: 2px solid var(--eco-primary);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  box-shadow:
    0 0 20px rgba(143, 218, 179, 0.3),
    0 4px 12px rgba(0, 0, 0, 0.3);
  position: relative;
}

.ecologic-trip-card:hover {
  border-color: var(--eco-primary);
  box-shadow:
    0 0 30px rgba(143, 218, 179, 0.5),
    0 6px 16px rgba(0, 0, 0, 0.4);
}

.ecologic-trip-card.is-cancelled {
  opacity: 0.7;
  filter: grayscale(0.3);
}

/* Ecologic Badge */
.ecologic-badge {
  position: absolute;
  top: -10px;
  right: 12px;
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

/* Header */
.trip-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-top: 0.2rem;
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

.status-badge.status-démarré {
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
  background: rgba(143, 218, 179, 0.05);
  border-radius: 6px;
  border: 1px solid rgba(143, 218, 179, 0.15);
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
  background: rgba(143, 218, 179, 0.05);
  border-radius: 6px;
  font-size: 0.8rem;
  border: 1px solid rgba(143, 218, 179, 0.15);
}

.vehicle-icon {
  color: var(--eco-primary);
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
  border-top: 1px solid rgba(143, 218, 179, 0.2);
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
  .ecologic-trip-card {
    padding: 1rem;
    padding-top: 2rem;
  }

  .ecologic-badge {
    top: 8px;
    right: 8px;
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
