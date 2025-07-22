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
                <span v-if="showPassword">👁️</span>
                <span v-else>🙈</span>
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
            <router-link to="/forgot-password" class="forgot-password">
              Mot de passe oublié ?
            </router-link>
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

          <!-- Bouton de connexion -->
          <button type="submit" class="login-btn" :disabled="isLoading || !isFormValid">
            <span v-if="isLoading" class="loading-spinner">⏳</span>
            <span v-else>Se connecter</span>
          </button>
        </form>

        <!-- Lien vers inscription -->
        <div class="signup-link">
          <p>Vous n'avez pas encore de compte ?</p>
          <router-link to="/register" class="signup-btn"> Créer un compte </router-link>
        </div>
      </div>

      <!-- Section informative -->
      <div class="info-section">
        <div class="info-content">
          <h2 class="info-title">Rejoignez la communauté EcoRide</h2>
          <div class="benefits-list">
            <div class="benefit-item">
              <span class="benefit-icon">🌱</span>
              <div class="benefit-text">
                <h3>Impact environnemental</h3>
                <p>Réduisez votre empreinte carbone en partageant vos trajets</p>
              </div>
            </div>
            <div class="benefit-item">
              <span class="benefit-icon">💰</span>
              <div class="benefit-text">
                <h3>Économies garanties</h3>
                <p>Partagez les frais et économisez sur vos trajets quotidiens</p>
              </div>
            </div>
            <div class="benefit-item">
              <span class="benefit-icon">👥</span>
              <div class="benefit-text">
                <h3>Nouvelles rencontres</h3>
                <p>Rencontrez des personnes partageant vos valeurs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/counter'

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

// Simulation de connexion
const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    // Simulation d'un délai d'API
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Simulation de validation (vous connecterez cela à votre vraie API)
    if (loginForm.value.email === 'demo@ecoride.fr' && loginForm.value.password === 'demo123') {
      // Connexion réussie
      const mockUser = {
        id: 1,
        prenom: 'Demo',
        nom: 'User',
        email: loginForm.value.email,
        avatar: 'https://i.pravatar.cc/150?img=1',
      }

      authStore.login(mockUser)
      successMessage.value = 'Connexion réussie ! Redirection...'

      setTimeout(() => {
        router.push('/')
      }, 1000)
    } else {
      // Erreur de connexion
      errorMessage.value =
        'Email/pseudo ou mot de passe incorrect. Essayez demo@ecoride.fr / demo123'
    }
  } catch {
    errorMessage.value = 'Une erreur est survenue. Veuillez réessayer.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d3748 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  padding-top: 80px;
}

.login-container {
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

.login-card {
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #1a1a1a;
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
  color: #ffffff;
  margin-bottom: 8px;
}

.login-subtitle {
  color: #cccccc;
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
  color: #cccccc;
}

.remember-me input[type='checkbox'] {
  accent-color: #34d399;
}

.forgot-password {
  color: #34d399;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.3s ease;
}

.forgot-password:hover {
  color: #22c55e;
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

.login-btn {
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
}

.login-btn:hover:not(:disabled) {
  background: #22c55e;
  transform: translateY(-1px);
}

.login-btn:disabled {
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

.signup-link {
  text-align: center;
  margin-top: 20px;
}

.signup-link p {
  color: #cccccc;
  margin-bottom: 12px;
}

.signup-btn {
  color: #34d399;
  text-decoration: none;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.signup-btn:hover {
  background: #1a2e1a;
  color: #22c55e;
}

/* Section informative */
.info-section {
  background: linear-gradient(135deg, #34d399 0%, #22c55e 100%);
  color: white;
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-content {
  max-width: 400px;
}

.info-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 30px;
  text-align: center;
}

.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.benefit-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.benefit-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.benefit-text h3 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.benefit-text p {
  font-size: 0.95rem;
  opacity: 0.9;
  line-height: 1.5;
}

/* Responsive */
@media (max-width: 768px) {
  .login-page {
    padding: 10px;
    padding-top: 60px;
  }

  .login-container {
    grid-template-columns: 1fr;
    max-width: 500px;
  }

  .info-section {
    order: -1;
    padding: 30px 20px;
  }

  .info-title {
    font-size: 1.5rem;
  }

  .login-card {
    padding: 30px 20px;
  }

  .login-title {
    font-size: 1.5rem;
  }
}
</style>
