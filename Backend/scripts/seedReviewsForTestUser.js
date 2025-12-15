/**
 * Seed script: Create real reviews for test@test.com user
 *
 * This script:
 * 1. Ensures test@test.com user exists
 * 2. Ensures test user is a driver (has driver_role)
 * 3. Creates reviewer users if they don't exist
 * 4. Creates completed carpoolings with test user as driver
 * 5. Creates participations for reviewer users
 * 6. Creates and approves reviews for the test driver
 * 7. Verifies all reviews are stored in MongoDB and have approved status
 *
 * Run with: npm run seed:reviews
 */

const { PrismaClient } = require("@prisma/client");
const Review = require("../models/Review");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

// Configuration
const TEST_USER_EMAIL = "test@test.com";
const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://localhost:27017/ecoride_reviews";
const REVIEW_COUNT = 6; // Number of reviews to create

// Sample review data
const SAMPLE_REVIEWS = [
    {
        rating: 5,
        comment:
            "Excellent chauffeur! Très ponctuel et véhicule impeccable. Conduite sécurisée et courtois.",
    },
    {
        rating: 4.5,
        comment:
            "Très bon voyage. Le chauffeur était sympathique et la route bien planifiée. Je recommande!",
    },
    {
        rating: 5,
        comment:
            "Parfait! Chauffeur réactif, véhicule propre et confortable. Exactement à l'heure.",
    },
    {
        rating: 4,
        comment:
            "Bon trajet. Petite attente au départ mais chauffeur a compensé avec une conversation agréable.",
    },
    {
        rating: 5,
        comment:
            "Super expérience! Musique agréable, température idéale, et chauffeur très professionnel.",
    },
    {
        rating: 4.5,
        comment:
            "Très satisfait. Route sans problème et chauffeur respectueux de l'environnement (écoconduite).",
    },
];

/**
 * Ensure MongoDB connection
 */
async function connectMongoDB() {
    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log("✅ MongoDB connected");
        }
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error);
        throw error;
    }
}

/**
 * Get or create test user
 */
async function getOrCreateTestUser() {
    try {
        let testUser = await prisma.user.findUnique({
            where: { email: TEST_USER_EMAIL },
            include: { roles: true },
        });

        if (testUser) {
            console.log(
                `✅ Test user found: ${testUser.pseudo} (ID: ${testUser.id})`
            );
        } else {
            // Create test user
            const hashedPassword = await bcrypt.hash("password123", 10);
            testUser = await prisma.user.create({
                data: {
                    email: TEST_USER_EMAIL,
                    pseudo: "test-driver",
                    password: hashedPassword,
                    first_name: "Test",
                    last_name: "Driver",
                    credits: 100,
                    phone_number: "+33612345678",
                },
                include: { roles: true },
            });
            console.log(`✅ Test user created: ${testUser.pseudo} (ID: ${testUser.id})`);
        }

        // Ensure user has driver role
        const driverRole = await prisma.role.findUnique({
            where: { name: "chauffeur" },
        });

        if (!driverRole) {
            console.warn(
                "⚠️  Driver role not found. Creating it..."
            );
            await prisma.role.create({
                data: { name: "chauffeur" },
            });
        }

        const hasDriverRole = testUser.roles.some((r) => r.name === "chauffeur");
        if (!hasDriverRole) {
            await prisma.user.update({
                where: { id: testUser.id },
                data: {
                    roles: {
                        connect: { name: "chauffeur" },
                    },
                },
            });
            console.log(`✅ Driver role added to test user`);
        }

        return testUser;
    } catch (error) {
        console.error("❌ Error with test user:", error);
        throw error;
    }
}

/**
 * Get or create reviewer users
 */
async function getOrCreateReviewers(count) {
    try {
        const reviewers = [];

        for (let i = 1; i <= count; i++) {
            const email = `reviewer${i}@test.com`;
            let reviewer = await prisma.user.findUnique({
                where: { email },
            });

            if (!reviewer) {
                const hashedPassword = await bcrypt.hash("password123", 10);
                reviewer = await prisma.user.create({
                    data: {
                        email,
                        pseudo: `reviewer-${i}`,
                        password: hashedPassword,
                        first_name: `Reviewer`,
                        last_name: `User${i}`,
                        credits: 100,
                        phone_number: `+336123456${String(i).padStart(2, "0")}`,
                    },
                });
                console.log(`✅ Reviewer created: ${email} (ID: ${reviewer.id})`);
            } else {
                console.log(`✅ Reviewer found: ${email} (ID: ${reviewer.id})`);
            }

            reviewers.push(reviewer);
        }

        return reviewers;
    } catch (error) {
        console.error("❌ Error with reviewers:", error);
        throw error;
    }
}

/**
 * Create completed carpoolings with test user as driver
 */
async function createCompletedCarpoolings(testUser, reviewerCount) {
    try {
        const carpoolings = [];
        const now = new Date();

        for (let i = 1; i <= reviewerCount; i++) {
            // Create carpooling
            const departureTime = new Date(now);
            departureTime.setDate(departureTime.getDate() - 7 + i); // Past dates
            departureTime.setHours(10, 0, 0, 0);

            const carpooling = await prisma.carpooling.create({
                data: {
                    driver_id: testUser.id,
                    departure_location: `Paris - Location ${i}`,
                    arrival_location: `Lyon - Destination ${i}`,
                    departure_time: departureTime,
                    estimated_duration: 120 + i * 10, // minutes
                    seats_available: 3,
                    price_per_seat: 25 + i,
                    vehicle_id: null, // Optional
                    status: "terminé", // IMPORTANT: Must be completed for reviews
                    preferences: null,
                },
            });

            carpoolings.push(carpooling);
            console.log(
                `✅ Carpooling created: ID ${carpooling.id} (${carpooling.departure_location} → ${carpooling.arrival_location})`
            );
        }

        return carpoolings;
    } catch (error) {
        console.error("❌ Error creating carpoolings:", error);
        throw error;
    }
}

/**
 * Create participations for reviewers in carpoolings
 */
async function createParticipations(carpoolings, reviewers) {
    try {
        for (let i = 0; i < carpoolings.length; i++) {
            const carpooling = carpoolings[i];
            const reviewer = reviewers[i];

            const participation = await prisma.participation.create({
                data: {
                    passenger_id: reviewer.id,
                    carpooling_id: carpooling.id,
                    status: "confirmé",
                    booking_date: new Date(
                        carpooling.departure_time.getTime() - 24 * 60 * 60 * 1000
                    ), // 1 day before
                    cancellation_date: null,
                },
            });

            console.log(
                `✅ Participation created: Reviewer ${reviewer.id} → Carpooling ${carpooling.id}`
            );
        }
    } catch (error) {
        console.error("❌ Error creating participations:", error);
        throw error;
    }
}

/**
 * Create and approve reviews in MongoDB
 */
async function createApprovedReviews(testUser, reviewers, carpoolings) {
    try {
        const createdReviews = [];

        for (let i = 0; i < Math.min(reviewers.length, SAMPLE_REVIEWS.length); i++) {
            const reviewer = reviewers[i];
            const carpooling = carpoolings[i];
            const reviewData = SAMPLE_REVIEWS[i];

            // Create review directly in MongoDB
            const review = new Review({
                reviewerId: reviewer.id,
                reviewedUserId: testUser.id, // Reviews are for the test user (driver)
                carpoolingId: carpooling.id,
                rating: reviewData.rating,
                comment: reviewData.comment,
                validationStatus: "approved", // Auto-approve for testing
                validatedBy: 1, // System/admin validation
                validatedAt: new Date(),
                isReported: false,
                reportReason: null,
                createdAt: carpooling.departure_time,
                updatedAt: new Date(),
            });

            await review.save();
            createdReviews.push(review);
            console.log(
                `✅ Review created & approved: ${reviewer.pseudo} → Driver (${review.rating} ⭐)`
            );
        }

        return createdReviews;
    } catch (error) {
        console.error("❌ Error creating reviews:", error);
        throw error;
    }
}

/**
 * Verify reviews in MongoDB
 */
async function verifyReviews(testUser) {
    try {
        const stats = await Review.getAverageRating(testUser.id);
        console.log(
            `\n📊 Review Statistics for ${testUser.pseudo}:`,
            stats
        );

        const reviews = await Review.find({
            reviewedUserId: testUser.id,
            validationStatus: "approved",
        });

        console.log(`\n📋 Reviews in Database: ${reviews.length}`);
        reviews.forEach((review, index) => {
            console.log(
                `  ${index + 1}. [${review.rating}⭐] from Reviewer ${review.reviewerId} on Carpooling ${review.carpoolingId}`
            );
            if (review.comment) {
                console.log(`     "${review.comment}"`);
            }
        });

        return reviews;
    } catch (error) {
        console.error("❌ Error verifying reviews:", error);
        throw error;
    }
}

/**
 * Main execution
 */
async function main() {
    console.log("🚀 Starting Review Seed Script");
    console.log(`📧 Target user: ${TEST_USER_EMAIL}`);
    console.log(`📝 Reviews to create: ${REVIEW_COUNT}\n`);

    try {
        // Connect to MongoDB
        await connectMongoDB();

        // Get or create test user
        const testUser = await getOrCreateTestUser();

        // Get or create reviewer users
        const reviewers = await getOrCreateReviewers(REVIEW_COUNT);

        // Create completed carpoolings
        const carpoolings = await createCompletedCarpoolings(
            testUser,
            REVIEW_COUNT
        );

        // Create participations
        await createParticipations(carpoolings, reviewers);

        // Create and approve reviews
        const reviews = await createApprovedReviews(
            testUser,
            reviewers,
            carpoolings
        );

        // Verify everything
        console.log("\n✨ Verification:");
        await verifyReviews(testUser);

        console.log("\n✅ Review seed script completed successfully!");
        console.log(
            `\n📌 Next steps:`
        );
        console.log(
            `   1. Start backend: cd Backend && npm run dev`
        );
        console.log(
            `   2. Call API: GET http://localhost:3000/api/users/${testUser.id}`
        );
        console.log(
            `   3. Verify 'reviews' array in response contains ${REVIEW_COUNT} approved reviews`
        );
    } catch (error) {
        console.error("\n❌ Script failed:", error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        await mongoose.disconnect();
        console.log("\n🔐 Connections closed");
    }
}

// Execute if run directly
if (require.main === module) {
    main();
}

module.exports = { seedReviewsForTestUser: main };
