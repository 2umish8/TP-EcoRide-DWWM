<template>
  <BaseState type="empty">
    <template #icon>
      <font-awesome-icon :icon="icon" />
    </template>
    <template #title>{{ title }}</template>
    <template #message>
      <slot>{{ message }}</slot>
    </template>
    <template #actions>
      <slot name="actions" />
    </template>
  </BaseState>
</template>

<script setup>
defineProps({
  icon: {
    type: [String, Array],
    default: () => ['fas', 'inbox'],
  },
  title: {
    type: String,
    default: 'Aucun résultat',
  },
  message: {
    type: String,
    default: "Il n'y a rien à afficher pour le moment.",
  },
})

import BaseState from './BaseState.vue'
</script>

<style scoped>
/* Inherits from BaseState */
</style>
