<script setup>
import { ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import NavMenu from './navbar/NavMenu.vue'
import NavActions from './navbar/NavActions.vue'

const authStore = useAuthStore()
const route = useRoute()
const isNavOpen = ref(false)

const toggleNav = () => {
  isNavOpen.value = !isNavOpen.value
}

const closeNav = () => {
  isNavOpen.value = false
}

const handleLogoClick = () => {
  if (route.path === '/') {
    window.location.reload()
  }
}
</script>

<template>
  <nav class="navbar">
    <!-- Logo -->
    <RouterLink class="navbar-brand" to="/" @click="handleLogoClick">
      <img src="@/assets/Logo ecoride transparent.PNG" alt="EcoRide" class="navbar-logo" />
    </RouterLink>

    <!-- Hamburger toggle for mobile -->
    <button class="navbar-toggler" type="button" @click="toggleNav" :class="{ active: isNavOpen }">
      <span class="navbar-toggler-icon"></span>
    </button>

    <!-- Navigation items wrapper -->
    <div class="navbar-nav-wrapper" :class="{ open: isNavOpen }">
      <NavMenu :isLoggedIn="authStore.isLoggedIn" @navigate="closeNav" />
      <NavActions @navigate="closeNav" />
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background: linear-gradient(to right, var(--color-dark), var(--color-dark-secondary));
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.75rem 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  width: 100%;
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
  background: var(--color-light);
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

/* Tablet (768px - 1024px) */
@media (max-width: 1024px) {
  .navbar {
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
}

/* Mobile (< 768px) */
@media (max-width: 767px) {
  .navbar {
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
    background: var(--color-dark);
    border: 1px solid rgba(255, 255, 255, 0.1);
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
}

/* Very small phones (< 360px) */
@media (max-width: 359px) {
  .navbar-logo {
    height: 28px;
  }
}
</style>
