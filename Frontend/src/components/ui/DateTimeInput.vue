<template>
  <div class="datetime-input-wrapper">
    <div class="datetime-inputs">
      <div class="date-time-group">
        <DateInput
          :model-value="dateValue"
          @update:model-value="updateDateTime('date', $event)"
          :min="min"
        />
        <TextInput
          type="time"
          :model-value="timeValue"
          @update:model-value="updateDateTime('time', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import DateInput from './DateInput.vue'
import TextInput from './TextInput.vue'

const props = defineProps({
  modelValue: { type: String, default: '' }, // ISO format: "2025-12-20T14:30"
  min: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

// Parse ISO datetime into date and time parts
const dateValue = computed(() => {
  if (!props.modelValue) return ''
  return props.modelValue.split('T')[0]
})

const timeValue = computed(() => {
  if (!props.modelValue) return ''
  return props.modelValue.split('T')[1]?.substring(0, 5) || ''
})

const updateDateTime = (field, value) => {
  const currentDate = dateValue.value || ''
  const currentTime = timeValue.value || ''

  let newDate = currentDate
  let newTime = currentTime

  if (field === 'date') {
    newDate = value
  } else if (field === 'time') {
    newTime = value
  }

  if (newDate && newTime) {
    emit('update:modelValue', `${newDate}T${newTime}`)
  }
}
</script>

<style scoped>
.datetime-input-wrapper {
  width: 100%;
}

.datetime-inputs {
  display: flex;
  gap: 1rem;
  width: 100%;
}

.date-time-group {
  display: flex;
  gap: 1rem;
  flex: 1;
  width: 100%;
}

.date-time-group :deep(> *) {
  flex: 1;
  min-width: 0;
}
</style>
