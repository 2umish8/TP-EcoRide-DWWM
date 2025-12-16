<template>
  <BaseButton v-bind="$attrs" :size="props.size" :class="['btn-primary', computedClass]">
    <slot />
  </BaseButton>
</template>

<script setup>
import BaseButton from './BaseButton.vue'
const props = defineProps({ size: { type: String, default: 'md' } })
const computedClass = props.size && props.size !== 'md' ? `btn-${props.size}` : ''
</script>

<style scoped>
.btn-primary {
  background: var(--color-primary);
  color: var(--color-dark);
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
}
</style>
