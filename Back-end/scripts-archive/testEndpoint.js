const axios = require("axios");

async function testEndpoint() {
    try {
        console.log("🧪 Test de l'endpoint /participations/check");

        // Test sans authentification
        const response = await axios.get(
            "http://localhost:3000/api/participations/1/check"
        );
        console.log("✅ Endpoint accessible:", response.data);
    } catch (error) {
        console.log(
            "❌ Erreur:",
            error.response?.status,
            error.response?.data?.message || error.message
        );

        if (error.response?.status === 401) {
            console.log(
                "🔒 L'endpoint nécessite une authentification (normal)"
            );
        }
    }
}

testEndpoint();
