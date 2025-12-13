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
.trip-card {
  background: #2d3748;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  border-left: 4px solid #4a5568;
}

.trip-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.trip-card.status-prévu {
  border-left-color: #007bff;
}

.trip-card.status-démarré {
  border-left-color: #ffc107;
}

.trip-card.status-terminé {
  border-left-color: #28a745;
}

.trip-card.status-annulé {
  border-left-color: #dc3545;
  opacity: 0.8;
}

.trip-card.is-cancelled {
  opacity: 0.7;
  background: linear-gradient(135deg, #2d1b1b, #3d2d2d);
  border-left: 4px solid #dc3545;
}

/* Header */
.trip-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #374151;
  border-bottom: 1px solid #4a5568;
}

.trip-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-badge.status-prévu {
  background: #e3f2fd;
  color: #1976d2;
}

.status-badge.status-démarré {
  background: #fff3cd;
  color: #856404;
}

.status-badge.status-terminé {
  background: #d4edda;
  color: #155724;
}

.status-badge.status-annulé {
  background: #f8d7da;
  color: #721c24;
}

.cancellation-badge {
  background: #dc3545;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.trip-actions {
  display: flex;
  gap: 0.5rem;
}

/* Route */
.trip-route {
  padding: 1rem 1.5rem;
}

.route-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.route-addresses {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.departure,
.arrival {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #e9ecef;
}

.icon {
  font-size: 0.9rem;
  color: #28a745;
}

.address {
  font-size: 0.95rem;
}

.route-arrow {
  display: flex;
  justify-content: center;
  color: #28a745;
  font-weight: 700;
  font-size: 1.2rem;
}

/* Details */
.trip-details {
  padding: 0 1.5rem 1rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.detail-icon {
  font-size: 1.1rem;
  margin-top: 0.2rem;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.detail-label {
  font-size: 0.8rem;
  color: #adb5bd;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-weight: 600;
  color: #e9ecef;
}

.detail-time {
  font-size: 0.9rem;
  color: #28a745;
  font-weight: 600;
}

.seats-remaining {
  font-size: 0.8rem;
  color: #adb5bd;
}

/* Vehicle */
.trip-vehicle {
  padding: 0 1.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #adb5bd;
}

.vehicle-icon {
  font-size: 1rem;
}

/* Footer */
.trip-card-footer {
  padding: 1rem 1.5rem;
  background: #374151;
  border-top: 1px solid #4a5568;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.trip-earnings,
.trip-price {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
}

.trip-earnings {
  color: #28a745;
}

.trip-price {
  color: #ffc107;
}

.earnings-icon,
.price-icon {
  font-size: 1rem;
}

.trip-id {
  font-size: 0.8rem;
  color: #adb5bd;
  margin-left: auto;
}

.id-label {
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .trip-details {
    grid-template-columns: 1fr;
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
