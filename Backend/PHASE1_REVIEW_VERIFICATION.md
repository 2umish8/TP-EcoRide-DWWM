# Phase 1: Backend Review Population - Verification Guide

## Overview
This guide walks through the complete backend setup for real review data and verification steps before moving to frontend integration.

## Prerequisites
- ✅ Backend is running: `cd Backend && npm run dev`
- ✅ MySQL database is running and initialized
- ✅ MongoDB is running and accessible
- ✅ Node.js dependencies installed: `cd Backend && npm install`

## Phase 1 Execution

### Step 1: Run the Integration Tests

Verify that the review system can create, approve, and query reviews:

```bash
cd Backend
npm run test:reviews
```

**Expected Output:**
```
🧪 REVIEW WORKFLOW INTEGRATION TESTS
====================================
✅ TEST 1: Review Creation with Validation
   ✅ Valid review created
   ✅ Invalid rating rejected (rating > 5)
   ✅ Duplicate review rejected (unique index enforced)

✅ TEST 2: Review Approval/Moderation
   ✅ Review created with status: pending
   ✅ Review approved
   ✅ Approval verified in database

✅ TEST 3: Pending Reviews Query
✅ TEST 4: Average Rating Calculation
✅ TEST 5: Review Pagination
✅ TEST 6: Review Data Integrity
====================================
✅ ALL TESTS PASSED!
====================================
```

**If tests fail:**
- Check MongoDB is running: `npm run mongo:test`
- Check MySQL connection: `npm run mongo:check`
- Review logs for specific error messages

### Step 2: Seed Real Review Data

Create actual reviews for the test user (`test@test.com`):

```bash
cd Backend
npm run seed:reviews
```

**Expected Output:**
```
🚀 Starting Review Seed Script
📧 Target user: test@test.com
📝 Reviews to create: 6

✅ Test user found: test-driver (ID: XX)
✅ Driver role added to test user
✅ Reviewer created: reviewer1@test.com (ID: XX)
✅ Reviewer created: reviewer2@test.com (ID: XX)
... [more reviewers]

✅ Carpooling created: ID XX (Paris - Location 1 → Lyon - Destination 1)
... [more carpoolings]

✅ Participation created: Reviewer X → Carpooling XX
... [more participations]

✅ Review created & approved: reviewer-1 → Driver (5 ⭐)
... [more reviews]

📊 Review Statistics for test-driver:
{
  average: 4.66,
  total: 6
}

📋 Reviews in Database: 6
  1. [5⭐] from Reviewer X on Carpooling XX
     "Excellent chauffeur! Très ponctuel et véhicule impeccable..."
  ... [more reviews]

✅ Review seed script completed successfully!

📌 Next steps:
   1. Start backend: cd Backend && npm run dev
   2. Call API: GET http://localhost:3000/api/users/{testUserId}
   3. Verify 'reviews' array in response contains 6 approved reviews
```

**If seed script fails:**
- Ensure MongoDB is connected and accessible
- Check MySQL has users and carpooling tables
- Review error messages for specific issues

### Step 3: Verify API Responses

#### 3a. Get Test User ID from Seed Script Output
Note the user ID from the seed script (e.g., `ID: 123`)

#### 3b. Call the User Profile Endpoint

```bash
curl -X GET "http://localhost:3000/api/users/123" \
  -H "Content-Type: application/json"
```

Or using a browser/Postman:
```
GET http://localhost:3000/api/users/123
```

**Expected Response Structure:**
```json
{
  "user": {
    "id": 123,
    "pseudo": "test-driver",
    "email": "test@test.com",
    // ... other user fields
    "roles": ["chauffeur"]
  },
  "stats": {
    "totalTrips": 0,
    "averageRating": "4.7",  // ← Real calculated average from MongoDB
    "totalReviews": 6  // ← Real count from MongoDB
  },
  "reviews": [  // ← Real reviews from MongoDB
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
    // ... more reviews (up to 10)
  ]
}
```

**Verification Checklist:**
- [ ] `stats.totalReviews` is `6` (or matching seed count)
- [ ] `stats.averageRating` is a calculated value (not hardcoded like `4.5`)
- [ ] `reviews` array has 6 items
- [ ] Each review has `rating`, `comment`, `created_at`, and `reviewer` object
- [ ] Each reviewer has `id`, `pseudo`, and `profile_picture_url`
- [ ] No "Utilisateur supprimé" (user deleted) messages in reviewer data
- [ ] Reviews are sorted by `created_at` (newest first)

#### 3c. Verify Carpooling Detail Endpoint

```bash
curl -X GET "http://localhost:3000/api/carpoolings/1" \
  -H "Content-Type: application/json"
```

**Expected Response (relevant fields):**
```json
{
  "carpooling": {
    "id": 1,
    // ... carpooling fields
    "driver_rating": 4.7,      // ← Real average from Review.getAverageRating()
    "total_reviews": 6,        // ← Real count from Review.getAverageRating()
    "driver_pseudo": "test-driver",
    "recent_reviews": [        // ← Real recent reviews
      {
        "rating": 5,
        "comment": "Excellent chauffeur!",
        "createdAt": "2025-01-14T10:00:00.000Z",
        "reviewer_pseudo": "User_124"  // Placeholder, enriched later
      },
      // ... up to 5 recent reviews
    ]
  }
}
```

**Verification Checklist:**
- [ ] `driver_rating` is real (not hardcoded `4.5`)
- [ ] `total_reviews` is real (not hardcoded `12`)
- [ ] `recent_reviews` array is populated with actual reviews
- [ ] Reviews are sorted by creation date (newest first)
- [ ] Maximum 5 reviews in `recent_reviews` array

### Step 4: MongoDB Direct Verification

Query MongoDB directly to confirm data integrity:

```bash
# In MongoDB Shell or Compass
use ecoride_reviews
db.reviews.find({ reviewedUserId: 123 })  // Replace 123 with test user ID
```

**Expected Output:**
```javascript
[
  {
    _id: ObjectId("..."),
    reviewerId: 124,
    reviewedUserId: 123,
    carpoolingId: 1,
    rating: 5,
    comment: "Excellent chauffeur!...",
    validationStatus: "approved",  // ← CRITICAL: Must be "approved"
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
- [ ] 6 documents found
- [ ] All have `validationStatus: "approved"`
- [ ] All have `reviewedUserId: 123` (test user)
- [ ] All have valid `reviewerId` values (reviewer IDs)
- [ ] All have `carpoolingId` values
- [ ] Ratings are between 1-5
- [ ] Comments are present

## Troubleshooting

### Issue: Tests fail with "MongoDB connection failed"
**Solution:**
```bash
# Verify MongoDB is running
mongosh  # or mongo
# Connect to correct database
use ecoride_reviews
exit
```

### Issue: Seed script fails with "User already exists"
**Solution:**
The script handles this gracefully. To reset test data:
```bash
# Delete test data manually (careful!)
mongosh
use ecoride_reviews
db.reviews.deleteMany({ reviewerId: { $regex: "reviewer" } })
```

### Issue: API returns `averageRating: "0.0"` and `totalReviews: 0`
**Solution:**
- Verify seed script completed successfully
- Check MongoDB connection in `getCarpoolingById` endpoint
- Ensure `Review.getAverageRating()` is working: `npm run test:reviews`

### Issue: Reviews show "Utilisateur supprimé" in reviewer name
**Solution:**
This bug is fixed in userController.js. The `reviewerInfo` map is now properly populated with reviewer data from MySQL.

## Summary: What Was Fixed

### 1. ✅ Unified Review Seed Script
- **File:** `Backend/scripts/seedReviewsForTestUser.js`
- **What it does:**
  - Creates test user `test@test.com` with driver role
  - Creates 6 reviewer users
  - Creates 6 completed carpoolings
  - Creates participations for all reviewers
  - Creates and auto-approves 6 reviews
- **Command:** `npm run seed:reviews`

### 2. ✅ Integration Tests
- **File:** `Backend/tests/reviewWorkflow.test.js`
- **Coverage:**
  - Review creation validation
  - Duplicate prevention
  - Approval/moderation flow
  - Pending review queries
  - Average rating calculation
  - Pagination
  - Data integrity
- **Command:** `npm run test:reviews`

### 3. ✅ Fixed Hardcoded Review Count
- **File:** `Backend/controllers/carpoolingController.js`
- **Before:** `driver_rating = 4.5` and `total_reviews = 12` (hardcoded)
- **After:** Uses `Review.getAverageRating()` to get real data from MongoDB
- **Change:** Line 738-751

### 4. ✅ Fixed Reviewer Info Lookup Bug
- **File:** `Backend/controllers/userController.js`
- **Before:** `reviewerInfo` object created but never populated
- **After:** Reviewer data from MySQL is now properly mapped into `reviewerInfo`
- **Change:** Line 298-316

## Next Steps: Phase 2 (Frontend)

Once Phase 1 verification is complete:
1. Create frontend component to display reviews
2. Call `GET /api/users/{userId}` endpoint
3. Map `reviews` array from API response to UI
4. Handle empty state (no reviews yet)
5. Style review cards with rating, comment, reviewer info
6. Test with multiple browsers and devices

---

**Status:** ✅ Phase 1 Complete
**Date:** December 15, 2025
**Verified By:** Backend Integration Tests + Manual API Testing
