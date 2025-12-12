/* global process */
import { test, expect } from '@playwright/test'

// Use a valid test user; adjust if different in the backend test database
const TEST_USER = process.env.TEST_USER || 'test'
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'Test2025!'

test('can login with test credentials', async ({ page }) => {
  await page.goto('/login')

  // Fill the login form
  await page.fill('#email', TEST_USER)
  await page.fill('#password', TEST_PASSWORD)

  // Submit form
  await Promise.all([
    page.waitForResponse((resp) => resp.url().includes('/users/login') && resp.status() === 200),
    page.click('button[type=submit]'),
  ])

  // On success, the page shows a success message and redirects
  await expect(page.locator('.success-message')).toHaveText(/Connexion réussie/)

  // The router redirects after 1 second to '/', so wait for navigation
  await page.waitForURL('/')

  // Basic check: ensure navbar indicates user logged-in, ie. Déconnexion is visible
  const userDropdown = page.locator(
    'button.user-dropdown-toggle, .user-dropdown-toggle, .dropdown-toggle',
  )
  if ((await userDropdown.count()) > 0) {
    await userDropdown.first().click()
  }
  await expect(page.locator('text=Déconnexion')).toBeVisible()
})
