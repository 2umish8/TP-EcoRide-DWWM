import { mount, flushPromises } from '@vue/test-utils'
import ProfileView from '@/views/ProfileView.vue'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock services and stores
vi.mock('@/services/mongoServices', () => ({
  preferencesService: {
    getMyPreferences: vi.fn(),
    updatePreferences: vi.fn(),
  },
}))

vi.mock('@/services/api', () => ({
  authService: {
    getProfile: vi.fn(),
  },
  vehicleService: {
    getUserVehicles: vi.fn().mockResolvedValue({ vehicles: [] }),
  },
  carpoolingService: {},
}))

const mockShowSuccess = vi.fn()
const mockShowError = vi.fn()
vi.mock('@/stores/notification', () => ({
  useNotificationStore: () => ({ showSuccess: mockShowSuccess, showError: mockShowError }),
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    isAuthenticated: true,
    currentUser: { pseudo: 'test', email: 'test@test.com' },
    logout: vi.fn(),
  }),
}))

describe('ProfileView - driver preferences', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('loads driver preferences when user is chauffeur', async () => {
    const { authService } = await import('@/services/api')
    const { preferencesService } = await import('@/services/mongoServices')
    authService.getProfile.mockResolvedValue({ user: { roles: ['chauffeur'] } })
    preferencesService.getMyPreferences.mockResolvedValue({
      allows_smoking: true,
      allows_pets: false,
      conversation_level: 'bavard',
      preferred_music_genre: 'rock',
      special_rules: 'Pas de chien',
    })

    const wrapper = mount(ProfileView)
    await flushPromises()

    expect(authService.getProfile).toHaveBeenCalled()
    expect(preferencesService.getMyPreferences).toHaveBeenCalled()

    const prefs = wrapper.vm.driverPreferences
    expect(prefs.allowsSmoking).toBe(true)
    expect(prefs.allowsPets).toBe(false)
    expect(prefs.conversationLevel).toBe('bavard')
    expect(prefs.preferredMusicGenre).toBe('rock')
    expect(prefs.specialRules).toBe('Pas de chien')
  })

  it('saves preferences and shows success on update', async () => {
    const { authService } = await import('@/services/api')
    const { preferencesService } = await import('@/services/mongoServices')
    authService.getProfile.mockResolvedValue({ user: { roles: ['chauffeur'] } })
    preferencesService.getMyPreferences.mockResolvedValue({})
    preferencesService.updatePreferences.mockResolvedValue({})

    const wrapper = mount(ProfileView)
    await flushPromises()

    // Modify preferences
    wrapper.vm.driverPreferences = {
      allowsSmoking: false,
      allowsPets: true,
      conversationLevel: 'modéré',
      preferredMusicGenre: 'pop',
      specialRules: 'Règles test',
    }

    await wrapper.vm.updatePreferences()

    expect(preferencesService.updatePreferences).toHaveBeenCalledWith({
      allowsSmoking: false,
      allowsPets: true,
      conversationLevel: 'modéré',
      preferredMusicGenre: 'pop',
      specialRules: 'Règles test',
    })
    expect(mockShowSuccess).toHaveBeenCalled()
  })
})
