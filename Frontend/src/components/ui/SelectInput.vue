<template>
  <select
    :value="modelValue"
    @change="$emit('update:modelValue', $event.target.value)"
    :class="['select-input', size, variant]"
    v-bind="$attrs"
  >
    <slot />
  </select>
</template>

<script setup>
defineProps({
  modelValue: { type: [String, Number], default: '' },
  size: { type: String, default: 'md' },
  variant: { type: String, default: 'default' },
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.select-input {
  padding: 0.75rem;
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  background: var(--color-dark-tertiary);
  color: var(--color-light-secondary);
  font-size: 1rem;
  transition: border-color 0.3s ease;
  cursor: pointer;
}

.select-input:focus {
  outline: none;
  border-color: var(--color-success);
}

.select-input.sm {
  padding: 0.5rem;
  font-size: 0.9rem;
}

.select-input.lg {
  padding: 1rem;
  font-size: 1.1rem;
}

.select-input.light {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.25);
}
</style>
