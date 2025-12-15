<template>
  <AutoCompleteInput
    :model-value="modelValue"
    :placeholder="placeholder"
    :suggestions="options"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  options: { type: Array, required: true },
})

defineEmits(['update:modelValue'])
</script>

<script>
import AutoCompleteInput from './AutoCompleteInput.vue'

export default {
  components: {
    AutoCompleteInput,
  },
}
</script>
