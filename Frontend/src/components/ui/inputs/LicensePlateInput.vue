<template>
  <BaseInput
    :model-value="modelValue"
    :placeholder="placeholder"
    :size="size"
    :variant="variant"
    type="text"
    maxlength="9"
    @update:model-value="handleInput"
    @focus="$emit('focus')"
    @blur="$emit('blur')"
    v-bind="$attrs"
  />
</template>

<script setup>
import BaseInput from './BaseInput.vue'

defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'AB-123-CD' },
  size: { type: String, default: 'md' },
  variant: { type: String, default: 'default' },
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur'])

const handleInput = (value) => {
  let input = value.toUpperCase().replace(/[^A-Z0-9-]/g, '')
  let formatted = ''
  let charIndex = 0

  // 2 letters
  while (charIndex < input.length && formatted.length < 2 && /[A-Z]/.test(input[charIndex])) {
    formatted += input[charIndex]
    charIndex++
  }

  // Skip dashes in input
  while (charIndex < input.length && input[charIndex] === '-') {
    charIndex++
  }

  // Add dash if we have 2 letters and more input
  if (formatted.length === 2 && charIndex < input.length) {
    formatted += '-'
  }

  // 3 numbers
  while (charIndex < input.length && formatted.length < 6 && /[0-9]/.test(input[charIndex])) {
    formatted += input[charIndex]
    charIndex++
  }

  // Skip dashes in input
  while (charIndex < input.length && input[charIndex] === '-') {
    charIndex++
  }

  // Add dash if we have 6 chars (2 letters + dash + 3 numbers) and more input
  if (formatted.length === 6 && charIndex < input.length) {
    formatted += '-'
  }

  // 2 letters
  while (charIndex < input.length && formatted.length < 9 && /[A-Z]/.test(input[charIndex])) {
    formatted += input[charIndex]
    charIndex++
  }

  emit('update:modelValue', formatted)
}
</script>
