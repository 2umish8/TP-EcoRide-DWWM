# PHASE 1: BACKEND REVIEW POPULATION - EXECUTION CHECKLIST

## Pre-Execution Requirements

- [ ] Backend server is running: `cd Backend && npm run dev`
- [ ] MongoDB is running and accessible
- [ ] MySQL is running with EcoRide database initialized
- [ ] All Backend dependencies installed: `cd Backend && npm install`

---

## STEP 1: Run Integration Tests

**Purpose:** Verify that the review system (MongoDB, models, queries) is working correctly before seeding real data.

```bash
cd Backend
npm run test:reviews
```

**✅ Success Criteria:**
```
✅ TEST 1: Review Creation with Validation — PASSED
✅ TEST 2: Review Approval/Moderation — PASSED
✅ TEST 3: Pending Reviews Query — PASSED
✅ TEST 4: Average Rating Calculation — PASSED
✅ TEST 5: Review Pagination — PASSED
✅ TEST 6: Review Data Integrity — PASSED
✅ ALL TESTS PASSED!
```

**If tests fail:**
- Check MongoDB connection: `npm run mongo:check`
- Check MySQL: `npm run mongo:test`
- Review error messages and logs

**Checklist:**
- [ ] All 6 tests passed
- [ ] No MongoDB connection errors
- [ ] No MySQL connection errors

---

## STEP 2: Seed Test Data

**Purpose:** Create actual reviews in MongoDB for the test user (`test@test.com`) with 6 reviewers and 6 approved reviews.

```bash
cd Backend
npm run seed:reviews
```

**✅ Success Criteria:**
```
🚀 Starting Review Seed Script
📧 Target user: test@test.com
📝 Reviews to create: 6

✅ Test user found: test-driver (ID: 123)
✅ Driver role added to test user
✅ Reviewer created: reviewer1@test.com (ID: 124)
✅ Reviewer created: reviewer2@test.com (ID: 125)
... (6 reviewers total)

✅ Carpooling created: ID 1
... (6 carpoolings total)

✅ Participation created: Reviewer 124 → Carpooling 1
... (6 participations total)

✅ Review created & approved: reviewer-1 → Driver (5 ⭐)
... (6 reviews total)

📊 Review Statistics for test-driver:
{ average: 4.7, total: 6 }

📋 Reviews in Database: 6
  1. [5⭐] from Reviewer 124
  2. [4.5⭐] from Reviewer 125
  3. [5⭐] from Reviewer 126
  4. [4⭐] from Reviewer 127
  5. [5⭐] from Reviewer 128
  6. [4.5⭐] from Reviewer 129

✅ Review seed script completed successfully!
```

**Important:** Note the test user ID from the output (e.g., `123`). You'll need this for the next step.

**Checklist:**
- [ ] Seed script completes without errors
- [ ] All 6 reviewers created
- [ ] All 6 carpoolings created
- [ ] All 6 participations created
- [ ] All 6 reviews created & approved
- [ ] Test user ID noted (e.g., `123`)

---

## STEP 3: Verify User Profile API

**Purpose:** Confirm that the API returns real review data (not placeholders).

### 3.1 Get User Profile

```bash
# Replace 123 with the test user ID from seed output
curl -X GET "http://localhost:3000/api/users/123" \
  -H "Content-Type: application/json"
```

Or use Postman/Browser:
```
GET http://localhost:3000/api/users/123
```

**✅ Expected Response:**
```json
{
  "user": {
    "id": 123,
    "pseudo": "test-driver",
    "email": "test@test.com",
    "roles": ["chauffeur"]
  },
  "stats": {
    "totalTrips": 0,
    "averageRating": "4.7",        // ← REAL, not hardcoded
    "totalReviews": 6               // ← REAL, not hardcoded 12
  },
  "reviews": [                      // ← REAL reviews from MongoDB
    {
      "id": "507f1f77bcf86cd799439011",
      "rating": 5,
      "comment": "Excellent chauffeur! Très ponctuel et véhicule impeccable. Conduite sécurisée et courtois.",
      "created_at": "2025-01-14T10:00:00.000Z",
      "reviewer": {
        "id": 124,
        "pseudo": "reviewer-1",
        "profile_picture_url": null
      }
    },
    {
      "id": "507f1f77bcf86cd799439012",
      "rating": 4.5,
      "comment": "Très bon voyage. Le chauffeur était sympathique et la route bien planifiée. Je recommande!",
      "created_at": "2025-01-13T10:00:00.000Z",
      "reviewer": {
        "id": 125,
        "pseudo": "reviewer-2",
        "profile_picture_url": null
      }
    },
    // ... 4 more reviews
  ]
}
```

**Verification Checklist:**
- [ ] Response status is `200 OK`
- [ ] `stats.totalReviews` = `6` (not `12`)
- [ ] `stats.averageRating` is calculated (e.g., `"4.7"`, not hardcoded)
- [ ] `reviews` array has `6` items
- [ ] Each review has: `id`, `rating`, `comment`, `created_at`, `reviewer`
- [ ] Each reviewer has: `id`, `pseudo`, `profile_picture_url`
- [ ] No "Utilisateur supprimé" in reviewer names
- [ ] Reviews are sorted newest first (by `created_at`)

---

## STEP 4: Verify Carpooling Detail API

**Purpose:** Confirm that driver rating and recent reviews are real (not hardcoded).

```bash
# Test with carpooling ID 1 (created by seed script)
curl -X GET "http://localhost:3000/api/carpoolings/1" \
  -H "Content-Type: application/json"
```

**✅ Expected Response (relevant fields):**
```json
{
  "carpooling": {
    "id": 1,
    "driver_rating": 4.7,           // ← REAL, not hardcoded 4.5
    "total_reviews": 6,             // ← REAL, not hardcoded 12
    "driver_pseudo": "test-driver",
    "recent_reviews": [
      {
        "rating": 5,
        "comment": "Excellent chauffeur!...",
        "createdAt": "2025-01-14T10:00:00Z",
        "reviewer_pseudo": "User_124"
      },
      // ... up to 4 more reviews
    ]
  }
}
```

**Verification Checklist:**
- [ ] `driver_rating` is real (not hardcoded `4.5`)
- [ ] `total_reviews` is real (not hardcoded `12`)
- [ ] `recent_reviews` has up to 5 reviews
- [ ] Reviews are sorted newest first

---

## STEP 5: MongoDB Direct Verification (Optional)

**Purpose:** Confirm data integrity in MongoDB.

```bash
# Connect to MongoDB
mongosh

# Use the reviews database
use ecoride_reviews

# Query reviews for test user (replace 123 with actual ID)
db.reviews.find({ reviewedUserId: 123 }).pretty()
```

**✅ Expected Output:**
```javascript
[
  {
    _id: ObjectId("507f1f77bcf86cd799439011"),
    reviewerId: 124,
    reviewedUserId: 123,
    carpoolingId: 1,
    rating: 5,
    comment: "Excellent chauffeur!...",
    validationStatus: "approved",     // ← CRITICAL
    validatedBy: 1,
    validatedAt: ISODate("2025-01-14T..."),
    isReported: false,
    createdAt: ISODate("2025-01-14T..."),
    updatedAt: ISODate("2025-01-14T...")
  },
  // ... 5 more reviews
]
```

**Verification Checklist:**
- [ ] 6 documents returned
- [ ] All have `validationStatus: "approved"`
- [ ] All have correct `reviewedUserId` (test user)
- [ ] All have valid `reviewerId` (reviewer IDs)
- [ ] All have valid `carpoolingId`
- [ ] Ratings are 1-5 (including half-points like 4.5)
- [ ] Comments are present

---

## Summary: What Should Be True After Phase 1

| Feature | Before | After ✅ |
|---------|--------|---------|
| Review Count | Hardcoded `12` | Real from MongoDB: `6` |
| Driver Rating | Hardcoded `4.5` | Real calculated: `4.7` |
| Reviews List | Placeholder data | Real reviews from MongoDB |
| Reviewer Names | "Utilisateur supprimé" | Real names from MySQL |
| Recent Reviews | Hardcoded examples | Real recent reviews |
| Test Environment | None | Complete test setup |
| Test Coverage | None | 6 integration tests |

---

## Troubleshooting

### Issue: Tests fail with "MongooseError: Cannot create collection"
**Solution:** Ensure MongoDB is running
```bash
mongosh  # or mongo
# Should connect successfully
```

### Issue: Seed script creates users but no reviews appear
**Solution:** Check MongoDB connection in seed script
```bash
npm run mongo:check
```

### Issue: API returns hardcoded values (old behavior)
**Solution:** Backend server must be restarted after code changes
```bash
# Kill the running dev server (Ctrl+C)
# Then restart
npm run dev
```

### Issue: Reviews show "Utilisateur supprimé" for reviewer
**Solution:** The bug fix is in userController.js. Ensure you have the latest code and restart the server.

---

## Complete Execution Example

```bash
# 1. Navigate to backend
cd Backend

# 2. Run tests (should pass)
npm run test:reviews
# ✅ Output: ALL TESTS PASSED!

# 3. Seed data (takes ~10 seconds)
npm run seed:reviews
# ✅ Output: Review seed script completed successfully!
# 📌 Note test user ID from output

# 4. Verify via API
curl http://localhost:3000/api/users/123
# ✅ Check response has real review data

# 5. Done! Phase 1 Complete
```

**Time to Complete:** ~5 minutes
**Success Rate:** Should be 100% if all prerequisites met

---

## ✅ Phase 1 Complete Checklist

- [ ] Integration tests pass (Step 1)
- [ ] Seed script completes (Step 2)
- [ ] User profile API returns real reviews (Step 3)
- [ ] Carpooling API shows real rating and review count (Step 4)
- [ ] MongoDB has 6 approved reviews for test user (Step 5)
- [ ] No hardcoded values in responses (Verification)
- [ ] All reviewer names are real (not "Utilisateur supprimé") (Verification)

---

## Ready for Phase 2

Once all checkboxes above are ✅:

1. Frontend can call `GET /api/users/{userId}` endpoint
2. Frontend receives real review data
3. Frontend components can display reviews
4. Phase 2: Build review display component

---

**Document Version:** 1.0
**Last Updated:** December 15, 2025
**Status:** Ready for Execution
