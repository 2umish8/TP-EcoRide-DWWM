<template>
  <div class="carpooling-detail">
    <h1>Détail du covoiturage</h1>
    <div v-if="loading">Chargement...</div>
    <div v-else-if="error">Erreur : {{ error }}</div>
    <div v-else-if="carpooling">
      <h2>{{ carpooling.departure_address }} → {{ carpooling.arrival_address }}</h2>
      <p>Date : {{ formatDate(carpooling.departure_datetime) }}</p>
      <p>Chauffeur : {{ carpooling.driver_pseudo }}</p>
      <p>Prix : {{ carpooling.price_per_passenger }} €</p>
      <!-- Ajoute ici d'autres infos utiles -->
    </div>
    <div v-else>Aucun covoiturage trouvé.</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api.js'

const route = useRoute()
const carpooling = ref(null)
const loading = ref(true)
const error = ref(null)

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('fr-FR')
}

onMounted(async () => {
  try {
    loading.value = true
    error.value = null
    const { id } = route.params
    const response = await api.get(`/carpoolings/${id}`)
    carpooling.value = response.data.carpooling
  } catch (err) {
    error.value = err.response?.data?.message || 'Erreur de connexion'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.carpooling-detail {
  max-width: 600px;
  margin: 40px auto;
  background: #222;
  color: #fff;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
</style> 