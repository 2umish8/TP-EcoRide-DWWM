#!/usr/bin/env node

/**
 * Script de test rapide MongoDB - Vérification post-installation
 */

const mongoose = require("mongoose");
require("dotenv").config();

console.log("🔍 Vérification de MongoDB...\n");

// Test de connexion
async function testMongoDB() {
    try {
        console.log("📡 Tentative de connexion à MongoDB...");
        console.log("URI:", process.env.MONGODB_URI);

        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ MongoDB connecté avec succès !");

        // Test de création d'une collection
        const TestSchema = new mongoose.Schema({
            test: String,
            timestamp: { type: Date, default: Date.now },
        });

        const TestModel = mongoose.model("TestConnection", TestSchema);

        // Insérer un document de test
        const testDoc = new TestModel({ test: "Installation MongoDB réussie" });
        await testDoc.save();
        console.log("✅ Test d'écriture réussi !");

        // Lire le document
        const foundDoc = await TestModel.findOne({
            test: "Installation MongoDB réussie",
        });
        if (foundDoc) {
            console.log("✅ Test de lecture réussi !");
        }

        // Nettoyer
        await TestModel.deleteMany({});
        console.log("✅ Test de suppression réussi !");

        console.log("\n🎉 MongoDB est prêt pour EcoRide !");
    } catch (error) {
        console.error("❌ Erreur MongoDB:", error.message);

        if (error.message.includes("ECONNREFUSED")) {
            console.log("\n💡 Solutions possibles:");
            console.log(
                "1. Vérifier que MongoDB est démarré : net start MongoDB"
            );
            console.log("2. Ou démarrer manuellement : mongod");
            console.log("3. Vérifier le port 27017");
        }

        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Connexion fermée");
    }
}

testMongoDB();
