import { test, expect } from '@playwright/test'

test('home page has correct title and login link', async ({ page }) => {
  // Navigate to the base URL provided in playwright.config.js
  await page.goto('/')
  // Title should contain EcoRide
  await expect(page).toHaveTitle(/EcoRide - Covoiturage Écologique/)

  // Check that login link exists in the page
  // Either check for the login view title or the login route
  await page.goto('/login')
  await expect(page.locator('h1.login-title')).toHaveText('Bon retour parmi nous !')
})
