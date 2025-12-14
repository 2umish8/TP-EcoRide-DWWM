<template>
  <div class="register-page">
    <div class="register-container">
      <!-- Section titre à gauche -->
      <div class="register-header-section">
        <div class="logo-section">
          <img src="@/assets/Logo ecoride transparent.PNG" alt="EcoRide" class="register-logo" />
        </div>
        <h1 class="register-title">Rejoignez EcoRide !</h1>
        <p class="register-subtitle">
          Créez votre compte et commencez à voyager de manière éco-responsable
        </p>
      </div>

      <div class="register-card">
        <!-- Formulaire d'inscription -->
        <form @submit.prevent="handleRegister" class="register-form">
          <!-- Première ligne : Email et Pseudo -->
          <div class="form-row">
            <div class="form-group">
              <label for="email" class="form-label">Adresse e-mail *</label>
              <input
                type="email"
                id="email"
                v-model="registerForm.email"
                class="form-input"
                :class="{ error: emailError && registerForm.email }"
                placeholder="votre@email.com"
                required
                :disabled="isLoading"
              />
              <div v-if="emailError && registerForm.email" class="field-error">
                {{ emailError }}
              </div>
            </div>

            <div class="form-group">
              <label for="pseudo" class="form-label">Pseudo *</label>
              <input
                type="text"
                id="pseudo"
                v-model="registerForm.pseudo"
                class="form-input"
                placeholder="votre_pseudo"
                required
                :disabled="isLoading"
              />
            </div>
          </div>

          <!-- Deuxième ligne : Mot de passe et Confirmation -->
          <div class="form-row">
            <div class="form-group">
              <label for="password" class="form-label">Mot de passe *</label>
              <div class="password-input-group">
                <input
                  :type="showPassword ? 'text' : 'password'"
                  id="password"
                  v-model="registerForm.password"
                  class="form-input"
                  :class="{
                    'password-valid': passwordValidation.isValid,
                    'password-invalid': registerForm.password && !passwordValidation.isValid,
                    'password-medium': passwordValidation.strength === 'moyen',
                  }"
                  placeholder="Minimum 8 caractères"
                  required
                  :disabled="isLoading"
                  :title="passwordTooltip"
                  @mouseenter="showTooltip = true"
                  @mouseleave="showTooltip = false"
                  @focus="showTooltip = true"
                  @blur="showTooltip = false"
                />
                <button
                  type="button"
                  @click="togglePassword"
                  class="password-toggle"
                  :disabled="isLoading"
                >
                  <font-awesome-icon v-if="showPassword" :icon="['fas', 'eye']" />
                  <font-awesome-icon v-else :icon="['fas', 'eye-slash']" />
                </button>
                <!-- Tooltip personnalisé -->
                <div class="password-tooltip" v-show="showTooltip">
                  <div class="tooltip-content">
                    <strong>Critères requis :</strong>
                    <ul>
                      <li>8+ caractères</li>
                      <li>1 minuscule, 1 majuscule</li>
                      <li>1 chiffre, 1 caractère spécial</li>
                      <li>Pas de caractères interdits (&lt;&gt;'"&amp;;)</li>
                    </ul>
                  </div>
                </div>
              </div>
              <!-- Indicateur de force simplifié -->
              <PasswordStrengthIndicator
                :password="registerForm.password"
                :show-requirements="false"
                @validation-change="handlePasswordValidation"
              />
            </div>

            <div class="form-group">
              <label for="confirmPassword" class="form-label">Confirmer le mot de passe *</label>
              <input
                type="password"
                id="confirmPassword"
                v-model="registerForm.confirmPassword"
                class="form-input"
                :class="{
                  'password-valid':
                    passwordConfirmationValidation.isValid && registerForm.confirmPassword,
                  'password-invalid':
                    registerForm.confirmPassword && !passwordConfirmationValidation.isValid,
                }"
                placeholder="Répétez votre mot de passe"
                required
                :disabled="isLoading"
              />
              <!-- Composant de validation de confirmation -->
              <PasswordConfirmationValidator
                :password="registerForm.password"
                :confirm-password="registerForm.confirmPassword"
                @confirmation-change="handlePasswordConfirmationValidation"
              />
            </div>
          </div>

          <!-- Message d'erreur -->
          <div v-if="errorMessage" class="error-message">
            <font-awesome-icon :icon="['fas', 'triangle-exclamation']" class="error-icon" />
            {{ errorMessage }}
          </div>

          <!-- Message de succès -->
          <div v-if="successMessage" class="success-message">
            <font-awesome-icon :icon="['fas', 'circle-check']" class="success-icon" />
            {{ successMessage }}
          </div>

          <!-- Bouton d'inscription -->
          <button type="submit" class="register-btn" :disabled="isLoading || !isFormValid">
            <font-awesome-icon
              v-if="isLoading"
              :icon="['fas', 'hourglass-half']"
              class="loading-spinner"
            />
            <span v-else>Créer mon compte</span>
          </button>
        </form>

        <!-- Lien vers connexion -->
        <div class="login-link">
          <p>Vous avez déjà un compte ?</p>
          <router-link to="/login" class="login-btn-link"> Se connecter </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { isValidEmail, getEmailErrorMessage } from '@/utils/emailValidator'
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator.vue'
import PasswordConfirmationValidator from '@/components/PasswordConfirmationValidator.vue'
import { authService } from '@/services/api'

const router = useRouter()

// État du formulaire
const registerForm = ref({
  email: '',
  pseudo: '',
  password: '',
  confirmPassword: '',
})

// États de l'interface
const isLoading = ref(false)
const showPassword = ref(false)
const showTooltip = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Tooltip pour les critères de mot de passe
const passwordTooltip = computed(() => {
  return 'Critères : 8+ caractères, 1 minuscule, 1 majuscule, 1 chiffre, 1 caractère spécial'
})

// États de validation des mots de passe
const passwordValidation = ref({
  isValid: false,
  strength: 'invalid',
  percentage: 0,
})

const passwordConfirmationValidation = ref({
  isValid: false,
  error: null,
})

// Validation de l'email
const emailError = computed(() => {
  if (!registerForm.value.email) {
    return null // Ne pas afficher d'erreur si le champ est vide
  }
  return getEmailErrorMessage(registerForm.value.email)
})

const isEmailValid = computed(() => {
  return registerForm.value.email && isValidEmail(registerForm.value.email)
})

// Validation des mots de passe
const passwordsMatch = computed(() => {
  return registerForm.value.password === registerForm.value.confirmPassword
})

// Validation du formulaire avec la nouvelle validation de mot de passe
const isFormValid = computed(() => {
  return (
    registerForm.value.email &&
    registerForm.value.pseudo &&
    registerForm.value.password &&
    registerForm.value.confirmPassword &&
    passwordsMatch.value &&
    isEmailValid.value &&
    passwordValidation.value.isValid &&
    passwordConfirmationValidation.value.isValid
  )
})

// Basculer l'affichage du mot de passe
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

// Gestionnaires de validation des mots de passe
const handlePasswordValidation = (validation) => {
  passwordValidation.value = validation
}

const handlePasswordConfirmationValidation = (validation) => {
  passwordConfirmationValidation.value = validation
}

// Inscription avec connexion au backend
const handleRegister = async () => {
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    // Appel à l'API d'inscription
    await authService.register({
      pseudo: registerForm.value.pseudo,
      email: registerForm.value.email,
      password: registerForm.value.password,
    })

    // Inscription réussie
    successMessage.value = 'Compte créé avec succès ! Redirection vers la connexion...'

    // Redirection vers la page de connexion après un délai
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error)

    // Gestion des erreurs spécifiques
    if (error.response?.data?.message) {
      errorMessage.value = error.response.data.message
    } else if (error.message) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = "Une erreur est survenue lors de l'inscription. Veuillez réessayer."
    }
  } finally {
    isLoading.value = false
  }
}
</script>

