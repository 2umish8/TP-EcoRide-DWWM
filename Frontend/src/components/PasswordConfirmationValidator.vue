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
      <span v-if="confirmationResult.isValid"
        ><font-awesome-icon :icon="['fas', 'circle-check']" /> Les mots de passe correspondent</span
      >
      <span v-else
        ><font-awesome-icon :icon="['fas', 'xmark']" /> {{ confirmationResult.error }}</span
      >
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
