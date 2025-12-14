import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import BecomeDriverView from './BecomeDriverView.vue'

// Mock the services
vi.mock('@/services/api', () => ({
  vehicleService: {
    addVehicle: vi.fn(),
  },
}))

vi.mock('@/services/mongoServices', () => ({
  preferencesService: {
    createPreferences: vi.fn(),
  },
}))

// Mock localStorage
const localStorageMock = (() => {
  let store = {}

  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString()
    },
    removeItem: (key) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock router-link
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useRoute: () => ({}),
}))

describe('BecomeDriverView.vue', () => {
  let wrapper

  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('authToken', 'test-token')
    vi.clearAllMocks()
    wrapper = mount(BecomeDriverView, {
      global: {
        stubs: {
          'router-link': { template: '<a><slot /></a>' },
          'font-awesome-icon': true,
        },
      },
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Initialization', () => {
    it('renders the component', () => {
      expect(wrapper.exists()).toBe(true)
    })

    it('displays page header with title', () => {
      const header = wrapper.find('.page-header')
      expect(header.exists()).toBe(true)
    })

    it('initializes with step 1', () => {
      expect(wrapper.vm.currentStep).toBe(1)
    })

    it('has three steps in the process', () => {
      expect(wrapper.vm.steps).toEqual(['Véhicule', 'Préférences', 'Confirmation'])
    })
  })

  describe('Step 1: Vehicle Information', () => {
    it('renders vehicle form on step 1', () => {
      const vehicleForm = wrapper.find('.step-content')
      expect(vehicleForm.exists()).toBe(true)
    })

    it('initializes vehicle data with empty values', () => {
      expect(wrapper.vm.vehicleData.plate_number).toBe('')
      expect(wrapper.vm.vehicleData.first_registration_date).toBe('')
      expect(wrapper.vm.vehicleData.model).toBe('')
      expect(wrapper.vm.vehicleData.brand_name).toBe('')
      expect(wrapper.vm.vehicleData.color_name).toBe('')
      expect(wrapper.vm.vehicleData.seats_available).toBe('')
      expect(wrapper.vm.vehicleData.is_electric).toBe(false)
    })

    it('contains car brands list', () => {
      expect(wrapper.vm.carBrands.length).toBeGreaterThan(0)
      expect(wrapper.vm.carBrands).toContain('Renault')
      expect(wrapper.vm.carBrands).toContain('Peugeot')
      expect(wrapper.vm.carBrands).toContain('Autre')
    })

    it('contains car colors list', () => {
      expect(wrapper.vm.carColors.length).toBeGreaterThan(0)
      expect(wrapper.vm.carColors).toContain('Blanc')
      expect(wrapper.vm.carColors).toContain('Noir')
      expect(wrapper.vm.carColors).toContain('Bleu')
    })

    it('validates required fields in vehicle step', () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

      wrapper.vm.validateVehicleStep()

      expect(alertSpy).toHaveBeenCalledWith('Veuillez remplir tous les champs obligatoires')
      expect(wrapper.vm.currentStep).toBe(1)

      alertSpy.mockRestore()
    })

    it('moves to step 2 when vehicle data is valid', () => {
      wrapper.vm.vehicleData.plate_number = 'AB-123-CD'
      wrapper.vm.vehicleData.first_registration_date = '2020-01-01'
      wrapper.vm.vehicleData.model = 'Clio'
      wrapper.vm.vehicleData.brand_name = 'Renault'
      wrapper.vm.vehicleData.color_name = 'Blanc'
      wrapper.vm.vehicleData.seats_available = 4

      wrapper.vm.validateVehicleStep()

      expect(wrapper.vm.currentStep).toBe(2)
    })

    it('updates vehicle data when form inputs change', async () => {
      wrapper.vm.vehicleData.brand_name = 'BMW'
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.vehicleData.brand_name).toBe('BMW')
    })

    it('handles electric vehicle checkbox', async () => {
      expect(wrapper.vm.vehicleData.is_electric).toBe(false)

      wrapper.vm.vehicleData.is_electric = true
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.vehicleData.is_electric).toBe(true)
    })

    it('today computed property returns current date in YYYY-MM-DD format', () => {
      const today = wrapper.vm.today
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      expect(today).toMatch(dateRegex)
    })
  })

  describe('Step 2: Driver Preferences', () => {
    beforeEach(async () => {
      // Move to step 2
      wrapper.vm.vehicleData.plate_number = 'AB-123-CD'
      wrapper.vm.vehicleData.first_registration_date = '2020-01-01'
      wrapper.vm.vehicleData.model = 'Clio'
      wrapper.vm.vehicleData.brand_name = 'Renault'
      wrapper.vm.vehicleData.color_name = 'Blanc'
      wrapper.vm.vehicleData.seats_available = 4
      wrapper.vm.validateVehicleStep()
      await wrapper.vm.$nextTick()
    })

    it('renders preferences form on step 2', () => {
      expect(wrapper.vm.currentStep).toBe(2)
    })

    it('initializes preferences with default values', () => {
      expect(wrapper.vm.preferencesData.musicPreference).toBe('Aucune musique')
      expect(wrapper.vm.preferencesData.conversationLevel).toBe('Modérée')
      expect(wrapper.vm.preferencesData.temperaturePreference).toBe(20)
      expect(wrapper.vm.preferencesData.smokingAllowed).toBe(false)
      expect(wrapper.vm.preferencesData.petsAllowed).toBe(false)
      expect(wrapper.vm.preferencesData.customPreferences).toBe('')
    })

    it('moves to step 3 when preferences validated', () => {
      wrapper.vm.validatePreferencesStep()

      expect(wrapper.vm.currentStep).toBe(3)
    })

    it('allows updating music preference', async () => {
      wrapper.vm.preferencesData.musicPreference = 'Musique douce'
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.preferencesData.musicPreference).toBe('Musique douce')
    })

    it('allows updating conversation level', async () => {
      wrapper.vm.preferencesData.conversationLevel = 'Bavard'
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.preferencesData.conversationLevel).toBe('Bavard')
    })

    it('allows updating temperature preference', async () => {
      wrapper.vm.preferencesData.temperaturePreference = 22
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.preferencesData.temperaturePreference).toBe(22)
    })

    it('temperature preference should be between 16 and 26', () => {
      wrapper.vm.preferencesData.temperaturePreference = 18
      expect(wrapper.vm.preferencesData.temperaturePreference).toBeGreaterThanOrEqual(16)
      expect(wrapper.vm.preferencesData.temperaturePreference).toBeLessThanOrEqual(26)
    })

    it('allows toggling smoking preference', async () => {
      wrapper.vm.preferencesData.smokingAllowed = true
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.preferencesData.smokingAllowed).toBe(true)
    })

    it('allows toggling pets preference', async () => {
      wrapper.vm.preferencesData.petsAllowed = true
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.preferencesData.petsAllowed).toBe(true)
    })

    it('allows updating custom preferences', async () => {
      wrapper.vm.preferencesData.customPreferences = 'I accept musical instruments'
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.preferencesData.customPreferences).toBe('I accept musical instruments')
    })

    it('can return to step 1 from step 2', () => {
      wrapper.vm.currentStep = 2
      wrapper.vm.currentStep = 1

      expect(wrapper.vm.currentStep).toBe(1)
    })
  })

  describe('Step 3: Confirmation', () => {
    beforeEach(async () => {
      // Populate and move through all steps
      wrapper.vm.vehicleData.plate_number = 'AB-123-CD'
      wrapper.vm.vehicleData.first_registration_date = '2020-01-01'
      wrapper.vm.vehicleData.model = 'Clio'
      wrapper.vm.vehicleData.brand_name = 'Renault'
      wrapper.vm.vehicleData.color_name = 'Blanc'
      wrapper.vm.vehicleData.seats_available = 4
      wrapper.vm.vehicleData.is_electric = true

      wrapper.vm.preferencesData.musicPreference = 'Musique douce'
      wrapper.vm.preferencesData.conversationLevel = 'Bavard'
      wrapper.vm.preferencesData.temperaturePreference = 22

      wrapper.vm.currentStep = 3
      await wrapper.vm.$nextTick()
    })

    it('renders confirmation step', () => {
      expect(wrapper.vm.currentStep).toBe(3)
    })

    it('displays vehicle summary data', () => {
      expect(wrapper.vm.vehicleData.plate_number).toBe('AB-123-CD')
      expect(wrapper.vm.vehicleData.brand_name).toBe('Renault')
      expect(wrapper.vm.vehicleData.model).toBe('Clio')
      expect(wrapper.vm.vehicleData.color_name).toBe('Blanc')
      expect(wrapper.vm.vehicleData.seats_available).toBe(4)
      expect(wrapper.vm.vehicleData.is_electric).toBe(true)
    })

    it('displays preferences summary data', () => {
      expect(wrapper.vm.preferencesData.musicPreference).toBe('Musique douce')
      expect(wrapper.vm.preferencesData.conversationLevel).toBe('Bavard')
      expect(wrapper.vm.preferencesData.temperaturePreference).toBe(22)
    })
  })

  describe('Step Indicator', () => {
    it('shows current step in steps indicator', () => {
      expect(wrapper.vm.currentStep).toBe(1)
    })

    it('updates step indicator when step changes', async () => {
      wrapper.vm.currentStep = 2
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.currentStep).toBe(2)
    })

    it('marks completed steps', () => {
      wrapper.vm.currentStep = 3
      // Step 1 and 2 should be considered completed
      expect(wrapper.vm.currentStep).toBe(3)
    })
  })

  describe('Final Submission & Driver Registration', () => {
    beforeEach(async () => {
      // Setup complete form data for all steps
      wrapper.vm.vehicleData.plate_number = 'AB-123-CD'
      wrapper.vm.vehicleData.first_registration_date = '2020-01-01'
      wrapper.vm.vehicleData.model = 'Clio'
      wrapper.vm.vehicleData.brand_name = 'Renault'
      wrapper.vm.vehicleData.color_name = 'Blanc'
      wrapper.vm.vehicleData.seats_available = 4
      wrapper.vm.vehicleData.is_electric = false

      wrapper.vm.preferencesData.musicPreference = 'Aucune musique'
      wrapper.vm.preferencesData.conversationLevel = 'Modérée'
      wrapper.vm.preferencesData.temperaturePreference = 20

      wrapper.vm.currentStep = 3
      await wrapper.vm.$nextTick()
    })

    it('requires engagement acceptance before submission', () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

      expect(wrapper.vm.acceptEngagement).toBe(false)
      wrapper.vm.submitDriverApplication()

      expect(alertSpy).toHaveBeenCalledWith(
        'Vous devez accepter les engagements pour devenir chauffeur',
      )

      alertSpy.mockRestore()
    })

    it('blocks submission if engagement not accepted', () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

      expect(wrapper.vm.acceptEngagement).toBe(false)
      wrapper.vm.submitDriverApplication()
      expect(alertSpy).toHaveBeenCalled()

      alertSpy.mockRestore()
    })

    it('allows submission when engagement is accepted', async () => {
      wrapper.vm.acceptEngagement = true
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.acceptEngagement).toBe(true)
    })

    it('sends POST request to /api/users/become-driver with correct headers', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      })

      wrapper.vm.acceptEngagement = true
      await wrapper.vm.submitDriverApplication()

      expect(fetchSpy).toHaveBeenCalledWith('/api/users/become-driver', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        },
      })

      fetchSpy.mockRestore()
    })

    it('successfully registers as driver and moves to step 4', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      })

      wrapper.vm.acceptEngagement = true
      await wrapper.vm.submitDriverApplication()
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.currentStep).toBe(4)
    })

    it('updates localStorage with chauffeur role on successful registration', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      })

      const userObj = { id: 1, name: 'Test User', roles: ['passager'] }
      localStorage.setItem('user', JSON.stringify(userObj))

      wrapper.vm.acceptEngagement = true
      await wrapper.vm.submitDriverApplication()
      await wrapper.vm.$nextTick()

      const updatedUser = JSON.parse(localStorage.getItem('user'))
      expect(updatedUser.roles).toContain('chauffeur')
    })

    it('handles missing user in localStorage gracefully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      })

      localStorage.removeItem('user')

      wrapper.vm.acceptEngagement = true
      await wrapper.vm.submitDriverApplication()
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.currentStep).toBe(4)
    })

    it('handles become-driver API error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
      })
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

      wrapper.vm.acceptEngagement = true
      await wrapper.vm.submitDriverApplication()
      await wrapper.vm.$nextTick()

      expect(alertSpy).toHaveBeenCalledWith("Erreur lors de l'inscription. Veuillez réessayer.")

      alertSpy.mockRestore()
    })

    it('sets isSubmitting to true during submission and resets after', async () => {
      global.fetch = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ ok: true, json: async () => ({ success: true }) }), 50)
          }),
      )

      wrapper.vm.acceptEngagement = true

      const submissionPromise = wrapper.vm.submitDriverApplication()
      expect(wrapper.vm.isSubmitting).toBe(true)

      await submissionPromise
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.isSubmitting).toBe(false)
    })

    it('does not add duplicate chauffeur role to localStorage', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      })

      const userObj = { id: 1, name: 'Test User', roles: ['passager', 'chauffeur'] }
      localStorage.setItem('user', JSON.stringify(userObj))

      wrapper.vm.acceptEngagement = true
      await wrapper.vm.submitDriverApplication()
      await wrapper.vm.$nextTick()

      const updatedUser = JSON.parse(localStorage.getItem('user'))
      const chauffeurCount = updatedUser.roles.filter((r) => r === 'chauffeur').length
      expect(chauffeurCount).toBe(1)
    })

    it('complete end-to-end workflow: vehicle > preferences > confirmation > registration', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      })

      localStorage.setItem('user', JSON.stringify({ id: 1, roles: [] }))

      // Step 1: Vehicle Information
      wrapper.vm.currentStep = 1
      wrapper.vm.vehicleData.plate_number = 'XY-789-AB'
      wrapper.vm.vehicleData.first_registration_date = '2019-03-15'
      wrapper.vm.vehicleData.model = 'Golf'
      wrapper.vm.vehicleData.brand_name = 'Volkswagen'
      wrapper.vm.vehicleData.color_name = 'Noir'
      wrapper.vm.vehicleData.seats_available = 5
      wrapper.vm.vehicleData.is_electric = true

      wrapper.vm.validateVehicleStep()
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.currentStep).toBe(2)

      // Step 2: Preferences
      wrapper.vm.preferencesData.musicPreference = 'Musique douce'
      wrapper.vm.preferencesData.conversationLevel = 'Bavard'
      wrapper.vm.preferencesData.temperaturePreference = 22
      wrapper.vm.preferencesData.petsAllowed = true

      wrapper.vm.validatePreferencesStep()
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.currentStep).toBe(3)

      // Step 3: Confirmation & Submission
      wrapper.vm.acceptEngagement = true
      await wrapper.vm.submitDriverApplication()
      await wrapper.vm.$nextTick()

      // Final assertions
      expect(wrapper.vm.currentStep).toBe(4)
      const updatedUser = JSON.parse(localStorage.getItem('user'))
      expect(updatedUser.roles).toContain('chauffeur')
      expect(global.fetch).toHaveBeenCalledWith('/api/users/become-driver', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        },
      })
    })
  })

  describe('State Management', () => {
    it('initializes isSubmitting as false', () => {
      expect(wrapper.vm.isSubmitting).toBe(false)
    })

    it('can update all vehicle fields', () => {
      const testData = {
        plate_number: 'XY-789-ZA',
        first_registration_date: '2019-05-10',
        model: 'Golf',
        brand_name: 'Volkswagen',
        color_name: 'Noir',
        seats_available: 5,
        is_electric: true,
      }

      Object.assign(wrapper.vm.vehicleData, testData)

      expect(wrapper.vm.vehicleData).toEqual(testData)
    })

    it('can update all preference fields', () => {
      const testData = {
        musicPreference: 'Radio',
        conversationLevel: 'Silencieux',
        temperaturePreference: 24,
        smokingAllowed: true,
        petsAllowed: true,
        customPreferences: 'Test preferences',
      }

      Object.assign(wrapper.vm.preferencesData, testData)

      expect(wrapper.vm.preferencesData).toEqual(testData)
    })
  })

  describe('Navigation', () => {
    it('allows moving forward through all steps', async () => {
      // Setup step 1
      wrapper.vm.vehicleData.plate_number = 'AB-123-CD'
      wrapper.vm.vehicleData.first_registration_date = '2020-01-01'
      wrapper.vm.vehicleData.model = 'Clio'
      wrapper.vm.vehicleData.brand_name = 'Renault'
      wrapper.vm.vehicleData.color_name = 'Blanc'
      wrapper.vm.vehicleData.seats_available = 4

      // Move to step 2
      wrapper.vm.validateVehicleStep()
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.currentStep).toBe(2)

      // Move to step 3
      wrapper.vm.validatePreferencesStep()
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.currentStep).toBe(3)
    })

    it('allows moving back from step 2 to step 1', async () => {
      wrapper.vm.currentStep = 2
      wrapper.vm.currentStep = 1
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.currentStep).toBe(1)
    })
  })
})
