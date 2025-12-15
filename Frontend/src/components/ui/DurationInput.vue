<template>
  <div class="duration-input-wrapper">
    <div class="duration-inputs">
      <div class="duration-group">
        <div class="input-field">
          <TextInput
            type="number"
            :model-value="hours"
            @update:model-value="updateDuration('hours', $event)"
            placeholder="0"
            min="0"
            max="24"
          />
          <span class="unit">h</span>
        </div>
        <div class="input-field">
          <TextInput
            type="number"
            :model-value="minutes"
            @update:model-value="updateDuration('minutes', $event)"
            placeholder="0"
            min="0"
            max="59"
          />
          <span class="unit">min</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import TextInput from './TextInput.vue'

const props = defineProps({
  modelValue: { type: String, default: '02:00' }, // Format: "HH:MM"
})

const emit = defineEmits(['update:modelValue'])

// Parse duration from "HH:MM" format
const hours = computed(() => {
  const [h] = props.modelValue.split(':')
  return h || '0'
})

const minutes = computed(() => {
  const [, m] = props.modelValue.split(':')
  return m || '0'
})

const updateDuration = (field, value) => {
  const numValue = Math.max(0, parseInt(value) || 0)

  if (field === 'hours') {
    const limitedHours = Math.min(numValue, 24)
    const mins = parseInt(minutes.value) || 0
    emit(
      'update:modelValue',
      `${String(limitedHours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`,
    )
  } else if (field === 'minutes') {
    const limitedMins = Math.min(numValue, 59)
    const hrs = parseInt(hours.value) || 0
    emit(
      'update:modelValue',
      `${String(hrs).padStart(2, '0')}:${String(limitedMins).padStart(2, '0')}`,
    )
  }
}
</script>

<style scoped>
.duration-input-wrapper {
  width: 100%;
}

.duration-inputs {
  display: flex;
  gap: 1rem;
  width: 100%;
}

.duration-group {
  display: flex;
  gap: 0.5rem;
  flex: 1;
  width: 100%;
}

.input-field {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  position: relative;
}

.input-field :deep(> .text-input),
.input-field :deep(> input) {
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
