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
              <button
                type="button"
                @click="togglePassword"
                class="password-toggle"
                :disabled="isLoading"
              >
                <font-awesome-icon v-if="showPassword" :icon="['fas', 'eye']" />
                <font-awesome-icon v-else :icon="['fas', 'eye-slash']" />
              </button>
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
          <button type="submit" class="login-btn" :disabled="isLoading || !isFormValid">
            <font-awesome-icon
              v-if="isLoading"
              :icon="['fas', 'spinner']"
              spin
              class="loading-spinner"
            />
            <span v-else>Se connecter</span>
          </button>
        </form>

        <!-- Lien vers inscription -->
        <div class="signup-link">
          <p>Vous n'avez pas encore de compte ?</p>
          <router-link to="/register" class="signup-btn"> Créer un compte </router-link>
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

