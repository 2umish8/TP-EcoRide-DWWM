<template>
  <div class="password-confirmation-validation" v-if="password || confirmPassword">
    <!-- Message de confirmation -->
    <div
      v-if="confirmPassword"
      :class="{
        'password-confirmation-success': confirmationResult.isValid,
        'password-confirmation-error': !confirmationResult.isValid,
      }"
    >
      <span v-if="confirmationResult.isValid">✅ Les mots de passe correspondent</span>
      <span v-else>❌ {{ confirmationResult.error }}</span>
    </div>
  </div>
</template>

<script>
import { validatePasswordConfirmation } from '../utils/passwordValidator.js'

export default {
  name: 'PasswordConfirmationValidator',
  props: {
    password: {
      type: String,
      default: '',
    },
    confirmPassword: {
      type: String,
      default: '',
    },
  },
  computed: {
    confirmationResult() {
      return validatePasswordConfirmation(this.password, this.confirmPassword)
    },
  },
  watch: {
    confirmationResult: {
      handler(newResult) {
        // Émettre l'état de validation au parent
        this.$emit('confirmation-change', {
          isValid: newResult.isValid,
          error: newResult.error,
        })
      },
      deep: true,
      immediate: true,
    },
  },
}
</script>

<style scoped>
.password-confirmation-success {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.password-confirmation-error {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}
</style>
