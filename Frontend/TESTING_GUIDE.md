# EcoRide Testing Guide

## Overview

Tests are organized in a **consolidated, efficient structure**:
- **Vitest** (75+ tests): Small, isolated unit tests for business logic
- **Playwright E2E** (3 tests): Complete end-to-end user journeys A→Z

## Running Tests

### 1️⃣ Run Vitest First (Fast Feedback)

```bash
# Frontend directory
cd Frontend

# Run all Vitest tests
npm run test:unit

# Run specific composable tests
npm run test:unit -- useParticipationActions
npm run test:unit -- useTripsActions

# Run validation tests
npm run test:unit -- validation.spec.js

# Watch mode for development
npm run test:unit -- --watch
```

**Expected**: All tests pass in <1 second ✅

### 2️⃣ Run E2E Tests (After Vitest Passes)

```bash
cd Frontend

# Run all E2E tests with 4 workers (optimized)
npx playwright test e2e/tests/complete-*.spec.js --project=chromium --workers=4

# Run specific journey test
npx playwright test e2e/tests/complete-passenger-journey.spec.js --project=chromium

# Run with browser visible (debug mode)
npx playwright test e2e/tests/complete-passenger-journey.spec.js --headed --project=chromium

# Run with single worker for detailed logs
npx playwright test e2e/tests/complete-passenger-journey.spec.js --project=chromium --workers=1
```

**Expected**: Each test takes 5-10 minutes, logs at each step ✅

### 3️⃣ Run Complete Test Suite

```bash
# 1. Start backend and frontend first
# Terminal 1: Backend
cd Backend
npm run dev

# Terminal 2: Frontend
cd Frontend
npm run dev

# Terminal 3: Run tests
cd Frontend

# Run all Vitest
npm run test:unit

# Run all E2E (after Vitest pass)
npx playwright test e2e/tests/complete-*.spec.js --project=chromium --workers=4
```

## Test Structure

### Vitest Tests (Isolated Logic)

**Location**: `Frontend/src/{composables,utils}/__tests__/*.spec.js`

Each test file covers ONE composable or utility:

```javascript
// Example: useParticipationActions.spec.js
- handleCancelParticipation
  ├── Success: basic cancel, with refund, with penalty
  ├── Errors: trip started, trip not found
  └── Edge cases: large refunds, zero values

// Example: useTripsActions.spec.js
- handleStartTrip (success, errors, state)
- handleFinishTrip (success, errors, state)
- handleCancelTrip (success, errors, state)
- State transitions (start → finish lifecycle)

// Example: validation.spec.js
- Email validation (valid/invalid formats)
- Password strength (min 8 chars, uppercase, lowercase, number)
- Trip price (0 < price <= 500)
- Seat capacity (1 <= seats <= 8)
- Credit deduction (sufficient funds)
- Date validation (future dates only)
```

**Why Vitest First**: Fast feedback (ms), isolated logic, easy to debug.

### E2E Tests (Complete Journeys)

**Location**: `Frontend/e2e/tests/complete-*.spec.js`

Each file is ONE comprehensive journey A→Z:

```javascript
// complete-passenger-journey.spec.js (Step-by-step with logs)
Step 1: Register with initial credits
Step 2: Search for trips (multiple destinations)
Step 3: View trip details and join first trip
Step 4: Search for another trip and join (Trip B)
Step 5: View my participated trips
Step 6: Complete trip and leave review with rating
Step 7: Cancel a pending trip participation
Step 8: Verify credits changed
Step 9: Logout

// complete-driver-journey.spec.js
Step 1: Register
Step 2: Become driver (add vehicle)
Step 3: Create new trip
Step 4: View created trips and participants
Step 5: Start trip
Step 6: Finish trip
Step 7: View reviews received
Step 8: Delete trip
Step 9: Logout

// complete-review-journey.spec.js
Step 1: Login as passenger
Step 2: Navigate to completed trips
Step 3: Open completed trip
Step 4: Locate review button
Step 5: Select star rating (4 stars)
Step 6: Write review text
Step 7: Add review categories
Step 8: Submit review
Step 9: Verify review on trip page
Step 10: Verify rating on driver profile
Step 11: Check another review can be submitted
Step 12: Logout
```

**Why These Tests**: Complete business logic, real user scenarios, one test per role.

## Understanding Test Output

### Vitest Output
```
✓ useParticipationActions › handleCancelParticipation › Success › should handle basic cancellation (5ms)
✓ useParticipationActions › handleCancelParticipation › Error › should handle API error (3ms)
✓ validation › Email Validation › Valid › should accept valid email (1ms)

Passed: 75 tests
Duration: 845ms
```

### E2E Output
```
✓ [chromium] › complete-passenger-journey.spec.js › Complete Passenger Journey › Full passenger workflow (342s)

════════════════════════════════════════════════════════════
🚀 Starting Complete Passenger Journey
════════════════════════════════════════════════════════════

✓ Step 1: Registering new passenger user
  ✓ User registered: passenger-1702665234567@ecoride.test
  ✓ Initial credits: 20

✓ Step 2: Searching for available trips
  ✓ Found 12 available trips

✓ Step 3: Viewing trip details and joining Trip A
  ✓ Trip details: Paris → Lyon, €25, 2 seats
  ✓ Trip details page displayed
  ✓ Clicked join button for Trip A
  ✓ Successfully joined Trip A

...continuing through all steps...

════════════════════════════════════════════════════════════
✓ Complete Passenger Journey Test PASSED
════════════════════════════════════════════════════════════
```

## Debugging Failed Tests

### If Vitest Fails
```bash
# Run with verbose output
npm run test:unit -- --reporter=verbose

# Run specific test file
npm run test:unit -- useParticipationActions.spec.js

# Run with --inspect to debug in Node
node --inspect ./node_modules/vitest/vitest.mjs run
```

### If E2E Fails
```bash
# Run with single worker for deterministic behavior
npx playwright test e2e/tests/complete-passenger-journey.spec.js --workers=1

# Run with headed mode (see browser)
npx playwright test e2e/tests/complete-passenger-journey.spec.js --headed

# Check test output and logs
cat test-results/tests-*.json

# Use Playwright inspector
npx playwright test e2e/tests/complete-passenger-journey.spec.js --debug
```

## Key Principles

1. **Test Order**
   - Vitest first (fast feedback)
   - E2E second (full integration)

2. **One Test, One Business Logic**
   - Passenger journey = register → search → join → review → cancel → logout
   - Driver journey = register → become driver → create → start → finish → delete → logout
   - No separate tests for "can register", "can search", etc.

3. **Detailed Logging**
   - Each step logs with checkmark ✓
   - Easy to see where tests fail
   - Debugging-friendly console output

4. **Complete Flows**
   - Tests cover multiple related actions
   - If something breaks, entire flow fails
   - Goal: everything works together

## Test Data & Reset

Tests use:
- **Ephemeral emails** for E2E: `passenger-${Date.now()}@ecoride.test`
- **Global test account** for review tests: `test@test.com` / `Test2025!`
- **Reset endpoints** in backend for cleanup:
  - `POST /admin/test/reset-user` - Reset to initial state
  - `POST /admin/test/cleanup-user` - Delete completely
  - `POST /admin/test/cleanup-carpooling` - Delete trip

## Success Criteria

✅ **Vitest**: All 75+ tests pass in <1 second
✅ **E2E**: All 3 journey tests pass with detailed step logs
✅ **Integration**: Data flows correctly through entire app
✅ **Debugging**: Failed tests show exactly which step broke

## Next Steps (Post-Evaluation)

- Add E2E tests for employee/admin workflows
- Add error case E2E tests
- Performance optimization
- Multi-browser E2E validation (Firefox, Safari)
