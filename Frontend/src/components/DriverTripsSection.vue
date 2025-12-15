<template>
  <!-- Non-driver state -->
  <BecomDriverPromo v-if="!isDriver">
    <template #actions>
      <router-link to="/become-driver" class="become-driver-btn">
        <font-awesome-icon :icon="['fas', 'car']" /> Commencer l'inscription chauffeur
      </router-link>
      <router-link to="/help" class="learn-more-btn">
        <font-awesome-icon :icon="['fas', 'book']" /> En savoir plus
      </router-link>
    </template>
  </BecomDriverPromo>

  <!-- Driver content -->
  <div v-else>
    <!-- Loading state -->
    <LoadingState
      v-if="loading"
      title="Chargement de vos trajets..."
      message="Veuillez patienter..."
    />

    <!-- Error state -->
    <ErrorState
      v-else-if="error"
      title="Erreur de chargement"
      :message="error"
      @retry="loadTrips"
    />

    <!-- Empty state -->
    <EmptyState v-else-if="trips.length === 0" :icon="['fas', 'car']" title="Aucun EcoRide trouvé">
      Vous n'avez pas encore créé de covoiturage. Commencez par proposer votre premier EcoRide !
      <template #actions>
        <router-link to="/create-trip" class="create-first-trip-btn">
          Créer mon premier EcoRide
        </router-link>
      </template>
    </EmptyState>

    <!-- Driver trips list -->
    <div v-else class="driver-trips-content">
      <!-- Statistics -->
      <div class="trips-stats">
        <BaseStatCard
          :number="getStatsByStatus('terminé').length"
          :label="`EcoRide${getStatsByStatus('terminé').length > 1 ? 's' : ''} effectué${getStatsByStatus('terminé').length > 1 ? 's' : ''}`"
          variant="completed"
        />
        <BaseStatCard
          :number="getStatsByStatus('prévu').length"
          label="À venir"
          variant="upcoming"
        />
        <BaseStatCard
          :number="getTotalParticipants()"
          :label="`Passager${getTotalParticipants() > 1 ? 's' : ''} transporté${getTotalParticipants() > 1 ? 's' : ''}`"
          variant="passengers"
        />
        <BaseStatCard
          :number="getCarbonSaved()"
          label="kg CO₂ économisés"
          subtext="Impact écologique"
          variant="eco-impact"
        />
      </div>

      <!-- Filters -->
      <FilterBar
        :selected-status="selectedStatus"
        :sort-order="sortOrder"
        @update:selected-status="selectedStatus = $event"
        @update:sort-order="sortOrder = $event"
      />

      <!-- No trips for selected status -->
      <EmptyState
        v-if="filteredAndSortedTrips.length === 0 && selectedStatus"
        :icon="['fas', 'inbox']"
        :title="`Aucun EcoRide ${getStatusEmptyMessage(selectedStatus)}`"
      >
        Réduisez les embouteillages et
        <router-link to="/create-trip" class="invite-link">proposez un EcoRide</router-link>
        !
      </EmptyState>

      <!-- Trips grid -->
      <TripsGrid
        v-else
        :items="
          filteredAndSortedTrips.map((trip) => ({
            trip,
            showEarnings: true,
          }))
        "
      >
        <template #default="{ item }">
          <PrimaryButton
            v-if="item.trip.status === 'prévu'"
            @click="handleStartTrip(item.trip.id)"
            size="sm"
            title="Démarrer le trajet"
          >
            ▶️
          </PrimaryButton>
          <PrimaryButton
            v-if="item.trip.status === 'démarré'"
            @click="handleFinishTrip(item.trip.id)"
            size="sm"
            title="Terminer le trajet"
          >
            <font-awesome-icon :icon="['fas', 'flag-checkered']" />
          </PrimaryButton>
          <PrimaryButton
            v-if="['prévu', 'démarré'].includes(item.trip.status)"
            @click="handleCancelTrip(item.trip.id)"
            size="sm"
            title="Annuler le trajet"
          >
            <font-awesome-icon :icon="['fas', 'xmark']" />
          </PrimaryButton>
          <IconButton
            @click="$router.push(`/carpoolings/${item.trip.id}`)"
            title="Voir les détails"
          >
            <font-awesome-icon :icon="['fas', 'eye']" />
          </IconButton>
        </template>
      </TripsGrid>
    </div>
  </div>
</template>

<script setup>
import BecomDriverPromo from './BecomDriverPromo.vue'
import LoadingState from './LoadingState.vue'
import ErrorState from './ErrorState.vue'
import EmptyState from './EmptyState.vue'
import FilterBar from './FilterBar.vue'
import TripsGrid from './TripsGrid.vue'
import BaseStatCard from './ui/BaseStatCard.vue'
import PrimaryButton from '@/components/ui/PrimaryButton.vue'
import IconButton from '@/components/ui/IconButton.vue'
import useTrips from '@/composables/useTrips'
import useTripsActions from '@/composables/useTripsActions'
import { calculateCarbonSaved } from '@/utils/helpers'
import { getStatusEmptyMessage } from '@/utils/formatters'

defineProps({
  isDriver: {
    type: Boolean,
    required: true,
  },
})

const {
  trips,
  loading,
  error,
  selectedStatus,
  sortOrder,
  filteredAndSortedTrips,
  loadTrips,
  startTrip,
  finishTrip,
  cancelTrip,
  getTotalParticipants,
  getStatsByStatus,
} = useTrips()
const {
  handleStartTrip: startTripAction,
  handleFinishTrip: finishTripAction,
  handleCancelTrip: cancelTripAction,
} = useTripsActions()

const handleStartTrip = (tripId) => startTripAction(startTrip, tripId)
const handleFinishTrip = (tripId) => finishTripAction(finishTrip, tripId)
const handleCancelTrip = (tripId) => cancelTripAction(cancelTrip, tripId)

const getCarbonSaved = () => calculateCarbonSaved(trips.value)

defineExpose({
  loadTrips,
})
</script>

<style scoped>
.driver-trips-content {
  width: 100%;
}

.trips-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.become-driver-btn {
  background: linear-gradient(135deg, var(--color-success) 0%, var(--color-secondary) 100%);
  color: var(--color-light);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.become-driver-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(143, 218, 179, 0.3);
}

.learn-more-btn {
  background: var(--color-dark-secondary);
  color: var(--color-light-secondary);
  border: 2px solid rgba(255, 255, 255, 0.2);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.learn-more-btn:hover {
  background: var(--color-dark-tertiary);
  border-color: var(--bs-primary);
  color: var(--bs-primary);
}

.create-first-trip-btn {
  background: var(--color-success);
  color: var(--color-light);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  margin-top: 1rem;
  transition: background-color 0.3s ease;
}

.create-first-trip-btn:hover {
  background: rgba(67, 197, 97, 0.8);
}

.invite-link {
  color: var(--color-success);
  text-decoration: none;
  font-weight: 600;
  position: relative;
  transition: all 0.3s ease;
}

.invite-link:hover {
  color: var(--color-primary);
  text-shadow: 0 0 8px rgba(143, 218, 179, 0.45);
}

.invite-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, rgba(143, 218, 179, 1), rgba(121, 208, 158, 0.85));
  transition: width 0.3s ease;
}

.invite-link:hover::after {
  width: 100%;
}

.action-btn-small {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 0.8rem;
}

.action-btn-small.start {
  background: var(--color-success);
  color: var(--color-light);
}

.action-btn-small.finish {
  background: var(--color-warning);
  color: var(--color-dark);
}

.action-btn-small.cancel {
  background: var(--color-error);
  color: var(--color-light);
}

.action-btn-small.view {
  background: var(--color-gray);
  color: var(--color-light);
}

.action-btn-small:hover {
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .trips-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .trips-stats {
    grid-template-columns: 1fr;
  }
}
</style>
