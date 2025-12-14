<template>
  <BaseModal :show="show" title="Ajouter un véhicule" @close="handleClose">
    <form @submit.prevent="handleSubmit" class="vehicle-form">
      <div class="form-group">
        <label class="form-label">Plaque d'immatriculation</label>
        <input
          type="text"
          v-model="formData.plate_number"
          class="form-input"
          placeholder="AA-123-BB"
          required
        />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Marque</label>
          <input
            type="text"
            v-model="formData.brand"
            class="form-input"
            placeholder="Peugeot"
            required
          />
        </div>
        <div class="form-group">
          <label class="form-label">Modèle</label>
          <input
            type="text"
            v-model="formData.model"
            class="form-input"
            placeholder="308"
            required
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Nombre de places</label>
          <select v-model="formData.seats_available" class="form-input" required>
            <option value="">Sélectionner</option>
            <option value="1">1 place</option>
            <option value="2">2 places</option>
            <option value="3">3 places</option>
            <option value="4">4 places</option>
            <option value="5">5 places</option>
            <option value="6">6 places</option>
            <option value="7">7 places</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Couleur</label>
          <input
            type="text"
            v-model="formData.color"
            class="form-input"
            placeholder="Blanc"
            required
          />
        </div>
      </div>

      <div class="form-group">
        <label class="checkbox-label">
          <input type="checkbox" v-model="formData.is_electric" />
          <span><font-awesome-icon :icon="['fas', 'bolt']" /> Véhicule électrique</span>
        </label>
      </div>
    </form>

    <template #footer>
      <button type="button" @click="handleClose" class="cancel-btn">Annuler</button>
      <button type="submit" class="submit-btn" :disabled="isSubmitting" @click="handleSubmit">
        <font-awesome-icon v-if="isSubmitting" :icon="['fas', 'spinner']" class="spinner-icon" />
        <span v-else>Ajouter</span>
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import BaseModal from './BaseModal.vue'

defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  isSubmitting: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit', 'close'])

const formData = ref({
  plate_number: '',
  brand: '',
  model: '',
  seats_available: '',
  color: '',
  is_electric: false,
})

const handleSubmit = () => {
  emit('submit', {
    plate_number: formData.value.plate_number,
    brand_name: formData.value.brand,
    model: formData.value.model,
    seats_available: parseInt(formData.value.seats_available),
    color_name: formData.value.color,
    is_electric: formData.value.is_electric || false,
  })
  resetForm()
}

const handleClose = () => {
  resetForm()
  emit('close')
}

const resetForm = () => {
  formData.value = {
    plate_number: '',
    brand: '',
    model: '',
    seats_available: '',
    color: '',
    is_electric: false,
  }
}

defineExpose({
  resetForm,
})
</script>

<style scoped>
.vehicle-form {
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--color-light);
  cursor: pointer;
  user-select: none;
}

.checkbox-label input[type='checkbox'] {
  accent-color: var(--color-primary);
  cursor: pointer;
  width: 18px;
  height: 18px;
}

.checkbox-label span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.cancel-btn {
  background: var(--color-gray);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  opacity: 0.8;
  transform: translateY(-1px);
}

.submit-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.submit-btn:hover:not(:disabled) {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
