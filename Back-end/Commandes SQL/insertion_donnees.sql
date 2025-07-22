-- Insérer un utilisateur Administrateur (mot de passe = 'admin_password')
-- Le compte admin doit être créé en amont [cite: 149]
INSERT INTO User (pseudo, email, password_hash, credits) VALUES 
('admin_eco', 'admin@ecoride.com', '$2b$10$8eAkSGue9Raab4nBRiM86Oj69FOo95Td3Gfcp2omHmNfKe5yLNS9e', 9999);
SET @admin_id = LAST_INSERT_ID();
INSERT INTO User_Role (user_id, role_id) VALUES (@admin_id, 1);

-- Insérer un utilisateur Employé (mot de passe = 'employe_password')
INSERT INTO User (pseudo, email, password_hash, credits) VALUES 
('employe_jo', 'jose@ecoride.com', '$2b$10$z0TAmq6OknuKbL6XNxwzxefYzby4rLQ7eChnLNGBV0FaGHZBWxv2i', 100);
SET @employe_id = LAST_INSERT_ID();
INSERT INTO User_Role (user_id, role_id) VALUES (@employe_id, 2);

-- Insérer un utilisateur qui est chauffeur ET passager (mot de passe = 'driver_password')
INSERT INTO User (pseudo, email, password_hash, credits) VALUES 
('Lila_conduite', 'lila@test.com', '$2b$10$SB9JilJUGNnlgm1QM6LwDuYWmAfc45xbNVaf1FQm.uWRC/wPR2oSu', 50);
SET @driver_id = LAST_INSERT_ID();
INSERT INTO User_Role (user_id, role_id) VALUES (@driver_id, 3), (@driver_id, 4);

-- Insérer un utilisateur qui est juste passager (mot de passe = 'passenger_password')
INSERT INTO User (pseudo, email, password_hash) VALUES 
('Tom_pouce', 'tom@test.com', '$2b$10$AETn/ug3udLD3zNXXfNl7uKmSlanG.xX.ewiYmlIpagpg3ihFyrIC');
SET @passenger_id = LAST_INSERT_ID();
INSERT INTO User_Role (user_id, role_id) VALUES (@passenger_id, 4);

-- Insérer des marques et couleurs
INSERT INTO Brand (name) VALUES ('Renault'), ('Peugeot'), ('Tesla'), ('Volkswagen');
INSERT INTO Color (name) VALUES ('Noir'), ('Blanc'), ('Gris'), ('Bleu');

-- Insérer un véhicule pour notre chauffeur Lila
INSERT INTO Vehicle (plate_number, model, seats_available, is_electric, user_id, brand_id, color_id) VALUES
('AB-123-CD', 'Zoe', 3, TRUE, @driver_id, 1, 4);