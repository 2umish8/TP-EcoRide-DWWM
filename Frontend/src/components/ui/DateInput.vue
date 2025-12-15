<template>
  <BaseInput
    :model-value="modelValue"
    type="date"
    :placeholder="placeholder"
    :size="size"
    :variant="variant"
    @update:model-value="$emit('update:modelValue', $event)"
    @focus="$emit('focus')"
    @blur="$emit('blur')"
    :min="min"
    v-bind="$attrs"
  />
</template>

<script setup>
import BaseInput from './BaseInput.vue'

defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  min: { type: String, default: '' },
  size: { type: String, default: 'md' },
  variant: { type: String, default: 'default' },
})
defineEmits(['update:modelValue', 'focus', 'blur'])
</script>
