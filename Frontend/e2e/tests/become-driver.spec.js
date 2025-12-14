/* global process */
import { test, expect } from '@playwright/test'

// Test user credentials
const TEST_USER = process.env.TEST_USER || 'test'
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'Test2025!'

test.describe('Become Driver Flow (E2E)', () => {
  test('should complete the become-driver workflow successfully', async ({ page }) => {
    // 1. Login first
    await page.goto('/login')
    await page.fill('#email', TEST_USER)
    await page.fill('#password', TEST_PASSWORD)

    await Promise.all([
      page.waitForResponse((resp) => resp.url().includes('/users/login') && resp.status() === 200),
      page.click('button[type=submit]'),
    ])

    // Verify login success
    await expect(page.locator('.success-message')).toBeVisible()
    await page.waitForURL('/')

    // 2. Navigate to become-driver page
    await page.goto('/become-driver')

    // Wait for step indicator to be visible
    await expect(page.locator('.steps-indicator')).toBeVisible()
    await expect(page.locator('.step:nth-child(1)')).toHaveClass(/active/)

    // 3. Step 1: Fill vehicle information
    console.log('Step 1: Filling vehicle information...')

    // Plate number
    await page.fill('input[placeholder="AB-123-CD"]', 'AB-123-CD')

    // First registration date
    const today = new Date().toISOString().split('T')[0]
    const pastDate = new Date(new Date().setFullYear(new Date().getFullYear() - 5))
      .toISOString()
      .split('T')[0]
    await page.fill('input[type="date"]', pastDate)

    // Brand selection
    const brandSelect = page.locator('select').first()
    await brandSelect.selectOption('Renault')

    // Model
    await page.fill('input[placeholder*="ex: Clio"]', 'Clio')

    // Color selection
    const colorSelect = page.locator('select').nth(1)
    await colorSelect.selectOption('Noir')

    // Seats
    await page.fill('input[type="number"]', '4')

    // Click next button (submit form)
    const nextBtn = page.locator('button:has-text("Suivant")')
    await nextBtn.click()

    // Wait for step 2
    await expect(page.locator('.step:nth-child(2)')).toHaveClass(/active/, { timeout: 5000 })

    console.log('Step 1 completed, moving to Step 2')

    // 4. Step 2: Fill driver preferences
    console.log('Step 2: Filling driver preferences...')

    // Wait for preferences form to appear
    await expect(page.locator('text=Préférences de conduite')).toBeVisible()

    // Music preference checkbox
    const musicCheckbox = page.locator('input[type="checkbox"][value="musique"]')
    if (await musicCheckbox.isEnabled()) {
      await musicCheckbox.check()
    }

    // Click next button
    await nextBtn.click()

    // Wait for step 3
    await expect(page.locator('.step:nth-child(3)')).toHaveClass(/active/, { timeout: 5000 })

    console.log('Step 2 completed, moving to Step 3')

    // 5. Step 3: Accept engagement
    console.log('Step 3: Accepting engagement terms...')

    // Wait for engagement section
    await expect(page.locator('text=Engagement de conduite')).toBeVisible()

    // Check the acceptance checkbox
    const acceptCheckbox = page.locator('input[type="checkbox"]').last()
    await acceptCheckbox.check()

    // Submit the form
    const submitBtn = page.locator('button:has-text("Devenir Chauffeur")')
    await expect(submitBtn).toBeEnabled()

    console.log('Submitting become-driver application...')

    // Monitor the API calls
    const vehicleResponse = await Promise.race([
      page.waitForResponse(
        (resp) =>
          resp.url().includes('/api/vehicles') &&
          resp.request().method() === 'POST' &&
          resp.status() === 201,
      ),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Vehicle API timeout')), 10000)),
    ]).catch((err) => {
      console.error('Vehicle API error:', err.message)
      return null
    })

    if (vehicleResponse) {
      console.log('Vehicle created successfully')
    }

    // Click submit
    await submitBtn.click()

    // Wait for success - either success message or redirect to profile/home
    await Promise.race([
      await expect(page.locator('.success-message')).toBeVisible(),
      page.waitForURL('/profile', { timeout: 5000 }),
      page.waitForURL('/', { timeout: 5000 }),
    ]).catch(() => {
      // Page might have redirected without visible success message
    })

    // 6. Verify the user is now a driver
    console.log('Verifying driver status...')

    // Check if currentStep reached step 4 (success)
    const currentStepElement = page.locator('.step:nth-child(4)')
    await expect(currentStepElement).toHaveClass(/active|completed/, { timeout: 5000 })

    console.log('Become Driver test completed successfully!')
  })

  test('should show validation errors for invalid vehicle data', async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('#email', TEST_USER)
    await page.fill('#password', TEST_PASSWORD)

    await Promise.all([
      page.waitForResponse((resp) => resp.url().includes('/users/login') && resp.status() === 200),
      page.click('button[type=submit]'),
    ])

    await page.waitForURL('/')

    // Navigate to become-driver
    await page.goto('/become-driver')

    // Try to submit form with invalid data
    const plateInput = page.locator('input[placeholder="AB-123-CD"]')
    await plateInput.fill('INVALID') // Invalid format

    // Try to click next - should fail validation
    const nextBtn = page.locator('button:has-text("Suivant")')
    await nextBtn.click()

    // Plate input should still be focused/have error due to HTML5 validation
    await expect(plateInput).toHaveValue('INVALID')

    // Verify we didn't advance to step 2
    await expect(page.locator('.step:nth-child(1)')).toHaveClass(/active/)

    console.log('Validation test completed successfully!')
  })

  test('should handle API errors gracefully', async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('#email', TEST_USER)
    await page.fill('#password', TEST_PASSWORD)

    await Promise.all([
      page.waitForResponse((resp) => resp.url().includes('/users/login') && resp.status() === 200),
      page.click('button[type=submit]'),
    ])

    await page.waitForURL('/')

    // Navigate to become-driver
    await page.goto('/become-driver')

    // Fill step 1 with valid data
    await page.fill('input[placeholder="AB-123-CD"]', 'AB-123-CD')

    const pastDate = new Date(new Date().setFullYear(new Date().getFullYear() - 5))
      .toISOString()
      .split('T')[0]
    await page.fill('input[type="date"]', pastDate)

    const brandSelect = page.locator('select').first()
    await brandSelect.selectOption('Renault')

    await page.fill('input[placeholder*="ex: Clio"]', 'Clio')

    const colorSelect = page.locator('select').nth(1)
    await colorSelect.selectOption('Noir')

    await page.fill('input[type="number"]', '4')

    // Proceed to step 2
    const nextBtn = page.locator('button:has-text("Suivant")')
    await nextBtn.click()

    await expect(page.locator('.step:nth-child(2)')).toHaveClass(/active/, { timeout: 5000 })

    // Proceed to step 3
    await nextBtn.click()

    await expect(page.locator('.step:nth-child(3)')).toHaveClass(/active/, { timeout: 5000 })

    // Accept terms
    const acceptCheckbox = page.locator('input[type="checkbox"]').last()
    await acceptCheckbox.check()

    // Set up route interception to simulate API failure
    await page.route('**/api/vehicles', (route) => {
      route.abort('failed')
    })

    // Try to submit
    const submitBtn = page.locator('button:has-text("Devenir Chauffeur")')
    await submitBtn.click()

    // Should show error alert/message
    await page.waitForEvent('dialog').then((dialog) => {
      expect(dialog.message()).toContain('Erreur')
      dialog.dismiss()
    })

    console.log('API error handling test completed successfully!')
  })
})
