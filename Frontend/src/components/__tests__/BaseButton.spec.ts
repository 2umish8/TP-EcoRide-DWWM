import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseButton from '@/components/ui/BaseButton.vue'
import { createRouter, createWebHistory } from 'vue-router'

describe('BaseButton', () => {
  it('renders a button when no `to` prop is provided', () => {
    const wrapper = mount(BaseButton, { slots: { default: 'Click' } })
    expect(wrapper.element.tagName.toLowerCase()).toBe('button')
    expect(wrapper.text()).toBe('Click')
  })

  it('renders a link when `to` prop is provided', async () => {
    const router = createRouter({ history: createWebHistory(), routes: [] })
    const wrapper = mount(BaseButton, {
      global: { plugins: [router] },
      props: { to: '/login' },
    })
    // RouterLink renders as an anchor element
    expect(wrapper.element.tagName.toLowerCase()).toBe('a')
  })

  it('emits click', async () => {
    const wrapper = mount(BaseButton)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('applies disabled attribute', async () => {
    const wrapper = mount(BaseButton, { props: { disabled: true } })
    expect(wrapper.attributes('disabled')).toBeDefined()
  })
})
