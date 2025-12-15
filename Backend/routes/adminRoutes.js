const express = require("express");
const router = express.Router();

// Importer les fonctions du contrôleur
const {
    getPlatformStats,
    getAllUsers,
    toggleUserSuspension,
    updateUserRoles,
    getAllCarpoolings,
    moderateCarpooling,
} = require("../controllers/adminController");

// Importer les middlewares d'authentification
const { authMiddleware, requireRole } = require("../authMiddleware");

// Routes d'administration (nécessitent le rôle administrateur ou employe)
router.get("/stats", authMiddleware, requireRole(["administrateur", "employe"]), getPlatformStats);
router.get("/users", authMiddleware, requireRole(["administrateur", "employe"]), getAllUsers);
router.put(
    "/users/:id/suspension",
    authMiddleware,
    requireRole(["administrateur", "employe"]),
    toggleUserSuspension
);
router.put("/users/:id/roles", authMiddleware, requireRole(["administrateur"]), updateUserRoles);
router.get(
    "/carpoolings",
    authMiddleware,
    requireRole(["administrateur", "employe"]),
    getAllCarpoolings
);
router.post(
    "/carpoolings/:id/cancel",
    authMiddleware,
    requireRole(["administrateur", "employe"]),
    moderateCarpooling
);

// ============================================
// TEST ENDPOINTS (Development/Test only)
// ============================================
// These endpoints are for E2E test environment cleanup
// DO NOT USE IN PRODUCTION

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const Review = require("../models/Review");
const DriverPreferences = require("../models/DriverPreferences");

/**
 * POST /admin/test/reset-user
 * Reset user to initial state (keep credentials, remove driver role, reset credits)
 * Body: { email: string }
 */
router.post("/test/reset-user", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        // 1. Find user
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                vehicles: true,
                participations: {
                    include: { carpooling: true },
                },
                drivenCarpoolings: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // 2. Cancel all participations and refund credits
        for (const participation of user.participations) {
            const carpooling = participation.carpooling;

            // Refund credits
            await prisma.user.update({
                where: { id: user.id },
                data: { credits: { increment: carpooling.pricePerPerson } },
            });

            // Increment available seats
            await prisma.carpooling.update({
                where: { id: carpooling.id },
                data: { availableSeats: { increment: 1 } },
            });

            // Delete participation
            await prisma.participation.delete({
                where: { id: participation.id },
            });
        }

        // 3. Delete all trips created by this driver
        for (const carpooling of user.drivenCarpoolings) {
            // Delete all participations for this trip
            await prisma.participation.deleteMany({
                where: { carpoolingId: carpooling.id },
            });

            // Delete the trip
            await prisma.carpooling.delete({
                where: { id: carpooling.id },
            });
        }

        // 4. Remove driver role and delete vehicles
        if (user.role && user.role.includes("chauffeur")) {
            // Delete vehicles
            await prisma.vehicle.deleteMany({
                where: { userId: user.id },
            });

            // Remove driver role
            const updatedRoles = user.role.filter((r) => r !== "chauffeur");
            await prisma.user.update({
                where: { id: user.id },
                data: { role: updatedRoles.length > 0 ? updatedRoles : ["passager"] },
            });
        }

        // 5. Delete MongoDB data (reviews, preferences)
        try {
            await Review.deleteMany({ driverId: user.id });
            await DriverPreferences.deleteMany({ userId: user.id });
        } catch (mongoError) {
            console.warn("MongoDB cleanup warning:", mongoError.message);
        }

        // 6. Reset credits to 20
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { credits: 20 },
        });

        return res.json({
            success: true,
            email: updatedUser.email,
            credits: updatedUser.credits,
            role: updatedUser.role,
        });
    } catch (error) {
        console.error("Error resetting user:", error);
        return res.status(500).json({ error: "Failed to reset user", details: error.message });
    }
});

/**
 * POST /admin/test/cleanup-user
 * Delete user completely from MySQL + MongoDB
 * Body: { email: string }
 */
router.post("/test/cleanup-user", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        // 1. Find user
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                vehicles: true,
                participations: true,
                drivenCarpoolings: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // 2. Delete all participations
        await prisma.participation.deleteMany({
            where: { userId: user.id },
        });

        // 3. Delete all trips created by this driver
        for (const carpooling of user.drivenCarpoolings) {
            await prisma.participation.deleteMany({
                where: { carpoolingId: carpooling.id },
            });
            await prisma.carpooling.delete({
                where: { id: carpooling.id },
            });
        }

        // 4. Delete vehicles
        await prisma.vehicle.deleteMany({
            where: { userId: user.id },
        });

        // 5. Delete from MongoDB
        try {
            await Review.deleteMany({ driverId: user.id });
            await DriverPreferences.deleteMany({ userId: user.id });
        } catch (mongoError) {
            console.warn("MongoDB cleanup warning:", mongoError.message);
        }

        // 6. Delete user
        await prisma.user.delete({
            where: { id: user.id },
        });

        return res.json({
            success: true,
            deleted: email,
        });
    } catch (error) {
        console.error("Error cleaning up user:", error);
        return res.status(500).json({ error: "Failed to cleanup user", details: error.message });
    }
});

/**
 * POST /admin/test/cleanup-carpooling
 * Delete a trip completely and refund all participants
 * Body: { carpoolingId: number }
 */
router.post("/test/cleanup-carpooling", async (req, res) => {
    try {
        const { carpoolingId } = req.body;

        if (!carpoolingId) {
            return res.status(400).json({ error: "carpoolingId is required" });
        }

        // 1. Get trip with participations
        const trip = await prisma.carpooling.findUnique({
            where: { id: parseInt(carpoolingId) },
            include: {
                participations: {
                    include: { user: true },
                },
            },
        });

        if (!trip) {
            return res.status(404).json({ error: "Carpooling not found" });
        }

        // 2. Refund all participants
        for (const participation of trip.participations) {
            await prisma.user.update({
                where: { id: participation.userId },
                data: { credits: { increment: trip.pricePerPerson } },
            });
        }

        // 3. Delete all participations
        await prisma.participation.deleteMany({
            where: { carpoolingId: trip.id },
        });

        // 4. Delete trip
        await prisma.carpooling.delete({
            where: { id: trip.id },
        });

        return res.json({
            success: true,
            deleted: carpoolingId,
            refundedParticipants: trip.participations.length,
        });
    } catch (error) {
        console.error("Error cleaning up carpooling:", error);
        return res.status(500).json({
            error: "Failed to cleanup carpooling",
            details: error.message,
        });
    }
});

module.exports = router;
