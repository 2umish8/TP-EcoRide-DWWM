<template>
  <div class="base-card">
    <slot />
  </div>
</template>

<script setup>
defineProps({
  /** Optional CSS class for additional styling */
  class: String,
})
</script>

<style scoped>
.base-card {
  background: var(--color-dark-secondary);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  padding: 40px;
}
</style>
