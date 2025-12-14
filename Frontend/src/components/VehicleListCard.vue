<template>
  <div class="vehicles-card">
    <div class="card-header">
      <h3 class="card-title">Mes Véhicules</h3>
      <button @click="$emit('add-vehicle')" class="add-btn">
        <font-awesome-icon :icon="['fas', 'plus']" class="add-icon" />
        Ajouter un véhicule
      </button>
    </div>

    <!-- Empty state -->
    <div v-if="vehicles.length === 0" class="empty-state">
      <span class="empty-icon"><font-awesome-icon :icon="['fas', 'car']" /></span>
      <p>Aucun véhicule enregistré</p>
      <small>Ajoutez votre premier véhicule pour proposer des trajets</small>
    </div>

    <!-- Vehicle list -->
    <div v-else class="vehicles-list">
      <div v-for="vehicle in vehicles" :key="vehicle.id" class="vehicle-item">
        <div class="vehicle-info">
          <h4>{{ vehicle.brand_name || vehicle.brand }} {{ vehicle.model }}</h4>
          <p class="vehicle-details">
            {{ vehicle.plate_number }} • {{ vehicle.seats_available }} places
            <span v-if="vehicle.is_electric" class="eco-badge">
              <font-awesome-icon :icon="['fas', 'bolt']" /> Électrique
            </span>
          </p>
        </div>
        <button @click="$emit('remove-vehicle', vehicle.id)" class="remove-btn">
          <font-awesome-icon :icon="['fas', 'trash']" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
  vehicles: {
    type: Array,
    required: true,
  },
})

defineEmits(['add-vehicle', 'remove-vehicle'])
</script>

<style scoped>
.vehicles-card {
  background: var(--color-dark);
  border-radius: 20px;
  padding: 30px;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--color-light);
  margin: 0;
}

.add-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
}

.add-btn:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
}

.add-icon {
  font-size: 1rem;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--color-light-secondary);
}

.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 15px;
  color: var(--color-primary);
}

.empty-state p {
  margin: 10px 0 5px;
  font-size: 1rem;
  color: var(--color-light);
}

.empty-state small {
  font-size: 0.9rem;
}

.vehicles-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.vehicle-item {
  background: var(--color-dark-secondary);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.vehicle-info {
  flex: 1;
}

.vehicle-info h4 {
  color: var(--color-light);
  font-size: 1.1rem;
  margin-bottom: 5px;
  margin-top: 0;
}

.vehicle-details {
  color: var(--color-light-secondary);
  font-size: 0.9rem;
  margin: 0;
}

.eco-badge {
  margin-left: 10px;
  color: var(--color-success);
  font-weight: 600;
}

.remove-btn {
  background: var(--color-error);
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.remove-btn:hover {
  background: var(--color-error);
  opacity: 0.8;
  transform: translateY(-1px);
}
</style>
