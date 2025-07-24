const axios = require("axios");

async function testSimple() {
    try {
        console.log("🔍 Test simple de connexion à l'API");

        // Test de base - vérifier si le serveur répond
        try {
            const response = await axios.get("http://localhost:3000");
            console.log("✅ Serveur répond:", response.status);
        } catch (error) {
            console.log("❌ Serveur ne répond pas:", error.message);
            return;
        }

        // Test d'inscription simple
        const userData = {
            nom: "Test",
            prenom: "User",
            pseudo: `test_${Date.now()}`,
            email: `test_${Date.now()}@test.com`,
            password: "MotDePasse123!",
            date_naissance: "1990-01-01",
            telephone: "0123456789",
        };

        console.log("📝 Tentative d'inscription...");
        const registerResponse = await axios.post(
            "http://localhost:3000/api/users/register",
            userData
        );
        console.log("✅ Inscription réussie:", registerResponse.data.message);

        // Test de connexion
        console.log("🔐 Tentative de connexion...");
        const loginResponse = await axios.post(
            "http://localhost:3000/api/users/login",
            {
                identifier: userData.email,
                password: userData.password,
            }
        );
        console.log("✅ Connexion réussie:", loginResponse.data.message);

        console.log("🎉 Tests de base réussis!");
    } catch (error) {
        console.error("❌ Erreur:", error.response?.data || error.message);
    }
}

testSimple();
