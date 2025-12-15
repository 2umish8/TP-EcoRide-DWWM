<template>
  <BaseInput
    :model-value="modelValue"
    :type="type"
    :placeholder="placeholder"
    :size="size"
    :variant="variant"
    @update:model-value="$emit('update:modelValue', $event)"
    @focus="$emit('focus')"
    @blur="$emit('blur')"
    v-bind="$attrs"
  />
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  size: { type: String, default: 'md' },
  variant: { type: String, default: 'default' },
})
defineEmits(['update:modelValue', 'focus', 'blur'])

import BaseInput from './BaseInput.vue'
</script>
