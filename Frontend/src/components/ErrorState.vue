<template>
  <BaseState type="error">
    <template #icon>
      <font-awesome-icon :icon="['fas', 'xmark']" />
    </template>
    <template #title>{{ title }}</template>
    <template #message>{{ message }}</template>
    <template #actions>
      <button v-if="showRetry" @click="$emit('retry')" class="retry-btn">
        {{ retryLabel }}
      </button>
    </template>
  </BaseState>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: 'Erreur de chargement',
  },
  message: {
    type: String,
    default: 'Une erreur est survenue.',
  },
  showRetry: {
    type: Boolean,
    default: true,
  },
  retryLabel: {
    type: String,
    default: 'Réessayer',
  },
})

defineEmits(['retry'])

import BaseState from './BaseState.vue'
</script>

<style scoped>
.retry-btn {
  background: var(--color-success);
  color: var(--color-light);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: inline-block;
  margin-top: 1rem;
  transition: background-color 0.3s ease;
}

.retry-btn:hover {
  background: rgba(67, 197, 97, 0.8);
}
</style>
