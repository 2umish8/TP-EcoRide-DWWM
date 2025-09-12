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
  background-color: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.strength-good {
  background-color: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.strength-medium {
  background-color: #fffbeb;
  color: #92400e;
  border: 1px solid #fde68a;
}

.strength-weak {
  background-color: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.strength-very-weak {
  background-color: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.strength-invalid {
  background-color: #f3f4f6;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.password-strength-bar {
  width: 100%;
  height: 0.25rem;
  background-color: #e5e7eb;
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
  background-color: #22c55e;
}

.password-strength-progress.strength-good {
  background-color: #22c55e;
}

.password-strength-progress.strength-medium {
  background-color: #f59e0b;
}

.password-strength-progress.strength-weak {
  background-color: #ef4444;
}

.password-strength-progress.strength-very-weak {
  background-color: #dc2626;
}

.password-strength-progress.strength-invalid {
  background-color: #9ca3af;
}

.password-error {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.password-requirements {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.password-requirements h4 {
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  color: #374151;
}

.password-requirements ul {
  margin: 0;
  padding-left: 1.25rem;
  color: #6b7280;
}

.password-requirements li {
  margin-bottom: 0.25rem;
}

.password-suggestions {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: #eff6ff;
  color: #1e40af;
  border: 1px solid #bfdbfe;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.password-icon {
  font-size: 1rem;
  margin-right: 0.25rem;
}
</style>
