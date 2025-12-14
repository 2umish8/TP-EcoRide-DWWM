<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import UserMenu from './UserMenu.vue'
import NavButton from '../ui/NavButton.vue'
import PrimaryButton from '../ui/PrimaryButton.vue'

const authStore = useAuthStore()
const isLoggedIn = computed(() => authStore.isLoggedIn)

defineEmits(['navigate'])
</script>

<template>
  <div class="navbar-nav-right">
    <template v-if="!isLoggedIn">
      <NavButton to="/register" @click="$emit('navigate')">
        <font-awesome-icon :icon="['fas', 'user-plus']" class="nav-icon" />
        Inscription
      </NavButton>

      <PrimaryButton to="/login" @click="$emit('navigate')">
        <font-awesome-icon :icon="['fas', 'arrow-right-to-bracket']" class="nav-icon" />
        Connexion
      </PrimaryButton>
    </template>

    <UserMenu v-else @navigate="$emit('navigate')" />
  </div>
</template>

<style scoped>
.navbar-nav-right {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: auto;
  flex-wrap: wrap;
}

.nav-icon {
  margin-right: 0.5rem;
}

@media (max-width: 767px) {
  .navbar-nav-right {
    flex-direction: column;
    width: 100%;
    gap: 0.5rem;
    margin-left: 0;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
}
</style>





