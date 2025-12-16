import { ref } from 'vue'

export function useSearchForm(initial = { departure: '', arrival: '', date: '' }) {
  const searchForm = ref({ ...initial })

  const resetSearchForm = () => {
    searchForm.value = { departure: '', arrival: '', date: '' }
  }

  const buildQuery = (values) => {
    return {
      departure: values.departure || '',
      arrival: values.arrival || '',
      date: values.date || '',
    }
  }

  // If router is passed, it will navigate, else it returns the query
  const submitSearch = (router, values = null) => {
    const s = values ?? searchForm.value
    const query = buildQuery(s)
    if (router && typeof router.push === 'function') {
      router.push({ name: 'SearchResults', query })
      return query
    }
    return query
  }

  return { searchForm, resetSearchForm, submitSearch }
}
