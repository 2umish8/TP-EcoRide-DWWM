<template>
  <BaseButton v-bind="$attrs" :size="props.size" :class="['tab-btn', { active: props.active }]">
    <slot />
  </BaseButton>
</template>

<script setup>
import BaseButton from './BaseButton.vue'
const props = defineProps({
  size: { type: String, default: 'md' },
  active: { type: Boolean, default: false },
})
</script>

<style scoped>
.tab-btn {
  background-color: transparent;
  color: var(--color-light);
  border: 1px solid var(--color-gray);
  box-shadow: none;
  padding: 0.5rem 1rem;
}

.tab-btn:hover {
  background-color: rgba(143, 218, 179, 0.1);
  border-color: var(--color-primary);
}

.tab-btn.active {
  background-color: var(--color-primary);
  color: var(--color-dark);
  border-color: var(--color-primary);
}

.tab-btn[disabled] {
  opacity: 0.6;
  background-color: transparent;
  border-color: var(--color-gray);
  color: var(--color-gray);
}
</style>
