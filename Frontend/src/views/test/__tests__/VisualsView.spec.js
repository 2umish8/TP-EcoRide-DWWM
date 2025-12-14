import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VisualsView from '../VisualsView.vue'

describe('VisualsView', () => {
  it('renders the VisualsDemo component', () => {
    const wrapper = mount(VisualsView)
    expect(wrapper.text()).toContain('Visuals — Style guide playground')
  })
})
