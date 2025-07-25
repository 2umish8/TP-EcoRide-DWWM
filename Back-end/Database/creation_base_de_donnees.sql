-- =============================================
-- Script de création de la base de données EcoRide
-- Version mise à jour : 23 juillet 2025
-- Compatible avec l'implémentation actuelle
-- =============================================

-- Suppression des tables si elles existent pour repartir de zéro
DROP TABLE IF EXISTS Participation, Carpooling, Vehicle, Brand, Color, User_Role, Role, User;

-- Table pour les Rôles (admin, employe, chauffeur, passager)
CREATE TABLE Role (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Table Utilisateur
CREATE TABLE User (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pseudo VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    credits INT NOT NULL DEFAULT 20, -- Un utilisateur reçoit 20 crédits à la création [cite: 102]
    suspended BOOLEAN NOT NULL DEFAULT FALSE,
    profile_picture_url VARCHAR(255),
    creation_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table de liaison pour les rôles des utilisateurs
CREATE TABLE User_Role (
    user_id INT,
    role_id INT,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES Role(id) ON DELETE CASCADE
);

-- Table des Marques de véhicules
CREATE TABLE Brand (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- Table des Couleurs de véhicules
CREATE TABLE Color (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Table des Véhicules
CREATE TABLE Vehicle (
    id INT PRIMARY KEY AUTO_INCREMENT,
    plate_number VARCHAR(20) UNIQUE NOT NULL,
    first_registration_date DATE,
    model VARCHAR(100) NOT NULL,
    seats_available INT NOT NULL,
    is_electric BOOLEAN NOT NULL DEFAULT FALSE,
    user_id INT NOT NULL, -- Le propriétaire du véhicule
    brand_id INT,
    color_id INT,
    FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE,
    FOREIGN KEY (brand_id) REFERENCES Brand(id),
    FOREIGN KEY (color_id) REFERENCES Color(id)
);

-- Table des Covoiturages
CREATE TABLE Carpooling (
    id INT PRIMARY KEY AUTO_INCREMENT,
    status VARCHAR(50) NOT NULL DEFAULT 'prévu', -- prévu, démarré, terminé, annulé
    departure_address VARCHAR(255) NOT NULL,
    arrival_address VARCHAR(255) NOT NULL,
    departure_datetime DATETIME NOT NULL,
    arrival_datetime DATETIME NOT NULL,
    price_per_passenger INT NOT NULL,
    initial_seats_offered INT NOT NULL,
    seats_remaining INT NOT NULL,
    platform_commission_earned INT DEFAULT 2, -- La plateforme prend 2 crédits [cite: 125]
    driver_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    FOREIGN KEY (driver_id) REFERENCES User(id),
    FOREIGN KEY (vehicle_id) REFERENCES Vehicle(id)
);

-- Table des Participations (liaison entre passager et covoiturage)
CREATE TABLE Participation (
    id INT PRIMARY KEY AUTO_INCREMENT,
    passenger_id INT NOT NULL,
    carpooling_id INT NOT NULL,
    credits_paid INT NOT NULL,
    participation_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_validated_by_passenger BOOLEAN DEFAULT NULL, -- NULL = en attente, TRUE = validé, FALSE = problème
    cancellation_date DATETIME,
    FOREIGN KEY (passenger_id) REFERENCES User(id),
    FOREIGN KEY (carpooling_id) REFERENCES Carpooling(id)
);

-- =============================================
-- INSERTION DES RÔLES SYSTÈME (OBLIGATOIRE)
-- =============================================
INSERT INTO Role (name) VALUES 
('admin'),
('employe'),
('chauffeur'),
('passager');

-- =============================================
-- INDEXES POUR LES PERFORMANCES
-- =============================================

-- Index pour les recherches par email (connexions fréquentes)
CREATE INDEX idx_user_email ON User(email);

-- Index pour les recherches de covoiturages par statut et date
CREATE INDEX idx_carpooling_status ON Carpooling(status);
CREATE INDEX idx_carpooling_departure_date ON Carpooling(departure_datetime);

-- Index pour les participations par utilisateur
CREATE INDEX idx_participation_passenger ON Participation(passenger_id);
CREATE INDEX idx_participation_carpooling ON Participation(carpooling_id);

-- Index pour les véhicules par propriétaire
CREATE INDEX idx_vehicle_user ON Vehicle(user_id);

-- =============================================
-- COMMENTAIRES ET CONTRAINTES BUSINESS
-- =============================================

-- Contrainte : Les crédits ne peuvent pas être négatifs
ALTER TABLE User ADD CONSTRAINT chk_credits_positive CHECK (credits >= 0);

-- Contrainte : Le prix par passager doit être positif
ALTER TABLE Carpooling ADD CONSTRAINT chk_price_positive CHECK (price_per_passenger > 0);

-- Contrainte : Les sièges restants ne peuvent pas être négatifs
ALTER TABLE Carpooling ADD CONSTRAINT chk_seats_remaining_positive CHECK (seats_remaining >= 0);

-- Contrainte : Les sièges disponibles du véhicule doivent être positifs
ALTER TABLE Vehicle ADD CONSTRAINT chk_seats_available_positive CHECK (seats_available > 0);