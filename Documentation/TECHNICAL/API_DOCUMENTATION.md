# Documentation API - EcoRide

## Application Déployée - Accès Direct

**L'application EcoRide est maintenant déployée et accessible en ligne !**

### Accès à l'application

**URL : https://ecoridetp.netlify.app/**

L'API backend est également déployée et accessible via l'application frontend déployée.

### Comptes de test prêts à utiliser

| Rôle               | Pseudo | Mot de passe | Accès                       |
| --------------------- | --------- | --------------- | ------------------------------ |
| **Administrateur** | Admin     | Admin2025!      | Gestion système                |
| **Utilisateur**    | test      | Test2025!       | Participation&Création trajets |

---

## Base URL

```
http://localhost:3000/api
```

## Authentification

L'API utilise JWT (JSON Web Tokens) pour l'authentification. Incluez le token dans l'en-tête Authorization :

```
Authorization: Bearer <token>
```

---

## Utilisateurs (/users)

### POST /users/register

Inscription d'un nouvel utilisateur

**Corps de la requête :**

```json
{
    "pseudo": "john_doe",
    "email": "john@example.com",
    "password": "motdepasse123"
}
```

**Validation des données :**

-   `pseudo` : obligatoire, chaîne de caractères
-   `email` : obligatoire, format d'email valide selon RFC 5322
-   `password` : obligatoire, chaîne de caractères

**Validation d'email :**
L'email est automatiquement validé et normalisé :

-   Format vérifié selon les standards RFC 5322
-   Normalisation automatique (minuscules, suppression des espaces)
-   Longueur maximale : 320 caractères
-   Partie locale maximale : 64 caractères
-   Domaine maximal : 253 caractères
-   Interdiction des points consécutifs (..) et en début/fin de partie locale

**Réponses :**

-   `201` : Utilisateur créé avec succès
-   `400` : Données manquantes ou format d'email invalide
-   `409` : Email ou pseudo déjà utilisé

**Exemple de réponse en cas d'email invalide :**

```json
{
    "message": "Format d'email invalide. Veuillez saisir une adresse email valide (ex: utilisateur@exemple.com)."
}
```

### POST /users/login

Connexion utilisateur

```json
{
    "identifier": "john@example.com", // email ou pseudo
    "password": "motdepasse123"
}
```

### GET /users/profile (auth requise)

Récupérer le profil utilisateur

### PUT /users/profile (auth requise)

Mettre à jour le profil

```json
{
    "pseudo": "nouveau_pseudo",
    "email": "nouveau@email.com",
    "profile_picture_url": "https://example.com/photo.jpg"
}
```

### POST /users/change-password (auth requise)

Changer le mot de passe

```json
{
    "currentPassword": "ancien_mdp",
    "newPassword": "nouveau_mdp"
}
```

### POST /users/become-driver (auth requise)

Devenir chauffeur (ajouter le rôle)

---

## Véhicules (/vehicles)

### POST /vehicles (auth requise, rôle chauffeur)

Ajouter un véhicule (rôle chauffeur requis)

```json
{
    "plate_number": "AB-123-CD",
    "model": "Clio",
    "seats_available": 4,
    "is_electric": false,
    "brand_name": "Renault",
    "color_name": "Rouge",
    "first_registration_date": "2020-01-15"
}
```

### GET /vehicles/my-vehicles (auth requise)

Lister mes véhicules

### PUT /vehicles/:id (auth requise)

Modifier un véhicule

### DELETE /vehicles/:id (auth requise)

Supprimer un véhicule

### GET /vehicles/brands-colors

Obtenir les marques et couleurs disponibles

---

## Covoiturages (/carpoolings)

### GET /carpoolings/available

Rechercher des covoiturages disponibles

```
Query params: ?departure=Paris&arrival=Lyon&date=2024-01-15
```

### POST /carpoolings (auth requise, rôle chauffeur)

Créer un covoiturage (rôle chauffeur requis)

```json
{
    "departure_address": "Paris",
    "arrival_address": "Lyon",
    "departure_datetime": "2024-01-15T08:00:00Z",
    "arrival_datetime": "2024-01-15T12:00:00Z",
    "price_per_passenger": 25,
    "seats_offered": 3,
    "vehicle_id": 1
}
```

### GET /carpoolings/my-carpoolings (auth requise)

Lister mes covoiturages en tant que chauffeur

### PUT /carpoolings/:id (auth requise)

Modifier un covoiturage

### POST /carpoolings/:id/cancel (auth requise)

Annuler un covoiturage

### POST /carpoolings/:id/start (auth requise)

Démarrer un covoiturage

### POST /carpoolings/:id/finish (auth requise)

Terminer un covoiturage

---

## Participations (/participations)

### POST /participations/:id/join (auth requise)

Rejoindre un covoiturage

### POST /participations/:id/cancel (auth requise)

Annuler sa participation

### GET /participations/my-participations (auth requise)

Lister mes participations

### POST /participations/:id/validate (auth requise)

Valider un covoiturage terminé

```json
{
    "is_validated": true
}
```

### GET /participations/:id/participants (auth requise)

Voir les participants d'un covoiturage (chauffeur uniquement)

---

## Crédits (/credits)

### GET /credits/balance (auth requise)

Consulter son solde de crédits

### GET /credits/history (auth requise)

Historique des transactions

### POST /credits/purchase (auth requise)

Acheter des crédits (simulation)

```json
{
    "amount": 50
}
```

### GET /credits/stats (auth requise)

Statistiques financières personnelles

### POST /credits/transfer (auth requise)

Transférer des crédits à un autre utilisateur

```json
{
    "recipient_email": "ami@example.com",
    "amount": 10,
    "message": "Remboursement essence"
}
```

---

## Administration (/admin)

### GET /admin/stats (auth requise, rôle admin/employé)

Statistiques de la plateforme (admin/employé)

### GET /admin/users (auth requise, rôle admin/employé)

Lister tous les utilisateurs (admin/employé)

```
Query params: ?page=1&limit=20&search=john&role=chauffeur
```

### PUT /admin/users/:id/suspension (auth requise, rôle admin/employé)

Suspendre/réactiver un utilisateur (admin/employé)

```json
{
    "suspended": true,
    "reason": "Comportement inapproprié"
}
```

### PUT /admin/users/:id/roles (auth requise, rôle admin)

Gérer les rôles d'un utilisateur (admin uniquement)

```json
{
    "roles": ["chauffeur", "passager"]
}
```

### GET /admin/carpoolings (auth requise, rôle admin/employé)

Lister tous les covoiturages (admin/employé)

### POST /admin/carpoolings/:id/cancel (auth requise, rôle admin/employé)

Annuler un covoiturage (admin/employé)

```json
{
    "reason": "Signalement pour fraude"
}
```

---

## Légendes

-   Authentification requise
-   Rôle chauffeur requis
-   Rôle admin ou employé requis
-   Rôle admin uniquement

## Codes de statut HTTP

-   200: Succès
-   201: Créé avec succès
-   400: Erreur de validation
-   401: Non authentifié
-   403: Accès interdit
-   404: Ressource non trouvée
-   409: Conflit (données déjà existantes)
-   500: Erreur serveur
