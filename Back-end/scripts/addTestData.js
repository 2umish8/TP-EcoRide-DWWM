// Script pour ajouter des données de test rapidement

const axios = require("axios");

const BASE_URL = "http://localhost:3000/api";
let authToken = "";

async function addTestData() {
    try {
        console.log("🚀 Ajout de données de test pour EcoRide\n");

        // 1. Connexion en tant qu'utilisateur existant
        try {
            const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
                identifier: "testeur@ecoride.com",
                password: "password123",
            });
            authToken = loginResponse.data.token;
            console.log("✅ Connexion réussie");
            console.log("🔍 Token reçu:", authToken.substring(0, 50) + "...");
            console.log("🔍 Données utilisateur:", loginResponse.data.user);
        } catch (error) {
            console.log("❌ Impossible de se connecter:", error.response?.data);
            return;
        }

        const config = {
            headers: { Authorization: `Bearer ${authToken}` },
        };

        // 2. Devenir chauffeur
        try {
            await axios.post(
                `${BASE_URL}/users/add-role`,
                { role: "chauffeur" },
                config
            );
            console.log("✅ Rôle chauffeur ajouté");
        } catch (error) {
            console.log(
                "ℹ️ Utilisateur déjà chauffeur ou erreur:",
                error.response?.data?.message
            );
        }

        // 3. Ajouter un véhicule
        let vehicleId;
        try {
            const vehicleResponse = await axios.post(
                `${BASE_URL}/vehicles`,
                {
                    plate_number: "AB-123-CD",
                    model: "Peugeot 308",
                    seats_available: 4,
                    is_electric: false,
                    brand_name: "Peugeot",
                    color_name: "Bleu",
                },
                config
            );
            vehicleId = vehicleResponse.data.vehicleId;
            console.log("✅ Véhicule ajouté:", vehicleId);
        } catch (error) {
            console.log(
                "ℹ️ Véhicule peut-être déjà existant:",
                error.response?.data?.message
            );
            // Récupérer les véhicules existants
            const vehiclesResponse = await axios.get(
                `${BASE_URL}/vehicles/my-vehicles`,
                config
            );
            if (vehiclesResponse.data.vehicles.length > 0) {
                vehicleId = vehiclesResponse.data.vehicles[0].id;
                console.log("✅ Utilisation du véhicule existant:", vehicleId);
            }
        }

        // 4. Créer quelques covoiturages
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        // Fonction pour convertir en format MySQL
        function toMySQLDateTime(date) {
            return date.toISOString().slice(0, 19).replace("T", " ");
        }

        const carpoolings = [
            {
                departure_address: "Paris",
                arrival_address: "Lyon",
                departure_datetime: toMySQLDateTime(tomorrow),
                arrival_datetime: toMySQLDateTime(
                    new Date(tomorrow.getTime() + 4 * 60 * 60 * 1000)
                ),
                price_per_passenger: 25,
                seats_offered: 3,
                vehicle_id: vehicleId,
            },
            {
                departure_address: "Marseille",
                arrival_address: "Nice",
                departure_datetime: toMySQLDateTime(nextWeek),
                arrival_datetime: toMySQLDateTime(
                    new Date(nextWeek.getTime() + 2.5 * 60 * 60 * 1000)
                ),
                price_per_passenger: 15,
                seats_offered: 2,
                vehicle_id: vehicleId,
            },
            {
                departure_address: "Toulouse",
                arrival_address: "Bordeaux",
                departure_datetime: toMySQLDateTime(
                    new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
                ),
                arrival_datetime: toMySQLDateTime(
                    new Date(
                        now.getTime() +
                            3 * 24 * 60 * 60 * 1000 +
                            2 * 60 * 60 * 1000
                    )
                ),
                price_per_passenger: 20,
                seats_offered: 4,
                vehicle_id: vehicleId,
            },
        ];

        for (let i = 0; i < carpoolings.length; i++) {
            try {
                const response = await axios.post(
                    `${BASE_URL}/carpoolings`,
                    carpoolings[i],
                    config
                );
                console.log(
                    `✅ Covoiturage ${i + 1} créé:`,
                    response.data.message
                );
            } catch (error) {
                console.log(
                    `❌ Erreur covoiturage ${i + 1}:`,
                    error.response?.data?.message || error.message
                );
                if (error.response?.data?.error) {
                    console.log(`   Details:`, error.response.data.error);
                }
            }
        }

        // 5. Tester la recherche
        console.log("\n🔍 Test de la recherche de covoiturages:");
        const searchResponse = await axios.get(
            `${BASE_URL}/carpoolings/available`
        );
        console.log(
            `✅ ${searchResponse.data.carpoolings.length} covoiturages trouvés`
        );

        if (searchResponse.data.carpoolings.length > 0) {
            const example = searchResponse.data.carpoolings[0];
            console.log("📋 Exemple:");
            console.log(
                `   - ${example.departure_address} → ${example.arrival_address}`
            );
            console.log(`   - Prix: ${example.price_per_passenger}€`);
            console.log(`   - Places: ${example.seats_remaining}`);
            console.log(`   - Chauffeur: ${example.driver_pseudo}`);
        }
    } catch (error) {
        console.error(
            "❌ Erreur générale:",
            error.response?.data || error.message
        );
    }
}

addTestData();
