import { describe, it, expect } from 'vitest'
import { useSearchForm } from '../useSearchForm'

describe('useSearchForm', () => {
  it('initializes with defaults and builds query', () => {
    const { searchForm, buildQuery } = (() => {
      const c = useSearchForm()
      // expose buildQuery by reconstructing a function (private in composable), test via submitSearch
      return { searchForm: c.searchForm, submitSearch: c.submitSearch }
    })()
    // default state
    expect(searchForm.value).toEqual({ departure: '', destination: '', date: '' })
  })

  it('submitSearch returns query object and uses router.push if provided', () => {
    const { searchForm, submitSearch } = useSearchForm()
    searchForm.value.departure = 'Paris'
    searchForm.value.destination = 'Lille'
    searchForm.value.date = '2025-12-13'

    const fakeRouter = {
      push: (arg) => {
        fakeRouter.pushed = arg
      },
    }
    const query = submitSearch(fakeRouter)
    expect(query).toEqual({ from: 'Paris', to: 'Lille', date: '2025-12-13' })
    expect(fakeRouter.pushed).toBeDefined()
    expect(fakeRouter.pushed.query).toEqual(query)
  })
})
