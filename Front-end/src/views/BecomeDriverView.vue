<template>
  <div class="become-driver-page">
    <div class="container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="title-section">
            <h1>🚗 Devenir Chauffeur EcoRide</h1>
            <p>Rejoignez notre communauté de conducteurs responsables</p>
          </div>
        </div>
      </div>

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
        <div class="form-card">
          <h3>🚙 Informations du véhicule</h3>
          <p class="step-description">
            Pour garantir la sécurité de nos utilisateurs, nous devons enregistrer les informations
            de votre véhicule.
          </p>

          <form @submit.prevent="validateVehicleStep">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Plaque d'immatriculation *</label>
                <input
                  v-model="vehicleData.plate_number"
                  type="text"
                  class="form-input"
                  placeholder="AB-123-CD"
                  pattern="[A-Z]{2}-[0-9]{3}-[A-Z]{2}"
                  required
                />
                <small class="form-hint">Format: AB-123-CD</small>
              </div>

              <div class="form-group">
                <label class="form-label">Date de première immatriculation *</label>
                <input
                  v-model="vehicleData.first_registration_date"
                  type="date"
                  class="form-input"
                  :max="today"
                  required
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Marque *</label>
                <select v-model="vehicleData.brand_name" class="form-select" required>
                  <option value="">Sélectionnez une marque</option>
                  <option v-for="brand in carBrands" :key="brand" :value="brand">
                    {{ brand }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Modèle *</label>
                <input
                  v-model="vehicleData.model"
                  type="text"
                  class="form-input"
                  placeholder="ex: Clio, Golf, 208..."
                  required
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Couleur *</label>
                <select v-model="vehicleData.color_name" class="form-select" required>
                  <option value="">Sélectionnez une couleur</option>
                  <option v-for="color in carColors" :key="color" :value="color">
                    {{ color }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Nombre de places disponibles *</label>
                <select v-model="vehicleData.seats_available" class="form-select" required>
                  <option value="">Sélectionnez</option>
                  <option v-for="n in 7" :key="n" :value="n">
                    {{ n }} place{{ n > 1 ? 's' : '' }}
                  </option>
                </select>
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
                  ⚡ Véhicule électrique (bonus écologique !)
                </label>
              </div>
            </div>

            <div class="form-actions">
              <router-link to="/my-trips" class="btn btn-secondary">❌ Annuler</router-link>
              <button type="submit" class="btn btn-primary">Suivant: Préférences ➡️</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Étape 2: Préférences de conduite -->
      <div v-if="currentStep === 2" class="step-content">
        <div class="form-card">
          <h3>⚙️ Préférences de conduite</h3>
          <p class="step-description">
            Définissez vos préférences pour que les passagers sachent à quoi s'attendre lors du
            trajet.
          </p>

          <form @submit.prevent="validatePreferencesStep">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Musique pendant le trajet</label>
                <select v-model="preferencesData.musicPreference" class="form-select">
                  <option value="Aucune musique">🔇 Aucune musique</option>
                  <option value="Musique douce">🎵 Musique douce</option>
                  <option value="Radio">📻 Radio</option>
                  <option value="Selon l'humeur">🎶 Selon l'humeur</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Niveau de conversation</label>
                <select v-model="preferencesData.conversationLevel" class="form-select">
                  <option value="Silencieux">🤫 Trajet silencieux</option>
                  <option value="Modérée">💬 Conversation modérée</option>
                  <option value="Bavard">🗣️ J'aime parler</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Température préférée (°C)</label>
                <div class="temperature-control">
                  <input
                    v-model="preferencesData.temperaturePreference"
                    type="range"
                    min="16"
                    max="26"
                    class="temperature-slider"
                  />
                  <span class="temperature-value"
                    >{{ preferencesData.temperaturePreference }}°C</span
                  >
                </div>
              </div>
            </div>

            <div class="preferences-grid">
              <div class="preference-card">
                <div class="preference-icon">🚭</div>
                <div class="preference-content">
                  <h4>Tabac</h4>
                  <label class="switch">
                    <input v-model="preferencesData.smokingAllowed" type="checkbox" />
                    <span class="slider"></span>
                  </label>
                  <p>
                    {{
                      preferencesData.smokingAllowed ? 'Fumeur accepté' : 'Non-fumeur uniquement'
                    }}
                  </p>
                </div>
              </div>

              <div class="preference-card">
                <div class="preference-icon">🐕</div>
                <div class="preference-content">
                  <h4>Animaux</h4>
                  <label class="switch">
                    <input v-model="preferencesData.petsAllowed" type="checkbox" />
                    <span class="slider"></span>
                  </label>
                  <p>{{ preferencesData.petsAllowed ? 'Animaux acceptés' : "Pas d'animaux" }}</p>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Préférences personnalisées (optionnel)</label>
              <textarea
                v-model="preferencesData.customPreferences"
                class="form-textarea"
                rows="3"
                placeholder="ex: J'accepte les instruments de musique, j'aime les discussions sur les voyages..."
              ></textarea>
            </div>

            <div class="form-actions">
              <button type="button" @click="currentStep = 1" class="btn btn-secondary">
                ⬅️ Retour
              </button>
              <button type="submit" class="btn btn-primary">Suivant: Confirmation ➡️</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Étape 3: Confirmation et finalisation -->
      <div v-if="currentStep === 3" class="step-content">
        <div class="confirmation-card">
          <h3>✅ Confirmation</h3>
          <p class="step-description">
            Vérifiez vos informations avant de finaliser votre inscription en tant que chauffeur.
          </p>

          <!-- Récapitulatif véhicule -->
          <div class="summary-section">
            <h4>🚙 Votre véhicule</h4>
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
                  {{ vehicleData.is_electric ? '⚡ Électrique' : '⛽ Thermique' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Récapitulatif préférences -->
          <div class="summary-section">
            <h4>⚙️ Vos préférences</h4>
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
                <span class="label">Température:</span>
                <span class="value">{{ preferencesData.temperaturePreference }}°C</span>
              </div>
              <div class="summary-item">
                <span class="label">Tabac:</span>
                <span class="value">{{
                  preferencesData.smokingAllowed ? '✅ Accepté' : '❌ Interdit'
                }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Animaux:</span>
                <span class="value">{{
                  preferencesData.petsAllowed ? '✅ Acceptés' : '❌ Interdits'
                }}</span>
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
              <h4>📋 Engagement de conduite responsable</h4>
              <ul class="engagement-list">
                <li>✅ Je m'engage à respecter le code de la route</li>
                <li>✅ Je m'engage à maintenir mon véhicule en bon état</li>
                <li>✅ Je m'engage à respecter les horaires convenus</li>
                <li>✅ Je m'engage à adopter une conduite éco-responsable</li>
                <li>✅ Je m'engage à respecter les autres utilisateurs</li>
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
            <button type="button" @click="currentStep = 2" class="btn btn-secondary">
              ⬅️ Retour
            </button>
            <button
              @click="submitDriverApplication"
              :disabled="!acceptEngagement || isSubmitting"
              class="btn btn-primary btn-large"
            >
              <span v-if="isSubmitting">🔄 Finalisation en cours...</span>
              <span v-else>🎉 Devenir Chauffeur EcoRide</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Étape 4: Succès -->
      <div v-if="currentStep === 4" class="step-content">
        <div class="success-card">
          <div class="success-icon">🎉</div>
          <h3>Félicitations !</h3>
          <p>Vous êtes maintenant officiellement chauffeur EcoRide !</p>

          <div class="success-benefits">
            <h4>Vos nouveaux avantages :</h4>
            <ul>
              <li>🚗 Proposer des covoiturages</li>
              <li>💰 Gagner des crédits en tant que conducteur</li>
              <li>🌟 Recevoir des avis de vos passagers</li>
              <li>📊 Accéder à vos statistiques de conduite</li>
              <li>🏆 Participer au programme de récompenses</li>
            </ul>
          </div>

          <div class="form-actions">
            <router-link to="/my-trips" class="btn btn-primary btn-large">
              🚀 Découvrir mes nouvelles fonctionnalités
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { vehicleService } from '@/services/api'
import { preferencesService } from '@/services/mongoServices'

export default {
  name: 'BecomeDriverView',
  setup() {
    // État des étapes
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
      conversationLevel: 'Modérée',
      temperaturePreference: 20,
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
        const vehicleResponse = await vehicleService.addVehicle(vehicleData.value)
        console.log('Véhicule ajouté:', vehicleResponse.data.vehicleId)

        // 2. Devenir chauffeur
        const driverResponse = await fetch('/api/users/become-driver', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        })

        if (!driverResponse.ok) {
          throw new Error("Erreur lors de l'ajout du rôle chauffeur")
        }

        // 3. Sauvegarder les préférences
        try {
          await preferencesService.createPreferences(preferencesData.value)
          console.log('Préférences sauvegardées')
        } catch (prefError) {
          console.log('Préférences non sauvegardées (optionnel):', prefError.message)
        }

        // 4. Succès !
        currentStep.value = 4

        // Mettre à jour le localStorage pour refléter le nouveau statut
        const userStr = localStorage.getItem('user')
        if (userStr) {
          const user = JSON.parse(userStr)
          user.roles = user.roles || []
          if (!user.roles.includes('chauffeur')) {
            user.roles.push('chauffeur')
          }
          localStorage.setItem('user', JSON.stringify(user))
        }
      } catch (error) {
        console.error("Erreur lors de l'inscription chauffeur:", error)
        alert("Erreur lors de l'inscription. Veuillez réessayer.")
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
  background-color: #1a1a1a;
  color: #e9ecef;
  padding: 20px 0;
  padding-top: 100px;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  background: #2d3748;
  border: 1px solid #4a5568;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  margin-bottom: 30px;
  overflow: hidden;
}

.header-content {
  padding: 30px;
  text-align: center;
}

.title-section h1 {
  margin: 0 0 10px 0;
  color: #ffffff;
  font-size: 2.2rem;
}

.title-section p {
  margin: 0;
  color: #adb5bd;
  font-size: 1.1rem;
}

.steps-indicator {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
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
  background: #4a5568;
  color: #adb5bd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 8px;
  transition: all 0.3s;
}

.step.active .step-number {
  background: #28a745;
  color: white;
}

.step.completed .step-number {
  background: #28a745;
  color: white;
}

.step-label {
  font-size: 0.9rem;
  color: #adb5bd;
  text-align: center;
}

.step.active .step-label {
  color: #28a745;
  font-weight: bold;
}

.form-card,
.confirmation-card,
.success-card {
  background: #2d3748;
  border: 1px solid #4a5568;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  padding: 40px;
  margin-bottom: 30px;
}

.form-card h3,
.confirmation-card h3,
.success-card h3 {
  margin: 0 0 15px 0;
  color: #ffffff;
  font-size: 1.5rem;
}

.step-description {
  color: #adb5bd;
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
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #e9ecef;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #4a5568;
  border-radius: 8px;
  background-color: #374151;
  color: #e9ecef;
  font-family: inherit;
  font-size: 1rem;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #28a745;
}

.form-hint {
  color: #adb5bd;
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
}

.checkbox-label {
  margin: 0;
  cursor: pointer;
  color: #e9ecef;
}

.temperature-control {
  display: flex;
  align-items: center;
  gap: 15px;
}

.temperature-slider {
  flex: 1;
  height: 6px;
  background: #4a5568;
  border-radius: 3px;
  outline: none;
}

.temperature-value {
  font-weight: bold;
  color: #28a745;
  min-width: 50px;
}

.preferences-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin: 30px 0;
}

.preference-card {
  background: #374151;
  border: 1px solid #4a5568;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.preference-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.preference-content h4 {
  margin: 0 0 15px 0;
  color: #ffffff;
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

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #4a5568;
  transition: 0.4s;
  border-radius: 34px;
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

input:checked + .slider {
  background-color: #28a745;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.summary-section {
  margin: 30px 0;
  padding: 20px;
  background: #374151;
  border-radius: 8px;
}

.summary-section h4 {
  margin: 0 0 20px 0;
  color: #ffffff;
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
  border-bottom: 1px solid #4a5568;
}

.summary-item .label {
  color: #adb5bd;
  font-weight: bold;
}

.summary-item .value {
  color: #e9ecef;
}

.custom-prefs {
  margin-top: 15px;
}

.custom-prefs .label {
  color: #adb5bd;
  font-weight: bold;
  display: block;
  margin-bottom: 8px;
}

.custom-prefs p {
  color: #e9ecef;
  background: #2d3748;
  padding: 12px;
  border-radius: 6px;
  margin: 0;
}

.engagement-section {
  margin: 30px 0;
}

.engagement-card {
  background: #1e3a28;
  border: 1px solid #28a745;
  border-radius: 8px;
  padding: 25px;
}

.engagement-card h4 {
  margin: 0 0 20px 0;
  color: #28a745;
}

.engagement-list {
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
}

.engagement-list li {
  padding: 8px 0;
  color: #e9ecef;
}

.success-card {
  text-align: center;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.success-benefits {
  background: #374151;
  border-radius: 8px;
  padding: 20px;
  margin: 30px 0;
  text-align: left;
}

.success-benefits h4 {
  margin: 0 0 15px 0;
  color: #28a745;
}

.success-benefits ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.success-benefits li {
  padding: 8px 0;
  color: #e9ecef;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: #28a745;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #218838;
  transform: translateY(-2px);
}

.btn-primary:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.btn-secondary {
  background: #374151;
  color: #e9ecef;
  border: 2px solid #4a5568;
}

.btn-secondary:hover {
  background: #4a5568;
  transform: translateY(-2px);
}

.btn-large {
  padding: 15px 30px;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .preferences-grid {
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
