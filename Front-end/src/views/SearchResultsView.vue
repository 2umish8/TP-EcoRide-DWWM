<template>
  <div class="search-results">
    <!-- Header avec critères de recherche -->
    <div class="search-header">
      <div class="search-criteria">
        <h1 class="results-title">
          {{ hasSearchCriteria ? 'Résultats de recherche' : 'Tous les covoiturages' }}
        </h1>
        <div class="criteria-details" v-if="hasSearchCriteria">
          <span class="route">{{ searchParams.from }} → {{ searchParams.to }}</span>
          <span class="date" v-if="searchParams.date">{{ formatDate(searchParams.date) }}</span>
        </div>
        <div class="criteria-details" v-else>
          <span class="browse-message">Parcourez tous les covoiturages disponibles</span>
        </div>
      </div>
      <div class="results-count">
        {{ formattedResults.length }} trajet{{ formattedResults.length > 1 ? 's' : '' }}
        {{ hasSearchCriteria ? 'trouvé' : 'disponible'
        }}{{ formattedResults.length > 1 ? 's' : '' }}
      </div>
    </div>

    <!-- Formulaire de recherche compact -->
    <div class="search-form-compact">
      <div class="search-inputs-compact">
        <input
          type="text"
          placeholder="Départ"
          v-model="newSearchParams.from"
          class="search-input-compact"
        />
        <input
          type="text"
          placeholder="Destination"
          v-model="newSearchParams.to"
          class="search-input-compact"
        />
        <input
          type="date"
          v-model="newSearchParams.date"
          class="search-input-compact"
          :min="new Date().toISOString().split('T')[0]"
        />
        <button @click="performNewSearch" class="search-btn-compact">Rechercher</button>
      </div>
    </div>

    <div class="results-container">
      <!-- Sidebar de filtres -->
      <div class="filters-sidebar">
        <h3>Filtrer les résultats</h3>
        <div class="filter-group">
          <h4>Prix maximum</h4>
          <input
            type="range"
            min="5"
            max="100"
            step="5"
            v-model="filters.maxPrice"
            class="price-slider"
          />
          <span class="price-value">{{ filters.maxPrice }}<IconCredit style="vertical-align: middle; margin-left: 2px;" /></span>
        </div>
        <div class="filter-group">
          <h4>Aspect écologique</h4>
          <div class="ecological-filter">
            <label class="feature-option">
              <input type="checkbox" v-model="filters.isElectric" /> Voiture électrique uniquement
            </label>
          </div>
        </div>
        <div class="filter-group">
          <h4>Durée maximale</h4>
          <div class="duration-filter">
            <select v-model="filters.maxDuration" class="duration-select">
              <option value="480">Toutes durées</option>
              <option value="60">1h maximum</option>
              <option value="120">2h maximum</option>
              <option value="180">3h maximum</option>
              <option value="240">4h maximum</option>
              <option value="300">5h maximum</option>
            </select>
          </div>
        </div>
        <div class="filter-group">
          <h4>Note minimale du chauffeur</h4>
          <div class="rating-filter">
            <select v-model="filters.minRating" class="rating-select">
              <option value="0">Toutes notes</option>
              <option value="3">3⭐ et plus</option>
              <option value="4">4⭐ et plus</option>
              <option value="4.5">4.5⭐ et plus</option>
            </select>
          </div>
        </div>
      </div>
      <div class="results-list">
        <!-- État de chargement -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Recherche des covoiturages...</p>
        </div>

        <!-- État d'erreur -->
        <div v-else-if="error" class="error-state">
          <h3>Erreur</h3>
          <p>{{ error }}</p>
          <button @click="loadCarpoolings" class="retry-btn">Réessayer</button>
        </div>

        <!-- Résultats -->
        <div v-else-if="formattedResults.length > 0">
          <div
            v-for="trip in formattedResults"
            :key="trip.id"
            class="trip-card"
            @click="selectTrip(trip)"
          >
            <div class="trip-header">
              <div class="trip-route">
                <span class="departure">{{ trip.departure }}</span>
                <div class="route-line">
                  <div class="route-dots">
                    <div class="dot start"></div>
                    <div class="line"></div>
                    <div class="dot end"></div>
                  </div>
                </div>
                <span class="destination">{{ trip.destination }}</span>
              </div>
              <div class="trip-time">
                <span class="departure-time">{{ trip.departureTime }}</span>
                <span class="duration">{{ trip.duration }}</span>
                <span class="arrival-time">{{ trip.arrivalTime }}</span>
              </div>
            </div>

            <div class="trip-details">
              <div class="driver-info">
                <img :src="trip.driver.avatar" :alt="trip.driver.name" class="driver-avatar" />
                <div class="driver-details">
                  <span class="driver-name">{{ trip.driver.name }}</span>
                  <div class="driver-rating">
                    <span class="rating">⭐ {{ trip.driver.rating }}</span>
                    <span class="rides-count" v-if="trip.driver.ridesCount > 0"
                      >({{ trip.driver.ridesCount }} trajets)</span
                    >
                  </div>
                </div>
              </div>

              <div class="trip-info">
                <div class="seats">
                  <span class="seats-available"
                    >{{ trip.seatsAvailable }} place{{ trip.seatsAvailable > 1 ? 's' : '' }}</span
                  >
                </div>
                <div class="price">
                  <span class="amount">{{ trip.price }}<IconCredit style="vertical-align: middle; margin-left: 2px;" /></span>
                  <span class="per-person">par personne</span>
                </div>
              </div>
            </div>

            <div class="trip-features" v-if="trip.features.length > 0">
              <span v-for="feature in trip.features" :key="feature" class="feature-tag">
                {{ getFeatureIcon(feature) }} {{ feature }}
              </span>
            </div>

            <div class="vehicle-info" v-if="trip.vehicle">
              <span class="vehicle-details">{{ trip.vehicle.brand }} {{ trip.vehicle.model }}</span>
              <span v-if="trip.vehicle.isElectric" class="electric-badge">🌱 Électrique</span>
            </div>
          </div>
        </div>

        <!-- Aucun résultat mais date alternative disponible -->
        <div v-else-if="nextAvailableDate" class="no-results-alternative">
          <div class="no-results-content">
            <h2>Aucun trajet trouvé pour cette date 😕</h2>
            <p>
              Cependant, nous avons trouvé des trajets pour le
              <strong>{{ formatDate(nextAvailableDate) }}</strong>
            </p>
            <div class="no-results-actions">
              <button class="btn-primary" @click="searchAlternativeDate">Voir ces trajets</button>
              <button class="btn-secondary" @click="createAlert">Créer une alerte</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Message si aucun résultat -->
    <div v-if="formattedResults.length === 0 && !loading && !error" class="no-results">
      <div class="no-results-content">
        <h2>Aucun trajet trouvé 😕</h2>
        <p>
          Essayez de modifier vos critères de recherche ou créez une alerte pour être notifié quand
          un trajet correspondant sera publié.
        </p>
        <div class="no-results-actions">
          <button class="btn-primary" @click="createAlert">Créer une alerte</button>
          <button class="btn-secondary" @click="$router.push('/')">Nouvelle recherche</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { carpoolingService } from '@/services/api.js'
import IconCredit from '@/components/icons/IconCredit.vue'

const route = useRoute()
const router = useRouter()

// État de chargement et d'erreur
const loading = ref(false)
const error = ref(null)
const nextAvailableDate = ref(null)

// Paramètres de recherche depuis l'URL
const searchParams = ref({
  from: route.query.from || '',
  to: route.query.to || '',
  date: route.query.date || '',
})

// Computed pour vérifier si des critères de recherche ont été fournis
const hasSearchCriteria = computed(() => {
  return (
    searchParams.value.from.trim() !== '' ||
    searchParams.value.to.trim() !== '' ||
    searchParams.value.date.trim() !== ''
  )
})

// Nouvelles paramètres de recherche pour le formulaire compact
const newSearchParams = ref({
  from: searchParams.value.from,
  to: searchParams.value.to,
  date: searchParams.value.date,
})

// Filtres selon le cahier des charges (US 4)
const filters = ref({
  maxPrice: 100, // Prix maximum
  isElectric: false, // Aspect écologique (voiture électrique)
  maxDuration: 480, // Durée maximale en minutes (8h par défaut)
  minRating: 0, // Note minimale du chauffeur
})

// Données des covoiturages
const carpoolings = ref([])

// Fonction pour charger les covoiturages depuis l'API
const loadCarpoolings = async () => {
  try {
    loading.value = true
    error.value = null
    nextAvailableDate.value = null

    // Construction des paramètres de requête
    const queryParams = {}

    if (searchParams.value.from) {
      queryParams.departure = searchParams.value.from
    }
    if (searchParams.value.to) {
      queryParams.arrival = searchParams.value.to
    }
    if (searchParams.value.date) {
      queryParams.date = searchParams.value.date
    }

    // Ajout des filtres
    if (filters.value.maxPrice < 100) {
      queryParams.maxPrice = filters.value.maxPrice
    }
    if (filters.value.isElectric) {
      queryParams.isElectric = 'true'
    }
    if (filters.value.maxDuration < 480) {
      queryParams.maxDuration = filters.value.maxDuration
    }
    if (filters.value.minRating > 0) {
      queryParams.minRating = filters.value.minRating
    }

    const data = await carpoolingService.getAvailableTrips(queryParams)
    carpoolings.value = data.carpoolings || []
    nextAvailableDate.value = data.nextAvailableDate
  } catch (err) {
    console.error('Erreur lors du chargement des covoiturages:', err)
    error.value = err.response?.data?.message || 'Erreur de connexion au serveur'
  } finally {
    loading.value = false
  }
}

// Formatage des données pour l'affichage
const formattedResults = computed(() => {
  return carpoolings.value.map((carpooling) => ({
    id: carpooling.id,
    departure: carpooling.departure_address,
    destination: carpooling.arrival_address,
    departureTime: new Date(carpooling.departure_datetime).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    arrivalTime: new Date(carpooling.arrival_datetime).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    duration: formatDuration(carpooling.duration_minutes),
    price: carpooling.price_per_passenger,
    seatsAvailable: carpooling.seats_remaining,
    driver: {
      name: carpooling.driver_pseudo,
      avatar: carpooling.driver_photo || 'https://i.pravatar.cc/150?img=' + (carpooling.id % 70),
      rating: carpooling.driver_rating ? parseFloat(carpooling.driver_rating).toFixed(1) : 'N/A',
      ridesCount: 0, // À implémenter plus tard
    },
    vehicle: {
      model: carpooling.model,
      brand: carpooling.brand_name,
      color: carpooling.color_name,
      isElectric: carpooling.is_electric,
    },
    features: getFeatures(carpooling),
  }))
})

// Fonction pour formater la durée
const formatDuration = (minutes) => {
  if (!minutes) return 'N/A'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}h${mins > 0 ? mins.toString().padStart(2, '0') : ''}` : `${mins}min`
}

// Fonction pour obtenir les caractéristiques du trajet
const getFeatures = (carpooling) => {
  const features = []
  if (carpooling.is_electric) {
    features.push('Voyage écologique')
  }
  // Ici on pourrait ajouter d'autres features basées sur les préférences du chauffeur
  return features
}

// Formatage de la date
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Obtenir l'icône d'une fonctionnalité
const getFeatureIcon = (feature) => {
  const icons = {
    'Voyage écologique': '🌱',
    'Réservation instantanée': '⚡',
    'Animaux acceptés': '🐕',
    'Fumeurs acceptés': '🚬',
    Climatisation: '❄️',
    WiFi: '📶',
    Musique: '🎵',
  }
  return icons[feature] || '✅'
}

// Sélection d'un trajet - navigation vers la vue détaillée
const selectTrip = (trip) => {
  // Navigation vers la page de détail du covoiturage
  router.push({
    name: 'CarpoolingDetail',
    params: { id: trip.id },
    query: {
      // Conserver les paramètres de recherche pour pouvoir revenir
      from: searchParams.value.from,
      to: searchParams.value.to,
      date: searchParams.value.date,
    },
  })
}

// Recherche avec la date alternative proposée
const searchAlternativeDate = () => {
  if (nextAvailableDate.value) {
    newSearchParams.value.date = nextAvailableDate.value
    performNewSearch()
  }
}

// Création d'une alerte pour être notifié de nouveaux trajets
const createAlert = () => {
  // À implémenter : système d'alertes email
  alert(
    "Fonctionnalité d'alerte à implémenter - Vous serez notifié par email quand un nouveau trajet correspondant sera disponible",
  )
}

// Nouvelle recherche depuis le formulaire compact
const performNewSearch = () => {
  // Mettre à jour les paramètres de recherche
  searchParams.value = { ...newSearchParams.value }

  // Mettre à jour l'URL
  router.push({
    name: 'SearchResults',
    query: {
      from: newSearchParams.value.from || '',
      to: newSearchParams.value.to || '',
      date: newSearchParams.value.date || '',
    },
  })

  // Relancer la recherche
  loadCarpoolings()
}

// Watcher pour recharger les données quand les filtres changent
watch(
  filters,
  () => {
    loadCarpoolings()
  },
  { deep: true },
)

// Watcher pour les changements de route
watch(route, (newRoute) => {
  searchParams.value = {
    from: newRoute.query.from || '',
    to: newRoute.query.to || '',
    date: newRoute.query.date || '',
  }
  newSearchParams.value = { ...searchParams.value }
  loadCarpoolings()
})

// Charger les données au montage du composant
onMounted(() => {
  loadCarpoolings()
})
</script>

<style scoped>
.search-results {
  min-height: 100vh;
  background-color: #1a1a1a;
  padding: 80px 20px 40px;
  color: white;
}

.search-header {
  max-width: 1200px;
  margin: 0 auto 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #2a2a2a;
  padding: 25px 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* Styles pour le formulaire de recherche compact */
.search-form-compact {
  max-width: 1200px;
  margin: 0 auto 30px;
  background: #2a2a2a;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.search-inputs-compact {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input-compact {
  flex: 1;
  min-width: 150px;
  padding: 12px 15px;
  border: 1px solid #444;
  border-radius: 8px;
  background: #1a1a1a;
  color: white;
  font-size: 0.9rem;
}

.search-input-compact::placeholder {
  color: #999;
}

.search-input-compact:focus {
  outline: none;
  border-color: #34d399;
}

.search-btn-compact {
  background: #34d399;
  color: #1a1a1a;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
  white-space: nowrap;
}

.search-btn-compact:hover {
  background: #22c55e;
}

/* États de chargement et d'erreur */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  color: #999;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #444;
  border-top: 3px solid #34d399;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-state {
  background: #2a2a2a;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  margin: 20px 0;
}

.error-state h3 {
  color: #ef4444;
  margin-bottom: 10px;
}

.retry-btn {
  background: #34d399;
  color: #1a1a1a;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 15px;
}

/* Alternative pour aucun résultat */
.no-results-alternative {
  background: #2a2a2a;
  padding: 40px;
  border-radius: 12px;
  text-align: center;
  margin: 20px 0;
}

.no-results-alternative h2 {
  color: #34d399;
  margin-bottom: 15px;
}

/* Informations véhicule */
.vehicle-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #333;
  font-size: 0.85rem;
  color: #999;
}

.electric-badge {
  background: #22c55e;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Filtres mis à jour */
.ecological-filter,
.duration-filter,
.rating-filter {
  margin-top: 10px;
}

.duration-select,
.rating-select {
  width: 100%;
  padding: 8px 12px;
  background: #1a1a1a;
  color: white;
  border: 1px solid #444;
  border-radius: 6px;
  margin-top: 8px;
}

.reset-filters-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  width: 100%;
  margin-top: 15px;
  font-size: 0.9rem;
}

.reset-filters-btn:hover {
  background: #dc2626;
}

.results-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: white;
  margin-bottom: 8px;
}

.criteria-details {
  display: flex;
  gap: 20px;
  align-items: center;
}

.browse-message {
  color: #34d399;
  font-style: italic;
}

.route {
  font-size: 1.1rem;
  font-weight: 500;
  color: #34d399;
}

.date {
  font-size: 0.95rem;
  color: #ccc;
}

.results-count {
  font-size: 1rem;
  color: #ccc;
  background: #1a1a1a;
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #444;
}

.results-container {
  min-height: calc(100vh - 220px);
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-start;
}

.filters-sidebar {
  background: #2a2a2a;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  height: fit-content;
  position: sticky;
  top: 20px;
  border: 1px solid #444;
  min-width: 260px;
  max-width: 320px;
  margin-right: 32px;
}

.filters-sidebar h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: white;
  margin-bottom: 20px;
}

.filter-group {
  margin-bottom: 24px;
}

.filter-group h4 {
  font-size: 1rem;
  font-weight: 600;
  color: white;
  margin-bottom: 12px;
}

.price-slider {
  width: 100%;
  margin-bottom: 8px;
  accent-color: #34d399;
}

.price-value {
  font-weight: 600;
  color: #34d399;
}

.time-filters,
.feature-filters {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.time-option,
.feature-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 0;
  color: #ccc;
}

.time-option input,
.feature-option input {
  accent-color: #34d399;
}

.no-results {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  padding: 60px 20px;
}

.no-results-content {
  background: #2a2a2a;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 1px solid #444;
}

.no-results h2 {
  font-size: 1.8rem;
  color: white;
  margin-bottom: 16px;
}

.no-results p {
  color: #ccc;
  font-size: 1.1rem;
  margin-bottom: 24px;
  line-height: 1.6;
}

.no-results-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-primary {
  background: #34d399;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-primary:hover {
  background: #22c55e;
}

.btn-secondary {
  background: transparent;
  color: #34d399;
  border: 2px solid #34d399;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #34d399;
  color: #1a1a1a;
}

/* Responsive */
@media (max-width: 900px) {
  .search-results {
    padding: 60px 15px 20px;
  }

  .search-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .search-form-compact {
    margin: 0 auto 20px;
    flex-direction: column;
    align-items: stretch;
  }

  .search-inputs-compact {
    flex-direction: column;
    gap: 12px;
  }

  .search-input-compact {
    min-width: 100%;
  }

  .filters-sidebar {
    position: static;
    margin: 0 0 24px 0;
    width: 100%;
    max-width: 100%;
  }

  .filters-sidebar h3 {
    text-align: center;
    margin-bottom: 15px;
  }

  .filter-group {
    margin-bottom: 15px;
  }

  .price-slider {
    width: 100%;
  }

  .price-value {
    text-align: center;
  }

  .results-container {
    flex-direction: column;
    align-items: stretch;
  }

  .trip-header {
    flex-direction: column;
    gap: 12px;
  }

  .trip-details {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .trip-info {
    align-items: flex-start;
    width: 100%;
  }
}

@media (min-width: 900px) {
  .results-container {
    justify-content: center;
    align-items: flex-start;
    padding-left: 40px;
    padding-right: 40px;
  }
  .results-list {
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
    gap: 24px;
  }
  .trip-card {
    width: 100%;
    min-width: 0;
    margin-left: 0;
    margin-right: 0;
  }
}

@media (max-width: 600px) {
  .results-container {
    padding-left: 4px;
    padding-right: 4px;
  }
  .results-list {
    max-width: 100vw;
    gap: 12px;
  }
  .trip-card {
    padding: 12px;
    font-size: 0.92rem;
    border-radius: 8px;
  }
  .trip-header,
  .trip-details,
  .trip-info,
  .driver-info {
    font-size: 0.95rem;
  }
  .departure,
  .destination {
    font-size: 1rem;
  }
  .results-title {
    font-size: 1.2rem;
  }
}

.confirm-filters-btn {
  background: #34d399;
  color: #1a1a1a;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  margin-top: 15px;
  font-size: 0.95rem;
  transition: background 0.2s;
}
.confirm-filters-btn:hover {
  background: #22c55e;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.trip-card {
  background: #2a2a2a;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #444;
}

.trip-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  border-color: #34d399;
}

.trip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.trip-route {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.departure,
.destination {
  font-weight: 600;
  color: var(--eco-beige);
  font-size: 1.1rem;
  text-shadow: 0 1px 4px rgba(0,0,0,0.25);
}

.route-line {
  flex: 1;
  padding: 0 12px;
}

.route-dots {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot.start {
  background: #34d399;
}

.dot.end {
  background: #ef4444;
}

.line {
  flex: 1;
  height: 2px;
  background: linear-gradient(to right, #34d399, #ef4444);
  border-radius: 1px;
}

.trip-time {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
}

.departure-time,
.arrival-time {
  font-weight: 600;
  color: white;
}

.duration {
  font-size: 0.85rem;
  color: #ccc;
}

.trip-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.driver-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.driver-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid #444;
}

.driver-name {
  font-weight: 600;
  color: white;
  display: block;
}

.driver-rating {
  font-size: 0.85rem;
  color: #ccc;
  margin-top: 2px;
}

.rating {
  color: #f59e0b;
}

.trip-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.seats-available {
  font-size: 0.9rem;
  color: #ccc;
}

.price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.amount {
  font-size: 1.4rem;
  font-weight: 700;
  color: #34d399;
}

.per-person {
  font-size: 0.8rem;
  color: #ccc;
}

.trip-features {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.feature-tag {
  background: #1a1a1a;
  color: #34d399;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 0.8rem;
  border: 1px solid #444;
}
</style>
