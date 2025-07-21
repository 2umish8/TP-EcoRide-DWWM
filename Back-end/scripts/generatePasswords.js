const bcrypt = require("bcrypt");

// Fonction pour générer des hash de mots de passe
async function generatePasswordHashes() {
    const saltRounds = 10;

    const passwords = {
        admin_password: await bcrypt.hash("admin_password", saltRounds),
        employe_password: await bcrypt.hash("employe_password", saltRounds),
        driver_password: await bcrypt.hash("driver_password", saltRounds),
        passenger_password: await bcrypt.hash("passenger_password", saltRounds),
        test123: await bcrypt.hash("test123", saltRounds),
    };

    console.log("Hash des mots de passe :");
    console.log("=========================");

    for (const [password, hash] of Object.entries(passwords)) {
        console.log(`${password}: ${hash}`);
    }
}

generatePasswordHashes().catch(console.error);
