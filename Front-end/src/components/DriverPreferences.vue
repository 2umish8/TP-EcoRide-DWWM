<template>
  <div class="driver-preferences">
    <div class="preferences-header">
      <h3>Préférences de conduite</h3>
      <p v-if="isOwnProfile">Configurez vos préférences pour les passagers</p>
      <p v-else>Préférences de ce chauffeur</p>
    </div>

    <!-- Mode édition -->
    <div v-if="isEditing" class="edit-mode">
      <form @submit.prevent="savePreferences" class="preferences-form">
        <!-- Préférences standards -->
        <div class="standard-preferences">
          <h4>Préférences standard</h4>

          <div class="preference-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.allowSmoking" />
              <span class="checkmark"></span>
              Fumeur autorisé
            </label>
          </div>

          <div class="preference-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.allowPets" />
              <span class="checkmark"></span>
              Animaux autorisés
            </label>
          </div>

          <div class="preference-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.allowMusic" />
              <span class="checkmark"></span>
              Musique autorisée
            </label>
          </div>

          <div class="preference-group">
            <label for="conversation">Niveau de conversation :</label>
            <select id="conversation" v-model="form.conversationLevel">
              <option value="silence">Silence préféré</option>
              <option value="minimal">Conversation minimale</option>
              <option value="normal">Conversation normale</option>
              <option value="social">Très social</option>
            </select>
          </div>
        </div>

        <!-- Préférences personnalisées -->
        <div class="custom-preferences">
          <h4>Préférences personnalisées</h4>

          <div
            v-for="(pref, index) in form.customPreferences"
            :key="index"
            class="custom-preference-item"
          >
            <input
              type="text"
              v-model="pref.name"
              placeholder="Nom de la préférence"
              maxlength="50"
            />
            <input type="text" v-model="pref.value" placeholder="Valeur" maxlength="100" />
            <button type="button" @click="removeCustomPreference(index)" class="btn-remove">
              ✕
            </button>
          </div>

          <button
            type="button"
            @click="addCustomPreference"
            class="btn-add-custom"
            :disabled="form.customPreferences.length >= 10"
          >
            + Ajouter une préférence
          </button>
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <button type="button" @click="cancelEdit" class="btn-cancel">Annuler</button>
          <button type="submit" class="btn-save" :disabled="loading">
            {{ loading ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Mode affichage -->
    <div v-else class="display-mode">
      <div v-if="hasPreferences" class="preferences-display">
        <!-- Préférences standards -->
        <div class="standard-display">
          <div class="preference-item" v-if="preferences.allowSmoking">
            <span class="icon">🚬</span>
            <span>Fumeur autorisé</span>
          </div>

          <div class="preference-item" v-if="preferences.allowPets">
            <span class="icon">🐕</span>
            <span>Animaux autorisés</span>
          </div>

          <div class="preference-item" v-if="preferences.allowMusic">
            <span class="icon">🎵</span>
            <span>Musique autorisée</span>
          </div>

          <div class="preference-item" v-if="preferences.conversationLevel">
            <span class="icon">💬</span>
            <span>{{ getConversationText(preferences.conversationLevel) }}</span>
          </div>
        </div>

        <!-- Préférences personnalisées -->
        <div v-if="preferences.customPreferences?.length > 0" class="custom-display">
          <h4>Autres préférences</h4>
          <div
            v-for="pref in preferences.customPreferences"
            :key="pref.name"
            class="custom-preference-display"
          >
            <strong>{{ pref.name }}:</strong> {{ pref.value }}
          </div>
        </div>
      </div>

      <div v-else class="no-preferences">
        <p v-if="isOwnProfile">
          Aucune préférence configurée.
          <button @click="startEdit" class="btn-link">Configurez-les maintenant</button>
        </p>
        <p v-else>Ce chauffeur n'a pas encore configuré ses préférences.</p>
      </div>

      <!-- Bouton d'édition -->
      <button v-if="isOwnProfile && hasPreferences" @click="startEdit" class="btn-edit">
        Modifier mes préférences
      </button>
    </div>

    <!-- Messages -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="success" class="success-message">Préférences enregistrées avec succès !</div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { preferencesService } from '@/services/mongoServices.js'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  driverId: {
    type: Number,
    required: true,
  },
})

const userStore = useUserStore()

// État réactif
const preferences = ref({})
const isEditing = ref(false)
const loading = ref(false)
const error = ref(null)
const success = ref(false)

const form = ref({
  allowSmoking: false,
  allowPets: false,
  allowMusic: false,
  conversationLevel: 'normal',
  customPreferences: [],
})

// Computed
const isOwnProfile = computed(() => {
  return userStore.user?.id === props.driverId
})

const hasPreferences = computed(() => {
  return Object.keys(preferences.value).length > 0
})

// Méthodes
const loadPreferences = async () => {
  try {
    error.value = null
    const data = await preferencesService.getDriverPreferences(props.driverId)
    preferences.value = data || {}
  } catch (err) {
    if (err.response?.status !== 404) {
      console.error('Erreur lors du chargement des préférences:', err)
      error.value = 'Erreur lors du chargement des préférences'
    }
  }
}

const startEdit = () => {
  // Initialiser le formulaire avec les préférences existantes
  form.value = {
    allowSmoking: preferences.value.allowSmoking || false,
    allowPets: preferences.value.allowPets || false,
    allowMusic: preferences.value.allowMusic || false,
    conversationLevel: preferences.value.conversationLevel || 'normal',
    customPreferences: [...(preferences.value.customPreferences || [])],
  }
  isEditing.value = true
  error.value = null
  success.value = false
}

const cancelEdit = () => {
  isEditing.value = false
  error.value = null
}

const savePreferences = async () => {
  try {
    loading.value = true
    error.value = null
    success.value = false

    // Filtrer les préférences personnalisées vides
    const cleanCustomPreferences = form.value.customPreferences.filter(
      (pref) => pref.name.trim() && pref.value.trim(),
    )

    const data = {
      ...form.value,
      customPreferences: cleanCustomPreferences,
    }

    await preferencesService.createOrUpdatePreferences(props.driverId, data)

    preferences.value = data
    isEditing.value = false
    success.value = true

    setTimeout(() => {
      success.value = false
    }, 3000)
  } catch (err) {
    console.error("Erreur lors de l'enregistrement:", err)
    error.value = "Erreur lors de l'enregistrement des préférences"
  } finally {
    loading.value = false
  }
}

const addCustomPreference = () => {
  if (form.value.customPreferences.length < 10) {
    form.value.customPreferences.push({ name: '', value: '' })
  }
}

const removeCustomPreference = (index) => {
  form.value.customPreferences.splice(index, 1)
}

const getConversationText = (level) => {
  const texts = {
    silence: 'Silence préféré',
    minimal: 'Conversation minimale',
    normal: 'Conversation normale',
    social: 'Très social',
  }
  return texts[level] || level
}

// Charger les préférences au montage
onMounted(() => {
  loadPreferences()
})
</script>

<style scoped>
.driver-preferences {
  background: #1a1a1a;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
}

.preferences-header {
  margin-bottom: 20px;
  text-align: center;
}

.preferences-header h3 {
  color: #34d399;
  margin: 0 0 10px 0;
}

.preferences-header p {
  color: #888;
  margin: 0;
}

/* Mode édition */
.preferences-form {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.standard-preferences h4,
.custom-preferences h4 {
  color: #fff;
  margin: 0 0 15px 0;
  border-bottom: 1px solid #333;
  padding-bottom: 10px;
}

.preference-group {
  margin-bottom: 15px;
}

.preference-group label {
  color: #fff;
  font-weight: bold;
}

.preference-group select {
  background: #2a2a2a;
  border: 2px solid #333;
  border-radius: 8px;
  padding: 10px;
  color: #fff;
  width: 100%;
  margin-top: 5px;
}

.preference-group select:focus {
  outline: none;
  border-color: #34d399;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.checkbox-label input[type='checkbox'] {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  background: #2a2a2a;
  border: 2px solid #333;
  border-radius: 4px;
  position: relative;
  transition: all 0.3s;
}

.checkbox-label input[type='checkbox']:checked + .checkmark {
  background: #34d399;
  border-color: #34d399;
}

.checkbox-label input[type='checkbox']:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #000;
  font-weight: bold;
}

/* Préférences personnalisées */
.custom-preference-item {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
}

.custom-preference-item input {
  background: #2a2a2a;
  border: 2px solid #333;
  border-radius: 8px;
  padding: 10px;
  color: #fff;
  flex: 1;
}

.custom-preference-item input:focus {
  outline: none;
  border-color: #34d399;
}

.btn-remove {
  background: #ef4444;
  color: #fff;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-add-custom {
  background: #333;
  color: #34d399;
  border: 2px dashed #34d399;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s;
}

.btn-add-custom:hover:not(:disabled) {
  background: rgba(52, 211, 153, 0.1);
}

.btn-add-custom:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Mode affichage */
.standard-display {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
}

.preference-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #2a2a2a;
  padding: 10px 15px;
  border-radius: 8px;
  color: #fff;
}

.preference-item .icon {
  font-size: 1.2em;
}

.custom-display h4 {
  color: #fff;
  margin: 20px 0 15px 0;
  border-bottom: 1px solid #333;
  padding-bottom: 10px;
}

.custom-preference-display {
  background: #2a2a2a;
  padding: 12px 15px;
  border-radius: 8px;
  margin-bottom: 10px;
  color: #ccc;
}

.custom-preference-display strong {
  color: #34d399;
}

.no-preferences {
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 40px 20px;
}

.btn-link {
  background: none;
  border: none;
  color: #34d399;
  text-decoration: underline;
  cursor: pointer;
}

/* Actions */
.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
}

.btn-cancel,
.btn-save,
.btn-edit {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cancel {
  background: #333;
  color: #fff;
}

.btn-save {
  background: #34d399;
  color: #000;
}

.btn-edit {
  background: #34d399;
  color: #000;
  margin-top: 20px;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

.btn-cancel:hover,
.btn-save:hover:not(:disabled),
.btn-edit:hover {
  opacity: 0.8;
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Messages */
.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid #ef4444;
  color: #ef4444;
  padding: 12px;
  border-radius: 8px;
  margin-top: 15px;
}

.success-message {
  background: rgba(52, 211, 153, 0.1);
  border: 1px solid #34d399;
  color: #34d399;
  padding: 12px;
  border-radius: 8px;
  margin-top: 15px;
  text-align: center;
}

/* Responsive */
@media (max-width: 768px) {
  .custom-preference-item {
    flex-direction: column;
    align-items: stretch;
  }

  .custom-preference-item input {
    width: 100%;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
