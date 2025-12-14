import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AppNavbar from '@/components/AppNavbar.vue'

// Mock auth store
const authMock = { isLoggedIn: false, currentUser: null, logout: vi.fn() }
vi.mock('@/stores/auth', () => ({ useAuthStore: () => authMock }))

describe('AppNavbar', () => {
  beforeEach(() => vi.resetAllMocks())

  it('renders main links and auth buttons for guest', () => {
    const wrapper = mount(AppNavbar, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot/></a>' },
          'font-awesome-icon': true,
        },
      },
    })
    const texts = wrapper.findAll('.nav-btn').map((n) => n.text().trim())
    expect(texts).toContain('Accueil')
    expect(texts).toContain('Rechercher')
    expect(texts).toContain('Connexion')
    expect(texts).toContain('Inscription')
  })

  it('calls logout when Déconnexion clicked', async () => {
    const mockLogout = vi.fn()
    // set store to logged-in
    authMock.isLoggedIn = true
    authMock.currentUser = { pseudo: 'toto' }
    authMock.logout = mockLogout
    const wrapper = mount(AppNavbar, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot/></a>' },
          'font-awesome-icon': true,
        },
      },
    })
    const logoutBtn = wrapper.findAll('.nav-btn').find((n) => n.text().includes('Déconnexion'))
    expect(logoutBtn).toBeDefined()
    await logoutBtn.trigger('click')
    expect(mockLogout).toHaveBeenCalled()
  })
})
