<template>
  <div class="my-trips">
    <!-- Header -->
    <div class="trips-header">
      <h1 class="page-title">Mes Trajets</h1>
      <p class="page-subtitle">Gérez tous vos covoiturages en tant que conducteur</p>
    </div>

    <!-- Actions rapides -->
    <div class="quick-actions">
      <router-link to="/search" class="action-btn secondary">
        <span class="icon">🔍</span>
        Rechercher un trajet
      </router-link>
      <router-link to="/" class="action-btn primary">
        <span class="icon">➕</span>
        Créer un nouveau trajet
      </router-link>
    </div>

    <!-- Contenu principal -->
    <div class="trips-container">
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
        <h3>Aucun trajet trouvé</h3>
        <p>
          Vous n'avez pas encore créé de covoiturage. Commencez par proposer votre premier trajet !
        </p>
        <router-link to="/" class="create-first-trip-btn"> Créer mon premier trajet </router-link>
      </div>

      <!-- Liste des trajets -->
      <div v-else class="trips-list">
        <!-- Statistiques rapides -->
        <div class="trips-stats">
          <div class="stat-card completed-trips">
            <span class="stat-number">{{ getStatsByStatus('terminé').length }}</span>
            <span class="stat-label"
              >Trajet{{ getStatsByStatus('terminé').length > 1 ? 's' : '' }} effectué{{
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
            <label for="status-filter">Statut :</label>
            <select id="status-filter" v-model="selectedStatus" class="filter-select">
              <option value="">Tous les statuts</option>
              <option value="prévu">Prévus</option>
              <option value="démarré">En cours</option>
              <option value="terminé">Terminés</option>
              <option value="annulé">Annulés</option>
            </select>
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
        <div class="trips-grid">
          <div
            v-for="trip in filteredAndSortedTrips"
            :key="trip.id"
            class="trip-card"
            :class="[`status-${trip.status}`, { 'has-participants': trip.participants_count > 0 }]"
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
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { carpoolingService } from '@/services/api'

export default {
  name: 'MyTripsView',
  setup() {
    const trips = ref([])
    const loading = ref(true)
    const error = ref(null)
    const selectedStatus = ref('')
    const sortOrder = ref('date-desc')

    // Charger les trajets
    const loadTrips = async () => {
      try {
        loading.value = true
        error.value = null

        const response = await carpoolingService.getDriverTrips()
        trips.value = response.carpoolings || []
      } catch (err) {
        console.error('Erreur lors du chargement des trajets:', err)
        error.value = err.response?.data?.message || 'Erreur lors du chargement des trajets'
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

    // Méthodes utilitaires
    const getStatsByStatus = (status) => {
      return trips.value.filter((trip) => trip.status === status)
    }

    const getTotalParticipants = () => {
      return trips.value.reduce((total, trip) => total + (trip.participants_count || 0), 0)
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
      if (confirm('Êtes-vous sûr de vouloir démarrer ce trajet ?')) {
        try {
          await carpoolingService.startTrip(tripId)
          await loadTrips() // Recharger la liste
        } catch (err) {
          alert(
            'Erreur lors du démarrage du trajet : ' + (err.response?.data?.message || err.message),
          )
        }
      }
    }

    const finishTrip = async (tripId) => {
      if (confirm('Êtes-vous sûr de vouloir terminer ce trajet ?')) {
        try {
          await carpoolingService.finishTrip(tripId)
          await loadTrips() // Recharger la liste
        } catch (err) {
          alert('Erreur lors de la fin du trajet : ' + (err.response?.data?.message || err.message))
        }
      }
    }

    const cancelTrip = async (tripId) => {
      if (confirm('Êtes-vous sûr de vouloir annuler ce trajet ? Cette action est irréversible.')) {
        try {
          await carpoolingService.cancelTrip(tripId)
          await loadTrips() // Recharger la liste
        } catch (err) {
          alert(
            "Erreur lors de l'annulation du trajet : " +
              (err.response?.data?.message || err.message),
          )
        }
      }
    }

    // Charger les données au montage
    onMounted(() => {
      loadTrips()
    })

    return {
      trips,
      loading,
      error,
      selectedStatus,
      sortOrder,
      filteredAndSortedTrips,
      loadTrips,
      getStatsByStatus,
      getTotalParticipants,
      getCarbonSaved,
      getStatusIcon,
      getStatusLabel,
      formatDate,
      formatTime,
      formatDuration,
      calculateEarnings,
      startTrip,
      finishTrip,
      cancelTrip,
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
  margin: 0;
}

/* Actions rapides */
.quick-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.action-btn.primary {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.action-btn.secondary {
  background: #2d3748;
  color: #e9ecef;
  border: 2px solid #4a5568;
}

.action-btn.secondary:hover {
  background: #374151;
  border-color: #28a745;
  color: #28a745;
}

.action-btn .icon {
  font-size: 1.1rem;
}

/* Container principal */
.trips-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* États de chargement, erreur, vide */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  background: #2d3748;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  color: #e9ecef;
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

  .quick-actions {
    flex-direction: column;
    align-items: center;
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
</style>
