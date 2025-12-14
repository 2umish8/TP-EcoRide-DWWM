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
              <font-awesome-icon :icon="['fas', 'xmark']" />
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
            <font-awesome-icon :icon="['fas', 'smoking']" class="icon" />
            <span>Fumeur autorisé</span>
          </div>

          <div class="preference-item" v-if="preferences.allowPets">
            <font-awesome-icon :icon="['fas', 'paw']" class="icon" />
            <span>Animaux autorisés</span>
          </div>

          <div class="preference-item" v-if="preferences.allowMusic">
            <font-awesome-icon :icon="['fas', 'music']" class="icon" />
            <span>Musique autorisée</span>
          </div>

          <div class="preference-item" v-if="preferences.conversationLevel">
            <font-awesome-icon :icon="['fas', 'comment']" class="icon" />
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
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  driverId: {
    type: Number,
    required: true,
  },
})

const authStore = useAuthStore()

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
  return authStore.currentUser?.id === props.driverId
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
