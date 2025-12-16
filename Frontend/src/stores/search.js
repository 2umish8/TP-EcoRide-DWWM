import { defineStore } from 'pinia'

export const useSearchStore = defineStore('search', {
  state: () => ({
    departure: localStorage.getItem('searchDeparture') || '',
    arrival: localStorage.getItem('searchArrival') || '',
    date: localStorage.getItem('searchDate') || '',
  }),

  getters: {
    getSearchParams: (state) => ({
      departure: state.departure,
      arrival: state.arrival,
      date: state.date,
    }),
  },

  actions: {
    setSearchParams(params) {
      this.departure = params.departure || ''
      this.arrival = params.arrival || ''
      this.date = params.date || ''

      localStorage.setItem('searchDeparture', this.departure)
      localStorage.setItem('searchArrival', this.arrival)
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
