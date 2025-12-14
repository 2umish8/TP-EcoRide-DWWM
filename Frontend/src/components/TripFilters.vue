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
      <div class="ecological-filter">
        <label class="feature-option">
          <input
            type="checkbox"
            :checked="filters.isElectric"
            @change="updateFilter('isElectric', $event.target.checked)"
          />
          Voiture électrique uniquement
        </label>
      </div>
    </div>

    <div class="filter-group">
      <h4>Durée maximale</h4>
      <div class="duration-filter">
        <select
          :value="filters.maxDuration"
          @change="updateFilter('maxDuration', $event.target.value)"
          class="duration-select"
        >
          <option value="480">Toutes durées</option>
          <option value="60">1h maximum</option>
          <option value="120">2h maximum</option>
          <option value="180">3h maximum</option>
          <option value="240">4h maximum</option>
          <option value="300">5h maximum</option>
        </select>
      </div>
    </div>

    <div class="filter-group">
      <h4>Note minimale du chauffeur</h4>
      <div class="rating-filter">
        <select
          :value="filters.minRating"
          @change="updateFilter('minRating', $event.target.value)"
          class="rating-select"
        >
          <option value="0">Toutes notes</option>
          <option value="3">3 étoiles et plus</option>
          <option value="4">4 étoiles et plus</option>
          <option value="4.5">4.5 étoiles et plus</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
import IconCredit from '@/components/icons/IconCredit.vue'

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
  background: #2a2a2a;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  height: fit-content;
  position: sticky;
  top: 20px;
  border: 1px solid #444;
  min-width: 260px;
  max-width: 320px;
}

.filters-sidebar h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: white;
  margin-bottom: 20px;
}

.filter-group {
  margin-bottom: 24px;
}

.filter-group h4 {
  font-size: 1rem;
  font-weight: 600;
  color: white;
  margin-bottom: 12px;
}

.price-slider {
  width: 100%;
  margin-bottom: 8px;
  accent-color: #34d399;
}

.price-value {
  font-weight: 600;
  color: #34d399;
}

.ecological-filter,
.duration-filter,
.rating-filter {
  margin-top: 10px;
}

.duration-select,
.rating-select {
  width: 100%;
  padding: 8px 12px;
  background: #1a1a1a;
  color: white;
  border: 1px solid #444;
  border-radius: 6px;
  margin-top: 8px;
}

.feature-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 0;
  color: #ccc;
}

.feature-option input {
  accent-color: #34d399;
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
