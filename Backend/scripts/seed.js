const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function seed() {
    try {
        console.log("🌱 Seeding database...");

        // Insert Roles
        const roles = await Promise.all([
            prisma.role.upsert({
                where: { name: "admin" },
                update: {},
                create: { name: "admin" },
            }),
            prisma.role.upsert({
                where: { name: "employe" },
                update: {},
                create: { name: "employe" },
            }),
            prisma.role.upsert({
                where: { name: "chauffeur" },
                update: {},
                create: { name: "chauffeur" },
            }),
            prisma.role.upsert({
                where: { name: "passager" },
                update: {},
                create: { name: "passager" },
            }),
        ]);

        console.log("✅ Roles created");

        // Hash password for all test users
        const hashedPassword = await bcrypt.hash("Test@1234", 10);

        // Insert Users
        const users = await Promise.all([
            prisma.user.create({
                data: {
                    pseudo: "admin_eco",
                    email: "admin@ecoride.fr",
                    password_hash: hashedPassword,
                    credits: 100,
                    suspended: false,
                    profile_picture_url: "https://example.com/avatars/admin.jpg",
                    roles: {
                        create: [{ role_id: roles[0].id }],
                    },
                },
            }),
            prisma.user.create({
                data: {
                    pseudo: "marie_support",
                    email: "marie.support@ecoride.fr",
                    password_hash: hashedPassword,
                    credits: 50,
                    suspended: false,
                    profile_picture_url: "https://example.com/avatars/marie.jpg",
                    roles: {
                        create: [{ role_id: roles[1].id }],
                    },
                },
            }),
            prisma.user.create({
                data: {
                    pseudo: "paul_moderateur",
                    email: "paul.moderateur@ecoride.fr",
                    password_hash: hashedPassword,
                    credits: 50,
                    suspended: false,
                    profile_picture_url: "https://example.com/avatars/paul.jpg",
                    roles: {
                        create: [{ role_id: roles[1].id }],
                    },
                },
            }),
            prisma.user.create({
                data: {
                    pseudo: "julien_drive",
                    email: "julien.dupont@email.fr",
                    password_hash: hashedPassword,
                    credits: 35,
                    suspended: false,
                    profile_picture_url: "https://example.com/avatars/julien.jpg",
                    roles: {
                        create: [
                            { role_id: roles[2].id }, // chauffeur
                            { role_id: roles[3].id }, // passager
                        ],
                    },
                },
            }),
            prisma.user.create({
                data: {
                    pseudo: "sophie_eco",
                    email: "sophie.martin@email.fr",
                    password_hash: hashedPassword,
                    credits: 42,
                    suspended: false,
                    profile_picture_url: "https://example.com/avatars/sophie.jpg",
                    roles: {
                        create: [{ role_id: roles[2].id }, { role_id: roles[3].id }],
                    },
                },
            }),
            prisma.user.create({
                data: {
                    pseudo: "thomas_green",
                    email: "thomas.bernard@email.fr",
                    password_hash: hashedPassword,
                    credits: 28,
                    suspended: false,
                    profile_picture_url: "https://example.com/avatars/thomas.jpg",
                    roles: {
                        create: [{ role_id: roles[2].id }, { role_id: roles[3].id }],
                    },
                },
            }),
            prisma.user.create({
                data: {
                    pseudo: "claire_voyage",
                    email: "claire.dubois@email.fr",
                    password_hash: hashedPassword,
                    credits: 51,
                    suspended: false,
                    profile_picture_url: "https://example.com/avatars/claire.jpg",
                    roles: {
                        create: [{ role_id: roles[2].id }, { role_id: roles[3].id }],
                    },
                },
            }),
            prisma.user.create({
                data: {
                    pseudo: "pierre_route",
                    email: "pierre.moreau@email.fr",
                    password_hash: hashedPassword,
                    credits: 33,
                    suspended: false,
                    profile_picture_url: "https://example.com/avatars/pierre.jpg",
                    roles: {
                        create: [{ role_id: roles[2].id }, { role_id: roles[3].id }],
                    },
                },
            }),
            prisma.user.create({
                data: {
                    pseudo: "emma_traveler",
                    email: "emma.petit@email.fr",
                    password_hash: hashedPassword,
                    credits: 18,
                    suspended: false,
                    profile_picture_url: "https://example.com/avatars/emma.jpg",
                    roles: {
                        create: [{ role_id: roles[3].id }],
                    },
                },
            }),
            prisma.user.create({
                data: {
                    pseudo: "lucas_student",
                    email: "lucas.roux@email.fr",
                    password_hash: hashedPassword,
                    credits: 15,
                    suspended: false,
                    profile_picture_url: "https://example.com/avatars/lucas.jpg",
                    roles: {
                        create: [{ role_id: roles[3].id }],
                    },
                },
            }),
            prisma.user.create({
                data: {
                    pseudo: "lea_voyageuse",
                    email: "lea.simon@email.fr",
                    password_hash: hashedPassword,
                    credits: 22,
                    suspended: false,
                    profile_picture_url: "https://example.com/avatars/lea.jpg",
                    roles: {
                        create: [{ role_id: roles[3].id }],
                    },
                },
            }),
            prisma.user.create({
                data: {
                    pseudo: "marc_commuter",
                    email: "marc.lefebvre@email.fr",
                    password_hash: hashedPassword,
                    credits: 25,
                    suspended: false,
                    profile_picture_url: "https://example.com/avatars/marc.jpg",
                    roles: {
                        create: [{ role_id: roles[3].id }],
                    },
                },
            }),
            prisma.user.create({
                data: {
                    pseudo: "alice_eco",
                    email: "alice.garcia@email.fr",
                    password_hash: hashedPassword,
                    credits: 19,
                    suspended: false,
                    profile_picture_url: "https://example.com/avatars/alice.jpg",
                    roles: {
                        create: [{ role_id: roles[3].id }],
                    },
                },
            }),
            prisma.user.create({
                data: {
                    pseudo: "user_suspended",
                    email: "suspended@email.fr",
                    password_hash: hashedPassword,
                    credits: 10,
                    suspended: true,
                    profile_picture_url: null,
                    roles: {
                        create: [{ role_id: roles[3].id }],
                    },
                },
            }),
        ]);

        console.log("✅ Users created");

        // Insert Brands
        const brands = await Promise.all([
            prisma.brand.upsert({
                where: { name: "Renault" },
                update: {},
                create: { name: "Renault" },
            }),
            prisma.brand.upsert({
                where: { name: "Peugeot" },
                update: {},
                create: { name: "Peugeot" },
            }),
            prisma.brand.upsert({
                where: { name: "Citroën" },
                update: {},
                create: { name: "Citroën" },
            }),
            prisma.brand.upsert({
                where: { name: "Toyota" },
                update: {},
                create: { name: "Toyota" },
            }),
            prisma.brand.upsert({
                where: { name: "Volkswagen" },
                update: {},
                create: { name: "Volkswagen" },
            }),
            prisma.brand.upsert({ where: { name: "BMW" }, update: {}, create: { name: "BMW" } }),
            prisma.brand.upsert({
                where: { name: "Mercedes-Benz" },
                update: {},
                create: { name: "Mercedes-Benz" },
            }),
            prisma.brand.upsert({ where: { name: "Audi" }, update: {}, create: { name: "Audi" } }),
            prisma.brand.upsert({ where: { name: "Ford" }, update: {}, create: { name: "Ford" } }),
            prisma.brand.upsert({
                where: { name: "Nissan" },
                update: {},
                create: { name: "Nissan" },
            }),
            prisma.brand.upsert({
                where: { name: "Hyundai" },
                update: {},
                create: { name: "Hyundai" },
            }),
            prisma.brand.upsert({ where: { name: "Kia" }, update: {}, create: { name: "Kia" } }),
            prisma.brand.upsert({
                where: { name: "Tesla" },
                update: {},
                create: { name: "Tesla" },
            }),
        ]);

        console.log("✅ Brands created");

        // Insert Colors
        const colors = await Promise.all([
            prisma.color.upsert({
                where: { name: "Blanc" },
                update: {},
                create: { name: "Blanc" },
            }),
            prisma.color.upsert({ where: { name: "Noir" }, update: {}, create: { name: "Noir" } }),
            prisma.color.upsert({ where: { name: "Gris" }, update: {}, create: { name: "Gris" } }),
            prisma.color.upsert({ where: { name: "Bleu" }, update: {}, create: { name: "Bleu" } }),
            prisma.color.upsert({
                where: { name: "Rouge" },
                update: {},
                create: { name: "Rouge" },
            }),
            prisma.color.upsert({ where: { name: "Vert" }, update: {}, create: { name: "Vert" } }),
            prisma.color.upsert({
                where: { name: "Argent" },
                update: {},
                create: { name: "Argent" },
            }),
            prisma.color.upsert({
                where: { name: "Beige" },
                update: {},
                create: { name: "Beige" },
            }),
        ]);

        console.log("✅ Colors created");

        // Insert Vehicles
        const vehicles = await Promise.all([
            prisma.vehicle.create({
                data: {
                    plate_number: "AB-123-CD",
                    first_registration_date: new Date("2020-05-15"),
                    model: "Clio V",
                    seats_available: 4,
                    is_electric: false,
                    user_id: users[3].id, // julien_drive
                    brand_id: brands[0].id, // Renault
                    color_id: colors[0].id, // Blanc
                },
            }),
            prisma.vehicle.create({
                data: {
                    plate_number: "EF-456-GH",
                    first_registration_date: new Date("2019-03-10"),
                    model: "Zoe",
                    seats_available: 3,
                    is_electric: true,
                    user_id: users[3].id, // julien_drive
                    brand_id: brands[0].id, // Renault
                    color_id: colors[3].id, // Bleu
                },
            }),
            prisma.vehicle.create({
                data: {
                    plate_number: "IJ-789-KL",
                    first_registration_date: new Date("2021-08-22"),
                    model: "308",
                    seats_available: 4,
                    is_electric: false,
                    user_id: users[4].id, // sophie_eco
                    brand_id: brands[1].id, // Peugeot
                    color_id: colors[1].id, // Noir
                },
            }),
            prisma.vehicle.create({
                data: {
                    plate_number: "MN-012-OP",
                    first_registration_date: new Date("2018-11-30"),
                    model: "Corolla Hybrid",
                    seats_available: 4,
                    is_electric: true,
                    user_id: users[5].id, // thomas_green
                    brand_id: brands[3].id, // Toyota
                    color_id: colors[2].id, // Gris
                },
            }),
            prisma.vehicle.create({
                data: {
                    plate_number: "QR-345-ST",
                    first_registration_date: new Date("2022-01-15"),
                    model: "C3",
                    seats_available: 3,
                    is_electric: false,
                    user_id: users[6].id, // claire_voyage
                    brand_id: brands[2].id, // Citroën
                    color_id: colors[4].id, // Rouge
                },
            }),
            prisma.vehicle.create({
                data: {
                    plate_number: "UV-678-WX",
                    first_registration_date: new Date("2020-09-08"),
                    model: "Golf",
                    seats_available: 4,
                    is_electric: false,
                    user_id: users[7].id, // pierre_route
                    brand_id: brands[4].id, // Volkswagen
                    color_id: colors[6].id, // Argent
                },
            }),
            prisma.vehicle.create({
                data: {
                    plate_number: "YZ-901-AB",
                    first_registration_date: new Date("2023-04-12"),
                    model: "Model 3",
                    seats_available: 4,
                    is_electric: true,
                    user_id: users[7].id, // pierre_route
                    brand_id: brands[12].id, // Tesla
                    color_id: colors[0].id, // Blanc
                },
            }),
        ]);

        console.log("✅ Vehicles created");

// Insert Carpoolings (using future dates for testing)
    const carpoolings = await Promise.all([
      prisma.carpooling.create({
        data: {
          status: "prévu",
          departure_address: "15 Rue de la République, 69001 Lyon",
          arrival_address: "25 Avenue des Champs-Élysées, 75008 Paris",
          departure_datetime: new Date("2025-12-20T08:00:00"),
          arrival_datetime: new Date("2025-12-20T12:30:00"),
          price_per_passenger: 25,
          initial_seats_offered: 3,
          seats_remaining: 3,
          platform_commission_earned: 2,
          driver_id: users[3].id,
          vehicle_id: vehicles[0].id,
        },
      }),
      prisma.carpooling.create({
        data: {
          status: "prévu",
          departure_address: "10 Place Bellecour, 69002 Lyon",
          arrival_address: "50 Rue de Rivoli, 75001 Paris",
          departure_datetime: new Date("2025-12-22T07:30:00"),
          arrival_datetime: new Date("2025-12-22T11:45:00"),
          price_per_passenger: 30,
          initial_seats_offered: 3,
          seats_remaining: 3,
          platform_commission_earned: 2,
          driver_id: users[4].id,
          vehicle_id: vehicles[2].id,
        },
      }),
      prisma.carpooling.create({
        data: {
          status: "prévu",
          departure_address: "5 Cours Lafayette, 69003 Lyon",
          arrival_address: "12 Boulevard Saint-Germain, 75005 Paris",
          departure_datetime: new Date("2025-12-25T09:00:00"),
          arrival_datetime: new Date("2025-12-25T13:15:00"),
          price_per_passenger: 20,
          initial_seats_offered: 3,
          seats_remaining: 3,
          platform_commission_earned: 2,
          driver_id: users[5].id,
          vehicle_id: vehicles[3].id,
        },
      }),
      prisma.carpooling.create({
        data: {
          status: "prévu",
          departure_address: "30 Rue Victor Hugo, 69002 Lyon",
          arrival_address: "8 Place de la Bastille, 75011 Paris",
          departure_datetime: new Date("2025-12-28T14:00:00"),
          arrival_datetime: new Date("2025-12-28T18:30:00"),
          price_per_passenger: 22,
          initial_seats_offered: 2,
          seats_remaining: 2,
          platform_commission_earned: 2,
          driver_id: users[6].id,
          vehicle_id: vehicles[4].id,
        },
      }),
      prisma.carpooling.create({
        data: {
          status: "prévu",
          departure_address: "20 Avenue Jean Jaurès, 69007 Lyon",
          arrival_address: "15 Rue de la Paix, 75002 Paris",
          departure_datetime: new Date("2026-01-05T10:00:00"),
          arrival_datetime: new Date("2026-01-05T14:30:00"),
          price_per_passenger: 28,
          initial_seats_offered: 3,
          seats_remaining: 3,
          platform_commission_earned: 2,
          driver_id: users[7].id,
          vehicle_id: vehicles[5].id,
        },
      }),
      prisma.carpooling.create({
        data: {
          status: "prévu",
          departure_address: "100 Rue de la Part-Dieu, 69003 Lyon",
          arrival_address: "40 Avenue de l'Opéra, 75002 Paris",
          departure_datetime: new Date("2026-01-10T06:00:00"),
          arrival_datetime: new Date("2026-01-10T10:15:00"),
          price_per_passenger: 35,
          initial_seats_offered: 3,
          seats_remaining: 3,
          platform_commission_earned: 2,
          driver_id: users[3].id,
          vehicle_id: vehicles[1].id,
        },
      }),
      prisma.carpooling.create({
        data: {
          status: "terminé",
          departure_address: "45 Quai Perrache, 69002 Lyon",
          arrival_address: "22 Boulevard Haussmann, 75009 Paris",
          departure_datetime: new Date("2025-12-10T15:30:00"),
          arrival_datetime: new Date("2025-12-10T20:00:00"),
          price_per_passenger: 26,
          initial_seats_offered: 3,
          seats_remaining: 0,
          platform_commission_earned: 2,
          driver_id: users[4].id,
          vehicle_id: vehicles[2].id,
        },
      }),
      prisma.carpooling.create({
        data: {
          status: "terminé",
          departure_address: "18 Place des Terreaux, 69001 Lyon",
          arrival_address: "33 Rue du Faubourg Saint-Antoine, 75011 Paris",
          departure_datetime: new Date("2025-12-08T08:45:00"),
          arrival_datetime: new Date("2025-12-08T13:00:00"),
          price_per_passenger: 24,
          initial_seats_offered: 4,
          seats_remaining: 0,
          platform_commission_earned: 2,
          driver_id: users[7].id,
          vehicle_id: vehicles[6].id,
        },
      }),
      prisma.carpooling.create({
        data: {
          status: "annulé",
          departure_address: "25 Rue Mercière, 69002 Lyon",
          arrival_address: "18 Avenue Montaigne, 75008 Paris",
          departure_datetime: new Date("2025-12-15T16:00:00"),
          arrival_datetime: new Date("2025-12-15T20:30:00"),
                    price_per_passenger: 32,
                    initial_seats_offered: 2,
                    seats_remaining: 2,
                    platform_commission_earned: 0,
                    driver_id: users[5].id,
                    vehicle_id: vehicles[3].id,
                },
            }),
        ]);

        console.log("✅ Carpoolings created");

// Insert Participations (only for completed trips)
    await Promise.all([
      prisma.participation.create({
        data: {
          passenger_id: users[10].id, // lea_voyageuse
          carpooling_id: carpoolings[6].id,
          credits_paid: 26,
          participation_date: new Date("2025-12-09T12:00:00"),
          is_validated_by_passenger: true,
          cancellation_date: null,
        },
      }),
      prisma.participation.create({
        data: {
          passenger_id: users[11].id, // marc_commuter
          carpooling_id: carpoolings[6].id,
          credits_paid: 26,
          participation_date: new Date("2025-12-09T13:15:00"),
          is_validated_by_passenger: true,
          cancellation_date: null,
        },
      }),
      prisma.participation.create({
        data: {
          passenger_id: users[12].id, // alice_eco
          carpooling_id: carpoolings[6].id,
          credits_paid: 26,
          participation_date: new Date("2025-12-09T14:30:00"),
          is_validated_by_passenger: true,
          cancellation_date: null,
        },
      }),
      prisma.participation.create({
        data: {
          passenger_id: users[8].id, // emma_traveler
          carpooling_id: carpoolings[7].id,
          credits_paid: 24,
          participation_date: new Date("2025-12-07T16:00:00"),
          is_validated_by_passenger: true,
          cancellation_date: null,
        },
      }),
      prisma.participation.create({
        data: {
          passenger_id: users[9].id, // lucas_student
          carpooling_id: carpoolings[7].id,
          credits_paid: 24,
          participation_date: new Date("2025-12-07T17:00:00"),
          is_validated_by_passenger: true,
          cancellation_date: null,
        },
      }),
      prisma.participation.create({
        data: {
          passenger_id: users[10].id, // lea_voyageuse
          carpooling_id: carpoolings[7].id,
          credits_paid: 24,
          participation_date: new Date("2025-12-07T18:00:00"),
          is_validated_by_passenger: false,
          cancellation_date: null,
        },
      }),
      prisma.participation.create({
        data: {
          passenger_id: users[11].id, // marc_commuter
          carpooling_id: carpoolings[7].id,
          credits_paid: 24,
          participation_date: new Date("2025-12-07T19:00:00"),
          is_validated_by_passenger: true,
          cancellation_date: null,
                },
            }),
        ]);

        console.log("✅ Participations created");

        console.log("🎉 Database seeded successfully!");
    } catch (error) {
        console.error("❌ Error seeding database:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
