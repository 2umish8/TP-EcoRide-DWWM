<template>
  <div class="my-trips">
    <!-- Header -->
    <div class="trips-header">
      <h1 class="page-title">Mes Trajets</h1>
      <p class="page-subtitle">Gérez tous vos covoiturages</p>
      <!-- Onglets Conducteur/Passager -->
      <div class="tabs-container">
        <div class="tab-wrapper">
          <div v-if="activeTab === 'passenger'" class="action-hint left">
            <span class="hint-text">Cliquez à nouveau pour</span>
          </div>
          <div v-else class="action-hint left invisible">
            <span class="hint-text">Cliquez à nouveau pour</span>
          </div>
          <button
            @click="handlePassengerTab"
            :class="['tab-btn', { active: activeTab === 'passenger' }]"
          >
            <span v-if="activeTab === 'passenger'" class="tab-content action-mode"
              ><font-awesome-icon :icon="['fas', 'magnifying-glass']" /> Rechercher un EcoRide </span
            ><span v-else class="tab-content normal-mode"
              ><font-awesome-icon :icon="['fas', 'calendar']" />
              Voir mes réservations
            </span>
          </button>
        </div>
        <div class="tab-wrapper">
          <button @click="handleDriverTab" :class="['tab-btn', { active: activeTab === 'driver' }]">
            <span v-if="activeTab === 'driver'" class="tab-content action-mode"
              ><font-awesome-icon :icon="['fas', 'plus']" /> Proposer un nouvel EcoRide </span
            ><span v-else class="tab-content normal-mode"
              ><font-awesome-icon :icon="['fas', 'car']" />
              Voir mes EcoRides proposés
            </span>
          </button>
          <div v-if="activeTab === 'driver'" class="action-hint right">
            <span class="hint-text">Cliquez à nouveau pour</span>
          </div>
          <div v-else class="action-hint right invisible">
            <span class="hint-text">Cliquez à nouveau pour</span>
          </div>
        </div>
      </div>
    </div>
    <!-- Contenu principal -->
    <div class="trips-container">
      <!-- Vue Conducteur -->
      <div v-if="activeTab === 'driver'" class="driver-content">
        <!-- Vérification si l'utilisateur est conducteur -->
        <div v-if="!isDriver" class="become-driver-state">
          <div class="become-driver-icon"><font-awesome-icon :icon="['fas', 'car']" /></div>
          <h3>Devenez conducteur EcoRide</h3>
          <p>Vous n'êtes pas encore conducteur sur EcoRide.</p>
          <p class="become-driver-description">En devenant conducteur, vous pourrez :</p>
          <ul class="benefit-list">
            <li>
              <font-awesome-icon :icon="['fas', 'bullseye']" /> Proposer vos trajets à la communauté
            </li>
            <li>
              <font-awesome-icon :icon="['fas', 'coins']" /> Gagner des crédits en partageant vos
              frais
            </li>
            <li><font-awesome-icon :icon="['fas', 'leaf']" /> Réduire votre empreinte carbone</li>
            <li>
              <font-awesome-icon :icon="['fas', 'handshake']" /> Rencontrer de nouvelles personnes
            </li>
            <li>
              <font-awesome-icon :icon="['fas', 'star']" /> Recevoir des avis de vos passagers
            </li>
          </ul>
          <div class="become-driver-notice">
            <p>
              <strong
                ><font-awesome-icon :icon="['fas', 'clipboard-list']" /> Processus d'inscription
                requis :</strong
              >
            </p>
            <ul>
              <li>
                <font-awesome-icon :icon="['fas', 'circle-check']" /> Informations de votre véhicule
              </li>
              <li>
                <font-awesome-icon :icon="['fas', 'circle-check']" /> Vos préférences de conduite
              </li>
              <li>
                <font-awesome-icon :icon="['fas', 'circle-check']" /> Engagement de conduite
                responsable
              </li>
            </ul>
          </div>
          <div class="become-driver-actions">
            <router-link to="/become-driver" class="become-driver-btn"
              ><font-awesome-icon :icon="['fas', 'car']" /> Commencer l'inscription chauffeur </router-link
            ><router-link to="/help" class="learn-more-btn"
              ><font-awesome-icon :icon="['fas', 'book']" /> En savoir plus
            </router-link>
          </div>
        </div>
        <!-- Contenu conducteur normal -->
        <div v-else>
          <!-- État de chargement -->
          <div v-if="loading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>Chargement de vos trajets...</p>
          </div>
          <!-- État d'erreur -->
          <div v-else-if="error" class="error-state">
            <div class="error-icon"><font-awesome-icon :icon="['fas', 'xmark']" /></div>
            <h3>Erreur de chargement</h3>
            <p>{{ error }}</p>
            <button @click="loadTrips" class="retry-btn">Réessayer</button>
          </div>
          <!-- Aucun trajet -->
          <div v-else-if="trips.length === 0" class="empty-state">
            <div class="empty-icon"><font-awesome-icon :icon="['fas', 'car']" /></div>
            <h3>Aucun EcoRide trouvé</h3>
            <p>
              Vous n'avez pas encore créé de covoiturage. Commencez par proposer votre premier
              EcoRide !
            </p>
            <router-link to="/create-trip" class="create-first-trip-btn">
              Créer mon premier EcoRide
            </router-link>
          </div>
          <!-- Liste des trajets conducteur -->
          <div v-else class="trips-list">
            <!-- Statistiques rapides -->
            <div class="trips-stats">
              <div class="stat-card completed-trips">
                <span class="stat-number">{{ getStatsByStatus('terminé').length }}</span
                ><span class="stat-label"
                  >EcoRide{{ getStatsByStatus('terminé').length > 1 ? 's' : '' }} effectué{{
                    getStatsByStatus('terminé').length > 1 ? 's' : ''
                  }}</span
                >
              </div>
              <div class="stat-card upcoming-trips">
                <span class="stat-number">{{ getStatsByStatus('prévu').length }}</span
                ><span class="stat-label">À venir</span>
              </div>
              <div class="stat-card passengers-transported">
                <span class="stat-number">{{ getTotalParticipants() }}</span
                ><span class="stat-label"
                  >Passager{{ getTotalParticipants() > 1 ? 's' : '' }} transporté{{
                    getTotalParticipants() > 1 ? 's' : ''
                  }}</span
                >
              </div>
              <div class="stat-card eco-impact">
                <span class="stat-number">{{ getCarbonSaved() }}</span
                ><span class="stat-label">kg CO₂ économisés</span
                ><span class="stat-subtext"
                  ><font-awesome-icon :icon="['fas', 'leaf']" /> Impact écologique</span
                >
              </div>
            </div>
            <!-- Filtres -->
            <div class="trips-filters">
              <div class="filter-group">
                <label>Filtrer par statut :</label>
                <div class="status-buttons">
                  <button
                    @click="selectedStatus = ''"
                    :class="['status-btn', { active: selectedStatus === '' }]"
                  >
                    Tous</button
                  ><button
                    @click="selectedStatus = 'prévu'"
                    :class="['status-btn', { active: selectedStatus === 'prévu' }]"
                  >
                    <font-awesome-icon :icon="['fas', 'calendar']" /> Prévus</button
                  ><button
                    @click="selectedStatus = 'démarré'"
                    :class="['status-btn', { active: selectedStatus === 'démarré' }]"
                  >
                    <font-awesome-icon :icon="['fas', 'car']" /> En cours</button
                  ><button
                    @click="selectedStatus = 'terminé'"
                    :class="['status-btn', { active: selectedStatus === 'terminé' }]"
                  >
                    <font-awesome-icon :icon="['fas', 'circle-check']" /> Terminés</button
                  ><button
                    @click="selectedStatus = 'annulé'"
                    :class="['status-btn', { active: selectedStatus === 'annulé' }]"
                  >
                    <font-awesome-icon :icon="['fas', 'xmark']" /> Annulés
                  </button>
                </div>
              </div>
              <div class="filter-group">
                <label for="sort-filter">Trier par :</label
                ><select id="sort-filter" v-model="sortOrder" class="filter-select">
                  <option value="date-desc">Plus récents</option>
                  <option value="date-asc">Plus anciens</option>
                  <option value="status">Statut</option>
                </select>
              </div>
            </div>
            <!-- Trajets -->
            <div
              v-if="filteredAndSortedTrips.length === 0 && selectedStatus"
              class="no-trips-status"
            >
              <div class="no-trips-icon"><font-awesome-icon :icon="['fas', 'inbox']" /></div>
              <h3>Aucun EcoRide {{ getStatusEmptyMessage(selectedStatus) }}</h3>
              <p>
                Réduisez les embouteillages et
                <router-link to="/create-trip" class="invite-link">proposez un EcoRide</router-link>
                !
              </p>
            </div>
            <div v-else class="trips-grid">
              <trip-card
                v-for="trip in filteredAndSortedTrips"
                :key="trip.id"
                :trip="trip"
                :show-earnings="true"
                ><template #actions
                  ><button
                    v-if="trip.status === 'prévu'"
                    @click="handleStartTrip(trip.id)"
                    class="action-btn-small start"
                    title="Démarrer le trajet"
                  >
                    ▶️</button
                  ><button
                    v-if="trip.status === 'démarré'"
                    @click="handleFinishTrip(trip.id)"
                    class="action-btn-small finish"
                    title="Terminer le trajet"
                  >
                    <font-awesome-icon :icon="['fas', 'flag-checkered']" /></button
                  ><button
                    v-if="['prévu', 'démarré'].includes(trip.status)"
                    @click="handleCancelTrip(trip.id)"
                    class="action-btn-small cancel"
                    title="Annuler le trajet"
                  >
                    <font-awesome-icon :icon="['fas', 'xmark']" /></button
                  ><router-link
                    :to="`/carpoolings/${trip.id}`"
                    class="action-btn-small view"
                    title="Voir les détails"
                    ><font-awesome-icon :icon="['fas', 'eye']" /></router-link
                ></template>
              </trip-card>
            </div>
          </div>
        </div>
      </div>
      <!-- Vue Passager -->
      <div v-if="activeTab === 'passenger'" class="passenger-content">
        <!-- État de chargement -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Chargement de vos participations...</p>
        </div>
        <!-- État d'erreur -->
        <div v-else-if="error" class="error-state">
          <div class="error-icon"><font-awesome-icon :icon="['fas', 'xmark']" /></div>
          <h3>Erreur de chargement</h3>
          <p>{{ error }}</p>
          <button @click="loadParticipations" class="retry-btn">Réessayer</button>
        </div>
        <!-- Aucune participation -->
        <div v-else-if="participations.length === 0" class="empty-state">
          <div class="empty-icon"><font-awesome-icon :icon="['fas', 'ticket']" /></div>
          <h3>Aucune participation trouvée</h3>
          <p>
            Vous n'avez pas encore participé à un covoiturage. Découvrez les EcoRides disponibles !
          </p>
          <router-link to="/search" class="create-first-trip-btn">
            Rechercher un EcoRide
          </router-link>
        </div>
        <!-- Liste des participations -->
        <div v-else class="participations-list">
          <!-- Statistiques rapides -->
          <div class="trips-stats">
            <div class="stat-card completed-trips">
              <span class="stat-number">{{ getParticipationStatsByStatus('terminé').length }}</span
              ><span class="stat-label"
                >Voyage{{
                  getParticipationStatsByStatus('terminé').length > 1 ? 's' : ''
                }}
                effectué{{ getParticipationStatsByStatus('terminé').length > 1 ? 's' : '' }}</span
              >
            </div>
            <div class="stat-card upcoming-trips">
              <span class="stat-number">{{ getParticipationStatsByStatus('prévu').length }}</span
              ><span class="stat-label">À venir</span>
            </div>
            <div class="stat-card passengers-transported">
              <span class="stat-number">{{ getTotalSpent() }}</span
              ><span class="stat-label">Crédits dépensés</span>
            </div>
            <div class="stat-card eco-impact">
              <span class="stat-number">{{ participations.length }}</span
              ><span class="stat-label"
                >Participation{{ participations.length > 1 ? 's' : '' }} total{{
                  participations.length > 1 ? 'es' : 'e'
                }}</span
              ><span class="stat-subtext"
                ><font-awesome-icon :icon="['fas', 'ticket']" /> Historique complet</span
              >
            </div>
          </div>
          <!-- Filtres -->
          <div class="trips-filters">
            <div class="filter-group">
              <label>Filtrer par statut :</label>
              <div class="status-buttons">
                <button
                  @click="selectedStatus = ''"
                  :class="['status-btn', { active: selectedStatus === '' }]"
                >
                  Tous</button
                ><button
                  @click="selectedStatus = 'prévu'"
                  :class="['status-btn', { active: selectedStatus === 'prévu' }]"
                >
                  <font-awesome-icon :icon="['fas', 'calendar']" /> Prévus</button
                ><button
                  @click="selectedStatus = 'démarré'"
                  :class="['status-btn', { active: selectedStatus === 'démarré' }]"
                >
                  <font-awesome-icon :icon="['fas', 'car']" /> En cours</button
                ><button
                  @click="selectedStatus = 'terminé'"
                  :class="['status-btn', { active: selectedStatus === 'terminé' }]"
                >
                  <font-awesome-icon :icon="['fas', 'circle-check']" /> Terminés</button
                ><button
                  @click="selectedStatus = 'annulé'"
                  :class="['status-btn', { active: selectedStatus === 'annulé' }]"
                >
                  <font-awesome-icon :icon="['fas', 'xmark']" /> Annulés
                </button>
              </div>
            </div>
            <div class="filter-group">
              <label for="sort-filter-passenger">Trier par :</label
              ><select id="sort-filter-passenger" v-model="sortOrder" class="filter-select">
                <option value="date-desc">Plus récents</option>
                <option value="date-asc">Plus anciens</option>
                <option value="status">Statut</option>
              </select>
            </div>
          </div>
          <!-- Participations -->
          <div
            v-if="filteredAndSortedParticipations.length === 0 && selectedStatus"
            class="no-trips-status"
          >
            <div class="no-trips-icon"><font-awesome-icon :icon="['fas', 'road']" /></div>
            <h3>Aucune participation {{ getStatusEmptyMessage(selectedStatus) }}</h3>
            <p>
              Découvrez les
              <router-link to="/search" class="invite-link">EcoRides disponibles</router-link>
              !
            </p>
          </div>
          <div v-else class="trips-grid">
            <trip-card
              v-for="participation in filteredAndSortedParticipations"
              :key="`${participation.carpooling_id}-${participation.id}`"
              :trip="{
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
              }"
              :show-price="true"
              ><template #actions
                ><router-link
                  :to="`/carpoolings/${participation.carpooling_id}`"
                  class="action-btn-small view"
                  title="Voir les détails"
                  ><font-awesome-icon :icon="['fas', 'eye']" /></router-link
                ><button
                  v-if="canCancelParticipation(participation)"
                  @click="handleCancelParticipation(participation.carpooling_id)"
                  title="Annuler la participation"
                >
                  <font-awesome-icon :icon="['fas', 'xmark']" /></button
              ></template>
            </trip-card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { ref, computed, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import TripCard from '@/components/TripCard.vue'
import useTrips from '@/composables/useTrips'
import useParticipations from '@/composables/useParticipations'
import useDriverStatus from '@/composables/useDriverStatus'
import { formatDate, formatTime, formatDuration } from '@/composables/useDateFormatting'
import { getStatusLabel, getStatusIcon, getStatusEmptyMessage } from '@/utils/formatters'
import { calculateCarbonSaved, calculateEarnings } from '@/utils/helpers'

export default {
  name: 'MyTripsView',
  components: {
    TripCard,
  },
  setup() {
    const notificationStore = useNotificationStore()
    const activeTab = ref('passenger')

    // Composables
    const {
      trips,
      loading: tripsLoadingState,
      error: tripsErrorState,
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
      participations,
      loading: participationsLoadingState,
      error: participationsErrorState,
      filteredAndSortedParticipations,
      loadParticipations,
      cancelParticipation,
      canCancelParticipation,
      getTotalSpent,
      getParticipationStatsByStatus,
    } = useParticipations()

    const { isDriver, checkDriverStatus } = useDriverStatus()

    // Computed loading and error based on active tab
    const loading = computed(() => tripsLoadingState.value || participationsLoadingState.value)
    const error = computed(() => tripsErrorState.value || participationsErrorState.value)

    // Helper functions
    const getCarbonSaved = () => {
      return calculateCarbonSaved(trips.value)
    }

    const handleStartTrip = async (tripId) => {
      notificationStore.showInfo('Démarrage du trajet...')
      try {
        await startTrip(tripId)
      } catch (err) {
        notificationStore.showError(
          'Erreur lors du démarrage du trajet : ' + (err.response?.data?.message || err.message),
        )
      }
    }

    const handleFinishTrip = async (tripId) => {
      notificationStore.showInfo('Fin du trajet...')
      try {
        await finishTrip(tripId)
      } catch (err) {
        notificationStore.showError(
          'Erreur lors de la fin du trajet : ' + (err.response?.data?.message || err.message),
        )
      }
    }

    const handleCancelTrip = async (tripId) => {
      notificationStore.showInfo('Annulation du trajet...')
      try {
        await cancelTrip(tripId)
      } catch (err) {
        notificationStore.showError(
          "Erreur lors de l'annulation du trajet : " + (err.response?.data?.message || err.message),
        )
      }
    }

    const handleCancelParticipation = async (carpoolingId) => {
      try {
        const result = await cancelParticipation(carpoolingId)
        let message = result.message
        if (result.creditsRefunded !== undefined) {
          message += `\nCrédits remboursés: ${result.creditsRefunded}`
        }
        if (result.penalty && result.penalty > 0) {
          message += `\nPénalité appliquée: ${result.penalty} crédits`
        }
        notificationStore.showSuccess(message)
      } catch (err) {
        notificationStore.showError(
          "Erreur lors de l'annulation de la participation : " +
            (err.response?.data?.message || err.message),
        )
      }
    }

    const handlePassengerTab = () => {
      if (activeTab.value === 'passenger') {
        window.location.href = '/search'
      } else {
        activeTab.value = 'passenger'
        loadParticipations()
      }
    }

    const handleDriverTab = () => {
      if (activeTab.value === 'driver') {
        window.location.href = '/create-trip'
      } else {
        activeTab.value = 'driver'
        loadTrips()
      }
    }

    onMounted(() => {
      checkDriverStatus()
      if (activeTab.value === 'passenger') {
        loadParticipations()
      } else {
        loadTrips()
      }
    })

    return {
      activeTab,
      trips,
      participations,
      loading,
      error,
      selectedStatus,
      sortOrder,
      isDriver,
      filteredAndSortedTrips,
      filteredAndSortedParticipations,
      loadTrips,
      loadParticipations,
      getCarbonSaved,
      getStatsByStatus,
      getParticipationStatsByStatus,
      getTotalParticipants,
      getTotalSpent,
      formatDate,
      formatTime,
      formatDuration,
      calculateEarnings,
      getStatusLabel,
      getStatusIcon,
      getStatusEmptyMessage,
      handleStartTrip,
      handleFinishTrip,
      handleCancelTrip,
      handleCancelParticipation,
      canCancelParticipation,
      handlePassengerTab,
      handleDriverTab,
    }
  },
}
</script>
