require("dotenv").config();
const db = require("./Config/db.js");

async function testDatabase() {
    try {
        console.log("🔍 Test de la connexion à la base de données...");
        console.log("Variables d'environnement:");
        console.log("DB_HOST:", process.env.DB_HOST);
        console.log("DB_USER:", process.env.DB_USER);
        console.log(
            "DB_PASSWORD:",
            process.env.DB_PASSWORD ? "***défini***" : "MANQUANT"
        );
        console.log("DB_NAME:", process.env.DB_NAME);

        // Test de connexion
        const [result] = await db.query("SELECT 1 as test");
        console.log("✅ Connexion réussie:", result);

        // Test des tables
        console.log("\n📋 Vérification des tables...");
        const [tables] = await db.query("SHOW TABLES");
        console.log("Tables disponibles:", tables);

        if (tables.length === 0) {
            console.log(
                "⚠️ Aucune table trouvée ! La base de données n'est pas initialisée."
            );
            return;
        }

        // Test de la table Carpooling
        try {
            const [carpoolings] = await db.query(
                "SELECT COUNT(*) as count FROM carpooling"
            );
            console.log("📊 Nombre de covoiturages:", carpoolings[0].count);

            if (carpoolings[0].count > 0) {
                const [sample] = await db.query(
                    "SELECT * FROM carpooling LIMIT 1"
                );
                console.log("📝 Exemple de covoiturage:", sample[0]);
            }
        } catch (error) {
            console.error(
                "❌ Erreur lors de l'accès à la table Carpooling:",
                error.message
            );
        }

        // Test de la requête complète
        console.log("\n🧪 Test de la requête complexe...");
        const sql = `
            SELECT c.*, 
                   u.pseudo as driver_pseudo,
                   u.profile_picture_url as driver_photo,
                   v.model, v.plate_number, v.is_electric,
                   b.name as brand_name, 
                   col.name as color_name,
                   TIMESTAMPDIFF(MINUTE, c.departure_datetime, c.arrival_datetime) as duration_minutes
            FROM carpooling c
            INNER JOIN User u ON c.driver_id = u.id
            INNER JOIN Vehicle v ON c.vehicle_id = v.id
            LEFT JOIN Brand b ON v.brand_id = b.id
            LEFT JOIN Color col ON v.color_id = col.id
            WHERE c.status = 'prévu' AND c.seats_remaining > 0
            LIMIT 1
        `;

        const [complexResult] = await db.query(sql);
        console.log("🔍 Résultat de la requête complexe:", complexResult);
    } catch (error) {
        console.error("💥 Erreur lors du test de la base de données:");
        console.error("Message:", error.message);
        console.error("Code:", error.code);
        console.error("Stack:", error.stack);
    }

    process.exit(0);
}

testDatabase();
