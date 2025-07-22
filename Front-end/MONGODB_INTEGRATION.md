# Guide d'intégration MongoDB - Front-end

## Composants MongoDB créés

### 1. Service Layer (`mongoServices.js`)

Service principal pour communiquer avec les APIs MongoDB :

- **Reviews API** : Création, lecture, modération des avis
- **Preferences API** : Gestion des préférences des chauffeurs
- Configuration Axios avec token d'authentification

### 2. Composants Vue.js

#### `DriverReviews.vue`

- Affichage des avis d'un chauffeur avec pagination
- Calcul de la note moyenne
- Interface responsive avec design EcoRide
- Props : `driverId` (obligatoire)

#### `ReviewForm.vue`

- Formulaire de création d'avis avec système d'étoiles
- Validation en temps réel
- Gestion des erreurs (avis déjà existant, etc.)
- Props : `driverId`, `carpoolingId` (obligatoires)
- Events : `review-submitted`, `cancel`

#### `DriverPreferences.vue`

- Affichage et édition des préférences de conduite
- Mode lecture/écriture selon les permissions
- Préférences standards + personnalisées
- Props : `driverId` (obligatoire)

## Intégration dans l'application

### 1. Dans un profil de chauffeur

```vue
<template>
  <div class="driver-profile">
    <!-- Informations du chauffeur -->

    <!-- Préférences de conduite -->
    <DriverPreferences :driver-id="driver.id" />

    <!-- Avis des passagers -->
    <DriverReviews :driver-id="driver.id" />
  </div>
</template>

<script setup>
import DriverReviews from '@/components/DriverReviews.vue'
import DriverPreferences from '@/components/DriverPreferences.vue'
</script>
```

### 2. Après un trajet terminé

```vue
<template>
  <div class="trip-completed">
    <!-- Informations du trajet -->

    <!-- Formulaire d'évaluation -->
    <ReviewForm
      :driver-id="trip.driverId"
      :carpooling-id="trip.id"
      @review-submitted="handleReviewSubmitted"
      @cancel="showReviewForm = false"
    />
  </div>
</template>

<script setup>
import ReviewForm from '@/components/ReviewForm.vue'

const handleReviewSubmitted = () => {
  showReviewForm.value = false
  // Actualiser les avis ou rediriger
}
</script>
```

### 3. Dans la liste de recherche

```vue
<template>
  <div class="search-result">
    <div class="driver-info">
      <h3>{{ driver.name }}</h3>
      <!-- Note moyenne rapide -->
      <div class="quick-rating" v-if="driver.averageRating">
        ⭐ {{ driver.averageRating }} ({{ driver.totalReviews }} avis)
      </div>
    </div>
  </div>
</template>
```

## Configuration requise

### 1. Store utilisateur

Le composant `DriverPreferences.vue` utilise le store utilisateur :

```js
// stores/user.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: null,
  }),
  // ...
})
```

### 2. Variables d'environnement

```env
VITE_API_BASE_URL=http://localhost:3000
```

### 3. Dépendances npm

```json
{
  "axios": "^1.6.0",
  "pinia": "^2.1.0"
}
```

## Tests à effectuer

### 1. Tests unitaires recommandés

- Service layer avec mocks Axios
- Composants avec Vue Test Utils
- Validation des formulaires

### 2. Tests d'intégration

- Workflow complet : trajet → évaluation → affichage
- Gestion des erreurs réseau
- Permissions utilisateurs

### 3. Tests UI/UX

- Responsive design sur mobile/tablette
- Accessibilité (ARIA, navigation clavier)
- Performance avec beaucoup d'avis

## Points d'attention

### 1. Sécurité

- Token JWT inclus automatiquement dans les requêtes
- Validation côté serveur des permissions
- Sanitisation des données utilisateur

### 2. Performance

- Pagination des avis (5 par page par défaut)
- Lazy loading pour les gros volumes
- Cache côté client si nécessaire

### 3. UX

- Messages d'erreur clairs et en français
- Loading states pour toutes les actions
- Confirmation avant suppression

### 4. Accessibilité

- Labels appropriés pour les lecteurs d'écran
- Navigation clavier complète
- Contraste suffisant (respecté dans le design)

## Prochaines étapes

1. **Tests immédiats** :

   ```bash
   cd Front-end
   npm run dev
   # Tester sur http://localhost:5173
   ```

2. **Intégration graduelle** :

   - Commencer par `DriverReviews` dans un profil existant
   - Ajouter `DriverPreferences`
   - Intégrer `ReviewForm` après les trajets

3. **Optimisations futures** :
   - Cache des avis fréquemment consultés
   - Notifications en temps réel
   - Statistiques avancées pour les chauffeurs

Le système MongoDB est maintenant prêt pour le déploiement de ce soir ! 🚀
