<template>
  <div class="become-driver-page">
    <div class="container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="title-section">
            <h1><font-awesome-icon :icon="['fas', 'car']" /> Devenir Chauffeur EcoRide</h1>
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
          <h3><font-awesome-icon :icon="['fas', 'car']" /> Informations du véhicule</h3>
          <p class="step-description">
            Pour garantir la sécurité de nos utilisateurs, nous devons enregistrer les informations
            de votre véhicule.
          </p>
          <form @submit.prevent="validateVehicleStep">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Plaque d'immatriculation *</label
                ><input
                  v-model="vehicleData.plate_number"
                  type="text"
                  class="form-input"
                  placeholder="AB-123-CD"
                  pattern="[A-Z]{2}-[0-9]{3}-[A-Z]{2}"
                  required
                /><small class="form-hint">Format: AB-123-CD</small>
              </div>
              <div class="form-group">
                <label class="form-label">Date de première immatriculation *</label
                ><input
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
                <label class="form-label">Marque *</label
                ><select v-model="vehicleData.brand_name" required>
                  <option value="">Sélectionnez une marque</option>
                  <option v-for="brand in carBrands" :key="brand" :value="brand">
                    {{ brand }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Modèle *</label
                ><input
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
                <label class="form-label">Couleur *</label
                ><select v-model="vehicleData.color_name" required>
                  <option value="">Sélectionnez une couleur</option>
                  <option v-for="color in carColors" :key="color" :value="color">
                    {{ color }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Nombre de places disponibles *</label
                ><select v-model="vehicleData.seats_available" required>
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
                /><label for="electric" class="checkbox-label"
                  ><font-awesome-icon :icon="['fas', 'bolt']" /> Véhicule électrique (bonus
                  écologique !)
                </label>
              </div>
            </div>
            <div class="form-actions">
              <router-link to="/my-trips" class="btn btn-secondary"
                ><font-awesome-icon :icon="['fas', 'xmark']" /> Annuler</router-link
              ><button type="submit" class="btn btn-primary">
                Suivant: Préférences <font-awesome-icon :icon="['fas', 'chevron-right']" />
              </button>
            </div>
          </form>
        </div>
      </div>
      <!-- Étape 2: Préférences de conduite -->
      <div v-if="currentStep === 2" class="step-content">
        <div class="form-card">
          <h3><font-awesome-icon :icon="['fas', 'gear']" /> Préférences de conduite</h3>
          <p class="step-description">
            Définissez vos préférences pour que les passagers sachent à quoi s'attendre lors du
            trajet.
          </p>
          <form @submit.prevent="validatePreferencesStep">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Musique pendant le trajet</label
                ><select v-model="preferencesData.musicPreference" class="form-select">
                  <option value="Aucune musique">Aucune musique</option>
                  <option value="Musique douce">
                    <font-awesome-icon :icon="['fas', 'music']" /> Musique douce
                  </option>
                  <option value="Radio">Radio</option>
                  <option value="Selon l'humeur">Selon l'humeur</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Niveau de conversation</label
                ><select v-model="preferencesData.conversationLevel" class="form-select">
                  <option value="Silencieux">Trajet silencieux</option>
                  <option value="Modérée">
                    <font-awesome-icon :icon="['fas', 'comment']" /> Conversation modérée
                  </option>
                  <option value="Bavard">J'aime parler</option>
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
                  /><span class="temperature-value"
                    >{{ preferencesData.temperaturePreference }}°C</span
                  >
                </div>
              </div>
            </div>
            <div class="preferences-grid">
              <div class="preference-card">
                <div class="preference-icon"><font-awesome-icon :icon="['fas', 'smoking']" /></div>
                <div class="preference-content">
                  <h4>Tabac</h4>
                  <label class="switch"
                    ><input v-model="preferencesData.smokingAllowed" type="checkbox" /><span
                      class="slider"
                    ></span
                  ></label>
                  <p>
                    {{
                      preferencesData.smokingAllowed ? 'Fumeur accepté' : 'Non-fumeur uniquement'
                    }}
                  </p>
                </div>
              </div>
              <div class="preference-card">
                <div class="preference-icon"><font-awesome-icon :icon="['fas', 'paw']" /></div>
                <div class="preference-content">
                  <h4>Animaux</h4>
                  <label class="switch"
                    ><input v-model="preferencesData.petsAllowed" type="checkbox" /><span
                      class="slider"
                    ></span
                  ></label>
                  <p>{{ preferencesData.petsAllowed ? 'Animaux acceptés' : "Pas d'animaux" }}</p>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Préférences personnalisées (optionnel)</label
              ><textarea
                v-model="preferencesData.customPreferences"
                class="form-textarea"
                rows="3"
                placeholder="ex: J'accepte les instruments de musique, j'aime les discussions sur les voyages..."
              ></textarea>
            </div>
            <div class="form-actions">
              <button type="button" @click="currentStep = 1" class="btn btn-secondary">
                <font-awesome-icon :icon="['fas', 'arrow-left']" /> Retour</button
              ><button type="submit" class="btn btn-primary">
                Suivant: Confirmation <font-awesome-icon :icon="['fas', 'chevron-right']" />
              </button>
            </div>
          </form>
        </div>
      </div>
      <!-- Étape 3: Confirmation et finalisation -->
      <div v-if="currentStep === 3" class="step-content">
        <div class="confirmation-card">
          <h3><font-awesome-icon :icon="['fas', 'circle-check']" /> Confirmation</h3>
          <p class="step-description">
            Vérifiez vos informations avant de finaliser votre inscription en tant que chauffeur.
          </p>
          <!-- Récapitulatif véhicule -->
          <div class="summary-section">
            <h4><font-awesome-icon :icon="['fas', 'car']" /> Votre véhicule</h4>
            <div class="summary-grid">
              <div class="summary-item">
                <span class="label">Plaque:</span
                ><span class="value">{{ vehicleData.plate_number }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Véhicule:</span
                ><span class="value">{{ vehicleData.brand_name }} {{ vehicleData.model }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Couleur:</span
                ><span class="value">{{ vehicleData.color_name }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Places:</span
                ><span class="value">{{ vehicleData.seats_available }} places</span>
              </div>
              <div class="summary-item">
                <span class="label">Type:</span
                ><span class="value"
                  ><span v-if="vehicleData.is_electric"
                    ><font-awesome-icon :icon="['fas', 'bolt']" /> Électrique</span
                  ><span v-else
                    ><font-awesome-icon :icon="['fas', 'gas-pump']" /> Thermique</span
                  ></span
                >
              </div>
            </div>
          </div>
          <!-- Récapitulatif préférences -->
          <div class="summary-section">
            <h4>⚙️ Vos préférences</h4>
            <div class="summary-grid">
              <div class="summary-item">
                <span class="label">Musique:</span
                ><span class="value">{{ preferencesData.musicPreference }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Conversation:</span
                ><span class="value">{{ preferencesData.conversationLevel }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Température:</span
                ><span class="value">{{ preferencesData.temperaturePreference }}°C</span>
              </div>
              <div class="summary-item">
                <span class="label">Tabac:</span
                ><span class="value"
                  ><span v-if="preferencesData.smokingAllowed"
                    ><font-awesome-icon :icon="['fas', 'circle-check']" /> Accepté</span
                  ><span v-else><font-awesome-icon :icon="['fas', 'xmark']" /> Interdit</span></span
                >
              </div>
              <div class="summary-item">
                <span class="label">Animaux:</span
                ><span class="value"
                  ><span v-if="preferencesData.petsAllowed"
                    ><font-awesome-icon :icon="['fas', 'circle-check']" /> Acceptés</span
                  ><span v-else
                    ><font-awesome-icon :icon="['fas', 'xmark']" /> Interdits</span
                  ></span
                >
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
                /><label for="engagement" class="checkbox-label"
                  ><strong
                    >J'accepte ces engagements et je confirme l'exactitude des informations
                    fournies</strong
                  ></label
                >
              </div>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" @click="currentStep = 2" class="btn btn-secondary">
              ⬅️ Retour</button
            ><button
              @click="submitDriverApplication"
              :disabled="!acceptEngagement || isSubmitting"
              class="btn btn-primary btn-large"
            >
              <span v-if="isSubmitting"
                ><font-awesome-icon :icon="['fas', 'spinner']" spin /> Finalisation en
                cours...</span
              ><span v-else
                ><font-awesome-icon :icon="['fas', 'gift']" /> Devenir Chauffeur EcoRide</span
              >
            </button>
          </div>
        </div>
      </div>
      <!-- Étape 4: Succès -->
      <div v-if="currentStep === 4" class="step-content">
        <div class="success-card">
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
            <router-link to="/my-trips"
              ><font-awesome-icon :icon="['fas', 'rocket']" /> Découvrir mes nouvelles
              fonctionnalités
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
        await vehicleService.addVehicle(vehicleData.value)

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
        } catch {
          // Les préférences sont optionnelles
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
