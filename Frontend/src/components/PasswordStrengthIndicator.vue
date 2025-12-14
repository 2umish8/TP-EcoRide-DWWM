<template>
  <div class="password-validation" v-if="password || showRequirements">
    <!-- Indicateur de force du mot de passe -->
    <div
      v-if="password"
      class="password-strength-indicator"
      :class="getPasswordStrengthColor(validation.strength)"
    >
      <span class="password-icon">{{ getPasswordStrengthIcon(validation.strength) }}</span>
      <span>Force du mot de passe : {{ validation.strength }}</span>
    </div>

    <!-- Barre de progression -->
    <div v-if="password" class="password-strength-bar">
      <div
        class="password-strength-progress"
        :class="getPasswordStrengthColor(validation.strength)"
        :style="{ width: validation.percentage + '%' }"
      ></div>
    </div>

    <!-- Messages d'erreur -->
    <div v-if="password && !validation.isValid" class="password-error">
      {{ getPasswordErrorMessage(validation) }}
    </div>

    <!-- Suggestions d'amélioration -->
    <div
      v-if="password && !validation.isValid && validation.suggestions.length > 0"
      class="password-suggestions"
    >
      <strong>Suggestions :</strong>
      {{ validation.suggestions.join(', ') }}
    </div>

    <!-- Critères requis -->
    <div v-if="showRequirements" class="password-requirements">
      <h4>Critères requis :</h4>
      <ul>
        <li>Au moins 8 caractères</li>
        <li>Une lettre minuscule (a-z)</li>
        <li>Une lettre majuscule (A-Z)</li>
        <li>Au moins 1 chiffre (0-9)</li>
        <li>Au moins 1 caractère spécial (!@#$%^&*...)</li>
        <li>Aucun caractère interdit (&lt;&gt;'"&amp;;)</li>
      </ul>
    </div>
  </div>
</template>

<script>
import {
  validatePassword,
  getPasswordErrorMessage,
  getPasswordStrengthColor,
  getPasswordStrengthIcon,
} from '../utils/passwordValidator.js'

export default {
  name: 'PasswordStrengthIndicator',
  props: {
    password: {
      type: String,
      default: '',
    },
    showRequirements: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    validation() {
      if (!this.password) {
        return {
          isValid: false,
          strength: 'invalid',
          percentage: 0,
          errors: [],
          suggestions: [],
        }
      }
      return validatePassword(this.password)
    },
  },
  methods: {
    getPasswordErrorMessage,
    getPasswordStrengthColor,
    getPasswordStrengthIcon,
  },
  watch: {
    validation: {
      handler(newValidation) {
        // Émettre l'état de validation au parent
        this.$emit('validation-change', {
          isValid: newValidation.isValid,
          strength: newValidation.strength,
          percentage: newValidation.percentage,
        })
      },
      deep: true,
      immediate: true,
    },
  },
}
</script>

