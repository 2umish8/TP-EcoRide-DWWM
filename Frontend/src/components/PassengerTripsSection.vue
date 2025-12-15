<template>
  <!-- Loading state -->
  <LoadingState
    v-if="loading"
    title="Chargement de vos participations..."
    message="Veuillez patienter..."
  />

  <!-- Error state -->
  <ErrorState
    v-else-if="error"
    title="Erreur de chargement"
    :message="error"
    @retry="loadParticipations"
  />

  <!-- Empty state -->
  <EmptyState
    v-else-if="participations.length === 0"
    :icon="['fas', 'ticket']"
    title="Aucune participation trouvée"
  >
    Vous n'avez pas encore participé à un covoiturage. Découvrez les EcoRides disponibles !
    <template #actions>
      <router-link to="/search" class="search-ecorides-btn"> Rechercher un EcoRide </router-link>
    </template>
  </EmptyState>

  <!-- Participations list -->
  <div v-else class="passenger-content">
    <!-- Statistics -->
    <div class="trips-stats">
      <BaseStatCard
        :number="getParticipationStatsByStatus('terminé').length"
        :label="`Voyage${getParticipationStatsByStatus('terminé').length > 1 ? 's' : ''} effectué${getParticipationStatsByStatus('terminé').length > 1 ? 's' : ''}`"
        variant="completed"
      />
      <BaseStatCard
        :number="getParticipationStatsByStatus('prévu').length"
        label="À venir"
        variant="upcoming"
      />
      <BaseStatCard :number="getTotalSpent()" label="Crédits dépensés" variant="passengers" />
      <BaseStatCard
        :number="participations.length"
        :label="`Participation${participations.length > 1 ? 's' : ''} total${participations.length > 1 ? 'es' : 'e'}`"
        subtext="Historique complet"
        variant="eco-impact"
      />
    </div>

    <!-- Filters -->
    <FilterBar
      :selected-status="selectedStatus"
      :sort-order="sortOrder"
      @update:selected-status="selectedStatus = $event"
      @update:sort-order="sortOrder = $event"
      sort-select-id="sort-filter-passenger"
    />

    <!-- No participations for selected status -->
    <EmptyState
      v-if="filteredAndSortedParticipations.length === 0 && selectedStatus"
      :icon="['fas', 'road']"
      :title="`Aucune participation ${getStatusEmptyMessage(selectedStatus)}`"
    >
      Découvrez les
      <router-link to="/search" class="invite-link">EcoRides disponibles</router-link>
      !
    </EmptyState>

    <!-- Participations grid -->
    <TripsGrid
      v-else
      :items="
        filteredAndSortedParticipations.map((participation) => ({
          trip: {
            id: participation.carpooling_id,
            departure_address: participation.departure_address,
            arrival_address: participation.arrival_address,
            departure_datetime: participation.departure_datetime,
            arrival_datetime: participation.arrival_datetime,
            price_per_passenger: participation.credits_paid,
            participants_count: 0,
            initial_seats_offered: 0,
            seats_remaining: 0,
            model: participation.model,
            plate_number: participation.plate_number,
            status: participation.carpooling_status,
            cancellation_date: participation.cancellation_date,
            credits_paid: participation.credits_paid,
          },
          showPrice: true,
          carpoolingId: participation.carpooling_id,
        }))
      "
    >
      <template #default="{ item }">
        <IconButton
          @click="$router.push(`/carpoolings/${item.carpoolingId}`)"
          title="Voir les détails"
        >
          <font-awesome-icon :icon="['fas', 'eye']" />
        </IconButton>
        <PrimaryButton
          v-if="canCancelParticipation(item)"
          @click="handleCancelParticipation(item.carpoolingId)"
          size="sm"
          title="Annuler la participation"
        >
          <font-awesome-icon :icon="['fas', 'xmark']" />
        </PrimaryButton>
      </template>
    </TripsGrid>
  </div>
</template>

<script setup>
import LoadingState from './LoadingState.vue'
import ErrorState from './ErrorState.vue'
import EmptyState from './EmptyState.vue'
import FilterBar from './FilterBar.vue'
import TripsGrid from './TripsGrid.vue'
import BaseStatCard from './ui/BaseStatCard.vue'
import PrimaryButton from '@/components/ui/PrimaryButton.vue'
import IconButton from '@/components/ui/IconButton.vue'
import useParticipations from '@/composables/useParticipations'
import useParticipationActions from '@/composables/useParticipationActions'
import { useRouter } from 'vue-router'
import { getStatusEmptyMessage } from '@/utils/formatters'

const router = useRouter()

const {
  participations,
  loading,
  error,
  selectedStatus,
  sortOrder,
  filteredAndSortedParticipations,
  loadParticipations,
  cancelParticipation,
  canCancelParticipation,
  getTotalSpent,
  getParticipationStatsByStatus,
} = useParticipations()

const { handleCancelParticipation: cancelParticipationAction } = useParticipationActions()

const handleCancelParticipation = (carpoolingId) =>
  cancelParticipationAction(cancelParticipation, carpoolingId)

defineExpose({
  loadParticipations,
})
</script>

<style scoped>
.passenger-content {
  width: 100%;
}

.trips-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.search-ecorides-btn {
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

.search-ecorides-btn:hover {
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
