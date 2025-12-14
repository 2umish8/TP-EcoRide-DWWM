import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SecondaryText from '@/components/ui/SecondaryText.vue'

describe('SecondaryText', () => {
  it('renders slot and uses span with secondary class', () => {
    const wrapper = mount(SecondaryText, { slots: { default: 'Hello' } })
    expect(wrapper.element.tagName.toLowerCase()).toBe('span')
    expect(wrapper.text()).toBe('Hello')
    expect(wrapper.classes()).toContain('text-secondary')
  })

  it('merges additional classes passed via attributes', () => {
    const wrapper = mount(SecondaryText, { attrs: { class: 'custom' }, slots: { default: 'Hi' } })
    expect(wrapper.classes()).toContain('custom')
    expect(wrapper.classes()).toContain('text-secondary')
  })
})
