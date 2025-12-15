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
.danger-btn {
  background-color: var(--color-error);
  color: var(--color-light);
}

.danger-btn:hover {
  background-color: #a8505a;
}

.danger-btn[disabled] {
  background-color: var(--color-gray);
  color: var(--color-light);
}
</style>
