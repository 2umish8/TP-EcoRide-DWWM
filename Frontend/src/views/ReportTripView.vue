<template>
  <div class="report-trip-page">
    <div class="container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="logo-section">
            <img src="@/assets/Logo ecoride transparent.PNG" alt="EcoRide" class="logo" />
          </div>
          <div class="title-section">
            <h1>
              <font-awesome-icon :icon="['fas', 'triangle-exclamation']" /> Signaler un problème
            </h1>
            <p>Votre sécurité et satisfaction sont notre priorité</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Chargement des informations du trajet...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-container">
        <div class="error-content">
          <h3><font-awesome-icon :icon="['fas', 'xmark']" /> Erreur</h3>
          <p>{{ error }}</p>
          <router-link to="/" class="btn-primary">Retour à l'accueil</router-link>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else class="report-content">
        <!-- Trip Information -->
        <div class="trip-info-card" v-if="tripInfo">
          <h3><font-awesome-icon :icon="['fas', 'location-dot']" /> Informations du trajet</h3>
          <div class="trip-details">
            <div class="detail-row">
              <span class="label"
                ><font-awesome-icon :icon="['fas', 'location-dot']" /> Départ :</span
              >
              <span class="value">{{ tripInfo.departure_address }}</span>
            </div>
            <div class="detail-row">
              <span class="label"><font-awesome-icon :icon="['fas', 'bullseye']" /> Arrivée :</span>
              <span class="value">{{ tripInfo.arrival_address }}</span>
            </div>
            <div class="detail-row">
              <span class="label"><font-awesome-icon :icon="['fas', 'calendar']" /> Date :</span>
              <span class="value">{{ formatTripDate(tripInfo.departure_datetime) }}</span>
            </div>
            <div class="detail-row">
              <span class="label"><font-awesome-icon :icon="['fas', 'user']" /> Chauffeur :</span>
              <span class="value">{{ tripInfo.driver_pseudo }}</span>
            </div>
          </div>
        </div>

        <!-- Warning Notice -->
        <div class="warning-notice">
          <h3><font-awesome-icon :icon="['fas', 'triangle-exclamation']" /> Important</h3>
          <p>
            Les signalements sont examinés attentivement par notre équipe. Merci de fournir des
            informations précises et détaillées pour nous permettre de traiter votre demande
            efficacement.
          </p>
          <p>
            <strong
              >En cas d'urgence ou de danger immédiat, contactez directement les services
              d'urgence.</strong
            >
          </p>
        </div>

        <!-- Report Form -->
        <div class="report-form-card">
          <div class="form-header">
            <h3><font-awesome-icon :icon="['fas', 'pen']" /> Détails du problème</h3>
            <p>Décrivez précisément ce qui s'est passé pendant votre trajet</p>
          </div>

          <form @submit.prevent="submitReport" class="report-form">
            <!-- Problem Category -->
            <div class="form-group">
              <label for="category" class="form-label">Type de problème *</label>
              <select id="category" v-model="reportForm.category" class="form-select" required>
                <option value="">Sélectionnez le type de problème</option>
                <option value="conduite_dangereuse">Conduite dangereuse</option>
                <option value="retard_important">Retard important (plus de 30 min)</option>
                <option value="vehicule_non_conforme">Véhicule non conforme à l'annonce</option>
                <option value="comportement_inapproprie">
                  Comportement inapproprié du chauffeur
                </option>
                <option value="non_respect_regles">Non-respect des règles EcoRide</option>
                <option value="trajet_modifie">Trajet modifié sans accord</option>
                <option value="probleme_hygiene">Problème d'hygiène ou de propreté</option>
                <option value="autre">Autre problème</option>
              </select>
            </div>

            <!-- Severity Level -->
            <div class="form-group">
              <label class="form-label">Gravité du problème *</label>
              <div class="severity-options">
                <label class="severity-option">
                  <input
                    type="radio"
                    name="severity"
                    value="mineur"
                    v-model="reportForm.severity"
                    required
                  />
                  <span class="severity-label">
                    <font-awesome-icon :icon="['fas', 'circle']" class="severity-icon minor" />
                    <span class="severity-text">
                      <strong>Mineur</strong><br />
                      Gêne légère, sans impact sur la sécurité
                    </span>
                  </span>
                </label>

                <label class="severity-option">
                  <input
                    type="radio"
                    name="severity"
                    value="modere"
                    v-model="reportForm.severity"
                    required
                  />
                  <span class="severity-label">
                    <font-awesome-icon
                      :icon="['fas', 'exclamation']"
                      class="severity-icon moderate"
                    />
                    <span class="severity-text">
                      <strong>Modéré</strong><br />
                      Problème notable affectant le confort
                    </span>
                  </span>
                </label>

                <label class="severity-option">
                  <input
                    type="radio"
                    name="severity"
                    value="grave"
                    v-model="reportForm.severity"
                    required
                  />
                  <span class="severity-label">
                    <font-awesome-icon
                      :icon="['fas', 'triangle-exclamation']"
                      class="severity-icon severe"
                    />
                    <span class="severity-text">
                      <strong>Grave</strong><br />
                      Problème de sécurité ou comportement inacceptable
                    </span>
                  </span>
                </label>
              </div>
            </div>

            <!-- Detailed Description -->
            <div class="form-group">
              <label for="description" class="form-label">Description détaillée *</label>
              <textarea
                id="description"
                v-model="reportForm.description"
                placeholder="Décrivez précisément ce qui s'est passé : heure, lieu, circonstances, impact sur votre trajet..."
                rows="6"
                required
                maxlength="1000"
                class="form-textarea"
              ></textarea>
              <div class="char-count">{{ reportForm.description.length }}/1000 caractères</div>
            </div>

            <!-- Additional Information -->
            <div class="form-group">
              <label for="additionalInfo" class="form-label">Informations complémentaires</label>
              <textarea
                id="additionalInfo"
                v-model="reportForm.additionalInfo"
                placeholder="Témoins, preuves, contexte particulier... (optionnel)"
                rows="3"
                maxlength="500"
                class="form-textarea"
              ></textarea>
              <div class="char-count">{{ reportForm.additionalInfo.length }}/500 caractères</div>
            </div>

            <!-- Contact Permission -->
            <div class="form-group">
              <div class="checkbox-container">
                <input
                  type="checkbox"
                  id="contactPermission"
                  v-model="reportForm.allowContact"
                  class="form-checkbox"
                />
                <label for="contactPermission" class="checkbox-label">
                  J'autorise l'équipe EcoRide à me contacter pour des précisions sur ce signalement
                </label>
              </div>
            </div>

            <!-- Rating (required for reports) -->
            <div class="form-group">
              <label class="form-label">Note globale du trajet *</label>
              <div class="star-rating">
                <button
                  v-for="star in 5"
                  :key="star"
                  type="button"
                  class="star-btn"
                  :class="{ active: star <= reportForm.rating, hover: star <= hoverRating }"
                  @click="setRating(star)"
                  @mouseenter="hoverRating = star"
                  @mouseleave="hoverRating = 0"
                >
                  <font-awesome-icon :icon="['fas', 'star']" />
                </button>
              </div>
              <span class="rating-text">{{ getRatingText(reportForm.rating) }}</span>
            </div>

            <!-- Form Actions -->
            <div class="form-actions">
              <router-link to="/" class="btn-secondary"> Annuler </router-link>
              <button type="submit" class="btn-danger" :disabled="!isFormValid || submitting">
                <span v-if="submitting"
                  ><font-awesome-icon :icon="['fas', 'spinner']" spin /> Envoi en cours...</span
                >
                <span v-else
                  ><font-awesome-icon :icon="['fas', 'triangle-exclamation']" /> Envoyer le
                  signalement</span
                >
              </button>
            </div>
          </form>
        </div>

        <!-- Success Message -->
        <div v-if="submitted" class="success-container">
          <div class="success-content">
            <h3><font-awesome-icon :icon="['fas', 'circle-check']" /> Signalement transmis</h3>
            <p>Votre signalement a été envoyé à notre équipe de modération.</p>
            <div class="success-details">
              <p>
                <strong>Numéro de référence :</strong> REP-{{ Date.now().toString().slice(-8) }}
              </p>
              <p><strong>Prochaines étapes :</strong></p>
              <ul>
                <li>Notre équipe va examiner votre signalement sous 24-48h</li>
                <li>Une enquête sera menée si nécessaire</li>
                <li>Des mesures appropriées seront prises</li>
                <li>Vous serez informé des suites données</li>
              </ul>
            </div>
            <div class="success-actions">
              <router-link to="/" class="btn-primary">Retour à l'accueil</router-link>
              <router-link to="/my-trips" class="btn-secondary">Mes trajets</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { reviewService } from '@/services/mongoServices'
import { carpoolingService } from '@/services/api'

const route = useRoute()

// Props from router
const carpoolingId = ref(route.params.carpoolingId)
const driverId = ref(route.query.driverId)

// State
const loading = ref(true)
const submitting = ref(false)
const submitted = ref(false)
const error = ref('')
const tripInfo = ref(null)
const hoverRating = ref(0)

// Form data
const reportForm = ref({
  category: '',
  severity: '',
  description: '',
  additionalInfo: '',
  allowContact: true,
  rating: 0,
})

// Computed
const isFormValid = computed(() => {
  return (
    reportForm.value.category &&
    reportForm.value.severity &&
    reportForm.value.description.trim().length > 0 &&
    reportForm.value.rating > 0
  )
})

// Methods
const setRating = (rating) => {
  reportForm.value.rating = rating
}

const getRatingText = (rating) => {
  const texts = {
    0: 'Sélectionnez une note',
    1: 'Très décevant',
    2: 'Décevant',
    3: 'Correct',
    4: 'Bien malgré le problème',
    5: 'Problème mineur, trajet globalement bon',
  }
  return texts[rating] || ''
}

const formatTripDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const loadTripInfo = async () => {
  try {
    loading.value = true

    // Get trip information
    const response = await carpoolingService.getCarpoolingById(carpoolingId.value)
    tripInfo.value = response.data.carpooling

    // Validate that the trip is completed
    if (tripInfo.value.status !== 'terminé') {
      throw new Error("Ce trajet n'est pas encore terminé ou n'existe pas.")
    }
  } catch (err) {
    console.error('Erreur lors du chargement du trajet:', err)
    error.value =
      err.response?.data?.message || err.message || 'Erreur lors du chargement du trajet'
  } finally {
    loading.value = false
  }
}

const submitReport = async () => {
  if (!isFormValid.value) return

  try {
    submitting.value = true

    // Create detailed report reason
    const detailedReason = `
CATÉGORIE: ${reportForm.value.category}
GRAVITÉ: ${reportForm.value.severity}

DESCRIPTION:
${reportForm.value.description}

${reportForm.value.additionalInfo ? `INFORMATIONS COMPLÉMENTAIRES:\n${reportForm.value.additionalInfo}` : ''}

Contact autorisé: ${reportForm.value.allowContact ? 'Oui' : 'Non'}
    `.trim()

    const reviewData = {
      reviewedUserId: parseInt(driverId.value),
      carpoolingId: parseInt(carpoolingId.value),
      rating: reportForm.value.rating,
      comment: `Signalement - ${reportForm.value.category}: ${reportForm.value.description.substring(0, 100)}...`,
      isReported: true,
      reportReason: detailedReason,
    }

    await reviewService.createReview(reviewData)

    submitted.value = true
  } catch (err) {
    console.error('Erreur lors de la soumission du signalement:', err)
    error.value = err.response?.data?.message || 'Erreur lors de la soumission du signalement'
  } finally {
    submitting.value = false
  }
}

// Lifecycle
onMounted(() => {
  if (!carpoolingId.value || !driverId.value) {
    error.value = 'Paramètres manquants pour signaler ce trajet'
    loading.value = false
    return
  }

  loadTripInfo()
})
</script>

<style scoped>
.report-trip-page {
  min-height: 100vh;
  background-color: var(--color-dark);
  color: var(--color-light-secondary);
  padding: 20px 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  background: var(--color-dark-secondary);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  margin-bottom: 30px;
  overflow: hidden;
}

.header-content {
  display: flex;
  align-items: center;
  padding: 30px;
  gap: 20px;
}

.logo {
  height: 60px;
  width: auto;
}

.title-section h1 {
  margin: 0 0 10px 0;
  color: var(--color-error);
  font-size: 1.8rem;
}

.title-section p {
  margin: 0;
  color: var(--color-gray);
  font-size: 1.1rem;
}

.loading-container,
.error-container {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 20px;
  border: 4px solid var(--color-dark-tertiary);
  border-top: 4px solid var(--color-error);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-content {
  background: var(--color-dark-secondary);
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.trip-info-card,
.warning-notice,
.report-form-card {
  background: var(--color-dark-secondary);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  margin-bottom: 30px;
  overflow: hidden;
}

.trip-info-card {
  padding: 25px;
}

.trip-info-card h3 {
  margin: 0 0 20px 0;
  color: var(--color-light);
  font-size: 1.3rem;
}

.trip-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.detail-row .label {
  font-weight: bold;
  min-width: 100px;
  color: var(--color-gray);
}

.detail-row .value {
  color: var(--color-light-secondary);
}

.warning-notice {
  padding: 25px;
  background: rgba(205, 101, 112, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-left: 4px solid var(--color-error);
}

.warning-notice h3 {
  margin: 0 0 15px 0;
  color: var(--color-error);
}

.warning-notice p {
  margin: 0 0 10px 0;
  color: rgba(205, 101, 112, 0.8);
  line-height: 1.6;
}

.report-form-card {
  padding: 30px;
}

.form-header {
  margin-bottom: 30px;
  text-align: center;
}

.form-header h3 {
  margin: 0 0 10px 0;
  color: var(--color-error);
  font-size: 1.4rem;
}

.form-header p {
  margin: 0;
  color: var(--color-gray);
  font-size: 1rem;
}

.form-group {
  margin-bottom: 25px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: var(--color-light-secondary);
}

.form-select,
.form-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.5;
  transition: border-color 0.3s;
  background-color: var(--color-dark-tertiary);
  color: var(--color-light-secondary);
}

.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-error);
}

.form-textarea {
  resize: vertical;
}

.char-count {
  text-align: right;
  font-size: 0.8rem;
  color: var(--color-gray);
  margin-top: 5px;
}

.severity-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.severity-option {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 15px;
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background-color: var(--color-dark-tertiary);
}

.severity-option:hover {
  border-color: var(--color-gray);
  background: rgba(255, 255, 255, 0.15);
}

.severity-option input[type='radio'] {
  margin-top: 2px;
}

.severity-option input[type='radio']:checked + .severity-label {
  font-weight: bold;
}

.severity-label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
}

.severity-icon {
  font-size: 1.2rem;
  margin-top: 2px;
}

.severity-icon.minor {
  color: var(--color-success);
}

.severity-icon.moderate {
  color: var(--color-warning);
}

.severity-icon.severe {
  color: var(--color-error);
}

.severity-text {
  line-height: 1.4;
}

.checkbox-container {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.form-checkbox {
  width: 18px;
  height: 18px;
  margin-top: 2px;
}

.checkbox-label {
  margin: 0;
  cursor: pointer;
  color: var(--color-light-secondary);
  font-weight: normal;
  line-height: 1.5;
}

.star-rating {
  display: flex;
  gap: 5px;
  margin-bottom: 10px;
}

.star-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  transition:
    transform 0.2s,
    color 0.2s;
  color: var(--color-gray);
}

.star-btn.active,
.star-btn.hover {
  color: var(--color-warning);
  transform: scale(1.1);
}

.rating-text {
  font-size: 0.9rem;
  color: var(--color-gray);
  font-style: italic;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
}

.btn-primary,
.btn-secondary,
.btn-danger {
  padding: 12px 30px;
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
  background: var(--color-success);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: rgba(67, 197, 97, 0.8);
  transform: translateY(-2px);
}

.btn-secondary {
  background: var(--color-dark-tertiary);
  color: var(--color-light-secondary);
  border: 2px solid rgba(255, 255, 255, 0.15);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.btn-danger {
  background: var(--color-error);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: rgba(205, 101, 112, 0.7);
  transform: translateY(-2px);
}

.btn-danger:disabled {
  background: var(--color-gray);
  cursor: not-allowed;
}

.success-container {
  text-align: center;
  padding: 40px;
}

.success-content {
  background: var(--color-dark-secondary);
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  border: 3px solid var(--color-success);
}

.success-content h3 {
  color: var(--color-success);
  margin-bottom: 15px;
}

.success-details {
  text-align: left;
  margin: 25px 0;
  padding: 20px;
  background: rgba(67, 197, 97, 0.1);
  border: 1px solid var(--color-success);
  border-radius: 8px;
}

.success-details ul {
  margin: 10px 0 0 20px;
}

.success-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 25px;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
    padding: 20px;
  }

  .container {
    padding: 0 15px;
  }

  .trip-info-card,
  .warning-notice,
  .report-form-card {
    padding: 20px;
  }

  .form-actions,
  .success-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary,
  .btn-danger {
    width: 100%;
  }

  .severity-options {
    gap: 10px;
  }

  .severity-option {
    padding: 12px;
  }
}
</style>
