import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import ArrowsFooter from '../ArrowsFooter.vue'

describe('ArrowsFooter', () => {
  it('renders arrows and footer slot', () => {
    const wrapper = mount(ArrowsFooter, { slots: { default: '<span>Link</span>' } })
    expect(wrapper.findAll('.arrow-down').length).toBe(2)
    expect(wrapper.find('.footer-links').text()).toContain('Link')
  })
})
