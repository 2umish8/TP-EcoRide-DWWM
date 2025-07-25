// Charger les variables d'environnement
require("dotenv").config();

const db = require("../Config/db.js");
const mongoose = require("mongoose");

async function cleanTestData() {
    console.log("🧹 Nettoyage des données de test...\n");

    try {
        // Nettoyer les données de test MySQL
        console.log("🗃️ Nettoyage MySQL...");

        // Supprimer les participations de test
        const [participations] = await db.query(`
            DELETE p FROM participation p
            INNER JOIN user u ON p.passenger_id = u.id
            WHERE u.email LIKE '%@test.com'
        `);
        console.log(
            `   ✅ ${participations.affectedRows} participations supprimées`
        );

        // Supprimer les covoiturages de test
        const [carpoolings] = await db.query(`
            DELETE c FROM carpooling c
            INNER JOIN user u ON c.driver_id = u.id
            WHERE u.email LIKE '%@test.com'
        `);
        console.log(`   ✅ ${carpoolings.affectedRows} covoiturages supprimés`);

        // Supprimer les véhicules de test
        const [vehicles] = await db.query(`
            DELETE v FROM vehicle v
            INNER JOIN user u ON v.user_id = u.id
            WHERE u.email LIKE '%@test.com'
        `);
        console.log(`   ✅ ${vehicles.affectedRows} véhicules supprimés`);

        // Supprimer les marques créées pour les tests (si elles n'ont plus de véhicules)
        const [brands] = await db.query(`
            DELETE FROM brand 
            WHERE name IN ('Tesla', 'BMW', 'Nissan', 'Renault', 'Peugeot') 
            AND id NOT IN (SELECT DISTINCT brand_id FROM vehicle WHERE brand_id IS NOT NULL)
        `);
        console.log(`   ✅ ${brands.affectedRows} marques nettoyées`);

        // Supprimer les couleurs créées pour les tests (si elles n'ont plus de véhicules)
        const [colors] = await db.query(`
            DELETE FROM color 
            WHERE name IN ('Blanc', 'Noir', 'Rouge', 'Bleu', 'Gris') 
            AND id NOT IN (SELECT DISTINCT color_id FROM vehicle WHERE color_id IS NOT NULL)
        `);
        console.log(`   ✅ ${colors.affectedRows} couleurs nettoyées`);

        // Supprimer les rôles utilisateur de test
        const [userRoles] = await db.query(`
            DELETE ur FROM user_role ur
            INNER JOIN user u ON ur.user_id = u.id
            WHERE u.email LIKE '%@test.com'
        `);
        console.log(
            `   ✅ ${userRoles.affectedRows} rôles utilisateur supprimés`
        );

        // Supprimer les utilisateurs de test
        const [users] = await db.query(`
            DELETE FROM user WHERE email LIKE '%@test.com'
        `);
        console.log(`   ✅ ${users.affectedRows} utilisateurs supprimés`);

        console.log("✅ Nettoyage MySQL terminé\n");

        // Nettoyer les données de test MongoDB
        console.log("🍃 Nettoyage MongoDB...");

        // Connecter à MongoDB si ce n'est pas déjà fait
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(
                process.env.MONGODB_URI || "mongodb://localhost:27017/ecoride"
            );
        }

        // Supprimer les avis de test (utilisateurs avec email test)
        const Review = mongoose.model(
            "Review",
            new mongoose.Schema({}, { strict: false })
        );
        const deletedReviews = await Review.deleteMany({
            $or: [
                { reviewerEmail: /@test\.com$/ },
                { driverEmail: /@test\.com$/ },
            ],
        });
        console.log(`   ✅ ${deletedReviews.deletedCount} avis supprimés`);

        // Supprimer les préférences de test
        const DriverPreferences = mongoose.model(
            "DriverPreferences",
            new mongoose.Schema({}, { strict: false })
        );
        const deletedPrefs = await DriverPreferences.deleteMany({
            driverEmail: /@test\.com$/,
        });
        console.log(
            `   ✅ ${deletedPrefs.deletedCount} préférences supprimées`
        );

        console.log("✅ Nettoyage MongoDB terminé\n");

        console.log("🎉 Nettoyage des données de test terminé avec succès!");
    } catch (error) {
        console.error("❌ Erreur lors du nettoyage:", error);
        throw error;
    }
}

async function resetDatabase() {
    console.log("🔄 Réinitialisation complète de la base de données...\n");

    try {
        // Lire et exécuter le script de création de base
        const fs = require("fs").promises;
        const path = require("path");

        const createScript = await fs.readFile(
            path.join(
                __dirname,
                "..",
                "Commandes SQL",
                "creation_base_de_donnees.sql"
            ),
            "utf8"
        );

        // Séparer les commandes SQL
        const commands = createScript
            .split(";")
            .map((cmd) => cmd.trim())
            .filter((cmd) => cmd.length > 0);

        console.log("🗃️ Exécution du script de création de base...");
        for (const command of commands) {
            if (command.trim()) {
                await db.query(command);
            }
        }
        console.log("✅ Tables recréées");

        // Exécuter le script d'initialisation des données
        try {
            const initScript = await fs.readFile(
                path.join(
                    __dirname,
                    "..",
                    "Commandes SQL",
                    "init_base_data.sql"
                ),
                "utf8"
            );

            const initCommands = initScript
                .split(";")
                .map((cmd) => cmd.trim())
                .filter((cmd) => cmd.length > 0);

            console.log("📊 Insertion des données de base...");
            for (const command of initCommands) {
                if (command.trim()) {
                    await db.query(command);
                }
            }
            console.log("✅ Données de base insérées");
        } catch (error) {
            console.log(
                "⚠️ Script d'initialisation non trouvé ou erreur, continuons..."
            );
        }

        // Nettoyer MongoDB
        console.log("🍃 Réinitialisation MongoDB...");
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(
                process.env.MONGODB_URI || "mongodb://localhost:27017/ecoride"
            );
        }

        // Supprimer toutes les collections MongoDB
        const collections = await mongoose.connection.db
            .listCollections()
            .toArray();
        for (const collection of collections) {
            await mongoose.connection.db.dropCollection(collection.name);
            console.log(`   ✅ Collection ${collection.name} supprimée`);
        }

        console.log("🎉 Base de données réinitialisée avec succès!");
    } catch (error) {
        console.error("❌ Erreur lors de la réinitialisation:", error);
        throw error;
    }
}

// Fonction pour vérifier l'état de la base de données
async function checkDatabaseStatus() {
    console.log("🔍 Vérification de l'état de la base de données...\n");

    try {
        // Vérifier MySQL
        console.log("🗃️ Statut MySQL:");
        const [users] = await db.query("SELECT COUNT(*) as count FROM user");
        const [vehicles] = await db.query(
            "SELECT COUNT(*) as count FROM vehicle"
        );
        const [carpoolings] = await db.query(
            "SELECT COUNT(*) as count FROM carpooling"
        );
        const [participations] = await db.query(
            "SELECT COUNT(*) as count FROM participation"
        );

        console.log(`   👥 Utilisateurs: ${users[0].count}`);
        console.log(`   🚗 Véhicules: ${vehicles[0].count}`);
        console.log(`   🛣️ Covoiturages: ${carpoolings[0].count}`);
        console.log(`   🎫 Participations: ${participations[0].count}`);

        // Vérifier MongoDB
        console.log("\n🍃 Statut MongoDB:");
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(
                process.env.MONGODB_URI || "mongodb://localhost:27017/ecoride"
            );
        }

        const collections = await mongoose.connection.db
            .listCollections()
            .toArray();
        console.log(`   📚 Collections: ${collections.length}`);

        for (const collection of collections) {
            const count = await mongoose.connection.db
                .collection(collection.name)
                .countDocuments();
            console.log(`     - ${collection.name}: ${count} documents`);
        }

        console.log("\n✅ Vérification terminée");
    } catch (error) {
        console.error("❌ Erreur lors de la vérification:", error);
        throw error;
    }
}

// Exécuter selon l'argument de ligne de commande
if (require.main === module) {
    const action = process.argv[2];

    switch (action) {
        case "clean":
            cleanTestData()
                .then(() => process.exit(0))
                .catch(() => process.exit(1));
            break;
        case "reset":
            resetDatabase()
                .then(() => process.exit(0))
                .catch(() => process.exit(1));
            break;
        case "status":
            checkDatabaseStatus()
                .then(() => process.exit(0))
                .catch(() => process.exit(1));
            break;
        default:
            console.log("Usage: node cleanDatabase.js [clean|reset|status]");
            console.log("  clean  - Nettoie les données de test");
            console.log("  reset  - Réinitialise complètement la base");
            console.log("  status - Affiche l'état actuel de la base");
            process.exit(1);
    }
}

module.exports = {
    cleanTestData,
    resetDatabase,
    checkDatabaseStatus,
};
