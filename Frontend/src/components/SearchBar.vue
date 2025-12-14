<template>
  <div class="search-section">
    <div class="search-bar">
      <form @submit.prevent="onSubmit" class="search-inputs">
        <div class="input-group">
          <input
            type="text"
            placeholder="Partir de ..."
            class="search-input"
            v-model="localForm.departure"
            required
          />
        </div>
        <div class="input-group">
          <input
            type="text"
            placeholder="Aller à ..."
            class="search-input"
            v-model="localForm.destination"
            required
          />
        </div>
        <div class="input-group">
          <input
            type="date"
            placeholder="dd/mm/yyyy"
            class="search-input"
            v-model="localForm.date"
            lang="fr"
            :min="minDate"
          />
        </div>
        <button type="submit" class="search-btn">
          <span>ecoRIDEZ</span>
          <font-awesome-icon :icon="['fas', 'search']" class="search-icon" aria-hidden="true" />
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Props and emits
const props = defineProps({
  initialValues: {
    type: Object,
    default: () => ({ departure: '', destination: '', date: '' }),
  },
  compact: { type: Boolean, default: false },
})
const emit = defineEmits(['search', 'browse-all'])

const localForm = ref({
  departure: props.initialValues.departure || '',
  destination: props.initialValues.destination || '',
  date: props.initialValues.date || '',
})

watch(
  () => props.initialValues,
  (nv) => {
    localForm.value = { ...nv }
  },
)

const minDate = computed(() => new Date().toISOString().split('T')[0])

const onSubmit = () => {
  emit('search', { ...localForm.value })
}
</script>

