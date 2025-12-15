import { test, expect } from '@playwright/test'
import fs from 'fs'

const TEST_DATA_PATH = new URL('../test-data.json', import.meta.url).pathname
const testData = fs.existsSync(TEST_DATA_PATH)
  ? JSON.parse(fs.readFileSync(TEST_DATA_PATH, 'utf8'))
  : {
      NON_DRIVER_PSEUDO: 'test-non-driver',
      NON_DRIVER_EMAIL: 'test-non-driver@test.com',
      NON_DRIVER_PASSWORD: 'Test2025!',
    }

const GOOD_USER = testData.NON_DRIVER_PSEUDO || testData.NON_DRIVER_EMAIL
const GOOD_PASSWORD = testData.NON_DRIVER_PASSWORD

test.describe('Profile -> Become Driver (E2E)', () => {
  test('should guide user to wizard and enable chauffeur after completion', async ({ page }) => {
    page.on('dialog', (dialog) => {
      // Surface the underlying reason when the onboarding fails.
      console.log('Dialog:', dialog.message())
      dialog.accept()
    })

    const randLetter = () => String.fromCharCode(65 + Math.floor(Math.random() * 26))
    const rand3 = () => String(Math.floor(Math.random() * 1000)).padStart(3, '0')
    const plate = `${randLetter()}${randLetter()}-${rand3()}-${randLetter()}${randLetter()}`

    // Login
    await page.goto('/login')
    await page.fill('#email', GOOD_USER)
    await page.fill('#password', GOOD_PASSWORD)

    await Promise.all([
      page.waitForResponse((resp) => resp.url().includes('/users/login') && resp.status() === 200),
      page.click('button[type=submit]'),
    ])

    await page.waitForURL('/')

    // Go to profile and wait for content to load
    await page.goto('/profile')
    await expect(page.locator('text=Mon rôle sur EcoRide')).toBeVisible()

    // Wait for profile to finish loading (role options should be interactive)
    await page.waitForSelector('.role-option:has-text("Chauffeur")', { state: 'visible' })
    await page.waitForTimeout(500) // Brief wait for any API calls to complete

    // Enable chauffeur role (checkbox is visually hidden, so force it for determinism)
    await page.locator('input[type="checkbox"][value="chauffeur"]').check({ force: true })

    // Confirm modal should appear (wait for modal, not just heading)
    await expect(page.locator('.modal-overlay')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=Devenir chauffeur')).toBeVisible()

    await Promise.all([
      page.waitForURL('**/become-driver'),
      page.click('button:has-text("Continuer")'),
    ])

    // Step 1: vehicle
    await expect(page.locator('text=Informations du véhicule')).toBeVisible()
    await page.fill('input[placeholder="AB-123-CD"]', plate)

    const pastDate = new Date(new Date().setFullYear(new Date().getFullYear() - 5))
      .toISOString()
      .split('T')[0]
    await page.fill('input[type="date"]', pastDate)

    await page.locator('select').nth(0).selectOption({ index: 1 }) // any brand
    await page.fill('input[placeholder*="ex: Clio"]', 'Clio')
    await page.locator('select').nth(1).selectOption({ index: 1 }) // any color
    await page.locator('select').nth(2).selectOption('4')

    await page.click('button:has-text("Suivant")')
    await expect(page.locator('text=Préférences de conduite')).toBeVisible()

    // Step 2 -> Step 3
    await page.click('button:has-text("Suivant")')
    await expect(page.locator('text=Engagement de conduite responsable')).toBeVisible()

    // Accept engagement
    await page.locator('input[type="checkbox"]').last().check()

    // Submit and wait for redirect back to profile (success step has link)
    await page.click('button:has-text("Devenir Chauffeur EcoRide")')
    await expect(page.locator('a:has-text("Retour au profil")')).toBeVisible({ timeout: 20000 })

    await Promise.all([page.waitForURL('**/profile'), page.click('a:has-text("Retour au profil")')])

    // Now profile should display driver section (vehicles card)
    await expect(page.locator('text=Mon rôle sur EcoRide')).toBeVisible()
    await expect(page.locator('text=Mes Véhicules')).toBeVisible()
  })
})
