<template>
  <BaseButton v-bind="$attrs" :class="`inline-link ${$attrs.class || ''}`">
    <slot />
  </BaseButton>
</template>

<script setup>
import BaseButton from './buttons/BaseButton.vue'
</script>

<style scoped>
.inline-link {
  color: var(--color-light-primary);
  text-decoration: underline;
  background: transparent;
  padding: 0;
}
.inline-link:hover {
  color: var(--color-secondary);
  transform: translateY(-1px);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}
.inline-link[disabled] {
  color: var(--color-gray-primary);
  text-decoration: none;
}
</style>
