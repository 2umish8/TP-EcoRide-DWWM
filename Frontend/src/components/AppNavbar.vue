<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import NavButton from './ui/NavButton.vue'

const authStore = useAuthStore()
const isLoggedIn = computed(() => authStore.isLoggedIn)
const currentUser = computed(() => authStore.currentUser)

const logout = async () => {
  await authStore.logout()
  window.location.href = '/'
}
</script>
<template>
  <nav class="app-navbar">
    <div class="app-navbar__inner">
      <NavButton to="/" class="app-navbar__logo">
        <img
          src="@/assets/Logo ecoride transparent.PNG"
          alt="EcoRide"
          class="app-navbar__logo-img"
        />
      </NavButton>
      <div class="app-navbar__content">
        <ul class="app-navbar__links">
          <li>
            <NavButton to="/">
              <font-awesome-icon :icon="['fas', 'house']" class="text-light" />
              Accueil
            </NavButton>
          </li>
          <li>
            <NavButton to="/search">
              <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="text-light" />
              Rechercher
            </NavButton>
          </li>
          <li v-if="isLoggedIn">
            <NavButton to="/my-trips">
              <font-awesome-icon :icon="['fas', 'person-walking-luggage']" class="text-light" />
              Mes trajets
            </NavButton>
          </li>
        </ul>
        <ul class="app-navbar__actions">
          <template v-if="!isLoggedIn"
            ><li>
              <NavButton to="/login">
                <font-awesome-icon :icon="['fas', 'arrow-right-to-bracket']" class="text-light" />
                Connexion
              </NavButton>
            </li>
            <li>
              <NavButton to="/register">
                <font-awesome-icon :icon="['fas', 'user-plus']" class="text-light" />
                Inscription
              </NavButton>
            </li></template
          ><template v-else
            ><li class="app-navbar__profile">
              <NavButton to="/profile">
                <font-awesome-icon :icon="['fas', 'user']" />
                {{ currentUser?.pseudo || currentUser?.prenom || 'Utilisateur' }}
              </NavButton>
              |
              <NavButton to="/credits">
                <font-awesome-icon :icon="['fas', 'coins']" />
                Mes crédits
              </NavButton>
              |
              <NavButton @click="logout">
                <font-awesome-icon :icon="['fas', 'user-xmark']" />
                Déconnexion
              </NavButton>
            </li></template
          >
        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* Layout-only styles for AppNavbar (uses project spacing & variables) */
.app-navbar {
  display: block;
  background-color: var(--color-dark-primary);
}
.app-navbar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
}
.app-navbar__logo-img {
  height: 44px;
  width: auto;
  display: block;
}
.app-navbar__content {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}
.app-navbar__links,
.app-navbar__actions {
  display: flex;
  gap: var(--spacing-md);
  list-style: none;
  margin: 0;
  padding: 0;
  align-items: center;
}
/* Button appearance is handled by NavButton component; layout spacing is controlled by parent container */
/* Responsive: hide primary links on small screens to keep layout clean */
@media (max-width: 640px) {
  .app-navbar__links {
    display: none;
  }
  .app-navbar__inner {
    padding-left: var(--spacing-sm);
    padding-right: var(--spacing-sm);
  }
}
</style>
