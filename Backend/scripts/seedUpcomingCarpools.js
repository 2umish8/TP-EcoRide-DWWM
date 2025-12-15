// Script to seed 50 upcoming carpools with realistic data

const axios = require("axios");

const BASE_URL = "http://localhost:3000/api";
let authToken = "";

// Popular French routes for variety
const ROUTES = [
    { departure: "Paris (Gare du Nord)", arrival: "Lyon (Gare de la Perrache)", duration: 4 },
    { departure: "Paris (Gare du Nord)", arrival: "Marseille (Gare Saint-Charles)", duration: 7 },
    {
        departure: "Lyon (Gare de la Perrache)",
        arrival: "Marseille (Gare Saint-Charles)",
        duration: 3.5,
    },
    { departure: "Paris (Montparnasse)", arrival: "Bordeaux (Gare Saint-Jean)", duration: 3 },
    { departure: "Paris (Gare de l'Est)", arrival: "Strasbourg (Gare Centrale)", duration: 4 },
    { departure: "Paris (Gare de l'Est)", arrival: "Mulhouse (Centre-ville)", duration: 5 },
    { departure: "Marseille (Centre-ville)", arrival: "Nice (Gare de Nice)", duration: 2.5 },
    { departure: "Toulouse (Gare Matabiau)", arrival: "Bordeaux (Gare Saint-Jean)", duration: 2.5 },
    {
        departure: "Toulouse (Gare Matabiau)",
        arrival: "Montpellier (Gare Saint-Roch)",
        duration: 2,
    },
    { departure: "Lille (Centre)", arrival: "Amiens (Gare du Nord)", duration: 1.5 },
    { departure: "Lille (Centre)", arrival: "Paris (Gare du Nord)", duration: 1 },
    { departure: "Nantes (Centre)", arrival: "Rennes (Gare SNCF)", duration: 2 },
    { departure: "Nantes (Centre)", arrival: "Angers (Gare Saint-Laud)", duration: 1.5 },
    { departure: "Strasbourg (Gare Centrale)", arrival: "Colmar (Centre)", duration: 1 },
    { departure: "Lyon (Parc de la Tête d'Or)", arrival: "Saint-Étienne (Gare)", duration: 1.5 },
    { departure: "Grenoble (Centre)", arrival: "Chambéry (Centre)", duration: 1.5 },
    { departure: "Monaco (Centre)", arrival: "Nice (Aéroport)", duration: 1 },
    { departure: "Cannes (Centre)", arrival: "Antibes (Centre)", duration: 1 },
    { departure: "Avignon (Gare TGV)", arrival: "Valence (Centre)", duration: 1.5 },
    { departure: "Dijon (Gare)", arrival: "Chalon-sur-Saône (Centre)", duration: 1.5 },
];

async function seedUpcomingCarpools() {
    try {
        console.log("🚀 Seeding database with 50 upcoming carpools\n");

        // 1. Login as driver
        try {
            const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
                identifier: "testeur@ecoride.com",
                password: "password123",
            });
            authToken = loginResponse.data.token;
            console.log("✅ Logged in as:", loginResponse.data.user.pseudo);
        } catch (error) {
            console.log("❌ Login failed:", error.response?.data?.message || error.message);
            return;
        }

        const config = {
            headers: { Authorization: `Bearer ${authToken}` },
        };

        // 2. Get or create vehicle
        let vehicleId;
        try {
            const vehiclesResponse = await axios.get(`${BASE_URL}/vehicles/my-vehicles`, config);
            if (vehiclesResponse.data.vehicles && vehiclesResponse.data.vehicles.length > 0) {
                vehicleId = vehiclesResponse.data.vehicles[0].id;
                console.log("✅ Using existing vehicle ID:", vehicleId);
            } else {
                throw new Error("No vehicles found");
            }
        } catch (error) {
            console.log("ℹ️ Creating new vehicle...");
            try {
                const vehicleResponse = await axios.post(
                    `${BASE_URL}/vehicles`,
                    {
                        plate_number: `SEED-${Date.now()}`,
                        model: "Tesla Model 3",
                        seats_available: 4,
                        is_electric: true,
                        brand_name: "Tesla",
                        color_name: "Blanc",
                    },
                    config
                );
                vehicleId = vehicleResponse.data.vehicleId;
                console.log("✅ Vehicle created:", vehicleId);
            } catch (createVehicleError) {
                console.log(
                    "❌ Failed to create vehicle:",
                    createVehicleError.response?.data?.message
                );
                return;
            }
        }

        // 3. Helper functions
        function toMySQLDateTime(date) {
            return date.toISOString().slice(0, 19).replace("T", " ");
        }

        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        // 4. Generate 50 carpools with varied dates and times over the next 60 days
        const carpools = [];
        const baseDate = new Date();
        baseDate.setDate(baseDate.getDate() + 1); // Start from tomorrow

        for (let i = 0; i < 50; i++) {
            // Distribute carpools across the next 60 days
            const daysOffset = getRandomInt(1, 60);
            const departureDate = new Date(baseDate);
            departureDate.setDate(departureDate.getDate() + daysOffset);

            // Random departure time between 7 AM and 7 PM
            const departureHour = getRandomInt(7, 19);
            const departureMinute = getRandomInt(0, 3) * 15; // 0, 15, 30, 45
            departureDate.setHours(departureHour, departureMinute, 0, 0);

            // Get random route
            const route = ROUTES[i % ROUTES.length];
            const arrivalDate = new Date(departureDate);
            arrivalDate.setHours(arrivalDate.getHours() + route.duration);

            // Random price based on distance (duration)
            const basePricePerHour = 8;
            const pricePerPassenger =
                Math.ceil(route.duration * basePricePerHour) + getRandomInt(-3, 3);

            // Random seat count: 2-4
            const seatsOffered = getRandomInt(2, 4);

            carpools.push({
                departure_address: route.departure,
                arrival_address: route.arrival,
                departure_datetime: toMySQLDateTime(departureDate),
                arrival_datetime: toMySQLDateTime(arrivalDate),
                price_per_passenger: Math.max(5, pricePerPassenger), // Minimum 5€
                seats_offered: seatsOffered,
                vehicle_id: vehicleId,
            });
        }

        console.log(`\n📋 Creating 50 carpools...\n`);

        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < carpools.length; i++) {
            try {
                await axios.post(`${BASE_URL}/carpoolings`, carpools[i], config);
                successCount++;

                // Display every 10th success for feedback
                if ((i + 1) % 10 === 0) {
                    console.log(`✅ ${i + 1}/50 carpools created`);
                }
            } catch (error) {
                errorCount++;
                console.log(
                    `❌ Error creating carpool ${i + 1}:`,
                    error.response?.data?.message || error.message
                );
            }
        }

        // 5. Display summary
        console.log(`\n${"═".repeat(50)}`);
        console.log(`📊 Summary:`);
        console.log(`   ✅ ${successCount}/50 carpools created successfully`);
        if (errorCount > 0) {
            console.log(`   ❌ ${errorCount} carpools failed`);
        }
        console.log(`${"═".repeat(50)}`);

        // 6. Display stats
        console.log("\n📈 Carpool Details:");
        console.log(`   • Date Range: Next 60 days`);
        console.log(`   • Routes: ${Math.min(20, ROUTES.length)} different French routes`);
        console.log(`   • Seats per carpool: 2-4`);
        console.log(`   • Prices: €5-€50 per passenger`);
        console.log(`   • Departure Times: 7 AM to 7 PM`);

        // 7. Try to search and display some carpools
        console.log("\n🔍 Fetching all available carpools...");
        try {
            const searchResponse = await axios.get(`${BASE_URL}/carpoolings/available`);
            const totalCarpools = searchResponse.data.carpoolings.length;
            console.log(`✅ Total carpools in database: ${totalCarpools}`);

            // Display a sample
            if (totalCarpools > 0) {
                const sample = searchResponse.data.carpoolings.slice(0, 5);
                console.log("\n📌 Sample of available carpools:");
                sample.forEach((carpool, idx) => {
                    const depDate = new Date(carpool.departure_datetime);
                    console.log(
                        `   ${idx + 1}. ${carpool.departure_address} → ${carpool.arrival_address}`
                    );
                    console.log(
                        `      📅 ${depDate.toLocaleDateString()} at ${depDate.toLocaleTimeString()}`
                    );
                    console.log(
                        `      💵 €${carpool.price_per_passenger}/passenger | 👥 ${carpool.seats_remaining} seats`
                    );
                });
            }
        } catch (searchError) {
            console.log("ℹ️ Could not fetch carpools:", searchError.message);
        }

        console.log("\n✨ Done! Database seeding completed.\n");
    } catch (error) {
        console.error("❌ General error:", error.response?.data || error.message);
    }
}

seedUpcomingCarpools();
