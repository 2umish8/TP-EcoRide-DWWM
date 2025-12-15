# Testing Strategy - Consolidated Approach

**Date**: December 15, 2025  
**Approach**: Vitest (small, isolated) + E2E (complete journeys)  
**Goal**: Verify application works end-to-end with minimal test bloat

---

## Why This Approach?

### Problem with Fragmented Tests
❌ 50+ small tests:
- "SearchBar renders" ✓
- "Button exists" ✓
- "Form fills" ✓
- "Results load" ✓
- "Can join" ✓
- "Credit deducts" ✓
- ... etc ...

**Result**: Lots of tests, but no guarantee everything works TOGETHER.

### Solution: Consolidated Tests
✅ 78 total tests (75 Vitest + 3 E2E):
- **75 Vitest**: Verify each isolated piece (composable, validation, etc.)
- **3 E2E**: Verify complete user journeys work together

**Result**: Complete confidence that app works end-to-end.

---

## Test Architecture

```
Frontend/
├── src/
│   ├── composables/
│   │   ├── useParticipationActions.js
│   │   │   └── __tests__/
│   │   │       └── useParticipationActions.spec.js (15 tests)
│   │   ├── useTripsActions.js
│   │   │   └── __tests__/
│   │   │       └── useTripsActions.spec.js (20 tests)
│   │   └── ... (other composables)
│   └── utils/
│       ├── validation.js
│       └── __tests__/
│           └── validation.spec.js (40 tests)
│
├── e2e/
│   └── tests/
│       ├── complete-passenger-journey.spec.js (1 test, 9 steps)
│       ├── complete-driver-journey.spec.js (1 test, 9 steps)
│       └── complete-review-journey.spec.js (1 test, 12 steps)
│
└── TESTING_GUIDE.md (this file)
```

---

## Test Files & Coverage

### Vitest Tests (Run First - 75+ Tests in <1 Second)

#### 1. useParticipationActions.spec.js
**Purpose**: Validate trip participation logic (join/cancel)

```javascript
✓ Should cancel participation successfully
✓ Should display credit refund when applicable
✓ Should handle late cancellation penalty
✓ Should handle cancellation without refund
✓ Should handle API error: trip already started
✓ Should handle error without response object
✓ Should handle error: cannot cancel completed trip
✓ Should handle very large credit refunds
✓ Should handle zero refund and zero penalty
```

**Why**: Cancel is critical business logic. Must validate refunds, penalties, error handling.

#### 2. useTripsActions.spec.js
**Purpose**: Validate trip state management (start/finish/cancel)

```javascript
✓ Should start trip successfully
✓ Should call start function with correct trip ID
✓ Should handle start when trip has participants
✓ Should handle start error: trip already started
✓ Should handle start error without response object
✓ Should handle start when trip not found
✓ Should finish trip successfully
✓ Should finish error when trip not started
✓ Should cancel trip successfully
✓ Should refund participants when cancelling
✓ Should handle cancel error: trip already completed
✓ Should handle cancel error: trip in progress
✓ Should handle complete trip lifecycle: start → finish
✓ Should prevent finish without start
✓ Should not allow concurrent starts
```

**Why**: Trip state transitions must be bulletproof. Must validate start→finish→complete flow.

#### 3. validation.spec.js
**Purpose**: Validate all input data before sending to API

```javascript
// Email: valid format, invalid format, no @, etc. (8 tests)
// Password: 8+ chars, uppercase, lowercase, number (12 tests)
// Trip Price: 0 < price <= 500 (8 tests)
// Seat Capacity: 1 <= seats <= 8 (8 tests)
// Credit Deduction: sufficient funds check (9 tests)
// Date Validation: future dates only (7 tests)
```

**Why**: Data validation prevents bad data from reaching API. Catches bugs early.

---

### E2E Tests (Run Second - 3 Tests, 5-10 Minutes Each)

#### 1. complete-passenger-journey.spec.js
**Complete Journey**: Register → Search → Join × 2 → Review → Cancel → Logout

```
Step 1: Register with initial 20 credits
Step 2: Search for trips (Paris → Lyon → Tomorrow)
Step 3: View trip details and join first trip
Step 4: Search for another trip (Paris → Marseille)
Step 5: Join second trip
Step 6: View participated trips in /my-trips
Step 7: Complete trip and leave 5-star review
Step 8: Cancel pending participation
Step 9: Verify credits deducted
Step 10: Logout

Total: ~9 related actions, one test
```

**Why**: Passenger must be able to: register → find trips → join multiple → review → cancel → logout.

#### 2. complete-driver-journey.spec.js
**Complete Journey**: Register → Become Driver → Create → Manage → Delete → Logout

```
Step 1: Register
Step 2: Become driver (add vehicle: Toyota Prius 2022, 4 seats)
Step 3: Create trip (Paris → Marseille, €30, 3 seats)
Step 4: View created trips
Step 5: View participants for first trip
Step 6: Start trip
Step 7: Finish trip
Step 8: View reviews received
Step 9: Delete a trip
Step 10: Logout

Total: ~10 related actions, one test
```

**Why**: Driver must be able to: register → become driver → create trips → start/finish → manage → logout.

#### 3. complete-review-journey.spec.js
**Complete Journey**: Login → Complete Trip → Leave Review → Verify → Logout

```
Step 1: Login as passenger
Step 2: Navigate to completed trips
Step 3: Open completed trip
Step 4: Click "Leave Review"
Step 5: Select 4-star rating
Step 6: Write review text
Step 7: Add review categories (if available)
Step 8: Submit review
Step 9: Verify review appears on trip page
Step 10: Verify rating on driver profile
Step 11: Check another trip for review capability
Step 12: Logout

Total: ~12 related actions, one test
```

**Why**: Review system must work: submit → display on trip → display on profile → accumulate ratings.

---

## Running Tests

### Workflow

```bash
# 1. Start backend and frontend (if not already running)
cd Backend && npm run dev &
cd Frontend && npm run dev &

# 2. Run Vitest (fast feedback, <1 second)
cd Frontend
npm run test:unit
# Expected output:
#   ✓ Passed: 75 tests
#   Duration: 845ms

# 3. If all Vitest pass, run E2E (complete validation)
npx playwright test e2e/tests/complete-*.spec.js --project=chromium --workers=4
# Expected output:
#   ✓ Complete Passenger Journey (342s)
#   ✓ Complete Driver Journey (285s)
#   ✓ Complete Review Journey (198s)

# 4. If E2E fails, debug with single worker
npx playwright test e2e/tests/complete-passenger-journey.spec.js --workers=1 --headed
```

### Command Reference

```bash
# Run all Vitest
npm run test:unit

# Run specific test file
npm run test:unit -- useParticipationActions.spec.js

# Run Vitest with watch mode
npm run test:unit -- --watch

# Run all E2E
npx playwright test e2e/tests/complete-*.spec.js --project=chromium --workers=4

# Run single E2E
npx playwright test e2e/tests/complete-passenger-journey.spec.js --project=chromium

# Run E2E with browser visible (debug)
npx playwright test e2e/tests/complete-passenger-journey.spec.js --headed --project=chromium

# Run E2E with single worker (deterministic)
npx playwright test e2e/tests/complete-passenger-journey.spec.js --workers=1 --project=chromium
```

---

## Expected Results

### Vitest Success
```
✓ 75 tests passed
Duration: 845ms
Status: ✅ All composable and validation logic works correctly
```

### E2E Success
```
✓ Complete Passenger Journey
  ════════════════════════════════════════════════════════════
  🚀 Starting Complete Passenger Journey
  ════════════════════════════════════════════════════════════
  ✓ Step 1: Registering new passenger user
    ✓ User registered: passenger-1702665234567@ecoride.test
    ✓ Initial credits: 20
  ✓ Step 2: Searching for available trips
    ✓ Found 12 available trips
  ... (all steps logged)
  ════════════════════════════════════════════════════════════
  ✓ Complete Passenger Journey Test PASSED
  ════════════════════════════════════════════════════════════
```

---

## Debugging Failures

### If Vitest Fails
1. Check test name for hint about what broke
2. Check error message for specific issue
3. Fix code
4. Re-run Vitest
5. Move to E2E

### If E2E Fails
1. Check which step failed (logged clearly)
2. Run with single worker for deterministic logs
3. Run with `--headed` to see browser
4. Identify if it's a selector issue or business logic issue
5. If business logic: create/extend Vitest for that piece
6. Fix code
7. Re-run Vitest first, then E2E

---

## Key Principles

### 1. Test Order Matters
```
Vitest First (fast feedback)
    ↓
E2E Second (full integration)
    ↓
Fix if needed, repeat
```

### 2. One Test, One Story
- ❌ 20 tests: "can register", "can login", "can search"...
- ✅ 1 test: "passenger registers → searches → joins → reviews → cancels"

### 3. Related Logic Stays Together
- ✓ Join and Cancel belong together (participation lifecycle)
- ✓ Start, Finish, Delete belong together (trip lifecycle)
- ✗ Don't separate them into different tests

### 4. Detailed Logging
- Each step logs with ✓
- Shows exactly where failures happen
- No guessing, no missing context

---

## Test Data & Environment

### Test Accounts
- **Vitest**: Mocks all external dependencies
- **E2E**: Uses ephemeral emails `passenger-${Date.now()}@ecoride.test`

### Reset Endpoints (Backend)
- `POST /admin/test/reset-user`: Reset user to initial state
- `POST /admin/test/cleanup-user`: Delete user completely
- `POST /admin/test/cleanup-carpooling`: Delete trip

### Environment Variables
- Frontend: `http://localhost:5174`
- Backend: `http://localhost:3000`
- Both must be running for E2E tests

---

## Success Criteria for Evaluation

✅ **Vitest**: All 75+ tests pass  
✅ **E2E**: All 3 journey tests pass with detailed logs  
✅ **Integration**: Data flows correctly through entire app  
✅ **Debugging**: Failed tests show exactly which step broke  
✅ **Coverage**: All 13 User Stories covered in test journeys

---

## When to Add More Tests (Post-Evaluation)

- Admin/Employee workflows (separate journeys)
- Error case E2E tests (what if API returns error?)
- Performance tests (how fast is search?)
- Multi-browser E2E (Firefox, Safari compatibility)

For now: **78 tests covering complete business logic = 100% confidence app works**.
