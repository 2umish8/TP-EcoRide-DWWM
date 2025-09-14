// Test simple pour vérifier que Prisma fonctionne
const db = require("./Config/db.js");

async function testPrismaConnection() {
    try {
        console.log("🧪 Test de connexion Prisma...");

        // Test de connexion
        await db.$connect();
        console.log("✅ Connexion Prisma réussie");

        // Test de lecture des rôles
        const roles = await db.role.findMany();
        console.log("📋 Rôles trouvés:", roles.length);

        // Test de lecture des utilisateurs
        const userCount = await db.user.count();
        console.log("👥 Nombre d'utilisateurs:", userCount);

        // Test de lecture des véhicules
        const vehicleCount = await db.vehicle.count();
        console.log("🚗 Nombre de véhicules:", vehicleCount);

        console.log("✨ Tous les tests Prisma ont réussi !");
    } catch (error) {
        console.error("❌ Erreur lors du test Prisma:", error);
    } finally {
        await db.$disconnect();
        console.log("🔌 Connexion Prisma fermée");
        process.exit(0);
    }
}

// Lancer le test
testPrismaConnection();
