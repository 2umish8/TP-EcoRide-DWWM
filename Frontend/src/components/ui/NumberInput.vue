<template>
  <div class="number-input-wrapper">
    <div class="number-input-group">
      <TextInput
        type="number"
        :model-value="modelValue"
        @update:model-value="updateNumber"
        :placeholder="placeholder"
        :min="min"
        :max="max"
      />
      <span v-if="unit" class="unit">{{ unit }}</span>
    </div>
  </div>
</template>

<script setup>
import TextInput from './TextInput.vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  min: { type: Number, default: 0 },
  max: { type: Number, default: undefined },
  placeholder: { type: String, default: '0' },
  unit: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const updateNumber = (value) => {
  let numValue = value === '' ? '' : parseInt(value) || 0

  // Enforce min/max bounds
  if (numValue !== '' && props.min !== undefined) {
    numValue = Math.max(numValue, props.min)
  }
  if (numValue !== '' && props.max !== undefined) {
    numValue = Math.min(numValue, props.max)
  }

  emit('update:modelValue', numValue)
}
</script>

<style scoped>
.number-input-wrapper {
  width: 100%;
}

.number-input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

.number-input-group :deep(> .text-input),
.number-input-group :deep(> input) {
  flex: 1;
  min-width: 0;
}

.unit {
  color: var(--color-gray);
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
}
</style>
