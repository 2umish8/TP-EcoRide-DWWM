
const mysql = require('mysql2');

const pool = mysql.createPool({
	host: 'localhost',
	user: 'root',
	password: '761834925Misch@el',
	database: 'ecoride_db',
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0
});

// Exporter la connexion pour l'utiliser dans d'autres fichiers
module.exports = pool.promise();