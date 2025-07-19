-- Insérer les rôles de base
INSERT INTO Role (name) VALUES ('administrateur'), ('employe'), ('chauffeur'), ('passager');

-- Insérer un utilisateur Administrateur (mot de passe = 'admin_password')
-- Le compte admin doit être créé en amont [cite: 149]
INSERT INTO User (pseudo, email, password_hash, credits) VALUES 
('admin_eco', 'admin@ecoride.com', '$2y$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 9999);
SET @admin_id = LAST_INSERT_ID();
INSERT INTO User_Role (user_id, role_id) VALUES (@admin_id, 1);

-- Insérer un utilisateur Employé (mot de passe = 'employe_password')
INSERT INTO User (pseudo, email, password_hash, credits) VALUES 
('employe_jo', 'jose@ecoride.com', '$2y$10$yyyyyyyyyyyyyyyyyyyyyyyyyyyyyy', 100);
SET @employe_id = LAST_INSERT_ID();
INSERT INTO User_Role (user_id, role_id) VALUES (@employe_id, 2);

-- Insérer un utilisateur qui est chauffeur ET passager (mot de passe = 'driver_password')
INSERT INTO User (pseudo, email, password_hash, credits) VALUES 
('Lila_conduite', 'lila@test.com', '$2y$10$zzzzzzzzzzzzzzzzzzzzzzzzzzzzzz', 50);
SET @driver_id = LAST_INSERT_ID();
INSERT INTO User_Role (user_id, role_id) VALUES (@driver_id, 3), (@driver_id, 4);

-- Insérer un utilisateur qui est juste passager (mot de passe = 'passenger_password')
INSERT INTO User (pseudo, email, password_hash) VALUES 
('Tom_pouce', 'tom@test.com', '$2y$10$aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
SET @passenger_id = LAST_INSERT_ID();
INSERT INTO User_Role (user_id, role_id) VALUES (@passenger_id, 4);

-- Insérer des marques et couleurs
INSERT INTO Brand (name) VALUES ('Renault'), ('Peugeot'), ('Tesla'), ('Volkswagen');
INSERT INTO Color (name) VALUES ('Noir'), ('Blanc'), ('Gris'), ('Bleu');

-- Insérer un véhicule pour notre chauffeur Lila
INSERT INTO Vehicle (plate_number, model, seats_available, is_electric, user_id, brand_id, color_id) VALUES
('AB-123-CD', 'Zoe', 3, TRUE, @driver_id, 1, 4);