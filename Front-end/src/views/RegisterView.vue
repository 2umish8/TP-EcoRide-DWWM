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
                  <span v-if="showPassword">👁️</span>
                  <span v-else>🙈</span>
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
            <span class="error-icon">⚠️</span>
            {{ errorMessage }}
          </div>

          <!-- Message de succès -->
          <div v-if="successMessage" class="success-message">
            <span class="success-icon">✅</span>
            {{ successMessage }}
          </div>

          <!-- Bouton d'inscription -->
          <button type="submit" class="register-btn" :disabled="isLoading || !isFormValid">
            <span v-if="isLoading" class="loading-spinner">⏳</span>
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

// Inscription avec connexion au back-end
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

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d3748 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  padding-top: 80px;
}

.register-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 1200px;
  width: 100%;
  background: #1a1a1a;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  min-height: 600px;
  border: 1px solid #333;
}

.register-header-section {
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #1a1a1a;
  color: white;
  text-align: center;
  border-right: 1px solid #333;
}

.register-card {
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow-y: auto;
  background: #1a1a1a;
}

.register-logo {
  width: 100px;
  height: auto;
  margin-bottom: 20px;
}

.register-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #34d399;
  margin-bottom: 16px;
}

.register-subtitle {
  color: #cccccc;
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
  gap: 2px;
}

.form-label {
  font-weight: 600;
  color: #ffffff;
  font-size: 0.9rem;
}

.form-input {
  padding: 15px 16px;
  border: 2px solid #333;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #2a2a2a;
  color: #ffffff;
}

.form-input:focus {
  outline: none;
  border-color: #34d399;
  background: #2a2a2a;
  box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.2);
}

.form-input::placeholder {
  color: #888;
}

.form-input.error {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.form-input.error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
}

.field-error {
  color: #ef4444;
  font-size: 0.85rem;
  font-weight: 500;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.field-error::before {
  content: '⚠️';
  font-size: 0.75rem;
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.password-input-group {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.password-toggle:hover {
  background: #333;
}

/* Tooltip pour les critères de mot de passe */
.password-input-group {
  position: relative;
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
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  font-size: 0.85rem;
  color: #ffffff;
}

.tooltip-content strong {
  color: #34d399;
  display: block;
  margin-bottom: 8px;
}

.tooltip-content ul {
  margin: 0;
  padding-left: 16px;
  color: #cccccc;
}

.tooltip-content li {
  margin-bottom: 4px;
  line-height: 1.4;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.password-strength {
  margin-top: 8px;
}

.strength-bar {
  width: 100%;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
}

.strength-fill.weak {
  background: #ef4444;
}
.strength-fill.medium {
  background: #f59e0b;
}
.strength-fill.good {
  background: #3b82f6;
}
.strength-fill.strong {
  background: #22c55e;
}

.strength-text {
  font-size: 0.8rem;
  font-weight: 500;
}

.strength-text.weak {
  color: #ef4444;
}
.strength-text.medium {
  color: #f59e0b;
}
.strength-text.good {
  color: #3b82f6;
}
.strength-text.strong {
  color: #22c55e;
}

.password-error {
  color: #ff6b6b;
  font-size: 0.8rem;
  margin-top: 4px;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #cccccc;
  line-height: 1.5;
}

.checkbox-label input[type='checkbox'] {
  accent-color: #34d399;
  margin: 0;
}

.link {
  color: #34d399;
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  color: #22c55e;
  text-decoration: underline;
}

.error-message {
  background: #2d1b1b;
  border: 1px solid #4a2020;
  color: #ff6b6b;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.success-message {
  background: #1b2d1b;
  border: 1px solid #204a20;
  color: #4ade80;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.register-btn {
  background: #34d399;
  color: white;
  border: none;
  padding: 16px 24px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 10px;
}

.register-btn:hover:not(:disabled) {
  background: #22c55e;
  transform: translateY(-1px);
}

.register-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.login-link {
  text-align: center;
  margin-top: 20px;
}

.login-link p {
  color: #cccccc;
  margin-bottom: 12px;
}

.login-btn-link {
  color: #34d399;
  text-decoration: none;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.login-btn-link:hover {
  background: #1a2e1a;
  color: #22c55e;
}

/* Responsive */
@media (max-width: 768px) {
  .register-page {
    padding: 10px;
    padding-top: 60px;
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

  /* Passer en layout vertical sur mobile */
  .form-row {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
</style>
