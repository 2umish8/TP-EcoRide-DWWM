<template>
  <BaseModal :show="show" title="Ajouter un véhicule" @close="closeModal">
    <form @submit.prevent="submitVehicle" class="vehicle-form">
      <div class="form-group">
        <label for="brand">Marque</label>
        <AutoCompleteInput
          id="brand"
          v-model="vehicleForm.brand_name"
          :suggestions="carBrandSuggestions"
          placeholder="Ex: Renault"
          required
        />
      </div>

      <div class="form-group">
        <label for="model">Modèle</label>
        <TextInput id="model" v-model="vehicleForm.model" placeholder="Ex: Clio" required />
      </div>

      <div class="form-group">
        <label for="plate">Plaque d'immatriculation</label>
        <LicensePlateInput
          id="plate"
          v-model="vehicleForm.plate_number"
          placeholder="AB-123-CD"
          required
        />
      </div>

      <div class="form-group">
        <label for="seats">Nombre de places disponibles</label>
        <NumberInput
          id="seats"
          v-model="vehicleForm.seats_available"
          :min="1"
          :max="8"
          placeholder="0"
          unit="places"
          required
        />
      </div>

      <div class="form-group checkbox-group">
        <input
          id="electric"
          v-model="vehicleForm.is_electric"
          type="checkbox"
          class="checkbox-input"
        />
        <label for="electric" class="checkbox-label">Véhicule électrique</label>
      </div>

      <div class="modal-actions">
        <SecondaryButton type="button" @click="closeModal">
          <font-awesome-icon :icon="['fas', 'xmark']" /> Annuler
        </SecondaryButton>
        <PrimaryButton type="submit" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="loading-spinner"></span>
          {{ isSubmitting ? 'Ajout...' : 'Ajouter le véhicule' }}
        </PrimaryButton>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { ref } from 'vue'
import BaseModal from '@/components/shared/modals/BaseModal.vue'
import AutoCompleteInput from '@/components/ui/inputs/AutoCompleteInput.vue'
import TextInput from '@/components/ui/inputs/TextInput.vue'
import NumberInput from '@/components/ui/inputs/NumberInput.vue'
import LicensePlateInput from '@/components/ui/inputs/LicensePlateInput.vue'
import { vehicleService } from '@/services/api'
import { useNotificationStore } from '@/stores/notification'
import SecondaryButton from '@/components/ui/buttons/SecondaryButton.vue'
import PrimaryButton from '@/components/ui/buttons/PrimaryButton.vue'

defineProps({
  show: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['close', 'vehicle-added'])

const notificationStore = useNotificationStore()
const isSubmitting = ref(false)

// Liste des marques de voitures populaires
const carBrandSuggestions = [
  'Renault',
  'Peugeot',
  'Citroën',
  'Volkswagen',
  'Audi',
  'BMW',
  'Mercedes-Benz',
  'Toyota',
  'Honda',
  'Nissan',
  'Hyundai',
  'Kia',
  'Mazda',
  'Seat',
  'Skoda',
  'Volvo',
  'Ford',
  'Fiat',
  'Alfa Romeo',
  'Lancia',
  'Chevrolet',
  'Jeep',
  'Tesla',
  'Porsche',
  'Ferrari',
  'Lamborghini',
  'Bentley',
  'Rolls-Royce',
]

const vehicleForm = ref({
  brand_name: '',
  model: '',
  plate_number: '',
  seats_available: '',
  is_electric: false,
})

const resetForm = () => {
  vehicleForm.value = {
    brand_name: '',
    model: '',
    plate_number: '',
    seats_available: '',
    is_electric: false,
  }
}

const closeModal = () => {
  resetForm()
  emit('close')
}

const submitVehicle = async () => {
  try {
    isSubmitting.value = true

    // Validation
    if (
      !vehicleForm.value.brand_name ||
      !vehicleForm.value.model ||
      !vehicleForm.value.plate_number ||
      !vehicleForm.value.seats_available
    ) {
      notificationStore.showError('Veuillez remplir tous les champs obligatoires')
      return
    }

    const submitData = {
      ...vehicleForm.value,
      seats_available: parseInt(vehicleForm.value.seats_available),
    }

    await vehicleService.addVehicle(submitData)

    notificationStore.showInfo('Véhicule ajouté avec succès !', 'Succès')
    resetForm()
    emit('vehicle-added')
    emit('close')
  } catch (error) {
    console.error("Erreur lors de l'ajout du véhicule:", error)
    notificationStore.showError(
      "Erreur lors de l'ajout du véhicule : " + (error.response?.data?.message || error.message),
    )
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.vehicle-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: var(--color-light-secondary);
  font-size: 0.9rem;
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--color-primary);
}

.checkbox-label {
  margin: 0;
  cursor: pointer;
  font-weight: 500;
  color: var(--color-light-secondary);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.btn {
  border: none;
  border-radius: 10px;
  padding: 12px 18px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.btn-secondary {
  background: var(--color-dark-tertiary);
  color: var(--color-light-secondary);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-dark-tertiary);
  border-color: var(--color-gray);
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
