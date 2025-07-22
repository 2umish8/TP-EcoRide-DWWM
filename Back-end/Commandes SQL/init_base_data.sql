-- Insérer les rôles de base
INSERT IGNORE INTO Role (name) VALUES 
('passager'),
('chauffeur'),
('employe'),
('administrateur');

-- Insérer quelques marques et couleurs de base pour les véhicules
INSERT IGNORE INTO Brand (name) VALUES 
('Peugeot'),
('Renault'),
('Citroën'),
('Toyota'),
('Tesla'),
('BMW'),
('Mercedes'),
('Audi');

INSERT IGNORE INTO Color (name) VALUES 
('Blanc'),
('Noir'),
('Gris'),
('Bleu'),
('Rouge'),
('Vert'),
('Jaune'),
('Orange');
