import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import HeroSection from '../HeroSection.vue'

describe('HeroSection', () => {
  it('renders the titles and includes SearchBar', () => {
    const wrapper = mount(HeroSection)
    expect(wrapper.find('h1').exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'SearchBar' }).exists()).toBe(true)
  })

  it('emits search when SearchBar emits', async () => {
    const wrapper = mount(HeroSection)
    const sb = wrapper.findComponent({ name: 'SearchBar' })
    await sb.vm.$emit('search', { departure: 'A', destination: 'B', date: '2025-12-13' })
    expect(wrapper.emitted()).toHaveProperty('search')
    const payload = wrapper.emitted('search')[0][0]
    expect(payload).toEqual({ departure: 'A', destination: 'B', date: '2025-12-13' })
  })

  it('scrolls to about-section when clicking en-savoir-plus', async () => {
    const fakeEl = { scrollIntoView: vi.fn() }
    const original = global.document.getElementById
    global.document.getElementById = () => fakeEl
    const wrapper = mount(HeroSection)
    const savoirPlusDiv = wrapper.find('.hero-more')
    expect(savoirPlusDiv.exists()).toBe(true)
    await savoirPlusDiv.trigger('click')
    expect(fakeEl.scrollIntoView).toHaveBeenCalled()
    global.document.getElementById = original
  })
})
