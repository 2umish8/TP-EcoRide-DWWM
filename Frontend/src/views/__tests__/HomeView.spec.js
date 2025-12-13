import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock vue-router's useRouter before importing the component
let mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: (...args) => mockPush(...args) }),
}))

import HomeView from '../HomeView.vue'

describe('HomeView', () => {
  beforeEach(() => {
    mockPush = vi.fn()
  })

  it('renders key child components and main container', () => {
    const wrapper = mount(HomeView, {
      global: {
        stubs: {
          'font-awesome-icon': true,
        },
      },
    })

    expect(wrapper.find('.accueil').exists()).toBe(true)
    // HeroSection and AboutSection are components; assert they are present
    expect(wrapper.findComponent({ name: 'HeroSection' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'AboutSection' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ArrowsFooter' }).exists()).toBe(true)
  })

  it('navigates to SearchResults with query when HeroSection emits search', async () => {
    const wrapper = mount(HomeView, {
      global: {
        stubs: {
          'font-awesome-icon': true,
        },
      },
    })

    const hero = wrapper.findComponent({ name: 'HeroSection' })
    const payload = { departure: 'Paris', destination: 'Lyon', date: '2025-12-13' }
    await hero.vm.$emit('search', payload)

    expect(mockPush).toHaveBeenCalled()
    const callArg = mockPush.mock.calls[0][0]
    expect(callArg).toEqual({
      name: 'SearchResults',
      query: { from: 'Paris', to: 'Lyon', date: '2025-12-13' },
    })
  })

  it('navigates to SearchResults empty query when HeroSection emits browse-all', async () => {
    const wrapper = mount(HomeView, {
      global: {
        stubs: {
          'font-awesome-icon': true,
        },
      },
    })

    const hero = wrapper.findComponent({ name: 'HeroSection' })
    await hero.vm.$emit('browse-all')

    expect(mockPush).toHaveBeenCalled()
    const callArg = mockPush.mock.calls[0][0]
    expect(callArg).toEqual({ name: 'SearchResults', query: { from: '', to: '', date: '' } })
  })
})
