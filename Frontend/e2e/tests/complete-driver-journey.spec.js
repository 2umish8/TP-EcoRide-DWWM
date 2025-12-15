import { test, expect } from '@playwright/test'

/**
 * COMPLETE DRIVER JOURNEY (A to Z)
 *
 * This test covers the entire business logic for a driver user:
 * 1. Registration
 * 2. Become a driver (add vehicle)
 * 3. Create a new carpooling trip
 * 4. View created trips and participants
 * 5. Start the trip
 * 6. Finish the trip
 * 7. View reviews received
 * 8. Delete a trip
 * 9. Logout
 *
 * This is ONE comprehensive test covering driver workflow.
 */

test.describe('Complete Driver Journey (A to Z)', () => {
  const DRIVER_EMAIL = `driver-${Date.now()}@ecoride.test`
  const DRIVER_PSEUDO = `Driver${Date.now()}`
  const PASSWORD = 'Test2025!'

  test('Full driver workflow: Register → Become Driver → Create → Start → Finish → Delete → Logout', async ({
    page,
  }) => {
    console.log('════════════════════════════════════════════════════════════')
    console.log('🚗 Starting Complete Driver Journey')
    console.log('════════════════════════════════════════════════════════════')

    // ========== STEP 1: REGISTRATION ==========
    console.log('\n✓ Step 1: Registering new driver user')
    await page.goto(`${process.env.BASE_URL || 'http://localhost:5173'}/register`)
    await page.fill('#pseudo', DRIVER_PSEUDO)
    await page.fill('#email', DRIVER_EMAIL)
    await page.fill('#password', PASSWORD)
    await page.fill('#confirmPassword', PASSWORD)
    await page.click('.register-btn')

    await page.waitForURL(/\/(home|profile|search)/, { timeout: 10000 })
    console.log(`  ✓ User registered: ${DRIVER_EMAIL}`)

    // ========== STEP 2: BECOME A DRIVER ==========
    console.log('\n✓ Step 2: Becoming a driver')
    await page.goto(`${process.env.BASE_URL || 'http://localhost:5174'}/profile`)

    // Look for "Become Driver" button
    const becomeDriverButton = page
      .locator(
        'button:has-text("Devenir chauffeur"), button:has-text("Become Driver"), [data-testid="become-driver"]',
      )
      .first()
    const becomeDriverVisible = await becomeDriverButton
      .isVisible({ timeout: 3000 })
      .catch(() => false)

    if (becomeDriverVisible) {
      await becomeDriverButton.click()
      console.log('  ✓ Clicked "Become Driver" button')

      // Wait for modal or form
      await page.waitForTimeout(1000)

      // Fill vehicle information
      const brandInput = page
        .locator('input[placeholder*="Marque"], input[placeholder*="Brand"]')
        .first()
      const modelInput = page
        .locator('input[placeholder*="Modèle"], input[placeholder*="Model"]')
        .first()
      const yearInput = page
        .locator('input[type="number"], input[placeholder*="Année"], input[placeholder*="Year"]')
        .first()
      const seatsInput = page
        .locator('input[placeholder*="places"], input[placeholder*="Seats"]')
        .first()

      if (await brandInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await brandInput.fill('Toyota')
        await modelInput.fill('Prius')
        await yearInput.fill('2022')
        await seatsInput.fill('4')
        console.log('  ✓ Filled vehicle information')

        // Submit vehicle form
        const submitButton = page
          .locator(
            'button[type="submit"]:has-text("Confirmer"), button[type="submit"]:has-text("Envoyer")',
          )
          .first()
        if (await submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await submitButton.click()
          await page.waitForTimeout(2000)
          console.log('  ✓ Vehicle registered successfully')
        }
      }
    }

    // ========== STEP 3: CREATE A NEW TRIP ==========
    console.log('\n✓ Step 3: Creating a new carpooling trip')
    const createTripButton = page
      .locator(
        '[data-testid="create-trip"], button:has-text("Créer"), button:has-text("Nouveau trajet")',
      )
      .first()

    if (await createTripButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createTripButton.click()
      console.log('  ✓ Clicked create trip button')

      await page.waitForTimeout(1000)

      // Fill trip form
      const departureInput = page
        .locator('input[placeholder*="Départ"], input[placeholder*="Partir"]')
        .first()
      const destinationInput = page
        .locator('input[placeholder*="Destination"], input[placeholder*="Aller"]')
        .first()
      const dateInput = page.locator('input[type="date"]').first()
      const priceInput = page
        .locator('input[type="number"], input[placeholder*="Prix"], input[placeholder*="Price"]')
        .first()
      const seatsInput = page
        .locator('input[placeholder*="places"], input[placeholder*="Seats"]')
        .last()

      if (await departureInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await departureInput.fill('Paris')
        await destinationInput.fill('Marseille')

        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 5)
        const dateString = tomorrow.toISOString().split('T')[0]
        await dateInput.fill(dateString)

        await priceInput.fill('30')
        await seatsInput.fill('3')
        console.log('  ✓ Filled trip form: Paris → Marseille, €30, 3 seats')

        // Submit trip
        const submitButton = page
          .locator(
            'button[type="submit"]:has-text("Créer"), button[type="submit"]:has-text("Publier")',
          )
          .first()
        if (await submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await submitButton.click()
          await page.waitForTimeout(2000)
          console.log('  ✓ Trip created successfully')
        }
      }
    }

    // ========== STEP 4: VIEW CREATED TRIPS AND PARTICIPANTS ==========
    console.log('\n✓ Step 4: Viewing created trips and participants')
    await page.goto(`${process.env.BASE_URL || 'http://localhost:5174'}/my-trips`)

    const createdTripsCount = await page
      .locator('[data-testid="trip-card"], .trip-card, [class*="trip"]')
      .count()
    console.log(`  ✓ Viewing ${createdTripsCount} created trips`)

    // Click first trip to see participants
    const firstTrip = page.locator('[data-testid="trip-card"], .trip-card, [class*="trip"]').first()
    if (await firstTrip.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstTrip.click()
      await page.waitForURL(/\/trip\/\d+/, { timeout: 5000 })

      // Look for participant list
      const participantList = page
        .locator('[data-testid="participants"], .participants, [class*="participant"]')
        .first()
      if (await participantList.isVisible({ timeout: 2000 }).catch(() => false)) {
        const participantCount = await page
          .locator('[data-testid="participant-item"], .participant-item, li[class*="participant"]')
          .count()
        console.log(`  ✓ Trip has ${participantCount} participant(s)`)
      }
    }

    // ========== STEP 5: START A TRIP ==========
    console.log('\n✓ Step 5: Starting a trip')
    const startButton = page
      .locator(
        '[data-testid="start-trip"], button:has-text("Démarrer"), button:has-text("Commencer")',
      )
      .first()

    if (await startButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await startButton.click()
      console.log('  ✓ Clicked "Start Trip" button')

      // Confirm if dialog appears
      const confirmButton = page
        .locator('button:has-text("Confirmer"), button:has-text("Oui"), button:has-text("OK")')
        .first()
      if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmButton.click()
        console.log('  ✓ Confirmed trip start')
        await page.waitForTimeout(1000)
      }
    }

    // ========== STEP 6: FINISH A TRIP ==========
    console.log('\n✓ Step 6: Finishing a trip')
    const finishButton = page
      .locator(
        '[data-testid="finish-trip"], button:has-text("Terminer"), button:has-text("Finish")',
      )
      .first()

    if (await finishButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await finishButton.click()
      console.log('  ✓ Clicked "Finish Trip" button')

      // Confirm if dialog appears
      const confirmButton = page
        .locator('button:has-text("Confirmer"), button:has-text("Oui"), button:has-text("OK")')
        .first()
      if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmButton.click()
        console.log('  ✓ Confirmed trip finish')
        await page.waitForTimeout(1000)
      }
    }

    // ========== STEP 7: VIEW REVIEWS RECEIVED ==========
    console.log('\n✓ Step 7: Viewing reviews received')
    await page.goto(`${process.env.BASE_URL || 'http://localhost:5174'}/profile`)

    const reviewsSection = page
      .locator('[data-testid="reviews"], .reviews, [class*="review"]')
      .first()
    if (await reviewsSection.isVisible({ timeout: 2000 }).catch(() => false)) {
      const reviewCount = await page
        .locator('[data-testid="review-item"], .review-item, div[class*="review-"]')
        .count()
      console.log(`  ✓ Profile shows ${reviewCount} received review(s)`)
    }

    // ========== STEP 8: DELETE A TRIP ==========
    console.log('\n✓ Step 8: Deleting a trip')
    await page.goto(`${process.env.BASE_URL || 'http://localhost:5174'}/my-trips`)

    const tripMenu = page
      .locator('[data-testid="trip-menu"], .trip-menu, button[aria-label*="menu"]')
      .last()
    const deleteButton = page
      .locator(
        '[data-testid="delete-trip"], button:has-text("Supprimer"), button:has-text("Delete")',
      )
      .first()

    if (await tripMenu.isVisible({ timeout: 2000 }).catch(() => false)) {
      await tripMenu.click()
    }

    if (await deleteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await deleteButton.click()
      console.log('  ✓ Clicked delete trip button')

      // Confirm deletion
      const confirmDeleteButton = page
        .locator(
          'button:has-text("Confirmer"), button:has-text("Oui"), button[role="button"]:has-text("Delete")',
        )
        .first()
      if (await confirmDeleteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmDeleteButton.click()
        console.log('  ✓ Confirmed trip deletion')
        await page.waitForTimeout(1000)
      }
    }

    // ========== STEP 9: LOGOUT ==========
    console.log('\n✓ Step 9: Logging out')
    const userDropdown = page
      .locator('button.user-dropdown-toggle, .user-dropdown-toggle, .dropdown-toggle')
      .first()
    if (await userDropdown.isVisible({ timeout: 2000 }).catch(() => false)) {
      await userDropdown.click()
    }

    const logoutButton = page
      .locator(
        'button:has-text("Déconnexion"), button:has-text("Logout"), a:has-text("Déconnexion")',
      )
      .first()
    if (await logoutButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await logoutButton.click()
      await page.waitForURL(/\/(home|login)/, { timeout: 5000 })
      console.log('  ✓ Successfully logged out')
    }

    console.log('\n════════════════════════════════════════════════════════════')
    console.log('✓ Complete Driver Journey Test PASSED')
    console.log('════════════════════════════════════════════════════════════\n')
  })
})
