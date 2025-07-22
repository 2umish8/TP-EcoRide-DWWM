-- Ajout de la table Review pour les avis et notes des chauffeurs
-- Selon le cahier des charges (US 11), les passagers peuvent laisser un avis et une note

CREATE TABLE Review (
    id INT PRIMARY KEY AUTO_INCREMENT,
    rating DECIMAL(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5), -- Note de 1 à 5
    comment TEXT,
    reviewer_id INT NOT NULL, -- L'utilisateur qui laisse l'avis (passager)
    reviewed_user_id INT NOT NULL, -- L'utilisateur qui reçoit l'avis (chauffeur)
    carpooling_id INT NOT NULL, -- Le covoiturage concerné
    is_validated_by_employee BOOLEAN DEFAULT NULL, -- NULL = en attente, TRUE = validé, FALSE = refusé
    creation_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    validation_date DATETIME,
    validated_by_employee_id INT,
    FOREIGN KEY (reviewer_id) REFERENCES User(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_user_id) REFERENCES User(id) ON DELETE CASCADE,
    FOREIGN KEY (carpooling_id) REFERENCES Carpooling(id) ON DELETE CASCADE,
    FOREIGN KEY (validated_by_employee_id) REFERENCES User(id),
    -- Un utilisateur ne peut laisser qu'un seul avis par covoiturage
    UNIQUE KEY unique_review_per_trip (reviewer_id, carpooling_id)
);

-- Index pour optimiser les requêtes de recherche de note moyenne par chauffeur
CREATE INDEX idx_reviewed_user_validated ON Review(reviewed_user_id, is_validated_by_employee);
