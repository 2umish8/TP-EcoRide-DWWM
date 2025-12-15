const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function seedRoles() {
    try {
        const roles = ["admin", "employe", "chauffeur", "passager"];

        for (const roleName of roles) {
            const existingRole = await prisma.role.findFirst({
                where: { name: roleName },
            });

            if (!existingRole) {
                await prisma.role.create({
                    data: { name: roleName },
                });
                console.log(`✅ Rôle '${roleName}' créé`);
            } else {
                console.log(`ℹ️  Rôle '${roleName}' existe déjà`);
            }
        }

        console.log("✅ Seeding des rôles terminé");
    } catch (error) {
        console.error("❌ Erreur lors du seeding:", error);
    } finally {
        await prisma.$disconnect();
    }
}

seedRoles();
