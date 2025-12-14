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

<style scoped>
/* Minimal hero styles (migrated from HomeView.vue) */
.hero-background {
  flex: 1;
  background: #1a1a1a url('@/assets/Accueil BG.png') center/cover no-repeat;
  border-radius: 0px 0px 80px 0px;
  display: flex;
  align-items: center;
  padding: 40px 60px;
  min-height: calc(100vh - 50px);
  position: relative;
  overflow: visible;
  width: 100%;
}

.hero-background::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 60%;
  height: 100%;
  background:
    radial-gradient(circle at 15% 15%, #34d399 18px, transparent 18px),
    radial-gradient(circle at 35% 25%, #22c55e 22px, transparent 22px);
  opacity: 0.3;
  z-index: 0;
  filter: blur(2px);
}

.hero-content {
  width: 100%;
  max-width: none;
  margin: 0;
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.catch-phrase {
  margin-top: 20px;
  max-width: 70%;
  z-index: 3;
  position: relative;
}

.main-title {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  line-height: 1.1;
  margin-bottom: 0.5rem;
  z-index: 3;
  position: relative;
}

.eco-highlight {
  color: #34d399;
}

.subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 1.2rem;
  font-weight: 300;
  color: #e0e0e0;
  margin-top: 1rem;
  max-width: 700px;
  line-height: 1.4;
}

.bottom-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding-bottom: 20px;
  position: relative;
  z-index: 10;
}

.qui-sommes-nous {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

/* Mobile-first visibility:
   - On small screens show only the mobile catch phrase
   - Hide main titles and subtitle on small screens
   - On wider screens (>=768px) hide mobile catch phrase and show main titles/subtitle */
.mobile-catch-phrase {
  display: block;
}

.main-title,
.subtitle {
  display: none;
}

@media (min-width: 768px) {
  .mobile-catch-phrase {
    display: none;
  }

  .main-title,
  .subtitle {
    display: block;
  }
}
</style>
