const mysql = require("mysql2");

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "ecoride_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Exporter la connexion pour l'utiliser dans d'autres fichiers
module.exports = pool.promise();
