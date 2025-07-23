# Utilitaires EcoRide - Back-end

Ce dossier contient les fonctions utilitaires utilisées dans l'application EcoRide.

## 📧 emailValidator.js

Module de validation et normalisation d'adresses email selon les standards RFC 5322.

### Fonctions disponibles

#### `isValidEmail(email)`

Valide le format d'une adresse email.

**Paramètres :**

-   `email` (string) : L'adresse email à valider

**Retourne :**

-   `boolean` : `true` si l'email est valide, `false` sinon

#### `validateAndNormalizeEmail(email)`

Valide et normalise une adresse email.

**Paramètres :**

-   `email` (string) : L'adresse email à valider et normaliser

**Retourne :**

-   `object` :
    ```js
    {
      isValid: boolean,        // true si l'email est valide
      normalizedEmail: string, // email normalisé (minuscules, sans espaces)
      error: string           // message d'erreur si invalide
    }
    ```

### Exemple d'utilisation

```javascript
const { validateAndNormalizeEmail } = require("./utils/emailValidator");

const result = validateAndNormalizeEmail(" USER@EXAMPLE.COM ");
console.log(result);
// {
//   isValid: true,
//   normalizedEmail: 'user@example.com',
//   error: null
// }

const invalidResult = validateAndNormalizeEmail("email-invalide");
console.log(invalidResult);
// {
//   isValid: false,
//   normalizedEmail: null,
//   error: 'Format d\'email invalide'
// }
```

### Règles de validation

La validation d'email suit les règles suivantes :

✅ **Accepté :**

-   Format standard : `utilisateur@domaine.com`
-   Sous-domaines : `user@mail.example.co.uk`
-   Tags avec + : `user+tag@example.com`
-   Underscores : `user_name@example.com`
-   Points dans la partie locale : `first.last@example.com`

❌ **Rejeté :**

-   Absence de @ : `emailsansarobase`
-   Multiple @ : `user@@example.com`
-   Domaine manquant : `user@`
-   Utilisateur manquant : `@example.com`
-   Points consécutifs : `user..name@example.com`
-   Points en début/fin : `.user@example.com` ou `user.@example.com`
-   Espaces dans la partie locale : `user name@example.com`
-   Longueur excessive (> 320 caractères)

### Tests

Vous pouvez tester la validation avec :

```bash
# Test des fonctions de validation
node scripts/testEmailValidation.js

# Test de l'endpoint d'inscription
node scripts/testRegistrationEmailValidation.js
```

### Normalisation automatique

L'email est automatiquement normalisé :

-   Conversion en minuscules
-   Suppression des espaces en début/fin
-   Conservation de la structure originale

**Exemple :**

-   Entrée : `" USER.TEST@EXAMPLE.COM "`
-   Normalisé : `"user.test@example.com"`

### Intégration dans l'API

La validation est intégrée dans :

-   `POST /users/register` : Validation lors de l'inscription
-   `PUT /users/profile` : Validation lors de la mise à jour du profil

En cas d'email invalide, l'API retourne une erreur 400 avec un message explicite :

```json
{
    "message": "Format d'email invalide. Veuillez saisir une adresse email valide (ex: utilisateur@exemple.com)."
}
```
