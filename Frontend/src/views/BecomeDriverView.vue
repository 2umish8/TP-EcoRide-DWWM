<template>
  <div class="become-driver-page">
    <div class="container">
      <!-- Header -->
      <BaseCard class="page-header">
        <h1><font-awesome-icon :icon="['fas', 'car']" /> Devenir Chauffeur EcoRide</h1>
        <p>Rejoignez notre communauté de conducteurs responsables</p>
      </BaseCard>

      <!-- Étapes du processus -->
      <div class="steps-indicator">
        <div
          v-for="(step, index) in steps"
          :key="index"
          :class="[
            'step',
            {
              active: currentStep === index + 1,
              completed: currentStep > index + 1,
            },
          ]"
        >
          <div class="step-number">{{ index + 1 }}</div>
          <div class="step-label">{{ step }}</div>
        </div>
      </div>

      <!-- Étape 1: Informations véhicule -->
      <div v-if="currentStep === 1" class="step-content">
        <BaseCard class="form-card">
          <h3><font-awesome-icon :icon="['fas', 'car']" /> Informations du véhicule</h3>
          <p class="step-description">
            Pour garantir la sécurité de nos utilisateurs, nous devons enregistrer les informations
            de votre véhicule.
          </p>

          <form @submit.prevent="validateVehicleStep">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Plaque d'immatriculation *</label>
                <LicensePlateInput v-model="vehicleData.plate_number" required />
                <small class="form-hint">Format: AB-123-CD</small>
              </div>

              <div class="form-group">
                <label class="form-label">Date de première immatriculation *</label>
                <TextInput
                  v-model="vehicleData.first_registration_date"
                  type="date"
                  :min="minRegistrationDate"
                  :max="today"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Marque *</label>
                <ListAutocomplete
                  v-model="vehicleData.brand_name"
                  :options="carBrands"
                  placeholder="Sélectionnez ou tapez une marque"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Modèle *</label>
                <TextInput v-model="vehicleData.model" placeholder="ex: Clio, Golf, 208..." />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Couleur *</label>
                <ListAutocomplete
                  v-model="vehicleData.color_name"
                  :options="carColors"
                  placeholder="Sélectionnez ou tapez une couleur"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Nombre de places disponibles *</label>
                <NumberInput
                  v-model="vehicleData.seats_available"
                  :min="1"
                  :max="8"
                  placeholder="Sélectionnez"
                  unit="places"
                />
              </div>
            </div>

            <div class="form-group">
              <div class="checkbox-container">
                <input
                  v-model="vehicleData.is_electric"
                  type="checkbox"
                  id="electric"
                  class="form-checkbox"
                />
                <label for="electric" class="checkbox-label">
                  <font-awesome-icon :icon="['fas', 'bolt']" /> Véhicule électrique (bonus
                  écologique !)
                </label>
              </div>
            </div>

            <div class="form-actions">
              <router-link to="/my-trips" class="router-link-wrapper">
                <SecondaryButton>
                  <font-awesome-icon :icon="['fas', 'xmark']" /> Annuler
                </SecondaryButton>
              </router-link>
              <PrimaryButton type="submit">
                Suivant: Préférences <font-awesome-icon :icon="['fas', 'chevron-right']" />
              </PrimaryButton>
            </div>
          </form>
        </BaseCard>
      </div>

      <!-- Étape 2: Préférences de conduite -->
      <div v-if="currentStep === 2" class="step-content">
        <BaseCard class="form-card">
          <h3><font-awesome-icon :icon="['fas', 'gear']" /> Préférences de conduite</h3>
          <p class="step-description">
            Définissez vos préférences pour que les passagers sachent à quoi s'attendre lors du
            trajet.
          </p>

          <form @submit.prevent="validatePreferencesStep">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Musique pendant le trajet</label>
                <ListAutocomplete
                  v-model="preferencesData.musicPreference"
                  :options="musicOptions"
                  placeholder="Sélectionnez une musique"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Niveau de conversation</label>
                <ListAutocomplete
                  v-model="preferencesData.conversationLevel"
                  :options="conversationLevels"
                  placeholder="Sélectionnez un niveau"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Préférences</label>
              <div class="preferences-inline">
                <div class="preference-inline-item">
                  <div>
                    <h5><font-awesome-icon :icon="['fas', 'smoking']" /> Tabac</h5>
                  </div>
                  <label class="switch-small">
                    <input v-model="preferencesData.smokingAllowed" type="checkbox" />
                    <span class="slider"></span>
                  </label>
                </div>

                <div class="preference-inline-item">
                  <div>
                    <h5><font-awesome-icon :icon="['fas', 'paw']" /> Animaux</h5>
                  </div>
                  <label class="switch-small">
                    <input v-model="preferencesData.petsAllowed" type="checkbox" />
                    <span class="slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Préférences personnalisées (optionnel)</label>
              <TextAreaInput
                v-model="preferencesData.customPreferences"
                placeholder="ex: J'accepte les instruments de musique, j'aime les discussions sur les voyages..."
              />
            </div>

            <div class="form-actions">
              <SecondaryButton @click="currentStep = 1" type="button">
                <font-awesome-icon :icon="['fas', 'arrow-left']" /> Retour
              </SecondaryButton>
              <PrimaryButton type="submit">
                Suivant: Confirmation <font-awesome-icon :icon="['fas', 'chevron-right']" />
              </PrimaryButton>
            </div>
          </form>
        </BaseCard>
      </div>

      <!-- Étape 3: Confirmation et finalisation -->
      <div v-if="currentStep === 3" class="step-content">
        <BaseCard class="confirmation-card">
          <h3><font-awesome-icon :icon="['fas', 'circle-check']" /> Confirmation</h3>
          <p class="step-description">
            Vérifiez vos informations avant de finaliser votre inscription en tant que chauffeur.
          </p>

          <!-- Récapitulatif véhicule -->
          <div class="summary-section">
            <h4><font-awesome-icon :icon="['fas', 'car']" /> Votre véhicule</h4>
            <div class="summary-grid">
              <div class="summary-item">
                <span class="label">Plaque:</span>
                <span class="value">{{ vehicleData.plate_number }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Véhicule:</span>
                <span class="value">{{ vehicleData.brand_name }} {{ vehicleData.model }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Couleur:</span>
                <span class="value">{{ vehicleData.color_name }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Places:</span>
                <span class="value">{{ vehicleData.seats_available }} places</span>
              </div>
              <div class="summary-item">
                <span class="label">Type:</span>
                <span class="value">
                  <span v-if="vehicleData.is_electric"
                    ><font-awesome-icon :icon="['fas', 'bolt']" /> Électrique</span
                  >
                  <span v-else><font-awesome-icon :icon="['fas', 'gas-pump']" /> Thermique</span>
                </span>
              </div>
            </div>
          </div>

          <!-- Récapitulatif préférences -->
          <div class="summary-section">
            <h4><font-awesome-icon :icon="['fas', 'gear']" /> Vos préférences</h4>
            <div class="summary-grid">
              <div class="summary-item">
                <span class="label">Musique:</span>
                <span class="value">{{ preferencesData.musicPreference }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Conversation:</span>
                <span class="value">{{ preferencesData.conversationLevel }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Tabac:</span>
                <span class="value">
                  <span v-if="preferencesData.smokingAllowed"
                    ><font-awesome-icon :icon="['fas', 'circle-check']" /> Accepté</span
                  >
                  <span v-else><font-awesome-icon :icon="['fas', 'xmark']" /> Interdit</span>
                </span>
              </div>
              <div class="summary-item">
                <span class="label">Animaux:</span>
                <span class="value">
                  <span v-if="preferencesData.petsAllowed"
                    ><font-awesome-icon :icon="['fas', 'circle-check']" /> Acceptés</span
                  >
                  <span v-else><font-awesome-icon :icon="['fas', 'xmark']" /> Interdits</span>
                </span>
              </div>
            </div>
            <div v-if="preferencesData.customPreferences" class="custom-prefs">
              <span class="label">Préférences personnalisées:</span>
              <p>{{ preferencesData.customPreferences }}</p>
            </div>
          </div>

          <!-- Engagement -->
          <div class="engagement-section">
            <div class="engagement-card">
              <h4>
                <font-awesome-icon :icon="['fas', 'clipboard-list']" /> Engagement de conduite
                responsable
              </h4>
              <ul class="engagement-list">
                <li>
                  <font-awesome-icon :icon="['fas', 'circle-check']" /> Je m'engage à respecter le
                  code de la route
                </li>
                <li>
                  <font-awesome-icon :icon="['fas', 'circle-check']" /> Je m'engage à maintenir mon
                  véhicule en bon état
                </li>
                <li>
                  <font-awesome-icon :icon="['fas', 'circle-check']" /> Je m'engage à respecter les
                  horaires convenus
                </li>
                <li>
                  <font-awesome-icon :icon="['fas', 'circle-check']" /> Je m'engage à adopter une
                  conduite éco-responsable
                </li>
                <li>
                  <font-awesome-icon :icon="['fas', 'circle-check']" /> Je m'engage à respecter les
                  autres utilisateurs
                </li>
              </ul>

              <div class="checkbox-container">
                <input
                  v-model="acceptEngagement"
                  type="checkbox"
                  id="engagement"
                  class="form-checkbox"
                  required
                />
                <label for="engagement" class="checkbox-label">
                  <strong
                    >J'accepte ces engagements et je confirme l'exactitude des informations
                    fournies</strong
                  >
                </label>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <SecondaryButton @click="currentStep = 2" type="button">
              <font-awesome-icon :icon="['fas', 'arrow-left']" /> Retour
            </SecondaryButton>
            <PrimaryButton
              @click="submitDriverApplication"
              :disabled="!acceptEngagement || isSubmitting"
              type="button"
            >
              <span v-if="isSubmitting"
                ><font-awesome-icon :icon="['fas', 'spinner']" spin /> Finalisation en
                cours...</span
              >
              <span v-else
                ><font-awesome-icon :icon="['fas', 'gift']" /> Devenir Chauffeur EcoRide</span
              >
            </PrimaryButton>
          </div>
        </BaseCard>
      </div>

      <!-- Étape 4: Succès -->
      <div v-if="currentStep === 4" class="step-content">
        <BaseCard class="success-card">
          <div class="success-icon"><font-awesome-icon :icon="['fas', 'gift']" /></div>
          <h3>Félicitations !</h3>
          <p>Vous êtes maintenant officiellement chauffeur EcoRide !</p>

          <div class="success-benefits">
            <h4>Vos nouveaux avantages :</h4>
            <ul>
              <li><font-awesome-icon :icon="['fas', 'car']" /> Proposer des covoiturages</li>
              <li>
                <font-awesome-icon :icon="['fas', 'coins']" /> Gagner des crédits en tant que
                conducteur
              </li>
              <li>
                <font-awesome-icon :icon="['fas', 'star']" /> Recevoir des avis de vos passagers
              </li>
              <li>
                <font-awesome-icon :icon="['fas', 'chart-line']" /> Accéder à vos statistiques de
                conduite
              </li>
              <li>
                <font-awesome-icon :icon="['fas', 'trophy']" /> Participer au programme de
                récompenses
              </li>
            </ul>
          </div>

          <div class="form-actions">
            <router-link to="/profile" class="router-link-wrapper">
              <PrimaryButton>
                <font-awesome-icon :icon="['fas', 'user']" /> Retour au profil
              </PrimaryButton>
            </router-link>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { authService, vehicleService } from '@/services/api'
import { preferencesService } from '@/services/mongoServices'
import { useAuthStore } from '@/stores/auth'
import BaseCard from '@/components/ui/cards/BaseCard.vue'
import LicensePlateInput from '@/components/ui/inputs/LicensePlateInput.vue'
import ListAutocomplete from '@/components/ui/inputs/ListAutocomplete.vue'
import TextInput from '@/components/ui/inputs/TextInput.vue'
import TextAreaInput from '@/components/ui/inputs/TextAreaInput.vue'
import NumberInput from '@/components/ui/inputs/NumberInput.vue'
import PrimaryButton from '@/components/ui/buttons/PrimaryButton.vue'
import SecondaryButton from '@/components/ui/buttons/SecondaryButton.vue'

export default {
  name: 'BecomeDriverView',
  components: {
    BaseCard,
    LicensePlateInput,
    ListAutocomplete,
    TextInput,
    TextAreaInput,
    NumberInput,
    PrimaryButton,
    SecondaryButton,
  },
  setup() {
    // State management
    const authStore = useAuthStore()
    const currentStep = ref(1)
    const isSubmitting = ref(false)
    const acceptEngagement = ref(false)

    const steps = ['Véhicule', 'Préférences', 'Confirmation']

    // Données du véhicule
    const vehicleData = ref({
      plate_number: '',
      first_registration_date: '',
      model: '',
      brand_name: '',
      color_name: '',
      seats_available: '',
      is_electric: false,
    })

    // Données des préférences
    const preferencesData = ref({
      musicPreference: 'Aucune musique',
      conversationLevel: 'Silencieux',
      smokingAllowed: false,
      petsAllowed: false,
      customPreferences: '',
    })

    // Options pour les formulaires
    const carBrands = [
      'Renault',
      'Peugeot',
      'Citroën',
      'Volkswagen',
      'BMW',
      'Mercedes',
      'Audi',
      'Toyota',
      'Honda',
      'Ford',
      'Opel',
      'Fiat',
      'Seat',
      'Skoda',
      'Hyundai',
      'Kia',
      'Nissan',
      'Mazda',
      'Volvo',
      'Autre',
    ]

    const carColors = [
      'Blanc',
      'Noir',
      'Gris',
      'Argent',
      'Bleu',
      'Rouge',
      'Vert',
      'Orange',
      'Jaune',
      'Violet',
      'Marron',
      'Beige',
      'Rose',
    ]

    const musicOptions = ['Aucune musique', 'Musique douce', 'Radio', "Selon l'humeur"]

    const conversationLevels = ['Silencieux', 'Modérée', 'Bavard']

    const minRegistrationDate = computed(() => {
      const date = new Date()
      date.setFullYear(date.getFullYear() - 30) // Pas de voiture de plus de 30 ans
      return date.toISOString().split('T')[0]
    })

    const today = computed(() => {
      return new Date().toISOString().split('T')[0]
    })

    // Validation étape véhicule
    const validateVehicleStep = () => {
      if (
        !vehicleData.value.plate_number ||
        !vehicleData.value.first_registration_date ||
        !vehicleData.value.model ||
        !vehicleData.value.brand_name ||
        !vehicleData.value.color_name ||
        !vehicleData.value.seats_available
      ) {
        alert('Veuillez remplir tous les champs obligatoires')
        return
      }

      currentStep.value = 2
    }

    // Validation étape préférences
    const validatePreferencesStep = () => {
      currentStep.value = 3
    }

    // Soumission finale
    const submitDriverApplication = async () => {
      if (!acceptEngagement.value) {
        alert('Vous devez accepter les engagements pour devenir chauffeur')
        return
      }

      isSubmitting.value = true

      try {
        // 1. Ajouter le véhicule
        await vehicleService.addVehicle(vehicleData.value)

        // 2. Devenir chauffeur
        const response = await authService.becomeDriver()

        // Si le backend retourne un nouveau token avec les rôles mis à jour, le stocker
        if (response.token && response.user) {
          localStorage.setItem('authToken', response.token)
          localStorage.setItem('user', JSON.stringify(response.user))

          // Mettre à jour le store Pinia
          authStore.login(response.user, response.token)
        }

        // 3. Sauvegarder les préférences
        try {
          await preferencesService.createPreferences(preferencesData.value)
        } catch {
          // Les préférences sont optionnelles
        }

        // 4. Succès !
        currentStep.value = 4
      } catch (error) {
        console.error("Erreur lors de l'inscription chauffeur:", error)
        const message = error?.response?.data?.message || error?.message
        alert("Erreur lors de l'inscription. " + (message || 'Veuillez réessayer.'))
      } finally {
        isSubmitting.value = false
      }
    }

    return {
      currentStep,
      steps,
      vehicleData,
      preferencesData,
      carBrands,
      carColors,
      musicOptions,
      conversationLevels,
      minRegistrationDate,
      today,
      acceptEngagement,
      isSubmitting,
      validateVehicleStep,
      validatePreferencesStep,
      submitDriverApplication,
    }
  },
}
</script>

<style scoped>
.become-driver-page {
  min-height: 100vh;
  background-color: var(--color-dark);
  color: var(--color-light-secondary);
  padding: 20px 0;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  text-align: center;
}

.page-header h1 {
  margin: 0 0 10px 0;
  color: var(--color-light);
  font-size: 2.2rem;
}

.page-header p {
  margin: 0;
  color: var(--color-gray);
  font-size: 1.1rem;
}

.steps-indicator {
  display: flex;
  justify-content: center;
  margin: 10px 0;
  gap: 20px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  color: var(--color-gray);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 8px;
  transition: all 0.3s;
}

.step.active .step-number {
  background: var(--color-success);
  color: white;
}

.step.completed .step-number {
  background: var(--color-success);
  color: white;
}

.step-label {
  font-size: 0.9rem;
  color: var(--color-gray);
  text-align: center;
}

.step.active .step-label {
  color: var(--color-success);
  font-weight: bold;
}

.form-card h3,
.confirmation-card h3,
.success-card h3 {
  margin: 0 0 15px 0;
  color: var(--color-light);
  font-size: 1.5rem;
}

.form-card,
.confirmation-card,
.success-card,
.page-header {
  margin-bottom: 30px;
}

.step-description {
  color: var(--color-gray);
  margin-bottom: 30px;
  line-height: 1.6;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
  width: 100%;
}

:deep(textarea) {
  width: 100%;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: var(--color-light-secondary);
}

.form-hint {
  color: var(--color-gray);
  font-size: 0.8rem;
  margin-top: 4px;
  display: block;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.form-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--color-primary);
}

.checkbox-label {
  margin: 0;
  cursor: pointer;
  color: var(--color-light-secondary);
}

.preferences-inline {
  display: flex;
  gap: 20px;
}

.preference-inline-item {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.preference-inline-item div h5 {
  margin: 0;
  color: var(--color-light);
  font-size: 0.9rem;
  white-space: nowrap;
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
  margin-bottom: 10px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-small {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.switch-small input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-error);
  transition: 0.4s;
  border-radius: 34px;
  opacity: 0.5;
}

.slider:before {
  position: absolute;
  content: '';
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

.switch-small .slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-error);
  transition: 0.4s;
  border-radius: 24px;
  opacity: 0.5;
}

.switch-small .slider:before {
  position: absolute;
  content: '';
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--color-success);
  opacity: 1;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.switch-small input:checked + .slider {
  background-color: var(--color-success);
  opacity: 1;
}

.switch-small input:checked + .slider:before {
  transform: translateX(18px);
}

.summary-section {
  margin: 30px 0;
  padding: 20px;
  background: var(--color-dark-tertiary);
  border-radius: 8px;
}

.summary-section h4 {
  margin: 0 0 20px 0;
  color: var(--color-light);
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.summary-item .label {
  color: var(--color-gray);
  font-weight: bold;
}

.summary-item .value {
  color: var(--color-light-secondary);
}

.custom-prefs {
  margin-top: 15px;
}

.custom-prefs .label {
  color: var(--color-gray);
  font-weight: bold;
  display: block;
  margin-bottom: 8px;
}

.custom-prefs p {
  color: var(--color-light-secondary);
  background: var(--color-dark-secondary);
  padding: 12px;
  border-radius: 6px;
  margin: 0;
}

.engagement-section {
  margin: 30px 0;
}

.engagement-card {
  background: rgba(67, 197, 97, 0.1);
  border: 1px solid var(--color-success);
  border-radius: 8px;
  padding: 25px;
}

.engagement-card h4 {
  margin: 0 0 20px 0;
  color: var(--color-success);
}

.engagement-list {
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
}

.engagement-list li {
  padding: 8px 0;
  color: var(--color-light-secondary);
}

.success-card {
  text-align: center;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.success-benefits {
  background: var(--color-dark-tertiary);
  border-radius: 8px;
  padding: 20px;
  margin: 30px 0;
  text-align: left;
}

.success-benefits h4 {
  margin: 0 0 15px 0;
  color: var(--color-success);
}

.success-benefits ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.success-benefits li {
  padding: 8px 0;
  color: var(--color-light-secondary);
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
}

.router-link-wrapper {
  text-decoration: none;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .steps-indicator {
    flex-direction: column;
    align-items: center;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
