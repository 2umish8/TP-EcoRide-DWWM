import { test, expect } from '@playwright/test'
import fs from 'fs'
const TEST_DATA_PATH = new URL('../test-data.json', import.meta.url).pathname
const testData = fs.existsSync(TEST_DATA_PATH)
  ? JSON.parse(fs.readFileSync(TEST_DATA_PATH, 'utf8'))
  : { TEST_USER_PSEUDO: 'test', TEST_USER_EMAIL: 'test@test.com', TEST_PASSWORD: 'Test2025!' }

test.describe('FontAwesome icons presence', () => {
  test('navbar and home page icons load', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Navbar: house icon (looser selector: any svg[data-icon=house])
    await expect(page.locator('svg[data-icon="house"]')).toBeVisible()

    // Home page: chevron or angles-down used as scroll indicator
    await expect(
      page.locator('svg[data-icon="chevron-down"], svg[data-icon="angles-down"]'),
    ).toHaveCount(1)

    // Ensure at least one FontAwesome svg is present on the page
    await expect(page.locator('svg.svg-inline--fa').first()).toBeVisible()
  })

  test('my-trips page shows expected icons', async ({ page }) => {
    // Login first (seeds from global-setup)
    await page.goto('/login')
    await page.fill('#email', testData.TEST_USER_PSEUDO || testData.TEST_USER_EMAIL)
    await page.fill('#password', testData.TEST_PASSWORD)
    await Promise.all([
      page.waitForResponse((resp) => resp.url().includes('/users/login') && resp.status() === 200),
      page.click('button[type=submit]'),
    ])
    await page.waitForURL('/')
    await page.goto('/my-trips')
    await page.waitForLoadState('networkidle')
    await page.waitForLoadState('domcontentloaded')

    // Key icons used in the view
    await expect(page.locator('svg[data-icon="leaf"]')).toBeVisible()
    await expect(page.locator('svg[data-icon="car"]')).toBeVisible()
    await expect(page.locator('svg[data-icon="coins"]')).toBeVisible()

    // If the page has an empty state, the inbox or road icon should be present too
    await expect(
      page.locator('svg[data-icon="inbox"], svg[data-icon="road"]').first(),
    ).toBeVisible()
  })

  test('login page shows eye / eye-slash control icon', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // Password visibility icon: either eye or eye-slash depending on initial state
    await expect(
      page.locator('svg[data-icon="eye"], svg[data-icon="eye-slash"]').first(),
    ).toBeVisible()

    // Also sanity-check FA icons present on the login page
    await expect(page.locator('svg.svg-inline--fa').first()).toBeVisible()
  })
})
