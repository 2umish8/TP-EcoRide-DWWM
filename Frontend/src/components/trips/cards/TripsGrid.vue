<template>
  <div class="trips-grid">
    <TripCard
      v-for="(item, index) in items"
      :key="item.key || index"
      :trip="item.trip"
      :show-earnings="item.showEarnings"
      :show-price="item.showPrice"
    >
      <template #actions>
        <slot :item="item" :index="index" />
      </template>
    </TripCard>
  </div>
</template>

<script setup>
import TripCard from './TripCard.vue'

defineProps({
  items: {
    type: Array,
    required: true,
    validator: (arr) => Array.isArray(arr),
  },
})
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
