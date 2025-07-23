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
            <span v-if="activeTab === 'passenger'" class="tab-content action-mode">
              <span class="icon">🔍</span>
              Rechercher un EcoRide
            </span>
            <span v-else class="tab-content normal-mode">
              <span class="icon">📅</span>
              Voir mes réservations
            </span>
          </button>
        </div>

        <div class="tab-wrapper">
          <button @click="handleDriverTab" :class="['tab-btn', { active: activeTab === 'driver' }]">
            <span v-if="activeTab === 'driver'" class="tab-content action-mode">
              <span class="icon">➕</span>
              Proposer un nouvel EcoRide
            </span>
            <span v-else class="tab-content normal-mode">
              <span class="icon">🚗</span>
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
          <div class="become-driver-icon">🚗</div>
          <h3>Devenez conducteur</h3>
          <p>Vous n'êtes pas encore conducteur sur EcoRide.</p>
          <p class="become-driver-description">En devenant conducteur, vous pourrez :</p>
          <ul class="benefit-list">
            <li>🎯 Proposer vos trajets à la communauté</li>
            <li>💰 Gagner des crédits en partageant vos frais</li>
            <li>🌱 Réduire votre empreinte carbone</li>
            <li>🤝 Rencontrer de nouvelles personnes</li>
          </ul>
          <div class="become-driver-actions">
            <button @click="becomeDriver" class="become-driver-btn">🚗 Devenir conducteur</button>
            <router-link to="/help" class="learn-more-btn"> 📚 En savoir plus </router-link>
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
            <div class="error-icon">❌</div>
            <h3>Erreur de chargement</h3>
            <p>{{ error }}</p>
            <button @click="loadTrips" class="retry-btn">Réessayer</button>
          </div>

          <!-- Aucun trajet -->
          <div v-else-if="trips.length === 0" class="empty-state">
            <div class="empty-icon">🚗</div>
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
                <span class="stat-number">{{ getStatsByStatus('terminé').length }}</span>
                <span class="stat-label"
                  >EcoRide{{ getStatsByStatus('terminé').length > 1 ? 's' : '' }} effectué{{
                    getStatsByStatus('terminé').length > 1 ? 's' : ''
                  }}</span
                >
              </div>
              <div class="stat-card upcoming-trips">
                <span class="stat-number">{{ getStatsByStatus('prévu').length }}</span>
                <span class="stat-label">À venir</span>
              </div>
              <div class="stat-card passengers-transported">
                <span class="stat-number">{{ getTotalParticipants() }}</span>
                <span class="stat-label"
                  >Passager{{ getTotalParticipants() > 1 ? 's' : '' }} transporté{{
                    getTotalParticipants() > 1 ? 's' : ''
                  }}</span
                >
              </div>
              <div class="stat-card eco-impact">
                <span class="stat-number">{{ getCarbonSaved() }}</span>
                <span class="stat-label">kg CO₂ économisés</span>
                <span class="stat-subtext">🌱 Impact écologique</span>
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
                    Tous
                  </button>
                  <button
                    @click="selectedStatus = 'prévu'"
                    :class="['status-btn', { active: selectedStatus === 'prévu' }]"
                  >
                    📅 Prévus
                  </button>
                  <button
                    @click="selectedStatus = 'démarré'"
                    :class="['status-btn', { active: selectedStatus === 'démarré' }]"
                  >
                    🚗 En cours
                  </button>
                  <button
                    @click="selectedStatus = 'terminé'"
                    :class="['status-btn', { active: selectedStatus === 'terminé' }]"
                  >
                    ✅ Terminés
                  </button>
                  <button
                    @click="selectedStatus = 'annulé'"
                    :class="['status-btn', { active: selectedStatus === 'annulé' }]"
                  >
                    ❌ Annulés
                  </button>
                </div>
              </div>
              <div class="filter-group">
                <label for="sort-filter">Trier par :</label>
                <select id="sort-filter" v-model="sortOrder" class="filter-select">
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
              <div class="no-trips-icon">📭</div>
              <h3>Aucun EcoRide {{ getStatusEmptyMessage(selectedStatus) }}</h3>
              <p>
                Réduisez les embouteillages et
                <router-link to="/create-trip" class="invite-link">proposez un EcoRide</router-link>
                !
              </p>
            </div>

            <div v-else class="trips-grid">
              <div
                v-for="trip in filteredAndSortedTrips"
                :key="trip.id"
                class="trip-card"
                :class="[
                  `status-${trip.status}`,
                  { 'has-participants': trip.participants_count > 0 },
                ]"
              >
                <!-- Header de la carte -->
                <div class="trip-card-header">
                  <div class="trip-status">
                    <span :class="['status-badge', `status-${trip.status}`]">
                      {{ getStatusIcon(trip.status) }} {{ getStatusLabel(trip.status) }}
                    </span>
                  </div>
                  <div class="trip-actions">
                    <button
                      v-if="trip.status === 'prévu'"
                      @click="startTrip(trip.id)"
                      class="action-btn-small start"
                      title="Démarrer le trajet"
                    >
                      ▶️
                    </button>
                    <button
                      v-if="trip.status === 'démarré'"
                      @click="finishTrip(trip.id)"
                      class="action-btn-small finish"
                      title="Terminer le trajet"
                    >
                      🏁
                    </button>
                    <button
                      v-if="['prévu', 'démarré'].includes(trip.status)"
                      @click="cancelTrip(trip.id)"
                      class="action-btn-small cancel"
                      title="Annuler le trajet"
                    >
                      ❌
                    </button>
                    <router-link
                      :to="`/carpoolings/${trip.id}`"
                      class="action-btn-small view"
                      title="Voir les détails"
                    >
                      👁️
                    </router-link>
                  </div>
                </div>

                <!-- Itinéraire -->
                <div class="trip-route">
                  <div class="route-info">
                    <span class="departure">📍 {{ trip.departure_address }}</span>
                    <div class="route-arrow">→</div>
                    <span class="destination">🎯 {{ trip.arrival_address }}</span>
                  </div>
                </div>

                <!-- Détails du voyage -->
                <div class="trip-details">
                  <div class="detail-item">
                    <span class="detail-icon">📅</span>
                    <div class="detail-content">
                      <span class="detail-label">Date de départ</span>
                      <span class="detail-value">{{ formatDate(trip.departure_datetime) }}</span>
                      <span class="detail-time">{{ formatTime(trip.departure_datetime) }}</span>
                    </div>
                  </div>

                  <div class="detail-item">
                    <span class="detail-icon">⏱️</span>
                    <div class="detail-content">
                      <span class="detail-label">Durée estimée</span>
                      <span class="detail-value">{{
                        formatDuration(trip.departure_datetime, trip.arrival_datetime)
                      }}</span>
                    </div>
                  </div>

                  <div class="detail-item">
                    <span class="detail-icon">💰</span>
                    <div class="detail-content">
                      <span class="detail-label">Prix par personne</span>
                      <span class="detail-value">{{ trip.price_per_passenger }} crédits</span>
                    </div>
                  </div>

                  <div class="detail-item">
                    <span class="detail-icon">👥</span>
                    <div class="detail-content">
                      <span class="detail-label">Participants</span>
                      <span class="detail-value">
                        {{ trip.participants_count || 0 }} / {{ trip.initial_seats_offered }}
                        <span class="seats-remaining"
                          >({{ trip.seats_remaining }} restante{{
                            trip.seats_remaining > 1 ? 's' : ''
                          }})</span
                        >
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Véhicule -->
                <div class="trip-vehicle" v-if="trip.model">
                  <span class="vehicle-icon">🚗</span>
                  <span class="vehicle-info">{{ trip.model }} ({{ trip.plate_number }})</span>
                </div>

                <!-- Footer de la carte -->
                <div class="trip-card-footer">
                  <div
                    class="trip-earnings"
                    v-if="trip.status === 'terminé' && trip.participants_count > 0"
                  >
                    <span class="earnings-icon">💵</span>
                    <span class="earnings-text">
                      Revenus estimés : {{ calculateEarnings(trip) }} crédits
                    </span>
                  </div>
                  <div class="trip-id">
                    <span class="id-label">ID :</span>
                    <span class="id-value">#{{ trip.id }}</span>
                  </div>
                </div>
              </div>
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
          <div class="error-icon">❌</div>
          <h3>Erreur de chargement</h3>
          <p>{{ error }}</p>
          <button @click="loadParticipations" class="retry-btn">Réessayer</button>
        </div>

        <!-- Aucune participation -->
        <div v-else-if="participations.length === 0" class="empty-state">
          <div class="empty-icon">🎫</div>
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
              <span class="stat-number">{{ getParticipationStatsByStatus('terminé').length }}</span>
              <span class="stat-label"
                >Voyage{{
                  getParticipationStatsByStatus('terminé').length > 1 ? 's' : ''
                }}
                effectué{{ getParticipationStatsByStatus('terminé').length > 1 ? 's' : '' }}</span
              >
            </div>
            <div class="stat-card upcoming-trips">
              <span class="stat-number">{{ getParticipationStatsByStatus('prévu').length }}</span>
              <span class="stat-label">À venir</span>
            </div>
            <div class="stat-card passengers-transported">
              <span class="stat-number">{{ getTotalSpent() }}</span>
              <span class="stat-label">Crédits dépensés</span>
            </div>
            <div class="stat-card eco-impact">
              <span class="stat-number">{{ participations.length }}</span>
              <span class="stat-label"
                >Participation{{ participations.length > 1 ? 's' : '' }} total{{
                  participations.length > 1 ? 'es' : 'e'
                }}</span
              >
              <span class="stat-subtext">🎫 Historique complet</span>
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
                  Tous
                </button>
                <button
                  @click="selectedStatus = 'prévu'"
                  :class="['status-btn', { active: selectedStatus === 'prévu' }]"
                >
                  📅 Prévus
                </button>
                <button
                  @click="selectedStatus = 'démarré'"
                  :class="['status-btn', { active: selectedStatus === 'démarré' }]"
                >
                  🚗 En cours
                </button>
                <button
                  @click="selectedStatus = 'terminé'"
                  :class="['status-btn', { active: selectedStatus === 'terminé' }]"
                >
                  ✅ Terminés
                </button>
                <button
                  @click="selectedStatus = 'annulé'"
                  :class="['status-btn', { active: selectedStatus === 'annulé' }]"
                >
                  ❌ Annulés
                </button>
              </div>
            </div>
            <div class="filter-group">
              <label for="sort-filter-passenger">Trier par :</label>
              <select id="sort-filter-passenger" v-model="sortOrder" class="filter-select">
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
            <div class="no-trips-icon">�</div>
            <h3>Aucune participation {{ getStatusEmptyMessage(selectedStatus) }}</h3>
            <p>
              Découvrez les
              <router-link to="/search" class="invite-link">EcoRides disponibles</router-link>
              !
            </p>
          </div>

          <div v-else class="trips-grid">
            <div
              v-for="participation in filteredAndSortedParticipations"
              :key="`${participation.carpooling_id}-${participation.id}`"
              class="trip-card participation-card"
              :class="[
                `status-${participation.carpooling_status}`,
                { 'is-cancelled': participation.cancellation_date },
              ]"
            >
              <!-- Header de la carte -->
              <div class="trip-card-header">
                <div class="trip-status">
                  <span :class="['status-badge', `status-${participation.carpooling_status}`]">
                    {{ getStatusIcon(participation.carpooling_status) }}
                    {{ getStatusLabel(participation.carpooling_status) }}
                  </span>
                  <span v-if="participation.cancellation_date" class="cancellation-badge">
                    � Annulée
                  </span>
                </div>
                <div class="trip-actions">
                  <router-link
                    :to="`/carpoolings/${participation.carpooling_id}`"
                    class="action-btn-small view"
                    title="Voir les détails"
                  >
                    👁️
                  </router-link>
                  <button
                    v-if="canCancelParticipation(participation)"
                    @click="cancelParticipation(participation.carpooling_id)"
                    class="action-btn-small cancel"
                    title="Annuler la participation"
                  >
                    ❌
                  </button>
                </div>
              </div>

              <!-- Itinéraire -->
              <div class="trip-route">
                <div class="route-info">
                  <div class="route-addresses">
                    <div class="departure">
                      <span class="icon">🟢</span>
                      <span class="address">{{ participation.departure_address }}</span>
                    </div>
                    <div class="route-arrow">
                      <span class="arrow">↓</span>
                    </div>
                    <div class="arrival">
                      <span class="icon">🔴</span>
                      <span class="address">{{ participation.arrival_address }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Détails du voyage -->
              <div class="trip-details">
                <div class="trip-schedule">
                  <div class="schedule-item">
                    <span class="schedule-label">📅 Date :</span>
                    <span class="schedule-value">{{
                      formatDate(participation.departure_datetime)
                    }}</span>
                  </div>
                  <div class="schedule-item">
                    <span class="schedule-label">🕒 Heure :</span>
                    <span class="schedule-value">
                      {{ formatTime(participation.departure_datetime) }} -
                      {{ formatTime(participation.arrival_datetime) }}
                    </span>
                  </div>
                  <div class="schedule-item">
                    <span class="schedule-label">⏱️ Durée :</span>
                    <span class="schedule-value">
                      {{
                        formatDuration(
                          participation.departure_datetime,
                          participation.arrival_datetime,
                        )
                      }}
                    </span>
                  </div>
                </div>

                <div class="trip-info">
                  <div class="info-item driver-info">
                    <span class="info-label">👨‍✈️ Conducteur :</span>
                    <span class="info-value">{{ participation.driver_pseudo }}</span>
                  </div>
                  <div class="info-item vehicle-info">
                    <span class="info-label">🚗 Véhicule :</span>
                    <span class="info-value"
                      >{{ participation.model }} ({{ participation.plate_number }})</span
                    >
                  </div>
                  <div class="info-item price-info">
                    <span class="info-label">💰 Prix payé :</span>
                    <span class="info-value price">{{ participation.credits_paid }} crédits</span>
                  </div>
                  <div v-if="participation.participation_date" class="info-item date-info">
                    <span class="info-label">📝 Réservé le :</span>
                    <span class="info-value">{{
                      formatDate(participation.participation_date)
                    }}</span>
                  </div>
                  <div v-if="participation.cancellation_date" class="info-item cancellation-info">
                    <span class="info-label">❌ Annulé le :</span>
                    <span class="info-value">{{
                      formatDate(participation.cancellation_date)
                    }}</span>
                  </div>
                </div>
              </div>

              <!-- Footer de la carte -->
              <div class="trip-card-footer">
                <div class="trip-id">
                  <span class="id-label">ID :</span>
                  <span class="id-value">#{{ participation.carpooling_id }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { carpoolingService, participationService } from '@/services/api'
import { showAlert, showConfirm, showError } from '@/composables/useModal'

export default {
  name: 'MyTripsView',
  setup() {
    const trips = ref([])
    const participations = ref([])
    const loading = ref(true)
    const error = ref(null)
    const selectedStatus = ref('')
    const sortOrder = ref('date-desc')
    const activeTab = ref('passenger') // Onglet passager par défaut
    const isDriver = ref(false) // État conducteur de l'utilisateur

    // Vérifier si l'utilisateur est conducteur
    const checkDriverStatus = async () => {
      try {
        await carpoolingService.getDriverTrips()
        isDriver.value = true
      } catch (err) {
        // Si erreur d'autorisation, l'utilisateur n'est pas conducteur
        if (
          err.response?.status === 403 ||
          err.response?.status === 401 ||
          err.response?.data?.message?.includes('conducteur') ||
          err.response?.data?.message?.includes('driver')
        ) {
          isDriver.value = false
        } else {
          // Pour d'autres erreurs, on considère qu'il pourrait être conducteur
          isDriver.value = true
        }
      }
    }

    // Charger les trajets
    const loadTrips = async () => {
      try {
        loading.value = true
        error.value = null

        const response = await carpoolingService.getDriverTrips()
        trips.value = response.carpoolings || []

        // Si on arrive ici sans erreur, l'utilisateur est conducteur
        isDriver.value = true
      } catch (err) {
        console.error('Erreur lors du chargement des trajets:', err)

        // Si erreur 403/401 ou message indiquant que l'utilisateur n'est pas conducteur
        if (
          err.response?.status === 403 ||
          err.response?.status === 401 ||
          err.response?.data?.message?.includes('conducteur') ||
          err.response?.data?.message?.includes('driver')
        ) {
          isDriver.value = false
          error.value = null // Pas d'erreur à afficher, juste pas conducteur
        } else {
          error.value = err.response?.data?.message || 'Erreur lors du chargement des trajets'
          isDriver.value = true // Considérer comme conducteur si erreur technique
        }
      } finally {
        loading.value = false
      }
    }

    // Charger les participations
    const loadParticipations = async () => {
      try {
        loading.value = true
        error.value = null

        const response = await participationService.getMyParticipations()
        participations.value = response.participations || []
      } catch (err) {
        console.error('Erreur lors du chargement des participations:', err)
        error.value = err.response?.data?.message || 'Erreur lors du chargement des participations'
      } finally {
        loading.value = false
      }
    }

    // Trajets filtrés et triés
    const filteredAndSortedTrips = computed(() => {
      let filtered = trips.value

      // Filtrer par statut
      if (selectedStatus.value) {
        filtered = filtered.filter((trip) => trip.status === selectedStatus.value)
      }

      // Trier
      return filtered.sort((a, b) => {
        switch (sortOrder.value) {
          case 'date-asc':
            return new Date(a.departure_datetime) - new Date(b.departure_datetime)
          case 'date-desc':
            return new Date(b.departure_datetime) - new Date(a.departure_datetime)
          case 'status':
            return a.status.localeCompare(b.status)
          default:
            return new Date(b.departure_datetime) - new Date(a.departure_datetime)
        }
      })
    })

    // Participations filtrées et triées
    const filteredAndSortedParticipations = computed(() => {
      let filtered = participations.value

      // Filtrer par statut
      if (selectedStatus.value) {
        filtered = filtered.filter(
          (participation) => participation.carpooling_status === selectedStatus.value,
        )
      }

      // Trier
      return filtered.sort((a, b) => {
        switch (sortOrder.value) {
          case 'date-asc':
            return new Date(a.departure_datetime) - new Date(b.departure_datetime)
          case 'date-desc':
            return new Date(b.departure_datetime) - new Date(a.departure_datetime)
          case 'status':
            return a.carpooling_status.localeCompare(b.carpooling_status)
          default:
            return new Date(b.departure_datetime) - new Date(a.departure_datetime)
        }
      })
    })

    // Méthodes utilitaires
    const getStatsByStatus = (status) => {
      return trips.value.filter((trip) => trip.status === status)
    }

    const getParticipationStatsByStatus = (status) => {
      return participations.value.filter(
        (participation) => participation.carpooling_status === status,
      )
    }

    const getTotalParticipants = () => {
      return trips.value.reduce((total, trip) => total + (trip.participants_count || 0), 0)
    }

    const getTotalSpent = () => {
      return participations.value.reduce(
        (total, participation) => total + (participation.credits_paid || 0),
        0,
      )
    }

    const getCarbonSaved = () => {
      // Calcul de l'impact carbone économisé grâce au covoiturage
      // Estimation : 120g CO₂ par km par passager évité
      // Distance moyenne estimée basée sur la durée (1h = ~60km en moyenne)
      let totalCarbonSaved = 0

      trips.value.forEach((trip) => {
        if (trip.status === 'terminé' && trip.participants_count > 0) {
          // Estimer la distance basée sur la durée
          const start = new Date(trip.departure_datetime)
          const end = new Date(trip.arrival_datetime)
          const durationHours = (end - start) / (1000 * 60 * 60)
          const estimatedDistance = durationHours * 60 // 60km/h moyenne

          // CO₂ économisé = distance × participants × 0.12kg CO₂/km
          const carbonSavedForTrip = estimatedDistance * trip.participants_count * 0.12
          totalCarbonSaved += carbonSavedForTrip
        }
      })

      return Math.round(totalCarbonSaved)
    }

    const getStatusIcon = (status) => {
      const icons = {
        prévu: '📅',
        démarré: '🚗',
        terminé: '✅',
        annulé: '❌',
      }
      return icons[status] || '❓'
    }

    const getStatusLabel = (status) => {
      const labels = {
        prévu: 'Prévu',
        démarré: 'En cours',
        terminé: 'Terminé',
        annulé: 'Annulé',
      }
      return labels[status] || status
    }

    const getStatusEmptyMessage = (status) => {
      const messages = {
        prévu: 'prévu',
        démarré: 'en cours',
        terminé: 'terminé',
        annulé: 'annulé',
      }
      return messages[status] || status
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    }

    const formatTime = (dateString) => {
      return new Date(dateString).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    const formatDuration = (startDate, endDate) => {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffMinutes = Math.round((end - start) / (1000 * 60))

      const hours = Math.floor(diffMinutes / 60)
      const minutes = diffMinutes % 60

      if (hours > 0) {
        return `${hours}h${minutes > 0 ? minutes.toString().padStart(2, '0') : ''}`
      }
      return `${minutes}min`
    }

    const calculateEarnings = (trip) => {
      const participants = trip.participants_count || 0
      const pricePerPassenger = trip.price_per_passenger || 0
      const platformCommission = trip.platform_commission_earned || 2 // Commission de la plateforme par passager

      return Math.max(0, participants * pricePerPassenger - participants * platformCommission)
    }

    // Actions sur les trajets
    const startTrip = async (tripId) => {
      const confirmed = await showConfirm(
        'Êtes-vous sûr de vouloir démarrer ce trajet ?',
        'Démarrer le trajet',
      )
      if (confirmed) {
        try {
          await carpoolingService.startTrip(tripId)
          await loadTrips() // Recharger la liste
        } catch (err) {
          showError(
            'Erreur lors du démarrage du trajet : ' + (err.response?.data?.message || err.message),
          )
        }
      }
    }

    const finishTrip = async (tripId) => {
      const confirmed = await showConfirm(
        'Êtes-vous sûr de vouloir terminer ce trajet ?',
        'Terminer le trajet',
      )
      if (confirmed) {
        try {
          await carpoolingService.finishTrip(tripId)
          await loadTrips() // Recharger la liste
        } catch (err) {
          showError(
            'Erreur lors de la fin du trajet : ' + (err.response?.data?.message || err.message),
          )
        }
      }
    }

    const cancelTrip = async (tripId) => {
      const confirmed = await showConfirm(
        'Êtes-vous sûr de vouloir annuler ce trajet ? Cette action est irréversible.',
        'Annuler le trajet',
      )
      if (confirmed) {
        try {
          await carpoolingService.cancelTrip(tripId)
          await loadTrips() // Recharger la liste
        } catch (err) {
          showError(
            "Erreur lors de l'annulation du trajet : " +
              (err.response?.data?.message || err.message),
          )
        }
      }
    }

    // Vérifier si une participation peut être annulée
    const canCancelParticipation = (participation) => {
      // Impossible d'annuler si déjà annulée
      if (participation.cancellation_date) {
        return false
      }

      // Impossible d'annuler si le covoiturage est déjà démarré ou terminé
      if (participation.carpooling_status !== 'prévu') {
        return false
      }

      return true
    }

    // Annuler une participation
    const cancelParticipation = async (carpoolingId) => {
      const confirmed = await showConfirm(
        "Êtes-vous sûr de vouloir annuler votre participation ? Vous serez remboursé selon la politique d'annulation.",
        'Annuler la participation',
      )
      if (confirmed) {
        try {
          const result = await participationService.cancelParticipation(carpoolingId)
          await loadParticipations() // Recharger la liste

          // Afficher le message de succès avec les détails du remboursement
          let message = result.message
          if (result.creditsRefunded !== undefined) {
            message += `\n💰 Crédits remboursés: ${result.creditsRefunded}`
          }
          if (result.penalty && result.penalty > 0) {
            message += `\n⚠️ Pénalité appliquée: ${result.penalty} crédits`
          }

          showAlert(message, 'Participation annulée')
        } catch (err) {
          showError(
            "Erreur lors de l'annulation de la participation : " +
              (err.response?.data?.message || err.message),
          )
        }
      }
    }

    // Action pour devenir conducteur
    const becomeDriver = async () => {
      const confirmed = await showConfirm(
        'Voulez-vous devenir conducteur sur EcoRide ?',
        'Devenir conducteur',
      )
      if (confirmed) {
        try {
          // TODO: Ajouter l'appel API pour devenir conducteur
          // await userService.becomeDriver()
          isDriver.value = true
          showAlert('Félicitations ! Vous êtes maintenant conducteur sur EcoRide.', 'Succès')
        } catch (err) {
          showError(
            "Erreur lors de l'inscription en tant que conducteur : " +
              (err.response?.data?.message || err.message),
          )
        }
      }
    }

    // Gestion des onglets avec actions
    const handlePassengerTab = () => {
      if (activeTab.value === 'passenger') {
        // Si déjà sur l'onglet passager, rediriger vers recherche
        window.location.href = '/search'
      } else {
        // Sinon, changer vers l'onglet passager et charger les participations
        activeTab.value = 'passenger'
        loadParticipations()
      }
    }

    const handleDriverTab = () => {
      if (activeTab.value === 'driver') {
        // Si déjà sur l'onglet conducteur, rediriger vers création
        window.location.href = '/create-trip'
      } else {
        // Sinon, changer vers l'onglet conducteur et charger les trajets
        activeTab.value = 'driver'
        loadTrips()
      }
    }

    // Charger les données au montage
    onMounted(() => {
      checkDriverStatus() // Vérifier d'abord le statut conducteur
      if (activeTab.value === 'passenger') {
        loadParticipations() // Charger les participations si onglet passager actif
      } else {
        loadTrips() // Charger les trajets si onglet conducteur actif
      }
    })

    return {
      trips,
      participations,
      loading,
      error,
      selectedStatus,
      sortOrder,
      activeTab,
      isDriver,
      filteredAndSortedTrips,
      filteredAndSortedParticipations,
      loadTrips,
      loadParticipations,
      checkDriverStatus,
      getStatsByStatus,
      getParticipationStatsByStatus,
      getTotalParticipants,
      getTotalSpent,
      getCarbonSaved,
      getStatusIcon,
      getStatusLabel,
      getStatusEmptyMessage,
      formatDate,
      formatTime,
      formatDuration,
      calculateEarnings,
      startTrip,
      finishTrip,
      cancelTrip,
      canCancelParticipation,
      cancelParticipation,
      becomeDriver,
      handlePassengerTab,
      handleDriverTab,
    }
  },
}
</script>

<style scoped>
/* Vue principale */
.my-trips {
  min-height: 100vh;
  background-color: #1a1a1a;
  color: #e9ecef;
  padding: 2rem 1rem;
  padding-top: 5rem; /* Espace pour la navbar fixe (80px) */
}

/* Header */
.trips-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #adb5bd;
  margin: 0 0 2rem 0;
}

/* Onglets */
.tabs-container {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1.5rem;
}

.tab-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  border: 2px solid #4a5568;
  border-radius: 8px;
  background: #2d3748;
  color: #adb5bd;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 220px;
  justify-content: center;
}

.tab-btn:hover {
  border-color: #28a745;
  color: #28a745;
  background: #374151;
}

.tab-btn.active {
  border-color: #28a745;
  background: #28a745;
  color: white;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
}

.tab-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab-content.action-mode {
  font-weight: 700;
  font-size: 0.95rem;
}

.tab-content.action-mode .icon {
  font-size: 1.1rem;
}

.tab-content.normal-mode {
  font-size: 1rem;
}

.action-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #6b7280;
  opacity: 0;
  animation: fadeInHint 0.3s ease-in-out 0.5s forwards;
  white-space: nowrap;
}

.action-hint.invisible {
  opacity: 0 !important;
  animation: none;
}

.action-hint.left {
  order: -1; /* Place l'indice avant le bouton */
}

.action-hint.right {
  order: 1; /* Place l'indice après le bouton */
}

.hint-text {
  font-style: italic;
  font-weight: 500;
}

@keyframes fadeInHint {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 0.8;
    transform: translateX(0);
  }
}

/* Container principal */
.trips-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* États de chargement, erreur, vide */
.loading-state,
.error-state,
.empty-state,
.placeholder-state,
.become-driver-state {
  text-align: center;
  padding: 3rem 2rem;
  background: #2d3748;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  color: #e9ecef;
}

.placeholder-state,
.become-driver-state {
  max-width: 600px;
  margin: 0 auto;
}

.placeholder-icon,
.become-driver-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.placeholder-description,
.become-driver-description {
  font-size: 1.1rem;
  color: #adb5bd;
  margin: 1.5rem 0 1rem 0;
}

.feature-list,
.benefit-list {
  text-align: left;
  margin: 1.5rem 0;
  padding: 0;
  list-style: none;
}

.feature-list li,
.benefit-list li {
  padding: 0.75rem 0;
  border-bottom: 1px solid #4a5568;
  font-size: 1rem;
  color: #e9ecef;
}

.feature-list li:last-child,
.benefit-list li:last-child {
  border-bottom: none;
}

.coming-soon,
.become-driver-actions {
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.coming-soon-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
  color: #212529;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.become-driver-btn {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
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
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.learn-more-btn {
  background: #2d3748;
  color: #e9ecef;
  border: 2px solid #4a5568;
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
  background: #374151;
  border-color: #28a745;
  color: #28a745;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #28a745;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-icon,
.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.retry-btn,
.create-first-trip-btn {
  background: #28a745;
  color: white;
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

.retry-btn:hover,
.create-first-trip-btn:hover {
  background: #218838;
}

/* Statistiques */
.trips-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #2d3748;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  text-align: center;
  border-left: 4px solid #28a745;
  position: relative;
  overflow: hidden;
}

/* Carte Trajets terminés - Vert */
.stat-card.completed-trips {
  background: linear-gradient(135deg, #2d3748 0%, #1a2e1a 100%);
  border-left-color: #22c55e;
}

.stat-card.completed-trips::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.stat-card.completed-trips .stat-number {
  color: #22c55e;
}

/* Carte À venir - Orange/Ambre */
.stat-card.upcoming-trips {
  background: linear-gradient(135deg, #2d3748 0%, #2a1f1a 100%);
  border-left-color: #f59e0b;
}

.stat-card.upcoming-trips::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.stat-card.upcoming-trips .stat-number {
  color: #f59e0b;
}

/* Carte Passagers transportés - Violet */
.stat-card.passengers-transported {
  background: linear-gradient(135deg, #2d3748 0%, #251a2e 100%);
  border-left-color: #8b5cf6;
}

.stat-card.passengers-transported::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.stat-card.passengers-transported .stat-number {
  color: #8b5cf6;
}

/* Carte Impact écologique - Turquoise (existante) */
.stat-card.eco-impact {
  background: linear-gradient(135deg, #2d3748 0%, #1a2332 100%);
  border-left-color: #20c997;
}

.stat-card.eco-impact::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(32, 201, 151, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.stat-card.eco-impact .stat-number {
  color: #20c997;
}

.stat-subtext {
  display: block;
  font-size: 0.75rem;
  color: #20c997;
  margin-top: 0.25rem;
  font-weight: 500;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #28a745;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #adb5bd;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Filtres */
.trips-filters {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  background: #2d3748;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 600;
  color: #e9ecef;
  font-size: 0.9rem;
}

.filter-select {
  padding: 0.5rem;
  border: 2px solid #4a5568;
  border-radius: 6px;
  font-size: 0.9rem;
  min-width: 150px;
  background: #374151;
  color: #e9ecef;
}

.filter-select:focus {
  outline: none;
  border-color: #28a745;
}

/* Boutons de statut */
.status-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.status-btn {
  padding: 0.5rem 1rem;
  border: 2px solid #4a5568;
  border-radius: 6px;
  background: #374151;
  color: #adb5bd;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.status-btn:hover {
  border-color: #28a745;
  color: #28a745;
  background: #2d3748;
}

.status-btn.active {
  border-color: #28a745;
  background: #28a745;
  color: white;
  box-shadow: 0 2px 4px rgba(40, 167, 69, 0.3);
}

/* Message aucun trajet pour statut */
.no-trips-status {
  text-align: center;
  padding: 3rem 2rem;
  background: #2d3748;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  color: #e9ecef;
  margin-bottom: 2rem;
}

.no-trips-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.7;
}

.invite-link {
  color: #28a745;
  text-decoration: none;
  font-weight: 600;
  position: relative;
  transition: all 0.3s ease;
}

.invite-link:hover {
  color: #20c997;
  text-shadow: 0 0 8px rgba(40, 167, 69, 0.5);
}

.invite-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #28a745, #20c997);
  transition: width 0.3s ease;
}

.invite-link:hover::after {
  width: 100%;
}

/* Grille des trajets */
.trips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

/* Cartes de trajet */
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

/* Header de carte */
.trip-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #374151;
  border-bottom: 1px solid #4a5568;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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

.trip-actions {
  display: flex;
  gap: 0.5rem;
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
  background: #28a745;
  color: white;
}

.action-btn-small.finish {
  background: #ffc107;
  color: #212529;
}

.action-btn-small.cancel {
  background: #dc3545;
  color: white;
}

.action-btn-small.view {
  background: #6c757d;
  color: white;
}

.action-btn-small:hover {
  transform: scale(1.1);
}

/* Itinéraire */
.trip-route {
  padding: 1rem 1.5rem;
}

.route-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-weight: 600;
}

.departure,
.destination {
  flex: 1;
  color: #e9ecef;
}

.route-arrow {
  color: #28a745;
  font-weight: 700;
  font-size: 1.2rem;
}

/* Détails du trajet */
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

/* Véhicule */
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

/* Footer de carte */
.trip-card-footer {
  padding: 1rem 1.5rem;
  background: #374151;
  border-top: 1px solid #4a5568;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.trip-earnings {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #28a745;
  font-weight: 600;
  font-size: 0.9rem;
}

.trip-id {
  font-size: 0.8rem;
  color: #adb5bd;
}

.id-label {
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .my-trips {
    padding: 1rem 0.5rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .tabs-container {
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .tab-wrapper {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }

  .action-hint.left,
  .action-hint.right {
    order: -1; /* Par défaut, au-dessus du bouton */
  }

  .action-hint.right {
    order: 1; /* L'indice droit (proposer) en dessous du bouton */
  }

  .tab-btn {
    width: 280px;
    justify-content: center;
  }

  .action-hint {
    justify-content: center;
    font-size: 0.75rem;
  }

  .trips-grid {
    grid-template-columns: 1fr;
  }

  .trips-filters {
    flex-direction: column;
    gap: 1rem;
  }

  .trips-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .trip-details {
    grid-template-columns: 1fr;
  }

  .trip-card-footer {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .trips-stats {
    grid-template-columns: 1fr;
  }
}

/* Styles spécifiques pour les participations */
.passenger-content {
  width: 100%;
}

.participations-list {
  width: 100%;
}

.participation-card {
  position: relative;
}

.participation-card.is-cancelled {
  opacity: 0.7;
  background: linear-gradient(135deg, #2d1b1b, #3d2d2d);
  border-left: 4px solid #dc3545;
}

.participation-card.is-cancelled::before {
  content: 'ANNULÉE';
  position: absolute;
  top: 10px;
  right: 10px;
  background: #dc3545;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: bold;
  z-index: 1;
}

.cancellation-badge {
  background: #dc3545;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-left: 0.5rem;
}

.driver-info .info-value {
  font-weight: 600;
  color: #28a745;
}

.vehicle-info .info-value {
  color: #6c757d;
  font-style: italic;
}

.price-info .info-value.price {
  color: #ffc107;
  font-weight: 600;
}

.cancellation-info .info-value {
  color: #dc3545;
  font-weight: 500;
}

/* Animation pour le changement d'onglet */
.passenger-content,
.driver-content {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
