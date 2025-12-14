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

<style scoped>
/* Minimal selection of search-related styles (kept consistent with HomeView styling) */
.search-section {
  width: 100%;
  max-width: none;
}

.search-bar {
  background: transparent;
  border-radius: 50px;
  padding: 0;
  box-shadow: none;
}

.search-inputs {
  display: flex;
  align-items: center;
  gap: 0;
  flex-wrap: nowrap;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50px;
  padding: 8px;
}

.input-group {
  display: flex;
  align-items: center;
  flex: 1;
  background: rgba(213, 213, 213, 0.1);
  border-color: #666666;
  border-radius: 25px;
  margin: 0 4px;
  padding: 0 20px;
  min-width: 0;
}

.input-group:nth-child(1),
.input-group:nth-child(2) {
  flex: 0.35;
}

.input-group:nth-child(3) {
  flex: 0.3;
}

/* Mobile-first: stack inputs vertically on small screens */
@media (max-width: 767px) {
  .search-inputs {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    padding: 10px;
    border-radius: 16px;
  }

  .input-group {
    flex: none;
    width: 100%;
    margin: 0;
    padding: 0 14px;
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
  .search-inputs {
    flex-direction: row;
    align-items: center;
    gap: 0;
  }

  .input-group:nth-child(1),
  .input-group:nth-child(2) {
    flex: 0.35;
  }

  .input-group:nth-child(3) {
    flex: 0.3;
  }

  .search-btn {
    width: auto;
    margin-left: 8px;
  }
}

.search-input {
  border: none;
  background: transparent;
  font-size: 1rem;
  color: #ffffff;
  flex: 1;
  padding: 15px 0;
  outline: none;
  min-width: 0;
  width: 100%;
}

.search-btn {
  background: #34d399;
  color: #1a1a1a;
  border: none;
  padding: 15px 25px;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background 0.3s ease;
  white-space: nowrap;
  margin-left: 8px;
  flex-shrink: 0;
  min-width: auto;
}

.browse-all-btn {
  background: rgba(52, 211, 153, 0.15);
  color: #34d399;
  border: 2px solid #34d399;
  padding: 12px 20px;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  backdrop-filter: blur(10px);
}
</style>
