<template>
  <div class="search-results">
    <!-- Barre de recherche -->
    <div class="search-bar-top">
      <SearchBar :initialValues="newSearchParams" @search="performNewSearch" />
    </div>

    <div class="results-container">
      <!-- Sidebar de filtres -->
      <TripFilters :filters="filters" @update-filter="handleFilterUpdate" />

      <!-- Contenu des résultats -->
      <div class="results-list">
        <!-- État de chargement -->
        <SearchResultsLoading v-if="loading" />

        <!-- État d'erreur -->
        <SearchResultsError v-else-if="error" :message="error" @retry="loadCarpoolings" />

        <!-- Résultats -->
        <template v-else-if="formattedResults.length > 0">
          <TripCard
            v-for="trip in formattedResults"
            :key="trip.id"
            :trip="trip"
            @select="selectTrip(trip)"
            @view-driver-profile="viewDriverProfile"
          />
        </template>

        <!-- Aucun résultat -->
        <SearchResultsEmpty
          v-else
          :nextAvailableDate="nextAvailableDate"
          @search-alternative-date="searchAlternativeDate"
          @create-alert="createAlert"
          @new-search="$router.push('/')"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCarpoolings } from '@/composables/useCarpoolings'
import SearchBar from '@/components/SearchBar.vue'
import TripFilters from '@/components/TripFilters.vue'
import TripCard from '@/components/TripCard.vue'
import SearchResultsLoading from '@/components/SearchResultsLoading.vue'
import SearchResultsError from '@/components/SearchResultsError.vue'
import SearchResultsEmpty from '@/components/SearchResultsEmpty.vue'

const route = useRoute()
const router = useRouter()
const { loading, error, nextAvailableDate, loadCarpoolings, formattedResults } = useCarpoolings()

// Paramètres de recherche depuis l'URL
const searchParams = ref({
  from: route.query.departure || route.query.from || '',
  to: route.query.destination || route.query.to || '',
  date: route.query.date || '',
  showMyTrips: route.query.showMyTrips === 'true' || false,
})

// Nouvelles paramètres de recherche pour le formulaire compact
const newSearchParams = ref({
  from: searchParams.value.from,
  to: searchParams.value.to,
  date: searchParams.value.date,
})

// Filtres selon le cahier des charges (US 4)
const filters = ref({
  maxPrice: 100,
  isElectric: false,
  maxDuration: 480,
  minRating: 0,
})

// Construire les paramètres de requête
const buildQueryParams = () => {
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

  return queryParams
}

// Sélection d'un trajet - navigation vers la vue détaillée
const selectTrip = (trip) => {
  router.push({
    name: 'CarpoolingDetail',
    params: { id: trip.id },
    query: {
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
  alert(
    "Fonctionnalité d'alerte à implémenter - Vous serez notifié par email quand un nouveau trajet correspondant sera disponible",
  )
}

// Fonction pour naviguer vers le profil du chauffeur
const viewDriverProfile = (userId) => {
  router.push(`/user/${userId}`)
}

// Nouvelle recherche depuis le formulaire compact
const performNewSearch = () => {
  searchParams.value = { ...newSearchParams.value }
  router.push({
    name: 'SearchResults',
    query: {
      from: newSearchParams.value.from || '',
      to: newSearchParams.value.to || '',
      date: newSearchParams.value.date || '',
    },
  })
  loadCarpoolings(buildQueryParams())
}

// Gestion de la mise à jour des filtres
const handleFilterUpdate = ({ key, value }) => {
  filters.value[key] = value
  loadCarpoolings(buildQueryParams())
}

// Chargement initial et watchers
onMounted(() => {
  loadCarpoolings(buildQueryParams())
})

watch(route, (newRoute) => {
  searchParams.value = {
    from: newRoute.query.from || '',
    to: newRoute.query.to || '',
    date: newRoute.query.date || '',
  }
  newSearchParams.value = { ...searchParams.value }
  loadCarpoolings(buildQueryParams())
})
</script>

<style scoped>
.search-results {
  min-height: 100vh;
  background-color: #1a1a1a;
  padding: 20px 20px 40px;
  color: white;
}

.search-bar-top {
  max-width: 1200px;
  margin: 0 auto 30px;
  padding: 0 20px;
}

.results-container {
  min-height: calc(100vh - 100px);
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-start;
  padding: 0 40px;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: 900px;
}

@media (max-width: 900px) {
  .results-container {
    flex-direction: column;
    align-items: stretch;
    padding-left: 4px;
    padding-right: 4px;
  }

  .results-list {
    gap: 16px;
  }
}

@media (max-width: 600px) {
  .search-results {
    padding: 60px 15px 20px;
  }

  .search-bar-top {
    padding: 0;
  }
}
</style>
