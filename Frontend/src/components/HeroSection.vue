<template>
  <div class="hero-background">
    <div class="hero-content">
      <div class="catch-phrase">
        <h1 class="main-title">Ta Voiture, Ton Empreinte Carbone.</h1>
        <h1 class="main-title">Et Si On <span class="eco-highlight">EcoRidait</span> Ensemble ?</h1>
        <h2 class="mobile-catch-phrase">
          Il y aura moins d'emboutaillage et de pollution, et ca sera grâce à
          <span class="eco-highlight">Vous</span> !
        </h2>
        <p class="subtitle">
          Chaque trajet en solo pèse sur la planète. Avec EcoRide, partagez vos trajets, réduisez
          vos émissions et faites des économies. Il est temps de changer la façon dont nous nous
          déplaçons. EcoRoulons vers un avenir plus vert.
        </p>
      </div>

      <div class="bottom-section">
        <SearchBar
          :initialValues="initialSearchValues"
          @search="onSearch"
          @browse-all="onBrowseAll"
        />
        <div class="qui-sommes-nous">
          <div class="scroll-icon" @click="onScroll">
            <slot name="scroll-icon">
              <font-awesome-icon :icon="['fas', 'angles-down']" class="scroll-svg" size="lg" />
            </slot>
          </div>
          <div class="en-savoir-plus" @click="onScroll">En Savoir Plus</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import SearchBar from '@/components/SearchBar.vue'
import { useScroll } from '@/composables/useScroll'

defineProps({
  initialSearchValues: {
    type: Object,
    default: () => ({ departure: '', destination: '', date: '' }),
  },
})
const emit = defineEmits(['search', 'browse-all'])

const { scrollToId } = useScroll()

const onSearch = (values) => {
  emit('search', values)
}

const onBrowseAll = () => {
  emit('browse-all')
}

const onScroll = () => {
  scrollToId('about-section')
}
</script>
