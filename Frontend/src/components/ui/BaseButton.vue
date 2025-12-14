<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  disabled: { type: Boolean, default: false },
  type: { type: String, default: 'button' },
  to: { type: String, default: null },
})

const emit = defineEmits(['click'])

const classes = computed(() => {
  const cls = ['base-button']
  if (props.disabled) cls.push('disabled')
  return cls
})
</script>

<template>
  <RouterLink v-if="to" :to="to" :class="classes" @click="emit('click')">
    <slot />
  </RouterLink>
  <button v-else :type="type" :class="classes" :disabled="disabled" @click="emit('click')">
    <slot />
  </button>
</template>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: 10px 16px;
  border-radius: 8px;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  white-space: nowrap;
  border: none;
  cursor: pointer;
  transition: opacity 0.15s ease;
}
.base-button:disabled,
.base-button.disabled {
  cursor: not-allowed;
  opacity: 0.7;
  pointer-events: none;
}
</style>
