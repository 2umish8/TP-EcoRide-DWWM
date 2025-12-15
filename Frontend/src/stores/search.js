import { defineStore } from 'pinia'

export const useSearchStore = defineStore('search', {
  state: () => ({
    departure: localStorage.getItem('searchDeparture') || '',
    destination: localStorage.getItem('searchDestination') || '',
    date: localStorage.getItem('searchDate') || '',
  }),

  getters: {
    getSearchParams: (state) => ({
      departure: state.departure,
      destination: state.destination,
      date: state.date,
    }),
  },

  actions: {
    setSearchParams(params) {
      this.departure = params.departure || ''
      this.destination = params.destination || ''
      this.date = params.date || ''

      localStorage.setItem('searchDeparture', this.departure)
      localStorage.setItem('searchDestination', this.destination)
      localStorage.setItem('searchDate', this.date)
    },

    clearSearchParams() {
      this.departure = ''
      this.destination = ''
      this.date = ''

      localStorage.removeItem('searchDeparture')
      localStorage.removeItem('searchDestination')
      localStorage.removeItem('searchDate')
    },
  },
})
