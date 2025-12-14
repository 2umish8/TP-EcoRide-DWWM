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

