<script setup>
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useAuthStore } from './stores/counter'
import GlassButton from './components/GlassButton.vue'
import CustomModal from './components/CustomModal.vue'
import { useModal } from './composables/useModal'

const authStore = useAuthStore()
const isLoggedIn = computed(() => authStore.isLoggedIn)
const currentUser = computed(() => authStore.currentUser)
const { modals } = useModal()

const route = useRoute()
const hideLayout = computed(() => {
  // Pages qui ne doivent pas avoir la navbar et le footer
  const pagesWithoutLayout = ['Admin', 'login', 'register', 'forgot-password']
  return pagesWithoutLayout.includes(route.name) || route.path.startsWith('/admin')
})

// Calculer le padding-top dynamiquement
const mainPaddingTop = computed(() => {
  return hideLayout.value ? '0px' : '70px'
})

const logout = async () => {
  await authStore.logout()
  window.location.href = '/'
}
</script>

<template>
  <div id="app">
    <!-- Navigation -->
    <nav v-if="!hideLayout" class="navbar navbar-expand-lg navbar-dark fixed-top custom-navbar">
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
                <svg
                  class="nav-icon me-1"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
                Accueil
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/search">
                <svg
                  class="nav-icon me-1"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                  />
                </svg>
                Rechercher
              </router-link>
            </li>
            <li class="nav-item" v-if="isLoggedIn">
              <router-link class="nav-link" to="/my-trips">
                <svg
                  class="nav-icon me-1"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"
                  />
                </svg>
                Mes trajets
              </router-link>
            </li>
          </ul>

          <ul class="navbar-nav">
            <template v-if="!isLoggedIn">
              <li class="nav-item">
                <GlassButton to="/login" variant="connexion">
                  <svg
                    class="nav-icon me-1"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v12z"
                    />
                  </svg>
                  Connexion
                </GlassButton>
              </li>
              <li class="nav-item">
                <GlassButton to="/register" variant="inscription">
                  <svg
                    class="nav-icon me-1"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                    />
                  </svg>
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
                  <svg
                    class="user-icon me-1"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M12 2C14.2 2 16 3.8 16 6C16 8.2 14.2 10 12 10C9.8 10 8 8.2 8 6C8 3.8 9.8 2 12 2ZM12 11C16.4 11 20 13.3 20 16V18C20 19.1 19.1 20 18 20H6C4.9 20 4 19.1 4 18V16C4 13.3 7.6 11 12 11Z"
                    />
                  </svg>
                  {{ currentUser?.pseudo || currentUser?.prenom || 'Utilisateur' }}
                </a>
                <ul class="dropdown-menu dropdown-menu-end user-dropdown-menu">
                  <li>
                    <router-link class="dropdown-item" to="/profile">
                      <i class="fas fa-user dropdown-icon"></i>
                      Mon profil
                    </router-link>
                  </li>
                  <li>
                    <router-link class="dropdown-item" to="/credits">
                      <i class="fas fa-credit-card dropdown-icon"></i>
                      Mes crédits
                    </router-link>
                  </li>
                  <li><hr class="dropdown-divider" /></li>
                  <li>
                    <a class="dropdown-item" href="#" @click.prevent="logout">
                      <svg
                        class="dropdown-icon"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path
                          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM13 17h-2v-6h2v6zm0-8h-2V7h2v2z"
                        />
                        <path
                          d="M2 2l20 20"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                        />
                      </svg>
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
    <div class="main-content" :style="{ paddingTop: mainPaddingTop }">
      <RouterView />
    </div>

    <!-- Footer -->
    <footer v-if="!hideLayout" class="footer-ecoride">
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

    <!-- Modales globales -->
    <CustomModal
      v-for="modal in modals"
      :key="modal.id"
      :is-visible="modal.isVisible"
      :type="modal.type"
      :title="modal.title"
      :message="modal.message"
      :confirm-text="modal.confirmText"
      :cancel-text="modal.cancelText"
      :hide-close-button="modal.hideCloseButton"
      :close-on-overlay="modal.closeOnOverlay"
      @confirm="modal.onConfirm"
      @cancel="modal.onCancel"
      @close="modal.onClose"
    />
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

.main-content {
  padding-bottom: 20px; /* Espace minimal entre contenu et footer */
  min-height: calc(100vh - 70px); /* Assurer que le contenu prend toute la hauteur disponible */
}

/* Supprimer les paddings-top individuels car ils sont maintenant gérés globalement */
.router-view > * {
  margin-top: 0;
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
  color: #f5f5f5;
  transition: color 0.3s ease;
  vertical-align: middle;
}

.nav-link:hover .nav-icon {
  color: #34d399;
}

/* Styles pour le dropdown utilisateur */
.user-dropdown-toggle {
  position: relative;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.user-dropdown-toggle:hover {
  background-color: rgba(52, 211, 153, 0.1);
  color: #34d399 !important;
}

.user-icon {
  color: #f5f5f5;
  transition: color 0.3s ease;
  vertical-align: middle;
}

.user-dropdown-toggle:hover .user-icon {
  color: #34d399;
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
  background-color: rgba(52, 211, 153, 0.1) !important;
  color: #34d399 !important;
  transform: translateX(5px);
}

.user-dropdown-menu .dropdown-item:active {
  background-color: rgba(52, 211, 153, 0.2) !important;
  color: #34d399 !important;
}

.user-dropdown-menu .dropdown-item i {
  width: 18px;
  color: #34d399;
  opacity: 0.8;
  flex-shrink: 0;
  margin-right: 8px;
}

.user-dropdown-menu .dropdown-item .dropdown-icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  color: #34d399;
  opacity: 0.8;
  display: inline-block;
  text-align: center;
  flex-shrink: 0;
}

.user-dropdown-menu .dropdown-divider {
  border-color: rgba(52, 211, 153, 0.2);
  margin: 0.5rem 0;
}

/* Assurer que le dropdown soit visible au-dessus du contenu */
.dropdown-menu.show {
  z-index: 1050;
}

/* Responsive pour mobile */
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
