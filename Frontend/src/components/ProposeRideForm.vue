<template>
  <div class="propose-ride-card">
    <h3 class="card-title">Proposer un EcoRide</h3>

    <form @submit.prevent="$emit('submit', formData)" class="propose-ride-form">
      <!-- Vehicle selection -->
      <div v-if="vehicles.length > 0" class="form-group">
        <label class="form-label">
          <font-awesome-icon :icon="['fas', 'car']" /> Véhicule à utiliser
        </label>
        <select v-model="formData.vehicleId" class="form-input" required>
          <option value="">Sélectionner un véhicule</option>
          <option v-for="vehicle in vehicles" :key="vehicle.id" :value="vehicle.id">
            {{ vehicle.brand_name || vehicle.brand }} {{ vehicle.model }} -
            {{ vehicle.plate_number }}
          </option>
        </select>
      </div>

      <!-- No vehicle warning -->
      <div v-if="vehicles.length === 0" class="no-vehicle-warning">
        <span class="warning-icon"
          ><font-awesome-icon :icon="['fas', 'triangle-exclamation']"
        /></span>
        <p>Vous devez d'abord ajouter un véhicule pour proposer un trajet.</p>
      </div>

      <!-- Departure and destination -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">
            <font-awesome-icon :icon="['fas', 'location-dot']" /> Lieu de départ
          </label>
          <input
            type="text"
            v-model="formData.departure"
            class="form-input"
            placeholder="Entrez le lieu de départ"
            required
          />
        </div>
        <div class="form-group">
          <label class="form-label">
            <font-awesome-icon :icon="['fas', 'flag-checkered']" /> Lieu d'arrivée
          </label>
          <input
            type="text"
            v-model="formData.destination"
            class="form-input"
            placeholder="Entrez le lieu d'arrivée"
            required
          />
        </div>
      </div>

      <!-- Date and time -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">
            <font-awesome-icon :icon="['fas', 'calendar']" /> Date de départ
          </label>
          <input type="date" v-model="formData.date" :min="minDate" class="form-input" required />
        </div>
        <div class="form-group">
          <label class="form-label">
            <font-awesome-icon :icon="['fas', 'clock']" /> Heure de départ
          </label>
          <input type="time" v-model="formData.time" class="form-input" required />
        </div>
      </div>

      <!-- Price and seats -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">
            <font-awesome-icon :icon="['fas', 'coins']" /> Prix par passager (€)
          </label>
          <input
            type="number"
            v-model="formData.price"
            class="form-input"
            placeholder="15"
            min="0"
            step="0.50"
            required
          />
        </div>
        <div class="form-group">
          <label class="form-label">
            <font-awesome-icon :icon="['fas', 'user-group']" /> Places offertes
          </label>
          <div class="select-container">
            <select
              v-model="formData.seats"
              class="form-input"
              required
              :disabled="!formData.vehicleId"
            >
              <option value="">Sélectionner</option>
              <option v-for="n in availableSeats" :key="n" :value="n">
                {{ n }} place{{ n > 1 ? 's' : '' }}
              </option>
            </select>

            <!-- Tooltip when no vehicle selected -->
            <div v-if="!formData.vehicleId" class="tooltip-orange">
              <span class="tooltip-icon"
                ><font-awesome-icon :icon="['fas', 'triangle-exclamation']"
              /></span>
              <span class="tooltip-text">Choisissez d'abord un véhicule</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Submit button -->
      <div class="propose-ride-actions">
        <PrimaryButton type="submit" :disabled="!canSubmit || vehicles.length === 0">
          <font-awesome-icon :icon="['fas', 'car']" class="propose-icon" />
          Proposer un EcoRide
        </PrimaryButton>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch, defineProps, defineEmits } from 'vue'
import PrimaryButton from '@/components/ui/PrimaryButton.vue'

const props = defineProps({
  vehicles: {
    type: Array,
    required: true,
  },
})

defineEmits(['submit'])

const formData = ref({
  departure: '',
  destination: '',
  date: '',
  time: '',
  price: '',
  seats: '',
  vehicleId: '',
})

const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const availableSeats = computed(() => {
  if (!formData.value.vehicleId) {
    return 0
  }

  const selectedVehicle = props.vehicles.find((v) => v.id == formData.value.vehicleId)
  if (!selectedVehicle) {
    return 0
  }

  const maxSeats = parseInt(selectedVehicle.seats_available)
  return Array.from({ length: maxSeats }, (_, i) => i + 1)
})

const canSubmit = computed(() => {
  return (
    formData.value.departure &&
    formData.value.destination &&
    formData.value.date &&
    formData.value.time &&
    formData.value.price &&
    formData.value.seats &&
    formData.value.vehicleId
  )
})

// Reset seats when vehicle changes
watch(
  () => formData.value.vehicleId,
  () => {
    formData.value.seats = ''
  },
)

// Expose formData for parent component
defineExpose({
  formData,
  reset: () => {
    formData.value = {
      departure: '',
      destination: '',
      date: '',
      time: '',
      price: '',
      seats: '',
      vehicleId: '',
    }
  },
})
</script>

<style scoped>
.propose-ride-card {
  background: var(--color-dark);
  border-radius: 20px;
  padding: 30px;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.card-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--color-light);
  margin-bottom: 20px;
  margin-top: 0;
}

.propose-ride-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  color: var(--color-light);
  font-weight: 600;
  font-size: 0.9rem;
}

.form-input {
  padding: 12px 16px;
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  background: var(--color-dark-secondary);
  color: var(--color-light);
  font-size: 0.95rem;
  width: 100%;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(143, 218, 179, 0.18);
}

.form-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.no-vehicle-warning {
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid var(--color-warning);
  border-radius: 10px;
  padding: 15px;
  text-align: center;
  color: var(--color-warning);
  margin: 10px 0;
}

.warning-icon {
  font-size: 1.5rem;
  display: block;
  margin-bottom: 8px;
}

.no-vehicle-warning p {
  margin: 0;
  font-size: 0.9rem;
}

.select-container {
  position: relative;
}

.tooltip-orange {
  position: absolute;
  top: -35px;
  left: 0;
  background: rgba(255, 152, 0, 0.95);
  color: var(--color-light);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
  z-index: 10;
  animation: tooltipFadeIn 0.3s ease;
  white-space: nowrap;
}

.tooltip-orange::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 20px;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid rgba(255, 152, 0, 0.95);
}

.tooltip-icon {
  font-size: 0.9rem;
}

.tooltip-text {
  white-space: nowrap;
}

.propose-ride-actions {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.propose-btn {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-success) 100%);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 15px;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 15px rgba(52, 211, 153, 0.3);
}

.propose-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(52, 211, 153, 0.4);
}

.propose-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.propose-icon {
  font-size: 1.2rem;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
