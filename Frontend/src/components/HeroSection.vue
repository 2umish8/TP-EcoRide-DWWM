<template>
  <div class="hero">
    <div class="text-container">
      <h1>Ta Voiture, Ton Empreinte Carbone.</h1>
      <h1>Et Si On <span>EcoRidait</span> Ensemble ?</h1>
      <h2>
        Il y aura moins d'emboutaillage et de pollution, et ca sera grâce à
        <span>Vous</span> !
      </h2>
      <p>
        Chaque trajet en solo pèse sur la planète. Avec EcoRide, partagez vos trajets, réduisez vos
        émissions et faites des économies. Il est temps de changer la façon dont nous nous
        déplaçons. EcoRoulons vers un avenir plus vert.
      </p>
    </div>
    <div class="hero-actions">
      <SearchBar
        :initialValues="initialSearchValues"
        @search="onSearch"
        @browse-all="onBrowseAll"
      />
      <div class="hero-cta">
        <div class="hero-icon" @click="onScroll">
          <slot name="scroll-icon"
            ><font-awesome-icon :icon="['fas', 'angles-down']" size="lg"
          /></slot>
        </div>
        <div class="hero-more" @click="onScroll">En Savoir Plus</div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
<script setup>
defineOptions({ name: 'HeroSection' })
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
