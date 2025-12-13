import { describe, it, expect, vi } from 'vitest'
import { useScroll } from '../useScroll'

describe('useScroll', () => {
  it('does not throw when element does not exist', () => {
    const { scrollToId } = useScroll()
    expect(scrollToId('non-existent')).toBe(false)
  })

  it('calls scrollIntoView when element exists', () => {
    const fakeEl = { scrollIntoView: vi.fn() }
    // Define getElementById on document
    const original = global.document.getElementById
    global.document.getElementById = () => fakeEl
    const { scrollToId } = useScroll()
    const result = scrollToId('some-id')
    expect(result).toBe(true)
    expect(fakeEl.scrollIntoView).toHaveBeenCalled()
    // restore
    global.document.getElementById = original
  })
})
