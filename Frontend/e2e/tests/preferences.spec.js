import { test, expect } from '@playwright/test'
import fs from 'fs'

const TEST_DATA_PATH = new URL('../test-data.json', import.meta.url).pathname
const testData = fs.existsSync(TEST_DATA_PATH)
  ? JSON.parse(fs.readFileSync(TEST_DATA_PATH, 'utf8'))
  : { TEST_USER_PSEUDO: 'test', TEST_USER_EMAIL: 'test@test.com', TEST_PASSWORD: 'Test2025!' }

const GOOD_USER = testData.TEST_USER_PSEUDO || testData.TEST_USER_EMAIL
const GOOD_PASS = testData.TEST_PASSWORD

test('driver can update driving preferences and receive confirmation', async ({ page }) => {
  // Ensure logged out state
  await page.context().clearCookies()
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())

  // Login
  await page.goto('/login')
  await page.fill('#email', GOOD_USER)
  await page.fill('#password', GOOD_PASS)
  await Promise.all([
    page.waitForResponse((resp) => resp.url().includes('/users/login') && resp.status() === 200),
    page.click('button[type=submit]'),
  ])

  // Go to profile
  await page.goto('/profile')

  // Ensure chauffeur role is active and the add vehicle button is visible
  const addVehicleBtn = page.locator('button.add-btn', { hasText: 'Ajouter un véhicule' })
  const chauffeurCheckbox = page
    .locator('label.role-option', { hasText: 'Chauffeur' })
    .locator('input[type=checkbox]')
  await chauffeurCheckbox.first().check()
  await expect(addVehicleBtn).toBeVisible()

  // Change a preference: toggle 'Fumeur autorisé' and set music genre
  const smokingCheckbox = page
    .locator('label.preference-item', { hasText: 'Fumeur autorisé' })
    .locator('input[type=checkbox]')
  const musicSelect = page
    .locator('.preference-select', { hasText: 'Genre musical préféré' })
    .locator('select')
  const specialRules = page.locator('textarea[placeholder^="Règles spéciales"]')

  // Set smoking preference to a known state (checked), set music and rules
  await smokingCheckbox.first().check()
  await musicSelect.selectOption('rock')
  await specialRules.fill('Pas de musique trop forte')

  // Wait for the POST /preferences response triggered by UI change
  await page.waitForResponse((resp) => resp.url().includes('/preferences') && resp.status() === 200)

  // Check for success notification
  await expect(page.locator('.success-message')).toBeVisible()
  await expect(page.locator('.success-message')).toHaveText(/Préférences mises à jour|Préférences/)

  // Cleanup: unset smoking preference for test idempotency
  await smokingCheckbox.first().uncheck()
  await page.waitForResponse((resp) => resp.url().includes('/preferences') && resp.status() === 200)
})
