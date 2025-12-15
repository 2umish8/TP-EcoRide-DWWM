<template>
  <textarea
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    :class="['textarea-input', size, variant]"
    v-bind="$attrs"
  ></textarea>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  size: { type: String, default: 'md' },
  variant: { type: String, default: 'default' },
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.textarea-input {
  padding: 0.75rem;
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  background: var(--color-dark-tertiary);
  color: var(--color-light-secondary);
  font-size: 1rem;
  transition: border-color 0.3s ease;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

.textarea-input:focus {
  outline: none;
  border-color: var(--color-success);
}

.textarea-input.sm {
  padding: 0.5rem;
  font-size: 0.9rem;
  min-height: 80px;
}

.textarea-input.lg {
  padding: 1rem;
  font-size: 1.1rem;
  min-height: 120px;
}

.textarea-input.light {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.25);
}
</style>
