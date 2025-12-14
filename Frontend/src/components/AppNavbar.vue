<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import GlassButton from './GlassButton.vue'

const authStore = useAuthStore()
const isLoggedIn = computed(() => authStore.isLoggedIn)
const currentUser = computed(() => authStore.currentUser)

const logout = async () => {
  await authStore.logout()
  window.location.href = '/'
}

// expose a simple flag for template to avoid using import.meta in expressions
const isDev = import.meta.env.MODE !== 'production'
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark fixed-top custom-navbar">
    <div class="container-fluid">
      <RouterLink class="navbar-brand fw-bold" to="/">
        <img src="@/assets/Logo ecoride transparent.PNG" alt="EcoRide" class="navbar-logo" />
      </RouterLink>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/">
              <font-awesome-icon :icon="['fas', 'house']" class="white-icon me-1" />
              Accueil
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/search">
              <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="white-icon me-1" />
              Rechercher
            </RouterLink>
          </li>
          <li class="nav-item" v-if="isDev">
            <RouterLink class="nav-link" to="/test/visuals">
              <font-awesome-icon :icon="['fas', 'shapes']" class="white-icon me-1" />
              Visuals
            </RouterLink>
          </li>
          <li class="nav-item" v-if="isLoggedIn">
            <RouterLink class="nav-link" to="/my-trips">
              <font-awesome-icon
                :icon="['fas', 'person-walking-luggage']"
                class="white-icon me-1"
              />
              Mes trajets
            </RouterLink>
          </li>
        </ul>

        <ul class="navbar-nav">
          <template v-if="!isLoggedIn">
            <li class="nav-item">
              <GlassButton to="/login" variant="connexion">
                <font-awesome-icon
                  :icon="['fas', 'arrow-right-to-bracket']"
                  class="white-icon me-1"
                />
                Connexion
              </GlassButton>
            </li>
            <li class="nav-item">
              <GlassButton to="/register" variant="inscription">
                <font-awesome-icon :icon="['fas', 'user-plus']" class="white-icon me-1" />
                Inscription
              </GlassButton>
            </li>
          </template>
          <template v-else>
            <li class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle user-dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <font-awesome-icon :icon="['fas', 'user']" class="user-icon me-1" />
                {{ currentUser?.pseudo || currentUser?.prenom || 'Utilisateur' }}
              </a>
              <ul class="dropdown-menu dropdown-menu-end user-dropdown-menu">
                <li>
                  <RouterLink class="dropdown-item" to="/profile">
                    <font-awesome-icon :icon="['fas', 'user']" class="dropdown-icon" />
                    Mon profil
                  </RouterLink>
                </li>
                <li>
                  <RouterLink class="dropdown-item" to="/credits">
                    <font-awesome-icon :icon="['fas', 'coins']" class="dropdown-icon" />
                    Mes crédits
                  </RouterLink>
                </li>
                <li><hr class="dropdown-divider" /></li>
                <li>
                  <a class="dropdown-item" href="#" @click.prevent="logout">
                    <font-awesome-icon :icon="['fas', 'user-xmark']" class="dropdown-icon" />
                    Déconnexion
                  </a>
                </li>
              </ul>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  margin: 0;
  padding: 0.3rem 0;
  width: 100%;
}

.custom-navbar {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%) !important;
  border-bottom: 1px solid rgba(52, 211, 153, 0.3);
}

.navbar .container-fluid {
  margin: 0;
  padding: 0 1rem;
  max-width: none;
}

.navbar-brand {
  font-size: 1.5rem;
}

.navbar-logo {
  height: 50px;
  max-width: 120px;
  width: auto;
  mix-blend-mode: lighten;
  object-fit: contain;
}

.navbar-nav .nav-item:not(:last-child) {
  margin-right: 15px;
}

@media (max-width: 768px) {
  .navbar-nav .nav-item {
    margin-bottom: 10px;
  }
}

.router-link-active {
  font-weight: bold;
}

.white-icon {
  width: 16px;
  height: 16px;
  color: #f5f5f5;
  transition: color 0.3s ease;
  vertical-align: middle;
}

.nav-link:hover .white-icon {
  color: var(--bs-primary);
}

.user-dropdown-toggle {
  position: relative;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.user-dropdown-toggle:hover {
  background-color: rgba(var(--bs-primary-rgb), 0.08);
  color: var(--bs-primary) !important;
}

.user-icon {
  color: #f5f5f5;
  transition: color 0.3s ease;
  vertical-align: middle;
}

.user-dropdown-toggle:hover .user-icon {
  color: var(--bs-primary);
}

.user-dropdown-menu {
  min-width: 200px;
  background-color: #2d2d2d !important;
  border: 1px solid rgba(52, 211, 153, 0.3) !important;
  border-radius: 0.5rem !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3) !important;
  padding: 0.5rem 0;
  margin-top: 0.5rem;
}

.user-dropdown-menu .dropdown-item {
  color: #f5f5f5 !important;
  padding: 0.75rem 1.25rem !important;
  transition: all 0.3s ease;
  border: none;
  background: none !important;
  white-space: nowrap;
  display: flex;
  align-items: center;
  text-decoration: none;
}

.user-dropdown-menu .dropdown-item:hover,
.user-dropdown-menu .dropdown-item:focus {
  background-color: rgba(var(--bs-primary-rgb), 0.08) !important;
  color: var(--bs-primary) !important;
  transform: translateX(5px);
}

.user-dropdown-menu .dropdown-item:active {
  background-color: rgba(var(--bs-primary-rgb), 0.16) !important;
  color: var(--bs-primary) !important;
}

.user-dropdown-menu .dropdown-item i {
  width: 18px;
  color: var(--bs-primary);
  opacity: 0.9;
  flex-shrink: 0;
  margin-right: 8px;
}

.user-dropdown-menu .dropdown-item .dropdown-icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  color: var(--bs-primary);
  opacity: 0.9;
  display: inline-block;
  text-align: center;
  flex-shrink: 0;
}

.user-dropdown-menu .dropdown-divider {
  border-color: rgba(var(--bs-primary-rgb), 0.16);
  margin: 0.5rem 0;
}

.dropdown-menu.show {
  z-index: 1050;
}

@media (max-width: 768px) {
  .user-dropdown-menu {
    min-width: 180px;
    right: 0 !important;
    left: auto !important;
  }

  .user-dropdown-toggle {
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
  }

  .user-dropdown-menu .dropdown-item {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
}
</style>
