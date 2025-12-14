import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NavButton from '../NavButton.vue'

describe('NavButton', () => {
  it('renders with nav class', () => {
    const wrapper = mount(NavButton, { slots: { default: 'Nav' } })
    expect(wrapper.find('.nav-btn').exists()).toBe(true)
  })
})
