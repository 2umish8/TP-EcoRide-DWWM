<template>
  <div class="role-selection-card">
    <h3 class="card-title">Mon rôle sur EcoRide</h3>

    <!-- Loading state -->
    <div v-if="isLoading" class="loading-indicator">
      <font-awesome-icon :icon="['fas', 'hourglass-half']" class="loading-spinner" />
      <p>Chargement de votre profil...</p>
    </div>

    <!-- Role options -->
    <div v-else class="role-options">
      <label class="role-option" :class="{ active: modelValue.includes('passager') }">
        <input
          type="checkbox"
          value="passager"
          :checked="modelValue.includes('passager')"
          @change="updateRole"
        />
        <div class="role-content">
          <span class="role-icon"><font-awesome-icon :icon="['fas', 'car']" /></span>
          <div class="role-text">
            <h4>Passager</h4>
            <p>Je cherche des trajets à partager</p>
          </div>
        </div>
      </label>

      <label class="role-option" :class="{ active: modelValue.includes('chauffeur') }">
        <input
          type="checkbox"
          value="chauffeur"
          :checked="modelValue.includes('chauffeur')"
          @change="updateRole"
        />
        <div class="role-content">
          <span class="role-icon"><font-awesome-icon :icon="['fas', 'truck']" /></span>
          <div class="role-text">
            <h4>Chauffeur</h4>
            <p>Je propose mes véhicules pour covoiturer</p>
          </div>
        </div>
      </label>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'role-changed'])

const updateRole = (event) => {
  const value = event.target.value
  const checked = event.target.checked
  const newRoles = [...props.modelValue]

  if (checked && !newRoles.includes(value)) {
    newRoles.push(value)
  } else if (!checked && newRoles.includes(value)) {
    newRoles.splice(newRoles.indexOf(value), 1)
  }

  emit('update:modelValue', newRoles)
  emit('role-changed', newRoles)
}
</script>

<style scoped>
.role-selection-card {
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

.role-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.role-option {
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 15px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--color-dark-secondary);
}

.role-option:hover {
  border-color: rgba(255, 255, 255, 0.25);
}

.role-option.active {
  border-color: var(--color-primary);
  background: rgba(52, 211, 153, 0.1);
}

.role-option input[type='checkbox'] {
  display: none;
}

.role-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.role-icon {
  font-size: 2rem;
  color: var(--color-primary);
}

.role-text h4 {
  color: var(--color-light);
  font-size: 1.1rem;
  margin-bottom: 5px;
  margin-top: 0;
}

.role-text p {
  color: var(--color-light-secondary);
  font-size: 0.9rem;
  margin: 0;
}

.loading-indicator {
  text-align: center;
  padding: 40px 20px;
  color: var(--color-light-secondary);
}

.loading-spinner {
  font-size: 2rem;
  display: block;
  margin-bottom: 15px;
  animation: spin 1s linear infinite;
}

.loading-indicator p {
  margin: 0;
  font-size: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .role-options {
    grid-template-columns: 1fr;
  }
}
</style>
