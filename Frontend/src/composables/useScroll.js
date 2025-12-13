export function useScroll() {
  const scrollToId = (id, options = { behavior: 'smooth' }) => {
    if (typeof window === 'undefined' || !document) return
    const el = document.getElementById(id)
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView(options)
      return true
    }
    return false
  }

  return { scrollToId }
}
