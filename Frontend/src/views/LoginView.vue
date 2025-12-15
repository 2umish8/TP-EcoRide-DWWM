<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <!-- Logo et titre -->
        <div class="login-header">
          <div class="logo-section">
            <img src="@/assets/Logo ecoride transparent.PNG" alt="EcoRide" class="login-logo" />
          </div>
          <h1 class="login-title">Bon retour parmi nous !</h1>
          <p class="login-subtitle">Connectez-vous pour continuer votre aventure éco-responsable</p>
        </div>

        <!-- Formulaire de connexion -->
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email" class="form-label">Email ou Pseudo</label>
            <input
              type="text"
              id="email"
              v-model="loginForm.email"
              class="form-input"
              placeholder="votre@email.com ou votre_pseudo"
              required
              :disabled="isLoading"
            />
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Mot de passe</label>
            <div class="password-input-group">
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="loginForm.password"
                class="form-input"
                placeholder="Votre mot de passe"
                required
                :disabled="isLoading"
              />
              <IconButton type="button" @click="togglePassword" :disabled="isLoading">
                <font-awesome-icon v-if="showPassword" :icon="['fas', 'eye']" />
                <font-awesome-icon v-else :icon="['fas', 'eye-slash']" />
              </IconButton>
            </div>
          </div>

          <!-- Options supplémentaires -->
          <div class="form-options">
            <label class="remember-me">
              <input type="checkbox" v-model="loginForm.rememberMe" :disabled="isLoading" />
              <span class="checkmark"></span>
              Se souvenir de moi
            </label>
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

          <!-- Bouton de connexion -->
          <PrimaryButton type="submit" :disabled="isLoading || !isFormValid">
            <font-awesome-icon
              v-if="isLoading"
              :icon="['fas', 'spinner']"
              spin
              class="loading-spinner"
            />
            <span v-else>Se connecter</span>
          </PrimaryButton>
        </form>

        <!-- Lien vers inscription -->
        <div class="signup-link">
          <p>Vous n'avez pas encore de compte ?</p>
          <InlineLink to="/register">Créer un compte</InlineLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/services/api'
import PrimaryButton from '@/components/ui/PrimaryButton.vue'
import IconButton from '@/components/ui/IconButton.vue'
import InlineLink from '@/components/ui/InlineLink.vue'

const router = useRouter()
const authStore = useAuthStore()

// État du formulaire
const loginForm = ref({
  email: '',
  password: '',
  rememberMe: false,
})

// États de l'interface
const isLoading = ref(false)
const showPassword = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Validation du formulaire
const isFormValid = computed(() => {
  return loginForm.value.email && loginForm.value.password
})

// Basculer l'affichage du mot de passe
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

// Connexion avec le backend
const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    // Appel à l'API de connexion
    const response = await authService.login({
      identifier: loginForm.value.email,
      password: loginForm.value.password,
    })

    // Stocker les informations utilisateur et token via le store
    if (response.user && response.token) {
      authStore.login(response.user, response.token)
    }

    successMessage.value = 'Connexion réussie ! Redirection...'

    setTimeout(() => {
      if (response.user && response.user.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/')
      }
    }, 1000)
  } catch (error) {
    console.error('Erreur lors de la connexion:', error)

    // Gestion des erreurs spécifiques
    if (error.response?.data?.message) {
      errorMessage.value = error.response.data.message
    } else if (error.message) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'Email ou mot de passe incorrect. Veuillez réessayer.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-dark) 0%, var(--color-dark-secondary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  max-width: 500px;
  width: 100%;
  background: var(--color-dark);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.login-card {
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: var(--color-dark);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo-section {
  margin-bottom: 20px;
}

.login-logo {
  width: 80px;
  height: auto;
}

.login-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-light);
  margin-bottom: 8px;
}

.login-subtitle {
  color: var(--color-light-secondary);
  font-size: 1rem;
  line-height: 1.5;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

.form-input {
  padding: 15px 16px;
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: var(--color-dark-secondary);
  color: var(--color-light);
}

.form-input:focus {
  outline: none;
  border-color: var(--bs-primary);
  background: var(--color-dark-secondary);
  box-shadow: 0 0 0 3px rgba(var(--bs-primary-rgb), 0.18);
}

.form-input::placeholder {
  color: var(--color-gray);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.password-input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-group .form-input {
  flex: 1;
  padding-right: 45px;
}

.password-input-group :deep(.icon-btn) {
  position: absolute;
  right: 8px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--color-light-secondary);
}

.remember-me input[type='checkbox'] {
  accent-color: var(--color-primary);
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
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.signup-link {
  text-align: center;
  margin-top: 20px;
}

.signup-link p {
  color: var(--color-light-secondary);
  margin-bottom: 12px;
}

/* Responsive */
@media (max-width: 768px) {
  .login-page {
    padding: 10px;
  }

  .login-container {
    max-width: 450px;
  }

  .login-card {
    padding: 30px 20px;
  }

  .login-title {
    font-size: 1.5rem;
  }
}
</style>
