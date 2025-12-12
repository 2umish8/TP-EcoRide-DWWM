<script setup>
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppNavbar from './components/AppNavbar.vue'
import AppFooter from './components/AppFooter.vue'
import CustomModal from './components/CustomModal.vue'
import { useModal } from './composables/useModal'

const route = useRoute()
const { modals } = useModal()

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
