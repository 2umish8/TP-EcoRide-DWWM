<template>
  <form @submit.prevent="onSubmit" class="search-field">
    <div class="search-input-wrapper">
      <CityAutocomplete
        v-model="localForm.departure"
        placeholder="Partir de ..."
        storage-key="recentCities-departure"
      />
    </div>
    <div class="search-input-wrapper">
      <CityAutocomplete
        v-model="localForm.destination"
        placeholder="Aller à ..."
        storage-key="recentCities-destination"
      />
    </div>
    <div class="search-input-wrapper">
      <DateInput v-model="localForm.date" :min="minDate" lang="fr" />
    </div>
    <SecondaryButton type="submit" class="search-btn">
      <span class="eco">eco</span>RIDEZ
      <font-awesome-icon :icon="['fas', 'search']" class="search-icon" aria-hidden="true" />
    </SecondaryButton>
  </form>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import SecondaryButton from './ui/SecondaryButton.vue'
import CityAutocomplete from './ui/CityAutocomplete.vue'
import DateInput from './ui/DateInput.vue'

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

<style scoped>
.search-icon {
  margin-left: 10px;
}

.search-btn {
  color: var(--color-light);
  border-width: 3px;
  border-radius: 9999px;
  padding: 15px 25px;
  font-weight: 600;
  gap: 0;
}

.eco {
  margin: 0;
  padding: 0;
  font-weight: 200;
  color: var(--color-primary);
}

.search-field {
  display: flex;
  align-items: center;
  gap: 0;
  flex-wrap: nowrap;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50px;
  padding: 8px;
  width: 100%;
  max-width: none;
}

.search-input {
  border: none;
  background: rgba(213, 213, 213, 0.1);
  border-color: var(--color-grey);
  border-radius: 25px;
  padding: 0 20px;
  font-size: 1rem;
  color: var(--color-light);
  flex: 1;
  outline: none;
  min-width: 0;
  display: flex;
  align-items: center;
  height: 48px;
  backdrop-filter: blur(2px);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
}

.search-input-wrapper {
  flex: 1;
  margin: 0 2px;
  min-width: 0;
}

/* Mobile-first: stack inputs vertically on small screens */
@media (max-width: 767px) {
  .search-field {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    padding: 10px;
    border-radius: 16px;
  }

  .search-input,
  .search-input-wrapper {
    flex: none;
    width: 100%;
    margin: 0;
    border-radius: 12px;
  }

  .search-btn {
    width: 100%;
    justify-content: center;
    padding: 12px 16px;
    margin-left: 0;
    border-radius: 12px;
  }
}

/* On wider screens keep a wide horizontal layout */
@media (min-width: 768px) {
  .search-field {
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }

  .search-input-wrapper:nth-of-type(1),
  .search-input-wrapper:nth-of-type(2) {
    flex: 1;
  }

  .search-input-wrapper:nth-of-type(3) {
    flex: 0.7;
  }

  .search-btn {
    flex: 0.6;
    margin-left: 0;
  }
}

.search-input-wrapper:nth-of-type(1),
.search-input-wrapper:nth-of-type(2) {
  flex: 1;
}

.search-input:nth-of-type(3) {
  flex: 0.7;
}
</style>
