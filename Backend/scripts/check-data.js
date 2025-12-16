const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkData() {
    try {
        const carpoolings = await prisma.carpooling.findMany({
            select: {
                id: true,
                status: true,
                departure_address: true,
                departure_datetime: true,
                seats_remaining: true,
            },
            orderBy: { id: 'asc' }
        });

        console.log("\n=== CARPOOLINGS IN DATABASE ===");
        carpoolings.forEach(c => {
            console.log(`ID: ${c.id} | Status: ${c.status} | Date: ${c.departure_datetime.toISOString()} | Seats: ${c.seats_remaining}`);
        });

        const users = await prisma.user.findMany({
            select: {
                id: true,
                pseudo: true,
                email: true,
                credits: true,
            },
        });

        console.log("\n=== USERS IN DATABASE ===");
        users.forEach(u => {
            console.log(`ID: ${u.id} | ${u.pseudo} | ${u.email} | Credits: ${u.credits}`);
        });

        console.log("\n");
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

checkData();
