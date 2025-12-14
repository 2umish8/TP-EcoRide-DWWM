<script setup>
import { useRouter } from 'vue-router'
import HeroSection from '@/components/HeroSection.vue'
import ArrowsFooter from '@/components/ArrowsFooter.vue'
import AboutSection from '@/components/AboutSection.vue'
import { useSearchForm } from '@/composables/useSearchForm'

// Configuration future pour l'authentification
const router = useRouter()

// Variables réactives pour le formulaire de recherche
const { searchForm, submitSearch } = useSearchForm()

// Fonction pour gérer la recherche depuis le SearchBar (reçoit la payload)
const handleSearch = (values) => {
  // Met à jour localement le formulaire et navigation via composable
  if (values) {
    searchForm.value = { ...values }
  }
  submitSearch(router, values)
}

// Fonction pour aller directement à la page des covoiturages
const goToCarpooling = () => {
  router.push({
    name: 'SearchResults',
    query: {
      from: '',
      to: '',
      date: '',
    },
  })
}
</script>
<template>
  <div class="accueil">
    <!-- Hero Section (extracted) --><HeroSection
      :initialSearchValues="searchForm"
      @search="handleSearch"
      @browse-all="goToCarpooling"
    /><!-- Footer arrows section extracted --><ArrowsFooter /><!-- Section À propos de nous (extrait) --><AboutSection />
  </div>
</template>
