<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import NavButton from './ui/NavButton.vue'
import PrimaryButton from './ui/PrimaryButton.vue'

const authStore = useAuthStore()
const isLoggedIn = computed(() => authStore.isLoggedIn)
const currentUser = computed(() => authStore.currentUser)
const isUserMenuOpen = ref(false)
const isNavOpen = ref(false)

const logout = async () => {
  await authStore.logout()
  window.location.href = '/'
}

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

const toggleNav = () => {
  isNavOpen.value = !isNavOpen.value
}

const closeNav = () => {
  isNavOpen.value = false
}

// expose a simple flag for template to avoid using import.meta in expressions
const isDev = import.meta.env.MODE !== 'production'
</script>

<template>
  <nav class="navbar navbar-expand-lg fixed-top">
    <div class="navbar-container">
      <!-- Logo -->
      <RouterLink class="navbar-brand" to="/">
        <img src="@/assets/Logo ecoride transparent.PNG" alt="EcoRide" class="navbar-logo" />
      </RouterLink>

      <!-- Hamburger toggle for mobile -->
      <button
        class="navbar-toggler"
        type="button"
        @click="toggleNav"
        :class="{ active: isNavOpen }"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Navigation items wrapper -->
      <div class="navbar-nav-wrapper" :class="{ open: isNavOpen }">
        <!-- LEFT: Navigation links -->
        <div class="navbar-nav-left">
          <NavButton to="/" @click="closeNav">
            <font-awesome-icon :icon="['fas', 'house']" class="nav-icon" />
            Accueil
          </NavButton>

          <NavButton to="/search" @click="closeNav">
            <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="nav-icon" />
            Rechercher
          </NavButton>

          <NavButton v-if="isDev" to="/test/visuals" @click="closeNav">
            <font-awesome-icon :icon="['fas', 'shapes']" class="nav-icon" />
            Visuals
          </NavButton>

          <NavButton v-if="isLoggedIn" to="/my-trips" @click="closeNav">
            <font-awesome-icon :icon="['fas', 'person-walking-luggage']" class="nav-icon" />
            Mes trajets
          </NavButton>
        </div>

        <!-- RIGHT: User actions -->
        <div class="navbar-nav-right">
          <template v-if="!isLoggedIn">
            <NavButton to="/register" @click="closeNav">
              <font-awesome-icon :icon="['fas', 'user-plus']" class="nav-icon" />
              Inscription
            </NavButton>

            <PrimaryButton to="/login" @click="closeNav">
              <font-awesome-icon :icon="['fas', 'arrow-right-to-bracket']" class="nav-icon" />
              Connexion
            </PrimaryButton>
          </template>

          <template v-else>
            <div class="user-menu">
              <button class="user-menu-toggle" @click="toggleUserMenu">
                <font-awesome-icon :icon="['fas', 'user']" class="user-icon" />
                <span class="user-name">{{
                  currentUser?.pseudo || currentUser?.prenom || 'Utilisateur'
                }}</span>
                <font-awesome-icon :icon="['fas', 'chevron-down']" class="chevron-icon" />
              </button>

              <ul class="user-menu-dropdown" v-show="isUserMenuOpen">
                <li>
                  <RouterLink class="dropdown-item" to="/profile" @click="isUserMenuOpen = false">
                    <font-awesome-icon :icon="['fas', 'user']" class="dropdown-icon" />
                    Mon profil
                  </RouterLink>
                </li>
                <li>
                  <RouterLink class="dropdown-item" to="/credits" @click="isUserMenuOpen = false">
                    <font-awesome-icon :icon="['fas', 'coins']" class="dropdown-icon" />
                    Mes crédits
                  </RouterLink>
                </li>
                <li class="dropdown-divider"></li>
                <li>
                  <a class="dropdown-item" href="#" @click.prevent="logout">
                    <font-awesome-icon :icon="['fas', 'user-xmark']" class="dropdown-icon" />
                    Déconnexion
                  </a>
                </li>
              </ul>
            </div>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  padding: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.navbar-container {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.75rem 1rem;
  max-width: 100%;
}

.navbar-logo {
  height: 40px;
  width: auto;
}

.navbar-brand {
  display: flex;
  align-items: center;
  margin-right: 2rem;
  flex-shrink: 0;
}

.navbar-toggler {
  display: none;
  flex-direction: column;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem 0;
  gap: 0.35rem;
  margin-left: auto;
}

.navbar-toggler-icon {
  display: block;
  width: 24px;
  height: 2px;
  background: var(--color-text);
  transition: all 0.3s ease;
}

.navbar-toggler.active .navbar-toggler-icon:nth-child(1) {
  transform: rotate(45deg) translate(10px, 10px);
}

.navbar-toggler.active .navbar-toggler-icon:nth-child(2) {
  opacity: 0;
}

.navbar-toggler.active .navbar-toggler-icon:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -7px);
}

.navbar-nav-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 2rem;
}

.navbar-nav-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  flex-wrap: wrap;
}

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

.user-menu {
  position: relative;
}

.user-menu-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0.5rem;
  font-size: 0.9rem;
}

.user-menu-toggle:hover {
  opacity: 0.8;
}

.user-menu-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  list-style: none;
  margin: 0.5rem 0 0 0;
  padding: 0;
  min-width: 180px;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.user-menu-dropdown li {
  display: flex;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: var(--color-text);
  text-decoration: none;
  width: 100%;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background: var(--color-background-soft);
}

.dropdown-icon {
  flex-shrink: 0;
  width: 16px;
}

.dropdown-divider {
  border-top: 1px solid var(--color-border);
  margin: 0.5rem 0;
}

.user-name {
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-icon {
  width: 18px;
}

.chevron-icon {
  font-size: 0.75rem;
  transition: transform 0.3s;
}

/* Tablet (768px - 1024px) */
@media (max-width: 1024px) {
  .navbar-container {
    padding: 0.5rem 1rem;
  }

  .navbar-logo {
    height: 35px;
  }

  .navbar-brand {
    margin-right: 1rem;
  }

  .navbar-nav-wrapper {
    gap: 1rem;
  }

  .navbar-nav-left,
  .navbar-nav-right {
    gap: 0.75rem;
  }

  .user-name {
    max-width: 60px;
  }
}

/* Mobile (< 768px) */
@media (max-width: 767px) {
  .navbar-container {
    position: relative;
    padding: 0.75rem;
  }

  .navbar-logo {
    height: 32px;
  }

  .navbar-brand {
    margin-right: 0.5rem;
  }

  .navbar-toggler {
    display: flex;
  }

  .navbar-nav-wrapper {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    width: calc(100% - 1.5rem);
    margin: 0 0.75rem;
    padding: 1rem;
    background: var(--color-background);
    border: 1px solid var(--color-border);
    border-top: none;
    border-radius: 0 0 0.5rem 0.5rem;
    gap: 1rem;
    max-height: 0;
    overflow: hidden;
    opacity: 0;
    transition:
      max-height 0.3s ease,
      opacity 0.3s ease;
    z-index: 999;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .navbar-nav-wrapper.open {
    max-height: 500px;
    opacity: 1;
  }

  .navbar-nav-left,
  .navbar-nav-right {
    flex-direction: column;
    width: 100%;
    gap: 0.5rem;
  }

  .navbar-nav-right {
    margin-left: 0;
    border-top: 1px solid var(--color-border);
    padding-top: 1rem;
    margin-top: 0.5rem;
  }

  .nav-icon {
    margin-right: 0.75rem;
  }

  .user-menu-toggle {
    width: 100%;
    justify-content: space-between;
    padding: 0.75rem;
    font-size: 0.95rem;
  }

  .user-name {
    max-width: 100px;
  }

  .user-menu-dropdown {
    position: static;
    border: none;
    border-top: 1px solid var(--color-border);
    background: transparent;
    margin: 0.5rem 0 0 0;
    padding: 0.5rem 0;
    min-width: auto;
    box-shadow: none;
  }

  .dropdown-item {
    padding: 0.75rem 1.5rem;
  }
}

/* Very small phones (< 360px) */
@media (max-width: 359px) {
  .navbar-logo {
    height: 28px;
  }

  .user-name {
    display: none;
  }

  .user-menu-toggle {
    padding: 0.5rem;
  }

  .dropdown-item {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }
}
</style>
