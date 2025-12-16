<template>
  <BaseButton
    v-bind="$attrs"
    :size="props.size"
    :class="['nav-btn', props.size && props.size !== 'md' ? `btn-${props.size}` : '']"
  >
    <slot />
  </BaseButton>
</template>

<script setup>
import BaseButton from './BaseButton.vue'
const props = defineProps({ size: { type: String, default: 'md' } })
</script>

<style scoped>
.nav-btn {
  background: transparent;
  color: var(--color-light);
  border: none;
  box-shadow: none;
  padding: 8px 12px;
}
.nav-btn:hover {
  backdrop-filter: blur(4px);
  background-color: rgba(255, 255, 255, 0.05);
}
.nav-btn[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
