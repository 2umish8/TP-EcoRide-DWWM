<template>
  <div class="filters-sidebar">
    <h3>Filtrer les résultats</h3>

    <div class="filter-group">
      <h4>Prix maximum</h4>
      <input
        type="range"
        min="5"
        max="100"
        step="5"
        :value="filters.maxPrice"
        @input="updateFilter('maxPrice', $event.target.value)"
        class="price-slider"
      />
      <span class="price-value"
        >{{ filters.maxPrice }}<IconCredit style="vertical-align: middle; margin-left: 2px"
      /></span>
    </div>

    <div class="filter-group">
      <h4>Aspect écologique</h4>
      <label class="checkbox-label">
        <input
          type="checkbox"
          :checked="filters.isElectric"
          @change="updateFilter('isElectric', $event.target.checked)"
        />
        <span class="checkmark"></span>
        Voiture électrique uniquement
      </label>
    </div>

    <div class="filter-group">
      <h4>Durée maximale</h4>
      <SelectInput
        :modelValue="filters.maxDuration"
        @update:modelValue="updateFilter('maxDuration', $event)"
        class="filter-select"
      >
        <option value="480">Toutes durées</option>
        <option value="60">1h maximum</option>
        <option value="120">2h maximum</option>
        <option value="180">3h maximum</option>
        <option value="240">4h maximum</option>
        <option value="300">5h maximum</option>
      </SelectInput>
    </div>

    <div class="filter-group">
      <h4>Note minimale du chauffeur</h4>
      <SelectInput
        :modelValue="filters.minRating"
        @update:modelValue="updateFilter('minRating', $event)"
        class="filter-select"
      >
        <option value="0">Toutes notes</option>
        <option value="3">3 étoiles et plus</option>
        <option value="4">4 étoiles et plus</option>
        <option value="4.5">4.5 étoiles et plus</option>
      </SelectInput>
    </div>
  </div>
</template>

<script setup>
import IconCredit from '@/components/shared/icons/IconCredit.vue'
import SelectInput from '@/components/ui/inputs/SelectInput.vue'

defineProps({
  filters: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update-filter'])

const updateFilter = (key, value) => {
  const numValue = ['maxPrice', 'maxDuration', 'minRating'].includes(key) ? Number(value) : value
  emit('update-filter', { key, value: numValue })
}
</script>

<style scoped>
.filters-sidebar {
  background: var(--color-dark-secondary);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  height: fit-content;
  position: sticky;
  top: 20px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  min-width: 260px;
  max-width: 320px;
}

.filters-sidebar h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--color-light);
  margin-bottom: 20px;
}

.filter-group {
  margin-bottom: 24px;
}

.filter-group h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-light);
  margin-bottom: 12px;
}

.price-slider {
  width: 100%;
  margin-bottom: 8px;
  accent-color: var(--color-primary);
}

.price-value {
  font-weight: 600;
  color: var(--color-primary);
}

.filter-select {
  width: 100%;
  margin-top: 10px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  margin-top: 10px;
}

.checkbox-label input[type='checkbox'] {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  background: var(--color-dark-tertiary);
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  position: relative;
  transition: all 0.3s;
  flex-shrink: 0;
}

.checkbox-label input[type='checkbox']:checked + .checkmark {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.checkbox-label input[type='checkbox']:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--color-dark);
  font-weight: bold;
  font-size: 0.9rem;
}

.checkbox-label {
  color: var(--color-light-secondary);
}

@media (max-width: 900px) {
  .filters-sidebar {
    position: static;
    margin: 0 0 24px 0;
    width: 100%;
    max-width: 100%;
  }

  .filters-sidebar h3 {
    text-align: center;
    margin-bottom: 15px;
  }

  .filter-group {
    margin-bottom: 15px;
  }
}
</style>
