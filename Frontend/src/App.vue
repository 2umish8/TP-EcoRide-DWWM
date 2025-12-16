<script setup>
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppNavbar from './components/layout/AppNavbar.vue'
import AppFooter from './components/layout/AppFooter.vue'
import Notification from './components/ui/feedback/Notification.vue'
import { useNotificationStore } from './stores/notification'

const route = useRoute()
const notificationStore = useNotificationStore()

const hideLayout = computed(() => {
  // Pages qui ne doivent pas avoir la navbar et le footer
  const pagesWithoutLayout = ['Admin', 'login', 'register', 'forgot-password']
  return pagesWithoutLayout.includes(route.name) || route.path.startsWith('/admin')
})
</script>

<template>
  <div id="app">
    <!-- Navigation -->
    <AppNavbar v-if="!hideLayout" />

    <!-- Contenu principal -->
    <div class="main-content">
      <RouterView />
    </div>

    <!-- Footer -->
    <AppFooter v-if="!hideLayout" />

    <!-- Notification globale -->
    <Notification :notification="notificationStore.current" />
  </div>
</template>

<style>
#app {
  width: 100%;
  margin: 0;
  padding: 0;
}

.main-content {
  padding-bottom: 20px;
  min-height: calc(100vh - 70px);
}

.router-view > * {
  margin-top: 0;
}

footer {
  position: static;
  width: 100%;
  z-index: 100;
}
</style>
