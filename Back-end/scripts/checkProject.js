const fs = require("fs");
const path = require("path");

// Fonction pour vérifier l'existence des fichiers
function checkFile(filePath, description) {
    const exists = fs.existsSync(filePath);
    const status = exists ? "✅" : "❌";
    console.log(`${status} ${description}: ${filePath}`);
    return exists;
}

// Fonction pour vérifier la structure du projet
function checkProjectStructure() {
    console.log("🔍 Vérification de la structure du projet EcoRide Backend\n");

    const checks = [
        // Fichiers principaux
        ["server.js", "Serveur principal"],
        ["package.json", "Configuration npm"],
        [".env.example", "Exemple de configuration environnement"],
        ["README.md", "Documentation du projet"],
        ["API_DOCUMENTATION.md", "Documentation de l'API"],
        ["authMiddleware.js", "Middleware d'authentification"],

        // Configuration
        ["Config/db.js", "Configuration base de données"],

        // Controllers
        ["controllers/userController.js", "Controller utilisateurs"],
        ["controllers/vehicleController.js", "Controller véhicules"],
        ["controllers/carpoolingController.js", "Controller covoiturages"],
        ["controllers/participationController.js", "Controller participations"],
        ["controllers/creditsController.js", "Controller crédits"],
        ["controllers/adminController.js", "Controller administration"],

        // Routes
        ["routes/userRoutes.js", "Routes utilisateurs"],
        ["routes/vehicleRoutes.js", "Routes véhicules"],
        ["routes/carpoolingRoutes.js", "Routes covoiturages"],
        ["routes/participationRoutes.js", "Routes participations"],
        ["routes/creditsRoutes.js", "Routes crédits"],
        ["routes/adminRoutes.js", "Routes administration"],

        // Scripts SQL
        ["Commandes SQL/creation_base_de_donnees.sql", "Script création BDD"],
        ["Commandes SQL/insertion_donnees.sql", "Script insertion données"],

        // Scripts utilitaires
        ["scripts/generatePasswords.js", "Générateur de hash"],
        ["scripts/testAPI.js", "Tests automatisés"],
    ];

    let allFilesExist = true;

    for (const [filePath, description] of checks) {
        const exists = checkFile(filePath, description);
        if (!exists) allFilesExist = false;
    }

    console.log("\n" + "=".repeat(50));

    if (allFilesExist) {
        console.log("🎉 Tous les fichiers sont présents !");
        console.log("\n📝 Prochaines étapes :");
        console.log("1. Copier .env.example vers .env et configurer");
        console.log("2. Créer la base de données MySQL");
        console.log("3. Exécuter les scripts SQL");
        console.log("4. npm install");
        console.log("5. npm run dev");
    } else {
        console.log("⚠️  Certains fichiers sont manquants !");
    }
}

// Fonction pour vérifier le package.json
function checkPackageJson() {
    try {
        const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

        console.log("\n📦 Vérification du package.json :");

        const requiredDeps = [
            "express",
            "mysql2",
            "bcrypt",
            "jsonwebtoken",
            "cors",
            "dotenv",
        ];

        const missingDeps = requiredDeps.filter(
            (dep) => !packageJson.dependencies[dep]
        );

        if (missingDeps.length === 0) {
            console.log("✅ Toutes les dépendances requises sont présentes");
        } else {
            console.log("❌ Dépendances manquantes:", missingDeps.join(", "));
        }

        // Vérifier les scripts
        const requiredScripts = ["start", "dev", "test", "setup"];
        const missingScripts = requiredScripts.filter(
            (script) => !packageJson.scripts[script]
        );

        if (missingScripts.length === 0) {
            console.log("✅ Tous les scripts npm sont configurés");
        } else {
            console.log("❌ Scripts manquants:", missingScripts.join(", "));
        }
    } catch (error) {
        console.log(
            "❌ Erreur lors de la lecture du package.json:",
            error.message
        );
    }
}

// Exécuter les vérifications
if (require.main === module) {
    checkProjectStructure();
    checkPackageJson();
}

module.exports = { checkProjectStructure, checkPackageJson };
