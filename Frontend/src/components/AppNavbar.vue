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
              <font-awesome-icon
                :icon="['fas', 'house']"
                class="var(--color-light-primary)-icon me-1"
              />
              Accueil
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/search">
              <font-awesome-icon
                :icon="['fas', 'magnifying-glass']"
                class="var(--color-light-primary)-icon me-1"
              />
              Rechercher
            </RouterLink>
          </li>
          <li class="nav-item" v-if="isLoggedIn">
            <RouterLink class="nav-link" to="/my-trips">
              <font-awesome-icon
                :icon="['fas', 'person-walking-luggage']"
                class="var(--color-light-primary)-icon me-1"
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
                  class="var(--color-light-primary)-icon me-1"
                />
                Connexion
              </GlassButton>
            </li>
            <li class="nav-item">
              <GlassButton to="/register" variant="inscription">
                <font-awesome-icon
                  :icon="['fas', 'user-plus']"
                  class="var(--color-light-primary)-icon me-1"
                />
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
