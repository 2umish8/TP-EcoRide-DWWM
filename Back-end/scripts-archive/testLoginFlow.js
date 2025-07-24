const axios = require("axios");

async function testLogin() {
    try {
        console.log("🔄 Test de connexion...");

        // D'abord, créons un utilisateur de test
        console.log("📝 Création d'un utilisateur de test...");

        const registerResponse = await axios.post(
            "http://localhost:3000/api/users/register",
            {
                pseudo: "testuser",
                email: "test@login.com",
                password: "761834925Misch@el",
            }
        );

        console.log("✅ Utilisateur créé:", registerResponse.data);

        // Ensuite, essayons de nous connecter
        console.log("🔐 Test de connexion...");

        const loginResponse = await axios.post(
            "http://localhost:3000/api/users/login",
            {
                identifier: "test@login.com",
                password: "761834925Misch@el",
            }
        );

        console.log("✅ Connexion réussie !");
        console.log("🎫 Token reçu:", loginResponse.data.token ? "Oui" : "Non");
        console.log("👤 Utilisateur:", loginResponse.data.user);
    } catch (error) {
        if (error.response) {
            console.log(
                "❌ Erreur API:",
                error.response.status,
                error.response.data
            );
        } else {
            console.log("❌ Erreur réseau:", error.message);
        }
    }
}

testLogin();
