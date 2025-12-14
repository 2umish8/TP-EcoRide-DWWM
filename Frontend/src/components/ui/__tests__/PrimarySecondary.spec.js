import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PrimaryButton from '../PrimaryButton.vue'
import SecondaryButton from '../SecondaryButton.vue'

describe('Primary and Secondary Button wrappers', () => {
  it('PrimaryButton applies eco-button--primary class', () => {
    const wrapper = mount(PrimaryButton, { slots: { default: 'Primary' } })
    expect(wrapper.find('.primary-btn').exists()).toBe(true)
  })

  it('SecondaryButton applies eco-button--secondary class', () => {
    const wrapper = mount(SecondaryButton, { slots: { default: 'Secondary' } })
    expect(wrapper.find('.secondary-btn').exists()).toBe(true)
  })
})
