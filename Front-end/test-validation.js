/**
 * Test simple pour vérifier la validation de mot de passe côté front-end
 * EcoRide - Frontend Password Validation Test
 */

import { validatePassword, validatePasswordConfirmation } from './src/utils/passwordValidator.js'

// Test des fonctions de validation
console.log('🧪 Tests de validation des mots de passe - Frontend EcoRide\n')

// Tests de mots de passe
const testPasswords = [
  { password: '', expected: false, label: 'Mot de passe vide' },
  { password: '123', expected: false, label: 'Mot de passe trop court' },
  {
    password: 'password',
    expected: false,
    label: 'Pas de majuscule, chiffre ou caractère spécial',
  },
  { password: 'Password', expected: false, label: 'Pas de chiffre ou caractère spécial' },
  { password: 'Password1', expected: false, label: 'Pas de caractère spécial' },
  { password: 'Password1!', expected: true, label: 'Mot de passe valide' },
  { password: 'MySecureP@ssw0rd', expected: true, label: 'Mot de passe complexe valide' },
  { password: 'Test<script>alert("xss")</script>', expected: false, label: 'Caractères interdits' },
]

console.log('1️⃣ Tests de validation de mot de passe :\n')

testPasswords.forEach((test, index) => {
  const result = validatePassword(test.password)
  const success = result.isValid === test.expected

  console.log(`Test ${index + 1}: ${test.label}`)
  console.log(`   Mot de passe: "${test.password}"`)
  console.log(`   Attendu: ${test.expected ? 'Valide' : 'Invalide'}`)
  console.log(`   Résultat: ${result.isValid ? 'Valide' : 'Invalide'}`)
  console.log(`   Force: ${result.strength}`)

  if (!result.isValid && result.errors.length > 0) {
    console.log(`   Erreurs: ${result.errors.join(', ')}`)
  }

  console.log(`   ✅ ${success ? 'RÉUSSI' : '❌ ÉCHEC'}\n`)
})

// Tests de confirmation de mot de passe
console.log('2️⃣ Tests de confirmation de mot de passe :\n')

const confirmationTests = [
  {
    password: 'Password1!',
    confirm: 'Password1!',
    expected: true,
    label: 'Mots de passe identiques',
  },
  {
    password: 'Password1!',
    confirm: 'Password1@',
    expected: false,
    label: 'Mots de passe différents',
  },
  { password: '', confirm: '', expected: false, label: 'Mots de passe vides' },
  { password: 'Password1!', confirm: '', expected: false, label: 'Confirmation vide' },
]

confirmationTests.forEach((test, index) => {
  const result = validatePasswordConfirmation(test.password, test.confirm)
  const success = result.isValid === test.expected

  console.log(`Test ${index + 1}: ${test.label}`)
  console.log(`   Mot de passe: "${test.password}"`)
  console.log(`   Confirmation: "${test.confirm}"`)
  console.log(`   Attendu: ${test.expected ? 'Valide' : 'Invalide'}`)
  console.log(`   Résultat: ${result.isValid ? 'Valide' : 'Invalide'}`)

  if (!result.isValid && result.error) {
    console.log(`   Erreur: ${result.error}`)
  }

  console.log(`   ✅ ${success ? 'RÉUSSI' : '❌ ÉCHEC'}\n`)
})

// Résumé
const totalTests = testPasswords.length + confirmationTests.length
const passedTests =
  testPasswords.filter((test) => {
    const result = validatePassword(test.password)
    return result.isValid === test.expected
  }).length +
  confirmationTests.filter((test) => {
    const result = validatePasswordConfirmation(test.password, test.confirm)
    return result.isValid === test.expected
  }).length

console.log('📊 RÉSUMÉ DES TESTS')
console.log(`Tests réussis: ${passedTests}/${totalTests}`)
console.log(`Taux de réussite: ${Math.round((passedTests / totalTests) * 100)}%`)

if (passedTests === totalTests) {
  console.log('🎉 Tous les tests sont réussis ! La validation fonctionne correctement.')
} else {
  console.log('⚠️ Certains tests ont échoué. Vérifiez la logique de validation.')
}
