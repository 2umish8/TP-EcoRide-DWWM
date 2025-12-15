<template>
  <BaseButton v-bind="$attrs" :size="props.size" :class="computedClass">
    <slot />
  </BaseButton>
</template>

<script setup>
import BaseButton from './BaseButton.vue'
const props = defineProps({ size: { type: String, default: 'md' } })
const computedClass = props.size && props.size !== 'md' ? `btn-${props.size}` : ''
</script>

<style scoped>
.success-btn {
  background-color: var(--color-success);
  color: var(--color-light);
}

.success-btn:hover {
  background-color: #2fa347;
}

.success-btn[disabled] {
  background-color: var(--color-gray);
  color: var(--color-light);
}
</style>
