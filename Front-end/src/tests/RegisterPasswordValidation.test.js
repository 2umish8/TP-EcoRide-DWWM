/**
 * Test d'intégration de la validation de mot de passe côté front-end
 * EcoRide - Test de l'inscription avec validation
 */

import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import RegisterView from '@/views/RegisterView.vue'
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator.vue'
import PasswordConfirmationValidator from '@/components/PasswordConfirmationValidator.vue'

// Mock du router
const mockRouter = {
  push: vi.fn(),
}

// Mock du store
const mockAuthStore = {
  login: vi.fn(),
}

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
}))

vi.mock('@/stores/counter', () => ({
  useAuthStore: () => mockAuthStore,
}))

describe('RegisterView - Validation des mots de passe', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(RegisterView, {
      global: {
        components: {
          PasswordStrengthIndicator,
          PasswordConfirmationValidator,
        },
      },
    })
  })

  it('affiche les critères de mot de passe quand le champ est vide', async () => {
    const passwordField = wrapper.find('#password')
    expect(passwordField.exists()).toBe(true)

    // Vérifier que les critères sont affichés
    const indicator = wrapper.findComponent(PasswordStrengthIndicator)
    expect(indicator.exists()).toBe(true)
    expect(indicator.props('showRequirements')).toBe(true)
  })

  it('valide un mot de passe faible', async () => {
    const passwordField = wrapper.find('#password')
    await passwordField.setValue('weak')

    const indicator = wrapper.findComponent(PasswordStrengthIndicator)
    expect(indicator.props('password')).toBe('weak')

    // Attendre que la validation se propage
    await wrapper.vm.$nextTick()

    // Le mot de passe faible ne devrait pas être valide
    expect(wrapper.vm.passwordValidation.isValid).toBe(false)
  })

  it('valide un mot de passe fort', async () => {
    const passwordField = wrapper.find('#password')
    const strongPassword = 'MonMotDePasse123!'
    await passwordField.setValue(strongPassword)

    const indicator = wrapper.findComponent(PasswordStrengthIndicator)
    expect(indicator.props('password')).toBe(strongPassword)

    // Simuler l'événement de validation
    await indicator.vm.$emit('validation-change', {
      isValid: true,
      strength: 'excellent',
      percentage: 100,
    })

    await wrapper.vm.$nextTick()

    // Le mot de passe fort devrait être valide
    expect(wrapper.vm.passwordValidation.isValid).toBe(true)
    expect(wrapper.vm.passwordValidation.strength).toBe('excellent')
  })

  it('valide la confirmation de mot de passe', async () => {
    const password = 'MonMotDePasse123!'

    // Saisir le mot de passe
    const passwordField = wrapper.find('#password')
    await passwordField.setValue(password)

    // Saisir la confirmation
    const confirmField = wrapper.find('#confirmPassword')
    await confirmField.setValue(password)

    const confirmValidator = wrapper.findComponent(PasswordConfirmationValidator)
    expect(confirmValidator.props('password')).toBe(password)
    expect(confirmValidator.props('confirmPassword')).toBe(password)

    // Simuler l'événement de validation de confirmation
    await confirmValidator.vm.$emit('confirmation-change', {
      isValid: true,
      error: null,
    })

    await wrapper.vm.$nextTick()

    // La confirmation devrait être valide
    expect(wrapper.vm.passwordConfirmationValidation.isValid).toBe(true)
  })

  it('détecte une confirmation de mot de passe incorrecte', async () => {
    const password = 'MonMotDePasse123!'
    const wrongConfirm = 'AutreMotDePasse123!'

    // Saisir le mot de passe
    const passwordField = wrapper.find('#password')
    await passwordField.setValue(password)

    // Saisir une confirmation incorrecte
    const confirmField = wrapper.find('#confirmPassword')
    await confirmField.setValue(wrongConfirm)

    const confirmValidator = wrapper.findComponent(PasswordConfirmationValidator)

    // Simuler l'événement de validation de confirmation
    await confirmValidator.vm.$emit('confirmation-change', {
      isValid: false,
      error: 'Les mots de passe ne correspondent pas',
    })

    await wrapper.vm.$nextTick()

    // La confirmation ne devrait pas être valide
    expect(wrapper.vm.passwordConfirmationValidation.isValid).toBe(false)
    expect(wrapper.vm.passwordConfirmationValidation.error).toBe(
      'Les mots de passe ne correspondent pas',
    )
  })

  it('applique les bonnes classes CSS selon la force du mot de passe', async () => {
    const passwordField = wrapper.find('#password')

    // Mot de passe faible
    await passwordField.setValue('weak')
    await passwordField.trigger('input')

    // Simuler une validation faible
    wrapper.vm.passwordValidation.isValid = false
    await wrapper.vm.$nextTick()

    expect(passwordField.classes()).toContain('password-invalid')

    // Mot de passe fort
    const strongPassword = 'MonMotDePasse123!'
    await passwordField.setValue(strongPassword)

    // Simuler une validation forte
    wrapper.vm.passwordValidation.isValid = true
    await wrapper.vm.$nextTick()

    expect(passwordField.classes()).toContain('password-valid')
  })

  it('désactive le bouton de soumission si les mots de passe ne sont pas valides', async () => {
    // Remplir tous les champs sauf les mots de passe
    await wrapper.find('#prenom').setValue('John')
    await wrapper.find('#nom').setValue('Doe')
    await wrapper.find('#email').setValue('john.doe@example.com')
    await wrapper.find('#pseudo').setValue('johndoe')
    await wrapper.find('#telephone').setValue('0612345678')
    await wrapper.find('#dateNaissance').setValue('1990-01-01')
    await wrapper.find('#acceptTerms').setChecked(true)

    // Mots de passe invalides
    wrapper.vm.passwordValidation.isValid = false
    wrapper.vm.passwordConfirmationValidation.isValid = false
    await wrapper.vm.$nextTick()

    // Le formulaire ne devrait pas être valide
    expect(wrapper.vm.isFormValid).toBe(false)

    // Mots de passe valides
    wrapper.vm.passwordValidation.isValid = true
    wrapper.vm.passwordConfirmationValidation.isValid = true
    wrapper.vm.isEmailValid = true
    await wrapper.vm.$nextTick()

    // Le formulaire devrait maintenant être valide
    expect(wrapper.vm.isFormValid).toBe(true)
  })
})

describe('PasswordStrengthIndicator', () => {
  it('affiche le bon indicateur pour différents niveaux de force', async () => {
    const wrapper = mount(PasswordStrengthIndicator, {
      props: {
        password: 'MonMotDePasse123!',
        showRequirements: false,
      },
    })

    expect(wrapper.find('.password-strength-indicator').exists()).toBe(true)
    expect(wrapper.find('.password-strength-bar').exists()).toBe(true)
  })

  it('émet les événements de validation correctement', async () => {
    const wrapper = mount(PasswordStrengthIndicator, {
      props: {
        password: 'TestPassword123!',
        showRequirements: false,
      },
    })

    // Vérifier que l'événement a été émis
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('validation-change')).toBeTruthy()
  })
})

describe('PasswordConfirmationValidator', () => {
  it('valide correctement la correspondance des mots de passe', async () => {
    const wrapper = mount(PasswordConfirmationValidator, {
      props: {
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!',
      },
    })

    expect(wrapper.find('.password-confirmation-success').exists()).toBe(true)
    expect(wrapper.emitted('confirmation-change')).toBeTruthy()
  })

  it('détecte les mots de passe non correspondants', async () => {
    const wrapper = mount(PasswordConfirmationValidator, {
      props: {
        password: 'TestPassword123!',
        confirmPassword: 'DifferentPassword123!',
      },
    })

    expect(wrapper.find('.password-confirmation-error').exists()).toBe(true)
  })
})
