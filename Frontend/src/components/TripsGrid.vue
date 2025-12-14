<template>
  <div class="trips-grid">
    <trip-card
      v-for="(item, index) in items"
      :key="item.key || index"
      :trip="item.trip"
      :show-earnings="item.showEarnings"
      :show-price="item.showPrice"
    >
      <template #actions>
        <slot :item="item" :index="index" />
      </template>
    </trip-card>
  </div>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    required: true,
    validator: (arr) => Array.isArray(arr),
  },
})

import TripCard from './TripCard.vue'
</script>

<style scoped>
.trips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .trips-grid {
    grid-template-columns: 1fr;
  }
}
</style>
