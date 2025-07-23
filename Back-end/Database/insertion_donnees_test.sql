-- =============================================
-- Fichier d'insertion de données de test EcoRide
-- Date de création : 22 juillet 2025
-- =============================================

-- INSERTION DES RÔLES
INSERT INTO Role (name) VALUES 
('admin'),
('employe'),
('chauffeur'),
('passager');

-- INSERTION DES UTILISATEURS
INSERT INTO User (pseudo, email, password_hash, credits, suspended, profile_picture_url) VALUES 
-- Administrateurs
('admin_eco', 'admin@ecoride.fr', '$2b$10$8K7L9B8WT6qHo.5H8K7L9B8WT6qHo5H8K7L9B8WT6qHo5H8K7L9B8W', 100, FALSE, 'https://example.com/avatars/admin.jpg'),

-- Employés
('marie_support', 'marie.support@ecoride.fr', '$2b$10$8K7L9B8WT6qHo.5H8K7L9B8WT6qHo5H8K7L9B8WT6qHo5H8K7L9B8W', 50, FALSE, 'https://example.com/avatars/marie.jpg'),
('paul_moderateur', 'paul.moderateur@ecoride.fr', '$2b$10$8K7L9B8WT6qHo.5H8K7L9B8WT6qHo5H8K7L9B8WT6qHo5H8K7L9B8W', 50, FALSE, 'https://example.com/avatars/paul.jpg'),

-- Chauffeurs
('julien_drive', 'julien.dupont@email.fr', '$2b$10$8K7L9B8WT6qHo.5H8K7L9B8WT6qHo5H8K7L9B8WT6qHo5H8K7L9B8W', 35, FALSE, 'https://example.com/avatars/julien.jpg'),
('sophie_eco', 'sophie.martin@email.fr', '$2b$10$8K7L9B8WT6qHo.5H8K7L9B8WT6qHo5H8K7L9B8WT6qHo5H8K7L9B8W', 42, FALSE, 'https://example.com/avatars/sophie.jpg'),
('thomas_green', 'thomas.bernard@email.fr', '$2b$10$8K7L9B8WT6qHo.5H8K7L9B8WT6qHo5H8K7L9B8WT6qHo5H8K7L9B8W', 28, FALSE, 'https://example.com/avatars/thomas.jpg'),
('claire_voyage', 'claire.dubois@email.fr', '$2b$10$8K7L9B8WT6qHo.5H8K7L9B8WT6qHo5H8K7L9B8WT6qHo5H8K7L9B8W', 51, FALSE, 'https://example.com/avatars/claire.jpg'),
('pierre_route', 'pierre.moreau@email.fr', '$2b$10$8K7L9B8WT6qHo.5H8K7L9B8WT6qHo5H8K7L9B8WT6qHo5H8K7L9B8W', 33, FALSE, 'https://example.com/avatars/pierre.jpg'),

-- Passagers
('emma_traveler', 'emma.petit@email.fr', '$2b$10$8K7L9B8WT6qHo.5H8K7L9B8WT6qHo5H8K7L9B8WT6qHo5H8K7L9B8W', 18, FALSE, 'https://example.com/avatars/emma.jpg'),
('lucas_student', 'lucas.roux@email.fr', '$2b$10$8K7L9B8WT6qHo.5H8K7L9B8WT6qHo5H8K7L9B8WT6qHo5H8K7L9B8W', 15, FALSE, 'https://example.com/avatars/lucas.jpg'),
('lea_voyageuse', 'lea.simon@email.fr', '$2b$10$8K7L9B8WT6qHo.5H8K7L9B8WT6qHo5H8K7L9B8WT6qHo5H8K7L9B8W', 22, FALSE, 'https://example.com/avatars/lea.jpg'),
('marc_commuter', 'marc.lefebvre@email.fr', '$2b$10$8K7L9B8WT6qHo.5H8K7L9B8WT6qHo5H8K7L9B8WT6qHo5H8K7L9B8W', 25, FALSE, 'https://example.com/avatars/marc.jpg'),
('alice_eco', 'alice.garcia@email.fr', '$2b$10$8K7L9B8WT6qHo.5H8K7L9B8WT6qHo5H8K7L9B8WT6qHo5H8K7L9B8W', 19, FALSE, 'https://example.com/avatars/alice.jpg'),

-- Utilisateur suspendu pour les tests
('user_suspended', 'suspended@email.fr', '$2b$10$8K7L9B8WT6qHo.5H8K7L9B8WT6qHo5H8K7L9B8WT6qHo5H8K7L9B8W', 10, TRUE, NULL);

-- ATTRIBUTION DES RÔLES AUX UTILISATEURS
INSERT INTO User_Role (user_id, role_id) VALUES 
-- Admin
(1, 1), -- admin_eco -> admin

-- Employés
(2, 2), -- marie_support -> employe
(3, 2), -- paul_moderateur -> employe

-- Chauffeurs (ils peuvent aussi être passagers)
(4, 3), (4, 4), -- julien_drive -> chauffeur + passager
(5, 3), (5, 4), -- sophie_eco -> chauffeur + passager
(6, 3), (6, 4), -- thomas_green -> chauffeur + passager
(7, 3), (7, 4), -- claire_voyage -> chauffeur + passager
(8, 3), (8, 4), -- pierre_route -> chauffeur + passager

-- Passagers uniquement
(9, 4),  -- emma_traveler -> passager
(10, 4), -- lucas_student -> passager
(11, 4), -- lea_voyageuse -> passager
(12, 4), -- marc_commuter -> passager
(13, 4), -- alice_eco -> passager
(14, 4); -- user_suspended -> passager

-- INSERTION DES MARQUES DE VÉHICULES
INSERT INTO Brand (name) VALUES 
('Renault'),
('Peugeot'),
('Citroën'),
('Toyota'),
('Volkswagen'),
('BMW'),
('Mercedes-Benz'),
('Audi'),
('Ford'),
('Nissan'),
('Hyundai'),
('Kia'),
('Tesla'),
('Opel'),
('Fiat');

-- INSERTION DES COULEURS
INSERT INTO Color (name) VALUES 
('Blanc'),
('Noir'),
('Gris'),
('Bleu'),
('Rouge'),
('Vert'),
('Argent'),
('Beige'),
('Orange'),
('Jaune'),
('Violet'),
('Marron');

-- INSERTION DES VÉHICULES
INSERT INTO Vehicle (plate_number, first_registration_date, model, seats_available, is_electric, user_id, brand_id, color_id) VALUES 
-- Véhicules de julien_drive (user_id = 4)
('AB-123-CD', '2020-05-15', 'Clio V', 4, FALSE, 4, 1, 1), -- Renault Clio Blanc
('EF-456-GH', '2019-03-10', 'Zoe', 3, TRUE, 4, 1, 4),     -- Renault Zoe Bleu (électrique)

-- Véhicule de sophie_eco (user_id = 5)
('IJ-789-KL', '2021-08-22', '308', 4, FALSE, 5, 2, 2),     -- Peugeot 308 Noir

-- Véhicule de thomas_green (user_id = 6)
('MN-012-OP', '2018-11-30', 'Corolla Hybrid', 4, TRUE, 6, 4, 3), -- Toyota Corolla Gris (hybride = électrique)

-- Véhicule de claire_voyage (user_id = 7)
('QR-345-ST', '2022-01-15', 'C3', 3, FALSE, 7, 3, 5),     -- Citroën C3 Rouge

-- Véhicules de pierre_route (user_id = 8)
('UV-678-WX', '2020-09-08', 'Golf', 4, FALSE, 8, 5, 7),   -- Volkswagen Golf Argent
('YZ-901-AB', '2023-04-12', 'Model 3', 4, TRUE, 8, 13, 1); -- Tesla Model 3 Blanc (électrique)

-- INSERTION DES COVOITURAGES
INSERT INTO Carpooling (status, departure_address, arrival_address, departure_datetime, arrival_datetime, price_per_passenger, initial_seats_offered, seats_remaining, platform_commission_earned, driver_id, vehicle_id) VALUES 

-- Covoiturages prévus (futurs)
('prévu', 
 '15 Rue de la République, 69001 Lyon', 
 '25 Avenue des Champs-Élysées, 75008 Paris', 
 '2025-07-25 08:00:00', 
 '2025-07-25 12:30:00', 
 25, 3, 2, 2, 4, 1), -- julien_drive, Renault Clio

('prévu', 
 '10 Place Bellecour, 69002 Lyon', 
 '50 Rue de Rivoli, 75001 Paris', 
 '2025-07-26 07:30:00', 
 '2025-07-26 11:45:00', 
 30, 3, 3, 2, 5, 3), -- sophie_eco, Peugeot 308

('prévu', 
 '5 Cours Lafayette, 69003 Lyon', 
 '12 Boulevard Saint-Germain, 75005 Paris', 
 '2025-07-27 09:00:00', 
 '2025-07-27 13:15:00', 
 20, 3, 1, 2, 6, 4), -- thomas_green, Toyota Corolla

('prévu', 
 '30 Rue Victor Hugo, 69002 Lyon', 
 '8 Place de la Bastille, 75011 Paris', 
 '2025-07-28 14:00:00', 
 '2025-07-28 18:30:00', 
 22, 2, 2, 2, 7, 5), -- claire_voyage, Citroën C3

-- Covoiturages en cours
('démarré', 
 '20 Avenue Jean Jaurès, 69007 Lyon', 
 '15 Rue de la Paix, 75002 Paris', 
 '2025-07-22 10:00:00', 
 '2025-07-22 14:30:00', 
 28, 3, 0, 2, 8, 6), -- pierre_route, Volkswagen Golf

-- Covoiturages terminés
('terminé', 
 '100 Rue de la Part-Dieu, 69003 Lyon', 
 '40 Avenue de l'Opéra, 75002 Paris', 
 '2025-07-20 06:00:00', 
 '2025-07-20 10:15:00', 
 35, 3, 0, 2, 4, 2), -- julien_drive, Renault Zoe

('terminé', 
 '45 Quai Perrache, 69002 Lyon', 
 '22 Boulevard Haussmann, 75009 Paris', 
 '2025-07-19 15:30:00', 
 '2025-07-19 20:00:00', 
 26, 3, 0, 2, 5, 3), -- sophie_eco, Peugeot 308

('terminé', 
 '18 Place des Terreaux, 69001 Lyon', 
 '33 Rue du Faubourg Saint-Antoine, 75011 Paris', 
 '2025-07-18 08:45:00', 
 '2025-07-18 13:00:00', 
 24, 4, 0, 2, 8, 7), -- pierre_route, Tesla Model 3

-- Covoiturage annulé
('annulé', 
 '25 Rue Mercière, 69002 Lyon', 
 '18 Avenue Montaigne, 75008 Paris', 
 '2025-07-24 16:00:00', 
 '2025-07-24 20:30:00', 
 32, 2, 2, 0, 6, 4); -- thomas_green, Toyota Corolla (annulé, pas de commission)

-- INSERTION DES PARTICIPATIONS
INSERT INTO Participation (passenger_id, carpooling_id, credits_paid, participation_date, is_validated_by_passenger, cancellation_date) VALUES 

-- Participations pour le covoiturage prévu #1 (julien_drive)
(9, 1, 25, '2025-07-22 10:30:00', NULL, NULL),  -- emma_traveler

-- Participations pour le covoiturage en cours #5 (pierre_route)
(10, 5, 28, '2025-07-21 14:00:00', NULL, NULL), -- lucas_student
(11, 5, 28, '2025-07-21 15:30:00', NULL, NULL), -- lea_voyageuse
(12, 5, 28, '2025-07-21 16:45:00', NULL, NULL), -- marc_commuter

-- Participations pour le covoiturage terminé #6 (julien_drive - Renault Zoe)
(13, 6, 35, '2025-07-19 18:00:00', TRUE, NULL),  -- alice_eco (validé)
(9, 6, 35, '2025-07-19 19:15:00', TRUE, NULL),   -- emma_traveler (validé)
(10, 6, 35, '2025-07-19 20:30:00', FALSE, NULL), -- lucas_student (problème signalé)

-- Participations pour le covoiturage terminé #7 (sophie_eco)
(11, 7, 26, '2025-07-18 12:00:00', TRUE, NULL),  -- lea_voyageuse (validé)
(12, 7, 26, '2025-07-18 13:15:00', TRUE, NULL),  -- marc_commuter (validé)
(13, 7, 26, '2025-07-18 14:30:00', TRUE, NULL),  -- alice_eco (validé)

-- Participations pour le covoiturage terminé #8 (pierre_route - Tesla)
(9, 8, 24, '2025-07-17 16:00:00', TRUE, NULL),   -- emma_traveler (validé)
(10, 8, 24, '2025-07-17 17:00:00', TRUE, NULL),  -- lucas_student (validé)
(11, 8, 24, '2025-07-17 18:00:00', NULL, NULL),  -- lea_voyageuse (en attente)
(12, 8, 24, '2025-07-17 19:00:00', TRUE, NULL),  -- marc_commuter (validé)

-- Participation pour le covoiturage prévu #3 puis annulée
(13, 3, 20, '2025-07-22 12:00:00', NULL, '2025-07-22 15:00:00'); -- alice_eco (annulée)

-- =============================================
-- REQUÊTES DE VÉRIFICATION (à décommenter pour tester)
-- =============================================

-- -- Vérifier les utilisateurs et leurs rôles
-- SELECT u.pseudo, u.email, u.credits, u.suspended, GROUP_CONCAT(r.name) as roles 
-- FROM User u 
-- LEFT JOIN User_Role ur ON u.id = ur.user_id 
-- LEFT JOIN Role r ON ur.role_id = r.id 
-- GROUP BY u.id;

-- -- Vérifier les véhicules avec leurs propriétaires
-- SELECT v.plate_number, v.model, b.name as brand, c.name as color, 
--        u.pseudo as owner, v.is_electric, v.seats_available
-- FROM Vehicle v 
-- LEFT JOIN Brand b ON v.brand_id = b.id 
-- LEFT JOIN Color c ON v.color_id = c.id 
-- LEFT JOIN User u ON v.user_id = u.id;

-- -- Vérifier les covoiturages
-- SELECT c.id, c.status, c.departure_address, c.arrival_address, 
--        c.departure_datetime, c.price_per_passenger, c.seats_remaining,
--        u.pseudo as driver, v.plate_number, v.model
-- FROM Carpooling c 
-- LEFT JOIN User u ON c.driver_id = u.id 
-- LEFT JOIN Vehicle v ON c.vehicle_id = v.id 
-- ORDER BY c.departure_datetime;

-- -- Vérifier les participations
-- SELECT p.id, u.pseudo as passenger, c.departure_address, c.arrival_address,
--        p.credits_paid, p.is_validated_by_passenger, p.cancellation_date
-- FROM Participation p 
-- LEFT JOIN User u ON p.passenger_id = u.id 
-- LEFT JOIN Carpooling c ON p.carpooling_id = c.id 
-- ORDER BY p.participation_date;

-- =============================================
-- STATISTIQUES RAPIDES
-- =============================================

-- -- Nombre d'utilisateurs par rôle
-- SELECT r.name, COUNT(*) as count 
-- FROM Role r 
-- LEFT JOIN User_Role ur ON r.id = ur.role_id 
-- GROUP BY r.id, r.name;

-- -- Covoiturages par statut
-- SELECT status, COUNT(*) as count 
-- FROM Carpooling 
-- GROUP BY status;

-- -- Total des crédits dans le système
-- SELECT SUM(credits) as total_credits 
-- FROM User 
-- WHERE suspended = FALSE;
