<template>
  <BaseState type="loading">
    <template #icon>
      <div class="loading-spinner"></div>
    </template>
    <template #title>{{ title }}</template>
    <template #message>{{ message }}</template>
  </BaseState>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: 'Chargement...',
  },
  message: {
    type: String,
    default: '',
  },
})

import BaseState from './BaseState.vue'
</script>

<style scoped>
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-light-secondary);
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
