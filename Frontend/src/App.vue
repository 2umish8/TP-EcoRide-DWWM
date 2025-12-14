<script setup>
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppNavbar from './components/AppNavbar.vue'
import AppFooter from './components/AppFooter.vue'
import Notification from './components/Notification.vue'
import { useNotificationStore } from './stores/notification'

const route = useRoute()
const notificationStore = useNotificationStore()

const hideLayout = computed(() => {
  // Pages qui ne doivent pas avoir la navbar et le footer
  const pagesWithoutLayout = ['Admin', 'login', 'register', 'forgot-password']
  return pagesWithoutLayout.includes(route.name) || route.path.startsWith('/admin')
})

const mainPaddingTop = computed(() => {
  return hideLayout.value ? '0px' : '70px'
})
</script>

<template>
  <div id="app">
    <!-- Navigation -->
    <AppNavbar v-if="!hideLayout" />

    <!-- Contenu principal -->
    <div class="main-content" :style="{ paddingTop: mainPaddingTop }">
      <RouterView />
    </div>

    <!-- Footer -->
    <AppFooter v-if="!hideLayout" />

    <!-- Notification globale -->
    <Notification :notification="notificationStore.current" />
  </div>
</template>

