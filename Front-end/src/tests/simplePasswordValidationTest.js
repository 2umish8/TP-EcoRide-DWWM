/**
 * Test simple de la validation de mot de passe côté front-end
 * EcoRide - Validation des utilitaires
 */

// Test des utilitaires de validation uniquement
import {
  analyzePasswordStrength,
  validatePassword,
  validatePasswordConfirmation,
  getPasswordErrorMessage,
  getPasswordStrengthColor,
} from '../utils/passwordValidator.js'

console.log('🧪 Tests de validation de mot de passe EcoRide\n')

// Test 1: Analyse de force basique
console.log('Test 1: Analyse de force de mot de passe')

const testPasswords = [
  { password: '', expected: 'invalid' },
  { password: 'weak', expected: 'très faible' },
  { password: 'Password', expected: 'faible' },
  { password: 'Password123', expected: 'moyen' },
  { password: 'Password123!', expected: 'excellent' },
  { password: 'MonSuperMotDePasse2024!', expected: 'excellent' },
]

testPasswords.forEach((test, index) => {
  const result = analyzePasswordStrength(test.password)
  const isCorrect = result.strength === test.expected
  console.log(`  ${index + 1}. "${test.password}" → ${result.strength} ${isCorrect ? '✅' : '❌'}`)
  if (!isCorrect) {
    console.log(`     Attendu: ${test.expected}, Obtenu: ${result.strength}`)
  }
})

console.log('\nTest 2: Validation complète')

// Test 2: Validation complète
const validationTests = [
  { password: 'MonMotDePasse123!', expectedValid: true },
  { password: 'faible', expectedValid: false },
  { password: 'TROPLONG'.repeat(20), expectedValid: false },
  { password: 'Password123', expectedValid: false }, // Manque caractère spécial
  { password: 'password123!', expectedValid: false }, // Manque majuscule
  { password: 'PASSWORD123!', expectedValid: false }, // Manque minuscule
  { password: 'Password!', expectedValid: false }, // Manque chiffre
]

validationTests.forEach((test, index) => {
  const result = validatePassword(test.password)
  const isCorrect = result.isValid === test.expectedValid
  console.log(
    `  ${index + 1}. "${test.password}" → ${result.isValid ? 'Valide' : 'Invalide'} ${isCorrect ? '✅' : '❌'}`,
  )
  if (!isCorrect) {
    console.log(`     Attendu: ${test.expectedValid ? 'Valide' : 'Invalide'}`)
    console.log(`     Erreurs: ${result.errors.join(', ')}`)
  }
})

console.log('\nTest 3: Confirmation de mot de passe')

// Test 3: Confirmation de mot de passe
const confirmationTests = [
  { password: 'Test123!', confirm: 'Test123!', expectedValid: true },
  { password: 'Test123!', confirm: 'Different123!', expectedValid: false },
  { password: '', confirm: '', expectedValid: false },
  { password: 'Test123!', confirm: '', expectedValid: false },
]

confirmationTests.forEach((test, index) => {
  const result = validatePasswordConfirmation(test.password, test.confirm)
  const isCorrect = result.isValid === test.expectedValid
  console.log(
    `  ${index + 1}. "${test.password}" vs "${test.confirm}" → ${result.isValid ? 'Match' : 'Pas de match'} ${isCorrect ? '✅' : '❌'}`,
  )
  if (!isCorrect) {
    console.log(`     Attendu: ${test.expectedValid ? 'Match' : 'Pas de match'}`)
    console.log(`     Erreur: ${result.error || 'Aucune'}`)
  }
})

console.log("\nTest 4: Messages d'erreur")

// Test 4: Messages d'erreur
const errorTests = [
  'faible',
  'Password',
  'password123',
  'PASSWORD123',
  'Password!',
  'MonMotDePasse123!',
]

errorTests.forEach((password, index) => {
  const validation = validatePassword(password)
  const errorMessage = getPasswordErrorMessage(validation)
  console.log(
    `  ${index + 1}. "${password}" → ${errorMessage || 'Aucune erreur'} ${validation.isValid ? '✅' : '❌'}`,
  )
})

console.log('\nTest 5: Classes CSS selon la force')

// Test 5: Classes CSS
const strengthTests = ['invalid', 'très faible', 'faible', 'moyen', 'fort', 'excellent']

strengthTests.forEach((strength, index) => {
  const className = getPasswordStrengthColor(strength)
  console.log(`  ${index + 1}. ${strength} → ${className}`)
})

console.log('\n🎉 Tests terminés !')

// Export pour pouvoir l'utiliser comme module si nécessaire
export { testPasswords, validationTests, confirmationTests, errorTests, strengthTests }
