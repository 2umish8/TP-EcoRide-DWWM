<template>
  <div class="forgot-password-page">
    <div class="forgot-password-container">
      <div class="forgot-password-card">
        <!-- Logo et titre -->
        <div class="forgot-password-header">
          <div class="logo-section">
            <img src="@/assets/Logo ecoride transparent.PNG" alt="EcoRide" class="logo" />
          </div>
          <h1 class="title">Mot de passe oublié ?</h1>
          <p class="subtitle">
            Pas de problème ! Entrez votre adresse e-mail et nous vous enverrons un lien pour
            réinitialiser votre mot de passe.
          </p>
        </div>

        <!-- Formulaire -->
        <form @submit.prevent="handleReset" class="reset-form">
          <div class="form-group">
            <label for="email" class="form-label">Adresse e-mail</label>
            <input
              type="email"
              id="email"
              v-model="email"
              class="form-input"
              placeholder="votre@email.com"
              required
              :disabled="isLoading"
            />
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

          <!-- Bouton -->
          <button type="submit" class="reset-btn" :disabled="isLoading || !email">
            <span v-if="isLoading" class="loading-spinner">⏳</span>
            <span v-else>Envoyer le lien</span>
          </button>
        </form>

        <!-- Retour à la connexion -->
        <div class="back-to-login">
          <router-link to="/login" class="back-link"> ← Retour à la connexion </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleReset = async () => {
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    // Simulation d'envoi d'email
    await new Promise((resolve) => setTimeout(resolve, 1500))

    successMessage.value = 'Un lien de réinitialisation a été envoyé à votre adresse e-mail.'
  } catch {
    errorMessage.value = 'Une erreur est survenue. Veuillez réessayer.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.forgot-password-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d3748 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  padding-top: 80px;
}

.forgot-password-container {
  max-width: 500px;
  width: 100%;
}

.forgot-password-card {
  background: #1a1a1a;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border: 1px solid #333;
}

.forgot-password-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  width: 80px;
  height: auto;
  margin-bottom: 20px;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 16px;
}

.subtitle {
  color: #cccccc;
  font-size: 1rem;
  line-height: 1.5;
}

.reset-form {
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

.reset-btn {
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

.reset-btn:hover:not(:disabled) {
  background: #22c55e;
  transform: translateY(-1px);
}

.reset-btn:disabled {
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

.back-to-login {
  text-align: center;
  margin-top: 24px;
}

.back-link {
  color: #34d399;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.back-link:hover {
  color: #22c55e;
}

/* Responsive */
@media (max-width: 768px) {
  .forgot-password-page {
    padding: 10px;
    padding-top: 60px;
  }

  .forgot-password-card {
    padding: 30px 20px;
  }

  .title {
    font-size: 1.5rem;
  }
}
</style>
