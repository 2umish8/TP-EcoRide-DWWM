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
} from '@/utils/passwordValidator.js'

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

<style scoped>
/* Styles inline pour éviter les problèmes d'import */
.password-validation {
  margin-top: 0.5rem;
}

.password-strength-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
  padding: 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.strength-excellent {
  background-color: rgba(67, 197, 97, 0.1);
  color: var(--color-success);
  border: 1px solid rgba(67, 197, 97, 0.3);
}

.strength-good {
  background-color: rgba(67, 197, 97, 0.1);
  color: var(--color-success);
  border: 1px solid rgba(67, 197, 97, 0.3);
}

.strength-medium {
  background-color: var(--color-light) beb;
  color: rgba(241, 213, 129, 0.8);
  border: 1px solid var(--color-warning);
}

.strength-weak {
  background-color: rgba(205, 101, 112, 0.1);
  color: var(--color-error);
  border: 1px solid rgba(205, 101, 112, 0.2);
}

.strength-very-weak {
  background-color: rgba(205, 101, 112, 0.1);
  color: var(--color-error);
  border: 1px solid rgba(205, 101, 112, 0.2);
}

.strength-invalid {
  background-color: var(--color-light);
  color: var(--color-gray);
  border: 1px solid var(--color-light-secondary);
}

.password-strength-bar {
  width: 100%;
  height: 0.25rem;
  background-color: var(--color-light-secondary);
  border-radius: 0.125rem;
  overflow: hidden;
  margin-top: 0.5rem;
}

.password-strength-progress {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 0.125rem;
}

.password-strength-progress.strength-excellent {
  background-color: var(--color-success);
}

.password-strength-progress.strength-good {
  background-color: var(--color-success);
}

.password-strength-progress.strength-medium {
  background-color: var(--color-warning);
}

.password-strength-progress.strength-weak {
  background-color: var(--color-error);
}

.password-strength-progress.strength-very-weak {
  background-color: var(--color-error);
}

.password-strength-progress.strength-invalid {
  background-color: var(--color-gray);
}

.password-error {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: rgba(205, 101, 112, 0.1);
  color: var(--color-error);
  border: 1px solid rgba(205, 101, 112, 0.2);
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.password-requirements {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background-color: var(--color-light);
  border: 1px solid var(--color-light-secondary);
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.password-requirements h4 {
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  color: var(--color-dark-tertiary);
}

.password-requirements ul {
  margin: 0;
  padding-left: 1.25rem;
  color: var(--color-gray);
}

.password-requirements li {
  margin-bottom: 0.25rem;
}

.password-suggestions {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: rgba(67, 197, 97, 0.05);
  color: var(--color-primary);
  border: 1px solid rgba(67, 197, 97, 0.15);
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.password-icon {
  font-size: 1rem;
  margin-right: 0.25rem;
}
</style>
