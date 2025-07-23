<script setup>
import { computed } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from './stores/counter'
import GlassButton from './components/GlassButton.vue'

const authStore = useAuthStore()
const isLoggedIn = computed(() => authStore.isLoggedIn)
const currentUser = computed(() => authStore.currentUser)

const logout = async () => {
  await authStore.logout()
  window.location.href = '/'
}
</script>

<template>
  <div id="app">
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-dark fixed-top custom-navbar">
      <div class="container-fluid">
        <router-link class="navbar-brand fw-bold" to="/">
          <img src="@/assets/Logo ecoride transparent.PNG" alt="EcoRide" class="navbar-logo" />
        </router-link>

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
              <router-link class="nav-link" to="/">
                <img src="@/assets/home-svgrepo-com.svg" alt="Accueil" class="nav-icon me-1" />
                Accueil
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/search">
                <img
                  src="@/assets/search-sort-svgrepo-com.svg"
                  alt="Rechercher"
                  class="nav-icon me-1"
                />
                Rechercher
              </router-link>
            </li>
            <li class="nav-item" v-if="isLoggedIn">
              <router-link class="nav-link" to="/my-trips">
                <img src="@/assets/trip-svgrepo-com.svg" alt="Mes trajets" class="nav-icon me-1" />
                Mes trajets
              </router-link>
            </li>
          </ul>

          <ul class="navbar-nav">
            <template v-if="!isLoggedIn">
              <li class="nav-item">
                <GlassButton to="/login" variant="connexion">
                  <img src="@/assets/login-svgrepo-com.svg" alt="Connexion" class="nav-icon me-1" />
                  Connexion
                </GlassButton>
              </li>
              <li class="nav-item">
                <GlassButton to="/register" variant="inscription">
                  <img
                    src="@/assets/user-add-svgrepo-com.svg"
                    alt="Inscription"
                    class="nav-icon me-1"
                  />
                  Inscription
                </GlassButton>
              </li>
            </template>
            <template v-else>
              <li class="nav-item dropdown">
                <a
                  class="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                >
                  <i class="fas fa-user me-1"></i>
                  {{ currentUser?.pseudo || currentUser?.prenom || 'Utilisateur' }}
                </a>
                <ul class="dropdown-menu">
                  <li>
                    <router-link class="dropdown-item" to="/profile">
                      <i class="fas fa-user-edit me-2"></i>
                      Mon profil
                    </router-link>
                  </li>
                  <li>
                    <router-link class="dropdown-item" to="/credits">
                      <i class="fas fa-coins me-2"></i>
                      Mes crédits
                    </router-link>
                  </li>
                  <li><hr class="dropdown-divider" /></li>
                  <li>
                    <a class="dropdown-item" href="#" @click.prevent="logout">
                      <i class="fas fa-sign-out-alt me-2"></i>
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

    <!-- Contenu principal -->
    <RouterView />

    <!-- Footer -->
    <footer class="footer-ecoride">
      <div class="footer-content">
        <span class="footer-text">© 2025 EcoRide</span>
        <span class="footer-separator">|</span>
        <a href="mailto:attention@nous.nexistons.pas" class="footer-link"
          >attention@nous.nexistons.pas</a
        >
        <span class="footer-separator">|</span>
        <a href="#" class="footer-link">Mentions légales</a>
      </div>
    </footer>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
}

#app {
  width: 100%;
  margin: 0;
  padding: 0;
}

main,
.router-view {
  padding-bottom: 20px; /* Espace minimal entre contenu et footer */
  padding-top: 70px; /* Espace pour la navbar fixe */
}

footer {
  position: static; /* Complètement dans le flux normal */
  width: 100%;
  z-index: 100;
}

.search-results {
  padding-bottom: 0; /* Plus besoin de compensation */
}

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

.footer-logo {
  height: 300px;
  max-width: 500px;
  width: auto;
  mix-blend-mode: lighten;
  object-fit: contain;
}

/* Espacement pour les boutons de connexion/inscription */
.navbar-nav .nav-item:not(:last-child) {
  margin-right: 15px;
}

/* Espacement spécifique pour les boutons d'auth sur mobile */
@media (max-width: 768px) {
  .navbar-nav .nav-item {
    margin-bottom: 10px;
  }
}

.router-link-active {
  font-weight: bold;
}

/* Style pour les icônes de navigation */
.nav-icon {
  width: 16px;
  height: 16px;
  filter: invert(1);
  vertical-align: middle;
}

.nav-link:hover .nav-icon {
  filter: invert(1) sepia(1) saturate(5) hue-rotate(150deg);
}

.footer-ecoride {
  position: static;
  width: 100%;
  z-index: 100;
  background: linear-gradient(90deg, #181c1f, #23272b 80%);
  color: #f5f5f5;
  font-size: 1rem;
  padding: 15px 0;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.12);
  display: flex;
  justify-content: center;
  align-items: center;
}
.footer-content {
  display: flex;
  gap: 16px;
  align-items: center;
}
.footer-link {
  color: #f5f5f5;
  text-decoration: underline;
  transition: color 0.2s;
}
.footer-link:hover {
  color: var(--eco-blue);
}
.footer-separator {
  color: #f5f5f5;
  opacity: 0.5;
}
.footer-text {
  font-weight: 500;
}
</style>
