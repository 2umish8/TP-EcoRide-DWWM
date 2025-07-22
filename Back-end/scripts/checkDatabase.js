const mysql = require("mysql2/promise");
require("dotenv").config();

async function checkAndCreateDatabase() {
    let connection;

    try {
        console.log("🔄 Connexion à MySQL...");

        // D'abord, se connecter sans spécifier de base de données
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        });

        console.log("✅ Connexion MySQL réussie !");

        // Vérifier si la base de données existe
        const [databases] = await connection.execute(
            `SHOW DATABASES LIKE '${process.env.DB_NAME}'`
        );

        if (databases.length === 0) {
            console.log(
                `🔄 Création de la base de données "${process.env.DB_NAME}"...`
            );
            await connection.execute(
                `CREATE DATABASE \`${process.env.DB_NAME}\``
            );
            console.log("✅ Base de données créée avec succès !");
        } else {
            console.log(
                `✅ Base de données "${process.env.DB_NAME}" existe déjà.`
            );
        }

        // Se connecter à la base de données spécifique
        await connection.changeUser({ database: process.env.DB_NAME });

        // Vérifier les tables importantes
        const [tables] = await connection.execute('SHOW TABLES LIKE "User"');

        if (tables.length === 0) {
            console.log(
                "⚠️  Tables manquantes. Veuillez exécuter le script SQL de création des tables."
            );
            console.log(
                "📁 Fichier: Back-end/Commandes SQL/creation_base_de_donnees.sql"
            );
            return false;
        } else {
            console.log("✅ Table User existe.");

            // Vérifier le contenu de la table User
            const [users] = await connection.execute(
                "SELECT COUNT(*) as count FROM User"
            );
            console.log(
                `📊 Nombre d'utilisateurs dans la base: ${users[0].count}`
            );

            return true;
        }
    } catch (error) {
        console.error(
            "❌ Erreur de connexion à la base de données:",
            error.message
        );

        if (error.code === "ER_ACCESS_DENIED_ERROR") {
            console.log(
                "🔑 Vérifiez vos identifiants MySQL dans le fichier .env"
            );
        } else if (error.code === "ECONNREFUSED") {
            console.log("🔌 MySQL n'est pas démarré. Lancez MySQL/XAMPP/WAMP");
        }

        return false;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Exécuter la vérification
checkAndCreateDatabase()
    .then((success) => {
        if (success) {
            console.log("🎉 Base de données prête à l'utilisation !");
            process.exit(0);
        } else {
            console.log("❌ Configuration de la base de données requise.");
            process.exit(1);
        }
    })
    .catch((error) => {
        console.error("💥 Erreur critique:", error);
        process.exit(1);
    });
