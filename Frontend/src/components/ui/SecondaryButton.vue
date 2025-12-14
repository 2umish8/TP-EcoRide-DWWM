<template>
  <BaseButton v-bind="$attrs" :size="props.size" :class="computedClass">
    <slot />
  </BaseButton>
</template>

<script setup>
import BaseButton from './BaseButton.vue'
const props = defineProps({ size: { type: String, default: 'md' } })
const computedClass = `secondary-btn ${props.size && props.size !== 'md' ? `btn-${props.size}` : ''}`
</script>

<style scoped>
.secondary-btn {
  background-color: rgba(143, 218, 179, 0.1);
  backdrop-filter: blur(8px);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}
.secondary-btn:hover {
  background-color: var(--color-primary);
  color: var(--color-dark);
  /* hover raise/box-shadow handled by BaseButton */
}
.secondary-btn[disabled] {
  background-color: rgba(122, 122, 122, 0.2);
  color: var(--color-gray);
  border-color: var(--color-gray);
  cursor: not-allowed;
}
</style>





