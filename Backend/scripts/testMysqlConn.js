/* Test MySQL connection using only process.env.DATABASE_URL
   Usage: node scripts/testMysqlConn.js
*/
const mysql = require("mysql2/promise");
require("dotenv").config({
    path: require("path").join(__dirname, "..", ".env"),
});

(async () => {
    try {
        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            console.error(
                "ERROR: process.env.DATABASE_URL is not defined. Aborting."
            );
            process.exit(2);
        }

        // Mask password for logging
        console.log(
            "Using DATABASE_URL:",
            databaseUrl.replace(/:.+@/, ":****@")
        );

        // Create a connection using the full database URL
        const connection = await mysql.createConnection(databaseUrl);

        const [rows] = await connection.query("SELECT 1 as ok");
        console.log("Query result:", rows);

        await connection.end();
        console.log("Connection test completed successfully.");
        process.exit(0);
    } catch (err) {
        console.error(
            "Connection test failed:",
            err && err.message ? err.message : err
        );
        if (err && err.code) console.error("Error code:", err.code);
        process.exit(3);
    }
})();
