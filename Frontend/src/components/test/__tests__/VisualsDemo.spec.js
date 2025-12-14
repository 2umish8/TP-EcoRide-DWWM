import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VisualsDemo from '../VisualsDemo.vue'

describe('VisualsDemo', () => {
  it('renders buttons and swatches', () => {
    const wrapper = mount(VisualsDemo)
    expect(wrapper.find('button').exists()).toBe(true)
    expect(wrapper.findAll('.swatch').length).toBeGreaterThan(0)
  })
})
