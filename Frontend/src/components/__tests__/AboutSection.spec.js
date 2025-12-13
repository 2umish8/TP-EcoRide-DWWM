import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import AboutSection from '../AboutSection.vue'

describe('AboutSection', () => {
  it('renders about content', () => {
    const wrapper = mount(AboutSection)
    expect(wrapper.find('.about-title').text()).toContain('À Propos de Nous')
    expect(wrapper.findAll('.about-paragraph').length).toBeGreaterThan(0)
  })
})
