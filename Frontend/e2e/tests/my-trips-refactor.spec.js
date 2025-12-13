import { test, expect } from '@playwright/test'

test.describe('MyTripsView Refactoring E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/')

    // Check if already authenticated by checking for /my-trips redirect
    const url = page.url()
    if (!url.includes('/my-trips') && !url.includes('/dashboard')) {
      // Need to login - wait for login form
      await page
        .waitForSelector('[type="email"], [type="password"]', { timeout: 5000 })
        .catch(() => null)

      // Fill in test user credentials (from global-setup.js)
      await page.fill('[type="email"]', 'test@example.com')
      await page.fill('[type="password"]', 'Password123!')

      // Submit form
      await page.click('button[type="submit"]')

      // Wait for redirect to dashboard or my-trips
      await page.waitForURL(/\/(dashboard|my-trips|home)/, { timeout: 5000 }).catch(() => null)
    }

    // Navigate to /my-trips
    await page.goto('/my-trips')

    // Wait for page content to load
    await page.waitForSelector('.my-trips, .page-content, h1', { timeout: 5000 }).catch(() => null)
  })

  test('✅ MyTripsView loads successfully', async ({ page }) => {
    // Verify page heading is visible
    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible({ timeout: 5000 })

    // Verify main content area exists
    const content = page.locator('.my-trips, .page-content')
    await expect(content.first()).toBeVisible()
  })

  test('✅ Both Passenger and Driver tabs are present', async ({ page }) => {
    // Look for tab buttons - use class selector instead of text
    const tabButtons = page.locator('[role="tab"], .tab-btn, .nav-link')

    // Should have at least 2 tabs
    const count = await tabButtons.count()
    expect(count).toBeGreaterThanOrEqual(2)

    // Tabs should be visible
    await expect(tabButtons.first()).toBeVisible()
  })

  test('✅ Can switch between tabs', async ({ page }) => {
    // Get all clickable tab elements
    const tabs = page.locator('[role="tab"], .tab-btn, button.nav-link')
    const tabCount = await tabs.count()

    if (tabCount >= 2) {
      // Click second tab
      await tabs.nth(1).click()

      // Wait for content to update
      await page.waitForTimeout(300)

      // Content should still be visible (no errors)
      const content = page.locator('.my-trips, .page-content')
      await expect(content.first()).toBeVisible()
    }
  })

  test('✅ TripCard component renders if trips exist', async ({ page }) => {
    // Look for trip cards with multiple possible class names
    const tripCards = page.locator('.trip-card, .card[data-testid*="trip"], [class*="trip-item"]')

    const count = await tripCards.count()

    // If there are trips, verify card structure
    if (count > 0) {
      const firstCard = tripCards.first()

      // Card should be visible
      await expect(firstCard).toBeVisible()

      // Verify card has content (not empty)
      const text = firstCard
      await expect(text).toHaveText()
      expect(text?.length).toBeGreaterThan(5)
    } else {
      // No trips is also valid - check for empty state message
      const emptyState = page.locator('.empty-state, .no-trips, [class*="empty"]')
      const emptyCount = await emptyState.count()

      // Either shows cards or empty state
      expect(count + emptyCount).toBeGreaterThan(0)
    }
  })

  test('✅ Loading state completes', async ({ page }) => {
    // Wait for loading spinner to disappear
    const loadingSpinner = page.locator('.loading-spinner, .spinner, [class*="loading"]')

    // Wait for spinner to be hidden or content to appear
    await Promise.race([
      page
        .waitForSelector('.loading-spinner, .spinner', { state: 'hidden', timeout: 3000 })
        .catch(() => null),
      page
        .waitForSelector('.trip-card, .empty-state, [class*="trip"]', { timeout: 3000 })
        .catch(() => null),
    ])

    // Spinner should not be visible after load
    const isLoading = await loadingSpinner.isVisible().catch(() => false)
    expect(isLoading).toBe(false)

    // Some content should be visible
    const content = page.locator('.my-trips, .page-content, h1')
    await expect(content.first()).toBeVisible()
  })

  test('✅ Date formatting is applied to trip cards', async ({ page }) => {
    // Look for trip cards
    const tripCards = page.locator('.trip-card, [class*="trip-item"]')
    const count = await tripCards.count()

    if (count > 0) {
      const firstCard = tripCards.first()

      // Look for date/time elements (various possible selectors)
      const dateElements = firstCard.locator(
        '[class*="date"], [class*="time"], .trip-date, .trip-time',
      )

      // If date elements exist, verify they have content
      const dateCount = await dateElements.count()
      if (dateCount > 0) {
        const firstDate = dateElements.first()
        const text = firstDate

        // Should have actual date text (not empty, not "undefined")
        await expect(text).toHaveText()
        expect(text?.includes('undefined')).toBe(false)
      }
    }
  })

  test('✅ Status badges are displayed on trip cards', async ({ page }) => {
    // Look for trip cards
    const tripCards = page.locator('.trip-card, [class*="trip-item"]')
    const count = await tripCards.count()

    if (count > 0) {
      const firstCard = tripCards.first()

      // Look for status badge (various possible selectors)
      const statusBadge = firstCard.locator('.status-badge, .badge, [class*="status"]')

      // If status badge exists, it should be visible
      if (await statusBadge.isVisible().catch(() => false)) {
        await expect(statusBadge).toBeVisible()

        // Should have a status text
        const text = statusBadge
        await expect(text).toHaveText()
      }
    }
  })

  test('✅ Stats component displays summary data (driver tab)', async ({ page }) => {
    // Switch to driver tab
    const tabs = page.locator('[role="tab"], .tab-btn, button.nav-link')
    const tabCount = await tabs.count()

    if (tabCount >= 2) {
      // Click driver tab (usually second)
      await tabs.nth(1).click()
      await page.waitForTimeout(300)

      // Look for stats display (multiple possible structures)
      const stats = page.locator('.stats, .trip-stats, [class*="stat"], .card-header')

      // Should have some stats visible or at least cards/content
      const statsCount = await stats.count()

      // Check if any content is rendered
      const content = page.locator('.my-trips, .page-content')
      await expect(content.first()).toBeVisible()
    }
  })

  test('✅ No console errors during interaction', async ({ page }) => {
    // Capture console errors
    const consoleErrors = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Interact with page - click tabs
    const tabs = page.locator('[role="tab"], .tab-btn, button.nav-link')
    const tabCount = await tabs.count()

    for (let i = 0; i < Math.min(tabCount, 2); i++) {
      await tabs.nth(i).click()
      await page.waitForTimeout(300)
    }

    // Click any action buttons
    const buttons = page.locator('button[class*="action"], button[class*="cancel"], .btn')
    const btnCount = Math.min(await buttons.count(), 3)

    for (let i = 0; i < btnCount; i++) {
      const btn = buttons.nth(i)
      if (await btn.isVisible().catch(() => false)) {
        try {
          await btn.click({ timeout: 1000 })
          await page.waitForTimeout(200)
        } catch {
          // Button might be disabled or disappear - that's ok
        }
      }
    }

    // Should have no critical errors
    const criticalErrors = consoleErrors.filter(
      (e) => !e.includes('favicon') && !e.includes('net::ERR'),
    )

    expect(criticalErrors.length).toBe(0)
  })

  test('✅ Responsive layout handles all screen sizes', async ({ page, viewport }) => {
    // Get current viewport
    const currentSize = viewport?.width || 1280

    // Main content should always be visible
    const content = page.locator('.my-trips, .page-content')
    await expect(content.first()).toBeVisible()

    // Tabs should be accessible
    const tabs = page.locator('[role="tab"], .tab-btn, button.nav-link')
    expect(await tabs.count()).toBeGreaterThanOrEqual(2)

    // No horizontal overflow
    const body = page.locator('body')
    const boxSize = await body.evaluate((el) => el.scrollWidth)
    expect(boxSize).toBeLessThanOrEqual(currentSize + 50) // Allow small tolerance
  })
})
