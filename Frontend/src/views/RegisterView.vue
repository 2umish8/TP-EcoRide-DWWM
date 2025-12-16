<template>
  <div class="register-page">
    <div class="register-container">
      <!-- Header section left -->
      <div class="register-header-section">
        <img src="@/assets/Logo ecoride transparent.PNG" alt="EcoRide" class="register-logo" />
        <h1 class="register-title">Rejoignez EcoRide !</h1>
        <p class="register-subtitle">
          Créez votre compte et commencez à voyager de manière éco-responsable
        </p>
      </div>

      <BaseCard class="register-card">
        <!-- Registration form -->
        <form @submit.prevent="handleRegister" class="register-form">
          <!-- First row: Email and Pseudo -->
          <div class="form-row">
            <div class="form-group">
              <label for="email" class="form-label">Adresse e-mail *</label>
              <TextInput
                id="email"
                v-model="registerForm.email"
                type="email"
                placeholder="votre@email.com"
                :disabled="isLoading"
              />
              <div v-if="emailError && registerForm.email" class="field-error">
                {{ emailError }}
              </div>
            </div>

            <div class="form-group">
              <label for="pseudo" class="form-label">Pseudo *</label>
              <TextInput
                id="pseudo"
                v-model="registerForm.pseudo"
                type="text"
                placeholder="votre_pseudo"
                :disabled="isLoading"
              />
            </div>
          </div>

          <!-- Second row: Password and Confirmation -->
          <div class="form-row">
            <div class="form-group">
              <label for="password" class="form-label">Mot de passe *</label>
              <div class="password-input-group">
                <TextInput
                  id="password"
                  v-model="registerForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Minimum 8 caractères"
                  :disabled="isLoading"
                  :title="passwordTooltip"
                  @mouseenter="showTooltip = true"
                  @mouseleave="showTooltip = false"
                  @focus="showTooltip = true"
                  @blur="showTooltip = false"
                />
                <IconButton type="button" @click="togglePassword" :disabled="isLoading">
                  <font-awesome-icon v-if="showPassword" :icon="['fas', 'eye']" />
                  <font-awesome-icon v-else :icon="['fas', 'eye-slash']" />
                </IconButton>
                <!-- Password criteria tooltip -->
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
              <!-- Password strength indicator -->
              <PasswordStrengthIndicator
                :password="registerForm.password"
                :show-requirements="false"
                @validation-change="handlePasswordValidation"
              />
            </div>

            <div class="form-group">
              <label for="confirmPassword" class="form-label">Confirmer le mot de passe *</label>
              <TextInput
                id="confirmPassword"
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="Répétez votre mot de passe"
                :disabled="isLoading"
              />
              <!-- Password confirmation validator -->
              <PasswordConfirmationValidator
                :password="registerForm.password"
                :confirm-password="registerForm.confirmPassword"
                @confirmation-change="handlePasswordConfirmationValidation"
              />
            </div>
          </div>

          <!-- Legal mentions checkbox -->
          <div class="legal-checkbox">
            <input
              id="acceptTerms"
              type="checkbox"
              v-model="acceptTerms"
              :disabled="isLoading"
              class="checkbox-input"
            />
            <label for="acceptTerms" class="checkbox-label">
              Je confirme avoir lu les
              <router-link to="/legal" target="_blank" class="legal-link">
                mentions légales
              </router-link>
            </label>
          </div>

          <!-- Error message -->
          <div v-if="errorMessage" class="error-message">
            <font-awesome-icon :icon="['fas', 'triangle-exclamation']" class="error-icon" />
            {{ errorMessage }}
          </div>

          <!-- Register button -->
          <PrimaryButton type="submit" :disabled="isLoading || !isFormValid">
            <font-awesome-icon
              v-if="isLoading"
              :icon="['fas', 'hourglass-half']"
              class="loading-spinner"
            />
            <span v-else>Créer mon compte</span>
          </PrimaryButton>
        </form>

        <!-- Link to login -->
        <div class="login-link">
          <p>Vous avez déjà un compte ?</p>
          <InlineLink to="/login">Se connecter</InlineLink>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { isValidEmail, getEmailErrorMessage } from '@/utils/emailValidator'
import PasswordStrengthIndicator from '@/components/shared/icons/PasswordStrengthIndicator.vue'
import PasswordConfirmationValidator from '@/components/shared/icons/PasswordConfirmationValidator.vue'
import { authService } from '@/services/api'
import PrimaryButton from '@/components/ui/buttons/PrimaryButton.vue'
import IconButton from '@/components/ui/buttons/IconButton.vue'
import InlineLink from '@/components/ui/InlineLink.vue'
import BaseCard from '@/components/ui/cards/BaseCard.vue'
import TextInput from '@/components/ui/inputs/TextInput.vue'
import { useNotificationStore } from '@/stores/notification'

const router = useRouter()
const notificationStore = useNotificationStore()

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
const acceptTerms = ref(false)

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
    passwordConfirmationValidation.value.isValid &&
    acceptTerms.value
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

  try {
    // Appel à l'API d'inscription
    await authService.register({
      pseudo: registerForm.value.pseudo,
      email: registerForm.value.email,
      password: registerForm.value.password,
    })

    // Inscription réussie
    notificationStore.showSuccess('Compte créé avec succès ! Redirection vers la connexion...')

    // Redirection vers la page de connexion après un délai
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (error) {
    if (import.meta.env.DEV) {
      console.log("Erreur lors de l'inscription:", error)
    }
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

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-dark) 0%, var(--color-dark-secondary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.register-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 1200px;
  width: 100%;
  background: var(--color-dark);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  min-height: 600px;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.register-header-section {
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: var(--color-dark);
  color: white;
  text-align: center;
  border-right: 1px solid rgba(255, 255, 255, 0.15);
}

.register-card {
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow-y: auto;
  background: var(--color-dark);
}

.register-logo {
  width: 100px;
  height: auto;
  margin-bottom: 20px;
}

.register-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 16px;
}

.register-subtitle {
  color: var(--color-light-secondary);
  font-size: 1.1rem;
  line-height: 1.6;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-weight: 600;
  color: var(--color-light);
  font-size: 0.9rem;
}

.field-error {
  color: var(--color-error);
  font-size: 0.85rem;
  font-weight: 500;
}

.password-input-group {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

.password-tooltip {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  margin-top: 8px;
  animation: fadeIn 0.2s ease-in-out;
}

.tooltip-content {
  background: var(--color-dark-secondary);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  font-size: 0.85rem;
  color: var(--color-light);
}

.tooltip-content strong {
  color: var(--color-primary);
  display: block;
  margin-bottom: 8px;
}

.tooltip-content ul {
  margin: 0;
  padding-left: 16px;
  color: var(--color-light-secondary);
}

.tooltip-content li {
  margin-bottom: 4px;
  line-height: 1.4;
}

.legal-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--color-primary);
}

.checkbox-input:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.checkbox-label {
  color: var(--color-light-secondary);
  font-size: 0.9rem;
  cursor: pointer;
  user-select: none;
}

.legal-link {
  color: var(--color-primary);
  text-decoration: underline;
  font-weight: 600;
}

.legal-link:hover {
  color: var(--color-primary-hover);
}

.error-message {
  background: rgba(205, 101, 112, 0.1);
  border: 1px solid rgba(205, 101, 112, 0.2);
  color: var(--color-error);
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.success-message {
  background: rgba(67, 197, 97, 0.1);
  border: 1px solid rgba(67, 197, 97, 0.2);
  color: var(--color-success);
  padding: 12px 16px;
  text-align: center;
  margin-top: 20px;
}

.login-link p {
  color: var(--color-light-secondary);
  margin-bottom: 12px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .register-page {
    padding: 10px;
  }

  .register-container {
    grid-template-columns: 1fr;
    max-width: 500px;
  }

  .register-header-section {
    order: -1;
    padding: 30px 20px;
  }

  .register-title {
    font-size: 2rem;
  }

  .register-card {
    padding: 30px 20px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
</style>
