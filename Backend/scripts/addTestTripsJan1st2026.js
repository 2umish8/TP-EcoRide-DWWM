// Script to add test carpoolings for January 1st, 2026

const axios = require("axios");

const BASE_URL = "http://localhost:3000/api";
let authToken = "";

async function addJan1st2026Trips() {
    try {
        console.log("🚀 Adding test trips for January 1st, 2026\n");

        // 1. Login as an existing driver
        try {
            const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
                identifier: "julien.dupont@email.fr",
                password: "password123",
            });
            authToken = loginResponse.data.token;
            console.log("✅ Login successful");
            console.log("🔍 User:", loginResponse.data.user.pseudo);
        } catch (error) {
            console.log("❌ Login failed:", error.response?.data?.message || error.message);
            // Try alternative login
            console.log("\n🔄 Trying alternative login...");
            try {
                const altLogin = await axios.post(`${BASE_URL}/users/login`, {
                    identifier: "sophie.martin@email.fr",
                    password: "password123",
                });
                authToken = altLogin.data.token;
                console.log("✅ Alternative login successful");
                console.log("🔍 User:", altLogin.data.user.pseudo);
            } catch (altError) {
                console.log("❌ Alternative login also failed");
                return;
            }
        }

        const config = {
            headers: { Authorization: `Bearer ${authToken}` },
        };

        // 2. Get or create a vehicle
        let vehicleId;
        try {
            const vehiclesResponse = await axios.get(`${BASE_URL}/vehicles/my-vehicles`, config);
            if (vehiclesResponse.data.vehicles && vehiclesResponse.data.vehicles.length > 0) {
                vehicleId = vehiclesResponse.data.vehicles[0].id;
                console.log("✅ Using existing vehicle:", vehicleId);
            } else {
                throw new Error("No vehicles found");
            }
        } catch (error) {
            console.log("ℹ️ Creating new vehicle...");
            try {
                const vehicleResponse = await axios.post(
                    `${BASE_URL}/vehicles`,
                    {
                        plate_number: "JAN-2026-CD",
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

        // 3. Helper function to format date for MySQL
        function toMySQLDateTime(date) {
            return date.toISOString().slice(0, 19).replace("T", " ");
        }

        // 4. Create trips for January 1st, 2026
        // Different times throughout the day to make them realistic
        const jan1st2026 = new Date("2026-01-01T00:00:00Z");

        const trips = [
            {
                departure_address: "Paris (Gare du Nord)",
                arrival_address: "Lyon (Gare de la Perrache)",
                departure_datetime: toMySQLDateTime(
                    new Date(jan1st2026.getTime() + 8 * 60 * 60 * 1000)
                ), // 8 AM
                arrival_datetime: toMySQLDateTime(
                    new Date(jan1st2026.getTime() + 12 * 60 * 60 * 1000)
                ), // 12 PM (4 hours trip)
                price_per_passenger: 30,
                seats_offered: 3,
                vehicle_id: vehicleId,
            },
            {
                departure_address: "Marseille (Centre-ville)",
                arrival_address: "Nice (Gare de Nice)",
                departure_datetime: toMySQLDateTime(
                    new Date(jan1st2026.getTime() + 10 * 60 * 60 * 1000)
                ), // 10 AM
                arrival_datetime: toMySQLDateTime(
                    new Date(jan1st2026.getTime() + 12.5 * 60 * 60 * 1000)
                ), // 12:30 PM (2.5 hours)
                price_per_passenger: 20,
                seats_offered: 2,
                vehicle_id: vehicleId,
            },
            {
                departure_address: "Toulouse (Gare Matabiau)",
                arrival_address: "Bordeaux (Gare Saint-Jean)",
                departure_datetime: toMySQLDateTime(
                    new Date(jan1st2026.getTime() + 9 * 60 * 60 * 1000)
                ), // 9 AM
                arrival_datetime: toMySQLDateTime(
                    new Date(jan1st2026.getTime() + 11.5 * 60 * 60 * 1000)
                ), // 11:30 AM (2.5 hours)
                price_per_passenger: 18,
                seats_offered: 4,
                vehicle_id: vehicleId,
            },
            {
                departure_address: "Lille (Centre)",
                arrival_address: "Amiens (Gare du Nord)",
                departure_datetime: toMySQLDateTime(
                    new Date(jan1st2026.getTime() + 14 * 60 * 60 * 1000)
                ), // 2 PM
                arrival_datetime: toMySQLDateTime(
                    new Date(jan1st2026.getTime() + 15.5 * 60 * 60 * 1000)
                ), // 3:30 PM (1.5 hours)
                price_per_passenger: 12,
                seats_offered: 3,
                vehicle_id: vehicleId,
            },
            {
                departure_address: "Strasbourg (Gare Centrale)",
                arrival_address: "Mulhouse (Centre-ville)",
                departure_datetime: toMySQLDateTime(
                    new Date(jan1st2026.getTime() + 11 * 60 * 60 * 1000)
                ), // 11 AM
                arrival_datetime: toMySQLDateTime(
                    new Date(jan1st2026.getTime() + 12.5 * 60 * 60 * 1000)
                ), // 12:30 PM (1.5 hours)
                price_per_passenger: 15,
                seats_offered: 2,
                vehicle_id: vehicleId,
            },
            {
                departure_address: "Nantes (Centre)",
                arrival_address: "Rennes (Gare SNCF)",
                departure_datetime: toMySQLDateTime(
                    new Date(jan1st2026.getTime() + 16 * 60 * 60 * 1000)
                ), // 4 PM
                arrival_datetime: toMySQLDateTime(
                    new Date(jan1st2026.getTime() + 18 * 60 * 60 * 1000)
                ), // 6 PM (2 hours)
                price_per_passenger: 22,
                seats_offered: 3,
                vehicle_id: vehicleId,
            },
        ];

        console.log(`\n📋 Creating ${trips.length} trips for January 1st, 2026...\n`);

        let successCount = 0;
        for (let i = 0; i < trips.length; i++) {
            try {
                const response = await axios.post(`${BASE_URL}/carpoolings`, trips[i], config);
                console.log(`✅ Trip ${i + 1} created successfully`);
                console.log(`   ${trips[i].departure_address} → ${trips[i].arrival_address}`);
                console.log(`   📅 ${trips[i].departure_datetime}`);
                console.log(`   💵 ${trips[i].price_per_passenger}€ per passenger`);
                console.log(`   👥 ${trips[i].seats_offered} seats\n`);
                successCount++;
            } catch (error) {
                console.log(`❌ Error creating trip ${i + 1}:`);
                console.log(`   ${error.response?.data?.message || error.message}\n`);
            }
        }

        // 5. Display summary
        console.log(`\n📊 Summary:`);
        console.log(`   ✅ ${successCount}/${trips.length} trips created successfully`);

        // 6. Test search for January 1st trips
        console.log("\n🔍 Searching for all available carpoolings...");
        try {
            const searchResponse = await axios.get(`${BASE_URL}/carpoolings/available`);
            console.log(`✅ ${searchResponse.data.carpoolings.length} carpoolings found in total`);

            // Filter for Jan 1st 2026
            const jan1stTrips = searchResponse.data.carpoolings.filter((trip) => {
                const departureDate = new Date(trip.departure_datetime);
                return departureDate.toISOString().startsWith("2026-01-01");
            });

            console.log(`\n📅 January 1st, 2026 trips: ${jan1stTrips.length}`);
            if (jan1stTrips.length > 0) {
                jan1stTrips.forEach((trip) => {
                    console.log(
                        `   • ${trip.departure_address} → ${trip.arrival_address} (${trip.price_per_passenger}€)`
                    );
                });
            }
        } catch (searchError) {
            console.log("ℹ️ Could not search carpoolings:", searchError.message);
        }

        console.log("\n✨ Done! Test data added successfully.\n");
    } catch (error) {
        console.error("❌ General error:", error.response?.data || error.message);
    }
}

addJan1st2026Trips();
