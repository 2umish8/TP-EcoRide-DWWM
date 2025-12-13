import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import SearchBar from '../SearchBar.vue'

describe('SearchBar', () => {
  it('renders inputs and buttons', () => {
    const wrapper = mount(SearchBar, {
      props: { initialValues: { departure: '', destination: '', date: '' } },
    })
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    expect(wrapper.findAll('input[type="text"]').length).toBe(2)
    expect(wrapper.find('input[type="date"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
    expect(wrapper.find('.browse-all-btn').exists()).toBe(true)
  })

  it('emits search with correct payload on submit', async () => {
    const wrapper = mount(SearchBar)
    const [start, dest] = wrapper.findAll('input[type="text"]')
    const date = wrapper.find('input[type="date"]')

    await start.setValue('Paris')
    await dest.setValue('Lyon')
    await date.setValue('2025-12-13')

    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.emitted()).toHaveProperty('search')
    const payload = wrapper.emitted('search')[0][0]
    expect(payload).toEqual({ departure: 'Paris', destination: 'Lyon', date: '2025-12-13' })
  })

  it('emits browse-all on click', async () => {
    const wrapper = mount(SearchBar)
    await wrapper.find('.browse-all-btn').trigger('click')
    expect(wrapper.emitted()).toHaveProperty('browse-all')
  })
})
