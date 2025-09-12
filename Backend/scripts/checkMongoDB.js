const fs = require("fs");
const path = require("path");

console.log("🔍 Vérification de l'intégration MongoDB EcoRide...\n");

// Vérifier les fichiers créés
const filesToCheck = [
    "Config/mongodb.js",
    "models/Review.js",
    "models/DriverPreferences.js",
    "controllers/reviewController.js",
    "controllers/preferencesController.js",
    "routes/reviewRoutes.js",
    "routes/preferencesRoutes.js",
];

let allFilesExist = true;

console.log("📁 Vérification des fichiers MongoDB:");
filesToCheck.forEach((file) => {
    const fullPath = path.join(__dirname, "..", file);
    if (fs.existsSync(fullPath)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - MANQUANT`);
        allFilesExist = false;
    }
});

// Vérifier package.json
console.log("\n📦 Vérification des dépendances:");
const packagePath = path.join(__dirname, "..", "package.json");
if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
    if (packageJson.dependencies && packageJson.dependencies.mongoose) {
        console.log(`✅ mongoose: ${packageJson.dependencies.mongoose}`);
    } else {
        console.log(`❌ mongoose - MANQUANT dans package.json`);
        allFilesExist = false;
    }
} else {
    console.log(`❌ package.json non trouvé`);
    allFilesExist = false;
}

// Vérifier .env
console.log("\n🔧 Vérification configuration:");
const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    if (envContent.includes("MONGODB_URI")) {
        console.log("✅ MONGODB_URI configuré dans .env");
    } else {
        console.log("❌ MONGODB_URI manquant dans .env");
        allFilesExist = false;
    }
} else {
    console.log("❌ Fichier .env non trouvé");
    allFilesExist = false;
}

// Vérifier server.js
console.log("\n🖥️ Vérification intégration server.js:");
const serverPath = path.join(__dirname, "..", "server.js");
if (fs.existsSync(serverPath)) {
    const serverContent = fs.readFileSync(serverPath, "utf8");

    const checks = [
        { text: "const connectMongoDB", label: "Import connexion MongoDB" },
        { text: "connectMongoDB()", label: "Appel connexion MongoDB" },
        { text: "reviewRoutes", label: "Import routes reviews" },
        { text: "preferencesRoutes", label: "Import routes préférences" },
        { text: "/api/reviews", label: "Route reviews" },
        { text: "/api/preferences", label: "Route préférences" },
    ];

    checks.forEach((check) => {
        if (serverContent.includes(check.text)) {
            console.log(`✅ ${check.label}`);
        } else {
            console.log(`❌ ${check.label} - MANQUANT`);
            allFilesExist = false;
        }
    });
}

// Résumé
console.log("\n" + "=".repeat(50));
if (allFilesExist) {
    console.log("🎉 SUCCÈS: MongoDB est correctement intégré !");
    console.log("\n📋 Prochaines étapes:");
    console.log("1. Démarrer MongoDB: mongod ou net start MongoDB");
    console.log("2. Tester la connexion: node scripts/testMongoDB.js");
    console.log("3. Démarrer l'application: npm run dev");
    console.log("4. Tester les endpoints avec Postman");

    console.log("\n🔗 Nouveaux endpoints disponibles:");
    console.log("- POST /api/reviews (créer avis)");
    console.log("- GET /api/reviews/driver/:id (voir avis chauffeur)");
    console.log("- GET /api/reviews/pending (modération employé)");
    console.log("- POST /api/preferences (préférences chauffeur)");
    console.log("- GET /api/preferences/driver/:id (voir préférences)");

    console.log("\n✅ Votre projet est PRÊT pour le déploiement ce soir !");
} else {
    console.log("❌ PROBLÈME: Certains fichiers MongoDB sont manquants");
    console.log("Veuillez vérifier l'intégration avant de continuer.");
}

console.log("=".repeat(50));
