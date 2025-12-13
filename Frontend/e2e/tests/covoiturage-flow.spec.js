import { test, expect } from '@playwright/test'
import fs from 'fs'

// Read seeded test data exported by globalSetup
const TEST_DATA_PATH = new URL('../test-data.json', import.meta.url).pathname
const testData = fs.existsSync(TEST_DATA_PATH)
  ? JSON.parse(fs.readFileSync(TEST_DATA_PATH, 'utf8'))
  : {
      TEST_USER_PSEUDO: 'test',
      TEST_USER_EMAIL: 'test@test.com',
      TEST_PASSWORD: 'Test2025!',
      VEHICLE_ID: null,
    }

const GOOD_USER = testData.TEST_USER_PSEUDO || testData.TEST_USER_EMAIL
const GOOD_PASS = testData.TEST_PASSWORD

// Use a unique vehicle plate for add/remove actions to avoid conflicts with existing seeded vehicles
const vehiclePlate = 'CL-' + Date.now().toString().slice(-6)
const vehicleBrand = 'Renault'
const vehicleModel = 'Clio 2020'
const vehicleSeatsText = '4 places'

// Helper to clear auth state
async function logoutIfNeeded(page) {
  // Clear local storage and cookies to ensure logged out
  await page.context().clearCookies()
  // Ensure page is on the app origin so localStorage is accessible
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
}

test('covoiturage critical flow: login error, login succeed, add vehicle, delete vehicle, logout', async ({
  page,
}) => {
  await logoutIfNeeded(page)

  // Navigate to login
  await page.goto('/login')

  // 1) wrong credentials should show an error
  await page.fill('#email', 'test@bad.com')
  await page.fill('#password', 'wrong123')
  await page.click('button[type=submit]')

  const errMsg = page.locator('.error-message')
  await expect(errMsg).toBeVisible()
  await expect(errMsg).toHaveText(
    /Identifiants invalides|Email ou mot de passe incorrect|Incorrect|invalid/i,
  )

  // 2) login with correct credentials
  await page.fill('#email', GOOD_USER)
  await page.fill('#password', GOOD_PASS)

  // Submit the form and wait for success and redirect
  await Promise.all([
    page.waitForResponse((resp) => resp.url().includes('/users/login') && resp.status() === 200),
    page.click('button[type=submit]'),
  ])

  const successMsg = page.locator('.success-message')
  await expect(successMsg).toBeVisible()
  await expect(successMsg).toHaveText(/Connexion réussie|Connexion/)

  // Expect the app to redirect to home page
  await page.waitForURL('/')

  // Check that the navbar contains a user dropdown
  // click on the dropdown to reveal the 'Déconnexion' button
  const userDropdown = page.locator(
    'button.user-dropdown-toggle, .user-dropdown-toggle, .dropdown-toggle',
  )
  await expect(userDropdown.first()).toBeVisible()
  await userDropdown.first().click()
  const logoutBtn = page.locator('text=Déconnexion')
  await expect(logoutBtn).toBeVisible()

  // 3) go to profile page to add vehicle
  await page.goto('/profile')

  // Ensure we have become a chauffeur (backend globalSetup did add the role), but the UI may require toggle
  // If the 'Ajouter un véhicule' button isn't visible, attempt to set chauffeur role by interacting with the role checkbox
  const addVehicleBtn = page.locator('button.add-btn', { hasText: 'Ajouter un véhicule' })
  // Ensure the chauffeur checkbox is checked, then expect add vehicle to be visible
  const chauffeurCheckbox = page
    .locator('label.role-option', { hasText: 'Chauffeur' })
    .locator('input[type=checkbox]')
  await chauffeurCheckbox.first().check()
  await expect(addVehicleBtn).toBeVisible()
  await addVehicleBtn.click()

  // Fill the vehicle form fields
  await page.fill('input[placeholder="AA-123-BB"]', vehiclePlate)
  await page.fill('input[placeholder="Peugeot"]', vehicleBrand)
  await page.fill('input[placeholder="308"]', vehicleModel)
  await page.selectOption('.vehicle-form select.form-select', '4') // seats value
  await page.fill('input[placeholder="Blanc"]', 'Gris')

  // Submit the vehicle form
  await Promise.all([
    page.waitForResponse((resp) => resp.url().includes('/vehicles') && resp.status() < 400),
    page.click('.vehicle-form button[type=submit]'),
  ])

  // Wait for the vehicles list to be updated with the new vehicle
  const newVehicleLocator = page.locator('.vehicle-item', { hasText: vehiclePlate })
  await expect(newVehicleLocator).toBeVisible({ timeout: 5000 })
  await expect(newVehicleLocator.locator('.vehicle-details')).toContainText(vehiclePlate)
  await expect(newVehicleLocator.locator('.vehicle-details')).toContainText(vehicleSeatsText)

  // 4) Delete the vehicle: click remove button inside the vehicle item
  const removeBtn = newVehicleLocator.locator('button.remove-btn')
  await Promise.all([
    page.waitForResponse((resp) => resp.url().includes('/vehicles/') && resp.status() < 400),
    removeBtn.click(),
  ])

  // Confirm the vehicle disappears - wait for the item to be gone
  await expect(page.locator('.vehicle-item', { hasText: vehiclePlate })).toHaveCount(0, {
    timeout: 5000,
  })

  // 5) Logout using the dropdown menu
  // Click dropdown toggle again
  const dropdownToggle = page.locator(
    'button.user-dropdown-toggle, .user-dropdown-toggle, .dropdown-toggle',
  )
  await expect(dropdownToggle.first()).toBeVisible()
  await dropdownToggle.first().click()
  await page.locator('text=Déconnexion').click()

  // Expect user to be redirected or logged out - confirm by presence of login link in navbar
  await expect(page.locator('a[href="/login"]')).toBeVisible({ timeout: 5000 })
})
