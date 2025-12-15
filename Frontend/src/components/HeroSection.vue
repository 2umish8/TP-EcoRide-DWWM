<template>
  <div class="hero-background">
    <div class="hero-content">
      <div class="catch-phrase">
        <template v-if="isLoggedIn">
          <h1 class="main-title">
            Bienvenu {{ pseudo }} !<br />
            Tu ne participes pas seulement à un covoiturage, tu participes à un
            <span class="eco-highlight">monde meilleur</span>
          </h1>
        </template>
        <template v-else>
          <h1 class="main-title">Ta Voiture, Ton Empreinte Carbone.</h1>
          <h1 class="main-title">
            Et Si On <span class="eco-highlight">EcoRidait</span> Ensemble ?
          </h1>
        </template>
        <h2 class="mobile-catch-phrase">
          Il y aura moins d'emboutaillage et de pollution, et ca sera grâce à
          <span class="eco-highlight">Vous</span> !
        </h2>
        <template v-if="isLoggedIn">
          <p class="subtitle">
            Rouler seul, tout le monde sait faire.<br />
            Penser aux autres (et à la planète), un peu moins.<br />
            Toi, t'as choisi le bon camp : EcoRide. <br />
            Ravis de t'avoir parmi nous !
          </p>
        </template>
        <template v-else>
          <p class="subtitle">
            Chaque trajet en solo pèse sur la planète. Avec EcoRide, partagez vos trajets, réduisez
            vos émissions et faites des économies. Il est temps de changer la façon dont nous nous
            déplaçons. EcoRoulons vers un avenir plus vert.
          </p>
        </template>
      </div>

      <div class="bottom-section">
        <SearchBar
          :initialValues="initialSearchValues"
          @search="onSearch"
          @browse-all="onBrowseAll"
        />
        <div class="qui-sommes-nous">
          <div class="en-savoir-plus" @click="onScroll">Qui sommes nous?</div>
          <div class="scroll-icon bounce" @click="onScroll">
            <slot name="scroll-icon">
              <font-awesome-icon :icon="['fas', 'angles-down']" class="scroll-svg" size="lg" />
            </slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import SearchBar from '@/components/SearchBar.vue'
import { useScroll } from '@/composables/useScroll'
import { useAuthStore } from '@/stores/auth'

defineProps({
  initialSearchValues: {
    type: Object,
    default: () => ({ departure: '', destination: '', date: '' }),
  },
})
const emit = defineEmits(['search', 'browse-all'])

const authStore = useAuthStore()
const isLoggedIn = computed(() => authStore.isLoggedIn)
const pseudo = computed(() => authStore.currentUser?.pseudo || '')

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
  background: var(--color-dark) url('@/assets/Accueil BG.png') center/cover no-repeat;
  border-radius: 0px 0px 80px 0px;
  display: flex;
  align-items: center;
  padding: 20px;
  min-height: calc(100vh - 50px);
  position: relative;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
}

@media (min-width: 768px) {
  .hero-background {
    padding: 40px 60px;
    border-radius: 0px 0px 80px 0px;
  }
}

.hero-background::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 60%;
  height: 100%;
  background:
    radial-gradient(circle at 15% 15%, var(--color-primary) 18px, transparent 18px),
    radial-gradient(circle at 35% 25%, var(--color-success) 22px, transparent 22px);
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
  max-width: 100%;
  z-index: 3;
  position: relative;
}

@media (min-width: 768px) {
  .catch-phrase {
    max-width: 70%;
  }
}

.main-title {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-light);
  margin: 0;
  line-height: 1.1;
  margin-bottom: 0.5rem;
  z-index: 3;
  position: relative;
}

.eco-highlight {
  color: var(--color-primary);
}

.subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 1.2rem;
  font-weight: 300;
  color: var(--color-light-secondary);
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
  width: 100%;
  box-sizing: border-box;
}

.qui-sommes-nous {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.scroll-icon {
  cursor: pointer;
  font-size: 1.5rem;
  color: var(--color-light);
}

.en-savoir-plus {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--color-light);
  cursor: pointer;
  transition: all 0.3s ease;
}

.en-savoir-plus:hover {
  transform: scale(1.1);
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
