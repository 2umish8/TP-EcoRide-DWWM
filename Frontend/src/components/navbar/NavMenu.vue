<script setup>
import { useRoute } from 'vue-router'
import NavButton from '../ui/NavButton.vue'

const isDev = import.meta.env.MODE !== 'production'
const route = useRoute()

defineProps({
  isLoggedIn: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['navigate'])

const handleAccueilClick = () => {
  emit('navigate')
  if (route.path === '/') {
    window.location.reload()
  }
}
</script>

<template>
  <div class="navbar-nav-left">
    <NavButton to="/" @click="handleAccueilClick">
      <font-awesome-icon :icon="['fas', 'house']" class="nav-icon" />
      Accueil
    </NavButton>

    <NavButton to="/search" @click="$emit('navigate')">
      <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="nav-icon" />
      Rechercher
    </NavButton>

    <NavButton v-if="isDev" to="/test/visuals" @click="$emit('navigate')">
      <font-awesome-icon :icon="['fas', 'shapes']" class="nav-icon" />
      Visuals
    </NavButton>

    <NavButton v-if="isLoggedIn" to="/my-trips" @click="$emit('navigate')">
      <font-awesome-icon :icon="['fas', 'person-walking-luggage']" class="nav-icon" />
      Mes trajets
    </NavButton>
  </div>
</template>

<style scoped>
.navbar-nav-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  flex-wrap: wrap;
}

@media (max-width: 767px) {
  .navbar-nav-left {
    flex-direction: column;
    width: 100%;
    gap: 0.5rem;
  }
}
</style>
