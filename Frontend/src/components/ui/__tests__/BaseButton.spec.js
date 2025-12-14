import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseButton from '../BaseButton.vue'

describe('BaseButton', () => {
  it('renders a button by default with base-button class', () => {
    const wrapper = mount(BaseButton, { slots: { default: 'Click' } })
    expect(wrapper.find('button').exists()).toBe(true)
    expect(wrapper.find('.base-button').exists()).toBe(true)
  })
  // component intentionally simple; no RouterLink behavior
})
