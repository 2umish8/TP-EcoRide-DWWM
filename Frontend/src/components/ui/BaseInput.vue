<template>
  <input
    :type="type"
    :placeholder="placeholder"
    :value="modelValue"
    :class="['base-input', size, variant]"
    @input="$emit('update:modelValue', $event.target.value)"
    @focus="$emit('focus')"
    @blur="$emit('blur')"
    v-bind="$attrs"
  />
</template>

<script setup>
defineProps({
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  size: { type: String, default: 'md', validator: (v) => ['sm', 'md', 'lg'].includes(v) },
  variant: { type: String, default: 'default', validator: (v) => ['default', 'light'].includes(v) },
})
defineEmits(['update:modelValue', 'focus', 'blur'])
</script>

<style scoped>
.base-input {
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s ease;
  backdrop-filter: blur(2px);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
  color: var(--color-light);
  width: 100%;
}

/* Size variants */
.base-input.sm {
  padding: 0.5rem 1rem;
  height: 36px;
  font-size: 0.9rem;
}

.base-input.md {
  padding: 0 20px;
  height: 48px;
  font-size: 1rem;
}

.base-input.lg {
  padding: 0 24px;
  height: 56px;
  font-size: 1.1rem;
}

/* Color variants */
.base-input.default {
  background: rgba(213, 213, 213, 0.1);
}

.base-input.light {
  background: rgba(255, 255, 255, 0.15);
}

.base-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.base-input:focus {
  background: rgba(213, 213, 213, 0.15);
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.3),
    0 0 8px rgba(143, 218, 179, 0.2);
}

/* Style calendar icon for date inputs */
.base-input[type='date']::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
}
</style>
