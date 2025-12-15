# Plan de Test Complet - EcoRide

**Date de création**: 15 décembre 2025  
**Statut**: ✅ **Majorité complétée (Phase 1 terminée, Phase 2-3 à faire)**  
**Priorité**: Avant tout refactoring  
**Scope**: Frontend + E2E (Backend API avec mocking/stubs dans Vitest si nécessaire)

---

## 📊 État de Mise en Œuvre (15 décembre 2025 - Restructuré)

### ✅ TERMINÉ — Phase 1 (Foundation)
- [x] **3 endpoints de test/nettoyage** créés et validés (Backend/routes/adminRoutes.js)
  - POST `/admin/test/reset-user` — Réinitialise utilisateur sans suppression
  - POST `/admin/test/cleanup-user` — Suppression complète utilisateur + MongoDB
  - POST `/admin/test/cleanup-carpooling` — Suppression trajet + remboursement
- [x] Stratégie de réinitialisation d'environnement documentée et implémentée
- [x] Backend running et opérationnel (http://localhost:3000)
- [x] Frontend running et opérationnel (http://localhost:5174)

### 🟡 EN COURS — Phase 2 (Consolidated E2E + Vitest)
- [ ] **Consolidated E2E Tests** — Few large tests covering complete business workflows
  - Passenger Complete Journey: Register → Search → Join multiple → Review → Cancel → Logout
  - Driver Complete Journey: Register → Become driver → Create → Start → Finish → Delete → Logout
  - Visitor to Participant: Browse → Search → Register on demand → Join → Logout
  - Complete Trip Lifecycle: Join → Complete → Review with rating → Verify profile
  - [Additional workflows with consolidated logic]
- [ ] **Vitest Tests** — Small isolated unit tests (Run BEFORE E2E)
  - Component rendering: HomeView, SearchBar, TripCard, ReviewForm
  - Composables: useSearchForm, useParticipationActions, useTripsActions, useCredits
  - Utilities: Validation, formatting, calculations
  - Services: API mocking and error handling

### ⚠️ À FAIRE — Phase 3 (Post-Évaluation)
- [ ] E2E pour workflows employé et administrateur
- [ ] Tests de régression et cas d'erreur avancés
- [ ] Performance optimization et couverture complète

---

## 🎉 Tests Créés - Session Restructurée (Consolidated Approach)

### E2E Tests (Consolidated Business Workflows)
✅ **3 fichiers E2E** couvrant des journées complètes de A à Z:

**1. Complete Passenger Journey (A to Z)** — `e2e/tests/complete-passenger-journey.spec.js`
- Register with initial credits (20)
- Search for trips across multiple destinations
- Join multiple trips in single flow
- View participated trips in /my-trips
- Complete trip and leave review with rating
- Cancel pending participation
- Verify credits deduction
- Logout
- **Status**: ✅ Code complete with detailed step logging

**2. Complete Driver Journey (A to Z)** — `e2e/tests/complete-driver-journey.spec.js`
- Register as new driver
- Become driver (add vehicle information)
- Create new carpooling trip
- View created trips
- View participant list
- Start trip
- Finish trip
- View reviews received
- Delete trip
- Logout
- **Status**: ✅ Code complete with detailed step logging

**3. Complete Review & Rating Journey (A to Z)** — `e2e/tests/complete-review-journey.spec.js`
- Login as passenger with completed trips
- Access completed trip
- Leave comprehensive review text
- Rate driver with 1-5 stars
- Add optional review categories/tags
- Submit review
- Verify review appears on trip page
- Verify rating on driver profile
- Check review count accumulation
- Logout
- **Status**: ✅ Code complete with detailed step logging

### Vitest Tests (Small, Isolated Unit Tests)
✅ **3 fichiers Vitest** pour logique métier isolée:

**1. useParticipationActions Composable** — `src/composables/__tests__/useParticipationActions.spec.js`
- Cancel participation (basic, with refund, with penalty)
- Display credit refunds correctly
- Handle late cancellation penalties
- Error cases: trip already started, etc.
- Edge cases: large refunds, zero values
- **Coverage**: Participation business logic (join/cancel)
- **Status**: ✅ Complete with 15+ test cases

**2. useTripsActions Composable** — `src/composables/__tests__/useTripsActions.spec.js`
- Start trip: success, errors, state validation
- Finish trip: success, errors, state validation
- Cancel trip: success, errors, refund logic
- State transitions: start → finish lifecycle
- Prevent concurrent operations
- **Coverage**: Trip state management
- **Status**: ✅ Complete with 20+ test cases

**3. Validation Utilities** — `src/utils/__tests__/validation.spec.js`
- Email validation: valid/invalid formats
- Password strength: uppercase, lowercase, numbers
- Trip price: min/max, positive values
- Seat capacity: 1-8 seats
- Credit deduction logic: sufficient credits validation
- Date validation: future dates only
- **Coverage**: Data integrity and form validation
- **Status**: ✅ Complete with 40+ test cases

### Test Strategy Summary

**Phase 1 (Now): Run Vitest First** ✅
```bash
npm run test:unit  # All Vitest tests (milliseconds, fast feedback)
# Total: 75+ test cases covering isolated logic
```

**Phase 2 (After Vitest Pass): Run E2E**
```bash
npx playwright test e2e/tests/complete-*.spec.js --project=chromium
# Total: 3 comprehensive tests covering complete business workflows
# Each test: 5-10 minutes, logs at each step for debugging
```

**Phase 3 (If E2E Fails): Regression Protocol**
- Identify which Vitest piece is broken
- Fix code
- Re-run that Vitest
- Re-run E2E

### Key Principle
**Fewer tests, deeper coverage**. Instead of 50 small tests (SearchBar renders, Button exists), we have:
- 75+ Vitest tests for isolated logic
- 3 E2E tests for complete business workflows
- Total: ~75 assertions across all tests
- Each test covers related business logic in one place

---

## 📋 Vue d'ensemble

Ce document fournit un plan de test exhaustif couvrant **tous les parcours utilisateur** décrits dans le **Cahier des charges (Cahier des charges.md)**. Il sert de **blueprint unique** pour :
- **Vitest** (tests unitaires frontend - feedback rapide)
- **Playwright E2E** (tests d'intégration frontend - validation finale)
- **Stratégie de régression** (quand un E2E échoue → Vitest couvre → itération)
- **Réinitialisation d'environnement de test** (maintenir un état neutre entre les tests)

---

## 🎯 Stratégie de Test Recommandée

### Ordre d'exécution

```
1. Vitest (composants, composables, services)
   ↓ (feedback rapide, validation locale)
2. E2E Playwright (parcours utilisateur complets)
   ↓ (validation intégration)
3. Si E2E échoue:
   a. Vérifier le code source vs le script E2E
   b. Créer/étendre un Vitest pour le secteur affecté
   c. Itérer jusqu'à succès
   d. Retour à E2E
```

### Stratégies de Réinitialisation d'Environnement

Pour maintenir un état neutre entre les tests (spécialement pour les tests "one-way" comme devenir chauffeur):

#### Option 1: Nettoyage via API (Recommandé - Playwright)

**Avant/Après chaque test E2E**, utiliser un **endpoint de nettoyage** (à créer si absent):

```javascript
// Dans global-setup.js ou beforeEach() de chaque test
async function cleanTestUser(email) {
  // Supprimer l'utilisateur de la DB (MySQL + MongoDB)
  await page.goto(`${API_URL}/admin/test/cleanup?email=${email}`);
  
  // Ou réinitialiser l'état (ex: retirer le rôle chauffeur sans suppression)
  await api.post('/admin/test/reset-role', { email, role: 'passenger' });
}
```

#### Option 2: Création d'un nouvel utilisateur pour chaque test

```javascript
// Générer un email unique par test
const testEmail = `test-${Date.now()}@ecoride.test`;
await registerUser(testEmail, 'Test2025!');

// Utiliser ce nouvel utilisateur pour le test
await loginAs(testEmail);
// ... test ...
// Après: supprimer via l'API de nettoyage
```

#### Option 3: Basculer le rôle (Sans suppression - Plus léger)

```javascript
// Pour les tests de chauffeur:
await api.post('/user/role', { role: 'driver', vehicleInfo: {...} });
// Test ...
// Après: rétrograder le rôle
await api.post('/user/role', { role: 'passenger' });
```

#### Option 4: Utiliser des `beforeEach()` et `afterEach()` déclaratifs

```javascript
test.describe('Driver Workflow', () => {
  let testUser = null;

  test.beforeEach(async ({ page }) => {
    // Créer un utilisateur frais pour ce test
    testUser = await createTestUser(page);
    await loginAs(page, testUser.email);
  });

  test.afterEach(async ({ page }) => {
    // Nettoyer après le test
    if (testUser) await deleteTestUser(page, testUser.email);
  });

  test('user can become a driver', async ({ page }) => {
    // Test dans un état propre et isolé
  });
});
```

### Recommandation Finale pour EcoRide

**Combiner Option 3 + Option 4 + API de Nettoyage**:

```javascript
// Backend: ajouter des endpoints de test dans Backend/routes/adminRoutes.js
POST /admin/test/reset-user       // Réinitialiser l'état de l'utilisateur (supprimer rôle chauffeur, véhicules, etc.)
POST /admin/test/cleanup          // Supprimer complètement l'utilisateur
POST /admin/test/seed-user        // Créer un nouvel utilisateur de test

// E2E: structure test avec nettoyage
test.describe('User Journeys', () => {
  test.beforeAll(async ({ browser }) => {
    // Seed initial des utilisateurs de test globaux
    await seedTestUsers(browser);
  });

  test.describe('Visitor → Driver Flow', () => {
    test.beforeEach(async ({ page }) => {
      // Avant chaque test: réinitialiser l'utilisateur
      await resetTestUser(page, TEST_USER_EMAIL);
    });

    test('should complete driver registration and create trip', async ({ page }) => {
      // Test dans un état neutre
    });
  });
});
```

---

## 👤 Rôles et Parcours Utilisateur

### 1️⃣ VISITEUR (Non authentifié)

#### US 1 - Page d'Accueil

**Objectif**: Vérifier que la page d'accueil est accessible et fonctionnelle.

**Parcours utilisateur**:
```
1. Accéder à https://ecoride.app/ (ou localhost:5173)
2. Vérifier que la page se charge complètement
3. Vérifier la présence:
   - Logo EcoRide
   - Présentation de l'entreprise (texte + images)
   - Barre de recherche avec placeholder "Destination"
   - Bouton "Trouver un itinéraire"
   - Footer avec email et mentions légales
4. Cliquer sur logo → redirection vers /
5. Cliquer sur "Mentions légales" → page légale
6. Consulter email de contact visible
```

**Validation Vitest** (`HomeView.spec.js`):
- ✅ Render components: HeroSection, AboutSection, ArrowsFooter, SearchBar
- ✅ SearchBar accepte destination et émet recherche

**Validation E2E** (`homepage.spec.js` - existant):
- ✅ Page title = "EcoRide | Covoiturage écologique"
- ✅ Logo clickable, footer visible
- ✅ SearchBar functional

---

#### US 2 - Navigation

**Objectif**: Vérifier que la navigation est complète et correcte.

**Parcours utilisateur**:
```
1. Depuis la page d'accueil, vérifier navbar contient:
   - Logo (cliquable → home)
   - "Accueil" (→ /)
   - "Covoiturages" (→ /search)
   - "Connexion / Inscription" (→ /login)
   - "Contact" (→ /contact ou lien mailto)

2. Cliquer sur chaque lien et vérifier redirection
3. Sur mobile, vérifier menu hamburger (si responsive)
4. Vérifier que navbar persiste en scrollant
```

**Validation Vitest** (`AppNavbar.spec.js` - à créer si absent):
- Render liens de navigation
- Emit navigation events correctement

**Validation E2E** (`navigation.spec.js` - à créer):
- Tous les liens de navigation fonctionnent
- Redirection correcte

---

#### US 3 & 4 - Recherche et Filtres (Visiteur)

**Objectif**: Vérifier la recherche de covoiturages et les filtres (avant authentification).

**Parcours utilisateur - Sans authentification**:
```
1. Accéder à /search (directement ou via navbar)
2. Voir un formulaire avec:
   - Lieu de départ (prérempli par géolocalisation ou "Votre position")
   - Lieu d'arrivée (vide ou prérempli si venant de la barre d'accueil)
   - Date/heure de départ
   - Bouton "Rechercher"

3. Remplir le formulaire:
   - Départ: "Paris"
   - Arrivée: "Lyon"
   - Date: demain
   - Cliquer "Rechercher"

4. Vérifier les résultats:
   - Affichage d'une liste de covoiturages
   - Chaque covoiturage montre:
     * Pseudo, photo, note du chauffeur
     * Nombre de places restantes
     * Prix
     * Date/heure départ/arrivée
     * Badge "Écologique" si électrique
     * Bouton "Détail"

5. Appliquer les filtres:
   - Véhicule électrique uniquement
   - Prix max: €50
   - Durée max: 2h
   - Note chauffeur min: 4.0
   - Vérifier que les résultats se mettent à jour

6. Si aucun résultat:
   - Système propose "Prochain trajet disponible: date X"

7. Cliquer sur "Détail" d'un covoiturage
   - Redirection vers /search/:id ou modal de détail
   - Affichage complet des infos + avis du chauffeur

8. Cliquer sur "Participer" sans authentification:
   - Redirection vers /login (demande de connexion)
```

**Validation Vitest** (`SearchBar.spec.js` - existant, TripFilters.spec.js - à créer):
- ✅ SearchBar accepte inputs et émet recherche
- ✅ TripFilters met à jour les filtres
- ✅ SearchForm valide les entrées (obligatoires)
- ✅ Composables `useSearchForm`, `useCarpoolings` retournent les bons états

**Validation E2E** (`search-results.spec.js` - existant):
- ✅ Recherche retourne les résultats
- ✅ Filtres affinent les résultats
- ✅ Clic sur "Détail" affiche les informations complètes
- ✅ Clic "Participer" redirige vers login

---

#### US 5 - Vue Détaillée d'un Covoiturage

**Objectif**: Vérifier que la page détail montre toutes les informations requises.

**Parcours utilisateur**:
```
1. Depuis les résultats, cliquer sur "Détail" d'un covoiturage
2. Page détail affiche:
   - Toutes les infos du covoiturage (US 3)
   - Informations du véhicule:
     * Modèle, marque, couleur, immatriculation
     * Électrique ou non
   - Avis du chauffeur (liste avec notes et commentaires)
   - Préférences du chauffeur:
     * Fumeur / Non-fumeur
     * Animaux / Pas d'animaux
     * Autres préférences personnalisées
   - Profil du chauffeur:
     * Photo, pseudo, note globale
     * Nombre de trajets effectués
   - Bouton "Participer" (visible pour visiteur, redirige vers login)
   - Bouton "Contacter le chauffeur" (optionnel)
```

**Validation Vitest** (`CarpoolingDetailView.spec.js` - à créer):
- Render component avec tous les champs requis
- DriverPreferences component affiche correctement
- DriverReviews component affiche liste d'avis

**Validation E2E**:
- ✅ Page charge avec toutes les infos
- ✅ Avis affichés correctement
- ✅ Véhicule et préférences visibles

---

#### US 6 - Inscription (Visiteur → Nouvel Utilisateur)

**Objectif**: Vérifier que l'inscription fonctionne et crée un compte actif.

**Parcours utilisateur**:
```
1. Cliquer sur "Inscription" dans la navbar
   → Redirection vers /register

2. Voir le formulaire d'inscription avec:
   - Champ "Pseudo" (obligatoire)
   - Champ "Email" (obligatoire, validation email)
   - Champ "Mot de passe" (obligatoire, critique de sécurité)
   - Champ "Confirmer mot de passe"
   - Acceptation des CGU/Mentions légales (checkbox)
   - Bouton "S'inscrire"
   - Lien "Déjà inscrit? Connexion" → /login

3. Remplir le formulaire:
   - Pseudo: "TestUser123"
   - Email: "test.user.123@ecoride.test"
   - Mot de passe: "SecurePass2025!"
   - Confirmer: "SecurePass2025!"
   - Cocher CGU
   - Cliquer "S'inscrire"

4. Vérifier:
   - Message de succès "Inscription réussie!"
   - Redirection vers /login
   - OU redirection directe vers /profile avec login auto
   - Utilisateur reçoit 20 crédits (vérifiable dans profil)

5. Cas d'erreur à tester:
   - Email déjà existant → "Email déjà utilisé"
   - Mots de passe non identiques → "Les mots de passe ne correspondent pas"
   - Mot de passe faible → "Mot de passe doit contenir au moins..."
   - Email invalide → "Format email invalide"
   - Pseudo vide → "Le pseudo est obligatoire"

6. Après inscription:
   - User peut se connecter avec ces identifiants
   - Crédits initiaux = 20
```

**Validation Vitest** (`RegisterView.spec.js` - à créer):
- Form render correctement
- Validation des champs (email, mot de passe, confirmation)
- Emit submit avec données correctes
- Affichage messages d'erreur/succès

**Validation E2E** (`registration.spec.js` - existant):
- ✅ S'inscrire avec succès
- ✅ Crédits initiaux attribués
- ✅ Redirection correcte

---

#### US 7 - Connexion (Visiteur)

**Objectif**: Vérifier que la connexion fonctionne et établit la session utilisateur.

**Parcours utilisateur**:
```
1. Cliquer sur "Connexion" dans la navbar → /login

2. Voir le formulaire avec:
   - Champ "Email"
   - Champ "Mot de passe"
   - Case "Rester connecté" (optionnel)
   - Bouton "Connexion"
   - Lien "Créer un compte" → /register
   - Lien "Mot de passe oublié?" → /forgot-password (optionnel)

3. Remplir avec les identifiants de test:
   - Email: "test@test.com" (OU "test")
   - Mot de passe: "Test2025!"
   - Cliquer "Connexion"

4. Vérifier:
   - Message succès "Connexion réussie"
   - Redirection vers /profile
   - Token JWT stocké en localStorage/sessionStorage
   - Navbar mise à jour (affiche pseudo, menu utilisateur)
   - Bouton déconnexion visible

5. Cas d'erreur:
   - Email inexistant → "Email ou mot de passe incorrect"
   - Mot de passe faux → "Email ou mot de passe incorrect"
   - Champ vide → "Ce champ est obligatoire"

6. Vérifier la session:
   - Recharger la page → reste connecté (si "Rester connecté" coché)
   - Token valide pour API calls
```

**Validation Vitest** (`LoginView.spec.js` - à créer):
- Form render
- Validation des champs
- Emit submit
- Gestion des erreurs

**Validation E2E** (`login.spec.js` - existant):
- ✅ Connexion réussie
- ✅ Token stocké
- ✅ Navbar reflète l'état connecté
- ✅ Redirection vers /profile

---

### 2️⃣ UTILISATEUR CONNECTÉ - PASSAGER

#### Profil & Rôle

**Objectif**: Vérifier que le profil utilisateur fonctionne et que le choix de rôle est correct.

**Parcours utilisateur**:
```
1. Après connexion, utilisateur redirigé vers /profile
   OU cliquer sur pseudo dans navbar → /profile

2. Voir la page de profil avec:
   - Infos utilisateur: pseudo, email, crédit actuel
   - Photo de profil (optionnel)
   - Section "Rôles" avec deux cartes:
     * Passager (par défaut, pas de config supplémentaire)
     * Chauffeur (nécessite infos véhicule, préférences)

3. Utilisateur peut cliquer:
   - "Je suis passager" → état passager activé
   - "Je veux devenir chauffeur" → redirection vers /become-driver (voir US Chauffeur)

4. Vérifier que le rôle sélectionné est sauvegardé
   - Après reload → rôle persiste
```

**Validation Vitest** (`ProfileView.spec.js` - existant, à étendre):
- ✅ Affiche role selection cards
- ✅ Émet événement de sélection de rôle

**Validation E2E** (`profile.spec.js` - à créer):
- ✅ Profil affiche les infos utilisateur
- ✅ Choix du rôle sauvegardé
- ✅ Crédits affichés correctement

---

#### US 10a - Recherche et Participation

**Objectif**: Vérifier qu'un passager peut rechercher et se joindre à un covoiturage.

**Parcours utilisateur**:
```
1. Utilisateur connecté en tant que passager accède à /search

2. Remplir le formulaire de recherche:
   - Départ: Paris
   - Arrivée: Lyon
   - Date: demain
   - Cliquer "Rechercher"

3. Voir les résultats (même que visiteur, mais avec bouton "Participer" actif)

4. Cliquer sur "Détail" d'un covoiturage

5. Vérifier que le bouton "Participer" est actif (pas de redirection login)
   - Bouton affiche: "Participer - €X crédits"

6. Cliquer "Participer":
   - Affichage d'un modal/dialog: "Confirmer la participation?"
   - Affiche: prix, nombre de places restantes, crédits actuels
   - Bouton "Annuler" et "Confirmer"

7. Cliquer "Confirmer":
   - Vérifier que l'utilisateur a assez de crédits
   - Si oui: inscription validée
     * Message: "Vous participez au trajet!"
     * Modal ferme, retour à détail du covoiturage
     * Page actualise: places restantes -1
   - Si non: "Crédits insuffisants" + lien vers /credits

8. Vérifier après participation:
   - Covoiturage apparaît dans /my-trips (section passager)
   - Crédits débités de l'utilisateur
   - Place réduite pour les autres utilisateurs

9. Cas d'erreur:
   - Trajet complet (0 places) → Bouton "Participer" désactivé
   - Crédits insuffisants → Modal affiche erreur
   - Trajet déjà passé → Bouton "Participer" désactivé
```

**Validation Vitest** (`useCarpoolings.spec.js`, `useParticipations.spec.js` - à créer/étendre):
- `useCarpoolings` récupère et filtre les trajets
- `useParticipationActions` valide la participation (crédits, places)
- Modal de confirmation affiche les bonnes infos

**Validation E2E** (`carpooling-join.spec.js` - existant ou à créer):
- ✅ Passager peut rechercher
- ✅ Passager peut se joindre à un trajet
- ✅ Crédits débités correctement
- ✅ Places mises à jour
- ✅ Trajet apparaît dans /my-trips

---

#### US 10b - Annulation de Covoiturage (Passager)

**Objectif**: Vérifier qu'un passager peut annuler sa participation et être remboursé.

**Parcours utilisateur**:
```
1. Passager participe à un trajet (voir US 10a)

2. Accéder à /my-trips → section "Passager"

3. Voir la liste des trajets:
   - Affichage chauffeur, destination, date, prix
   - Bouton "Annuler" visible (si trajet pas commencé)
   - Bouton "Détail" pour infos complètes

4. Cliquer sur "Annuler":
   - Modal: "Annuler votre participation?"
   - Affiche remboursement: "+X crédits"
   - Boutons: "Continuer" et "Annuler"

5. Cliquer "Continuer":
   - Inscription annulée
   - Message: "Votre participation a été annulée"
   - Crédits remboursés intégralement
   - Trajet supprimé de "Mes trajets"
   - Place libérée côté chauffeur

6. Vérifier dans /credits → historique:
   - Transaction: "+X crédits (Remboursement annulation trajet)"

7. Cas d'erreur:
   - Trajet commencé/terminé → Bouton "Annuler" désactivé
   - Affichage: "Ce trajet a déjà commencé"
```

**Validation Vitest** (`useParticipationActions.spec.js` - à créer):
- Fonction cancel valide que trajet pas commencé
- Crédits remboursés correctement
- État mis à jour

**Validation E2E** (`participation-cancel.spec.js` - à créer):
- ✅ Passager peut annuler sa participation
- ✅ Crédits remboursés
- ✅ Trajet supprimé de my-trips
- ✅ Places actualisées chez chauffeur

---

#### US 11 - Avis et Notation (Passager)

**Objectif**: Vérifier que le passager peut laisser un avis après un trajet terminé.

**Parcours utilisateur**:
```
1. Trajet terminé par le chauffeur

2. Passager reçoit un email:
   - Sujet: "Merci pour votre trajet!"
   - Contenu: Lien vers /review/:tripId

3. Passager accède à /review/:tripId (ou clique lien email)

4. Voir le formulaire d'avis:
   - Photo/nom du chauffeur
   - Résumé du trajet (départ, arrivée, date)
   - Champ "Note" (étoiles 1-5)
   - Champ "Commentaire" (optionnel, max 500 chars)
   - Checkboxes additionnelles (optionnelles):
     * "Le trajet s'est bien déroulé"
     * "Le chauffeur était courtois"
     * "Véhicule propre et confortable"
   - Boutons: "Soumettre" et "Plus tard"

5. Remplir le formulaire:
   - Note: 5 étoiles
   - Commentaire: "Excellent trajet! Recommandé!"
   - Cocher checkboxes
   - Cliquer "Soumettre"

6. Vérifier:
   - Message: "Votre avis a été soumis pour validation"
   - Redirection vers /my-trips
   - Avis en attente (status "En attente de modération")

7. Si problème rencontré:
   - Checkbox spéciale: "Le trajet s'est mal déroulé"
   - Champ commentaire débloquer pour détails
   - Soumission → validation employé (voir US Employé)

8. Validation (automatique ou par employé):
   - Avis validé → apparaît dans le profil du chauffeur
   - Avis rejeté → supprimé, passager notifié (optionnel)

9. Cas d'erreur:
   - Trajet pas encore terminé → Redirection vers /my-trips
   - Déjà un avis soumis → "Vous avez déjà laissé un avis pour ce trajet"
```

**Validation Vitest** (`ReviewForm.spec.js` - existant ou à créer):
- Form render avec tous les champs
- Validation de la note (1-5)
- Commentaire limité à 500 chars
- Emit submit correctement

**Validation E2E** (`review-submit.spec.js` - à créer):
- ✅ Passager peut accéder au formulaire d'avis
- ✅ Soumettre un avis avec note et commentaire
- ✅ Avis apparaît dans le profil du chauffeur
- ✅ Historique de notification d'avis

---

### 3️⃣ UTILISATEUR CONNECTÉ - CHAUFFEUR

#### US 8 - Profil Chauffeur

**Objectif**: Vérifier que l'utilisateur peut devenir chauffeur et renseigner toutes les infos requises.

**Parcours utilisateur**:
```
1. Utilisateur connecté accède à /profile
   → Clic sur "Je veux devenir chauffeur"
   → Redirection vers /become-driver (ou /profile/become-driver)

2. Vue multi-étapes (ou form unique) affichant:

   ÉTAPE 1 - VÉHICULE(S)
   - Bouton "Ajouter un véhicule"
   - Form avec champs:
     * Marque (dropdown: Renault, Peugeot, Tesla, etc.)
     * Modèle (text input)
     * Couleur (color picker ou dropdown)
     * Plaque d'immatriculation (text input, format: XX-000-XX)
     * Date de première immatriculation (date picker)
     * Nombre de places disponibles (number, 1-8)
     * Électrique ou non (checkbox/toggle)
     * Ajouter bouton "Ajouter ce véhicule" → ajoute à la liste
   - Liste des véhicules ajoutés
   - Bouton "Valider et continuer" → ÉTAPE 2

   ÉTAPE 2 - PRÉFÉRENCES
   - Champs:
     * Fumeur / Non-fumeur (radio buttons ou toggle)
     * Animaux / Pas d'animaux (radio buttons)
     * Musique / Pas de musique (optionnel)
     * Réseaux sociaux / Pas de réseaux (optionnel)
     * Champ libre "Autres préférences" (textarea, max 200 chars)
   - Bouton "Valider et devenir chauffeur"

3. Après validation:
   - Utilisateur devient chauffeur
   - Redirection vers /profile
   - Nouveau menu chauffeur visible:
     * "Créer un trajet"
     * "Mes trajets en tant que chauffeur"

4. Cas d'erreur:
   - Pas de véhicule → "Vous devez ajouter au moins un véhicule"
   - Plaque invalide → "Format plaque incorrect"
   - Date future → "Date de première immatriculation invalide"
   - Aucune préférence → "Vous devez renseigner vos préférences"

5. Réinitialisation pour test:
   - IMPORTANT: Pour les tests répétés
   - Option: Endpoint API DELETE /user/driver-profile → retire rôle chauffeur, supprime véhicules et préférences
   - OU: beforeEach() crée nouvel utilisateur pour chaque test
```

**Validation Vitest** (`BecomeDriverView.spec.js` - existant ou à créer):
- ✅ Render multi-step form
- ✅ Validation des champs véhicule (plaque, date)
- ✅ Ajout/suppression de véhicules
- ✅ Validation des préférences

**Validation E2E** (`become-driver.spec.js` - existant):
- ✅ Utilisateur peut compléter le profil chauffeur
- ✅ Véhicule(s) sauvegardé(s) correctement
- ✅ Préférences enregistrées
- ✅ Rôle chauffeur activé

---

#### US 9 - Création de Trajet (Chauffeur)

**Objectif**: Vérifier que le chauffeur peut créer un trajet et fixer le prix.

**Parcours utilisateur - PRÉREQUIS: Utilisateur est chauffeur (voir US 8)**:
```
1. Chauffeur accède à /create-trip (ou via menu /profile)

2. Voir le formulaire avec:
   - Champ "Adresse de départ" (autocomplete)
   - Champ "Adresse d'arrivée" (autocomplete)
   - Champ "Date et heure de départ" (datetime picker)
   - Champ "Durée estimée" (ou heure d'arrivée auto-calculée)
   - Champ "Prix par personne" (number, > 0)
   - Sélecteur de véhicule (dropdown: liste des véhicules du chauffeur)
   - Bouton "Créer le trajet"

3. Remplir:
   - Départ: "Paris (13 Rue de la Paix)"
   - Arrivée: "Lyon (10 Quai Saint-Antoine)"
   - Date/heure: demain 08:00
   - Prix: €45
   - Véhicule: "Tesla Model 3 (2 places)"
   - Cliquer "Créer le trajet"

4. Vérifier:
   - Message: "Trajet créé avec succès!"
   - Commission appliquée: €45 - €2 = €43 crédits (chauffeur reçoit 43)
   - Trajet appears dans /my-trips (section chauffeur)
   - Trajet searchable dans /search par d'autres utilisateurs

5. Cas d'erreur:
   - Adresses vides → "L'adresse est obligatoire"
   - Prix ≤ 0 → "Le prix doit être positif"
   - Date dans le passé → "La date doit être dans le futur"
   - Pas de véhicule disponible → "Vous devez ajouter un véhicule"
   - 0 places restantes dans le véhicule → "Ce véhicule n'a plus de places"

6. Réinitialisation pour test:
   - DELETE /carpooling/:tripId → supprime le trajet
   - OU: test utilise beforeEach() pour trajet frais
```

**Validation Vitest** (`ProposeRideForm.spec.js` - à créer):
- Form render correctement
- Validation adresses (non-vides)
- Validation prix (> 0)
- Validation date (future)
- Sélection véhicule

**Validation E2E** (`create-trip.spec.js` - existant ou à créer):
- ✅ Chauffeur peut créer un trajet
- ✅ Trajet searchable
- ✅ Commission appliquée correctement
- ✅ Trajet affiche dans my-trips

---

#### US 10c - Gestion de Trajet (Chauffeur)

**Objectif**: Vérifier que le chauffeur peut démarrer et terminer un trajet, et gérer les participants.

**Parcours utilisateur - PRÉREQUIS: Trajet créé avec participant(s)**:
```
1. Chauffeur accède à /my-trips → section "Chauffeur"

2. Voir la liste des trajets:
   - Affichage destination, date, passagers inscrits, prix
   - Statut du trajet (À venir, En cours, Terminé)
   - Bouton "Démarrer" (si ≥ heure départ - 15 min)
   - Bouton "Détail" pour infos complètes
   - Bouton "Annuler" (si pas commencé)

3. À l'heure du départ, cliquer "Démarrer":
   - Modal: "Commencer le trajet?"
   - Affiche: destination, passagers (liste avec noms)
   - Boutons: "Annuler" et "Démarrer"

4. Cliquer "Démarrer":
   - Bouton change en "Arrivé à destination"
   - État du trajet: "En cours"
   - Passagers notifiés (optionnel: push notification)
   - Timestamp de départ enregistré

5. À l'arrivée, cliquer "Arrivé à destination":
   - Modal: "Terminer le trajet?"
   - Affiche: destination, passagers
   - Boutons: "Continuer" et "Annuler"

6. Cliquer "Continuer":
   - Trajet marqué comme "Terminé"
   - Timestamp d'arrivée enregistré
   - Chauffeur reçoit les crédits:
     * Prix total - commission 2€ par personne
     * Ex: 1 passager à €45 → chauffeur reçoit €43
   - Passagers reçoivent un email pour valider et laisser avis
   - Bouton "Arrivé à destination" disparaît

7. Cas d'erreur:
   - Trajet pas encore commençable → "Pas encore l'heure de démarrage"
   - Trajet déjà terminé → Boutons désactivés
   - Aucun passager → Bouton "Démarrer" actif quand même (vérifier logique)

8. Annulation par le chauffeur:
   - Avant démarrage: clic sur "Annuler"
   - Modal: "Annuler ce trajet?"
   - Affiche: "Tous les passagers seront remboursés"
   - Cliquer "Annuler le trajet":
     * Trajet supprimé
     * Tous les passagers remboursés (X crédits chacun)
     * Email notification à tous les passagers

9. Réinitialisation pour test:
   - Trajet créé → test annuler → état neutre
   - Trajet créé → test démarrer → test terminer → état neutre (supprimer trajet)
```

**Validation Vitest** (`useTripsActions.spec.js` - à créer):
- Fonction start vérifie les conditions (temps, statut)
- Fonction finish vérifie les conditions (en cours)
- Fonction cancel remboursé les passagers
- Calcul des crédits correct (prix - 2€/passager)

**Validation E2E** (`driver-trip-management.spec.js` - à créer):
- ✅ Chauffeur peut démarrer un trajet
- ✅ Chauffeur peut terminer un trajet
- ✅ Crédits versés correctement
- ✅ Passagers notifiés (email ou notification)
- ✅ Annulation fonctionne et rembourse

---

#### Historique de Trajets (Chauffeur)

**Objectif**: Vérifier que le chauffeur peut voir l'historique de ses trajets.

**Parcours utilisateur**:
```
1. Chauffeur accède à /my-trips → section "Chauffeur"

2. Voir les trajets:
   - Trajets futurs (À venir)
   - Trajets en cours (En cours)
   - Trajets passés (Terminé)

3. Chaque trajet affiche:
   - Destination, date/heure, nombre de passagers
   - Prix total reçu
   - Avis passagers (notes moyennes)
   - Durée réelle du trajet
   - Bouton "Détail" → affiche infos complètes

4. Filtrer par:
   - Date (tous, aujourd'hui, cette semaine, ce mois)
   - Statut (tous, à venir, en cours, terminé)
   - Destination (search)

5. Trier par:
   - Date (croissante/décroissante)
   - Prix (croissant/décroissant)
   - Nombre de passagers

6. Vérifier que l'historique persiste:
   - Reload page → historique toujours visible
   - API retourne tous les trajets du chauffeur
```

**Validation Vitest** (`useTrips.spec.js` - à créer):
- Récupération des trajets du chauffeur
- Filtrage par statut
- Tri par différents critères

**Validation E2E** (`driver-history.spec.js` - à créer):
- ✅ Historique affichable
- ✅ Filtres et tris fonctionnels

---

### 4️⃣ SYSTÈME DE CRÉDITS (Tous les rôles)

#### US 6c - Crédits Initiaux

**Objectif**: Vérifier que les crédits initiaux sont attribués à l'inscription.

**Parcours utilisateur**:
```
1. Nouvel utilisateur s'inscrit (voir US 6)
   - Inscription complétée

2. Accéder à /profile → onglet "Crédits"
   OU /credits

3. Vérifier:
   - Solde initial: 20 crédits
   - Affichage: "Vous disposez de 20 crédits"
   - Historique vide (première création)

4. Vérifier dans la DB:
   - Utilisateur.credits = 20
```

**Validation Vitest** (`authStore.spec.js` - à créer):
- Nouvel utilisateur créé avec 20 crédits

**Validation E2E**:
- ✅ Nouvel utilisateur a 20 crédits après inscription

---

#### Crédits: Participation (Passager)

**Objectif**: Vérifier que les crédits sont débités lors d'une participation.

**Parcours utilisateur**:
```
1. Passager a 20 crédits
2. Participe à un trajet à €15
3. Vérifier:
   - Crédits réduits: 20 - 15 = 5
   - Historique: "-15 crédits (Participation trajet Paris → Lyon)"
   - Trajet dans my-trips
4. Annule la participation
5. Vérifier:
   - Crédits restaurés: 5 + 15 = 20
   - Historique: "+15 crédits (Remboursement annulation)"
```

**Validation Vitest** (`useParticipationActions.spec.js`):
- Débit correct
- Remboursement correct

**Validation E2E**:
- ✅ Crédits débités à la participation
- ✅ Crédits remboursés à l'annulation

---

#### Crédits: Création Trajet (Chauffeur)

**Objectif**: Vérifier que la commission est appliquée à la création de trajet.

**Parcours utilisateur**:
```
1. Chauffeur crée un trajet à €50 (pour 2 places)
   - Commission: 2€ × 1 (création) = €2
   - Trajet coûtera €50/personne

2. 2 passagers se joignent au trajet:
   - Chauffeur reçoit: €50 + €50 - €2 = €98 (après termination)

3. Vérifier dans historique:
   - Crédit débité lors de création? (NON, commission appliquée à la fin)
   - Crédit crédité à la fin du trajet
```

**Validation Vitest**:
- Calcul de commission correct

**Validation E2E**:
- ✅ Commission déduite correctement

---

#### Crédits: Résumé Page (Utilisateur)

**Objectif**: Vérifier que la page de crédits affiche toutes les infos.

**Parcours utilisateur**:
```
1. Utilisateur accède à /credits (ou /profile → onglet Crédits)

2. Voir:
   - Solde actuel (ex: "Vous disposez de 78 crédits")
   - Barre de progression (visuelle)
   - Historique complet:
     * Date, type (participation, remboursement, création trajet, etc.)
     * Montant (+/-)
     * Description
   - Pagination si historique long
   - Bouton "Acheter des crédits" (optionnel, si système achat)

3. Filtrer historique:
   - Par type (participation, remboursement, etc.)
   - Par date (cette semaine, ce mois, tout)

4. Trier:
   - Par date (récent, ancien)
   - Par montant
```

**Validation Vitest** (`CreditsView.spec.js` - à créer):
- Render solde et historique
- Filtrage et tri

**Validation E2E** (`credits-page.spec.js` - à créer):
- ✅ Solde affichable
- ✅ Historique complet
- ✅ Filtres et tris

---

### 5️⃣ EMPLOYÉ

#### US 11b & US 12 - Espace Employé

**Objectif**: Vérifier que l'employé peut modérer les avis et traiter les rapports.

**Parcours utilisateur - PRÉREQUIS: Employé créé par admin (voir US Admin)**:
```
1. Employé se connecte avec identifiants créés par admin

2. Redirection vers /employee (ou /admin/employee)

3. Voir deux sections:

   SECTION 1 - MODÉRATION D'AVIS
   - Liste d'avis en attente:
     * Auteur (passager), note, commentaire
     * Chauffeur cible
     * Trajet (destination, date)
     * Statut: "En attente"
   - Pour chaque avis:
     * Bouton "Valider" → avis publié sur le profil du chauffeur
     * Bouton "Refuser" → avis supprimé, passager notifié (optionnel)
     * Champ "Raison du refus" (si refuser)
   
   SECTION 2 - RAPPORTS DE TRAJET
   - Liste de trajets signalés:
     * Numéro du trajet (ID)
     * Destination, date, participants
     * Chauffeur et passager(s)
     * Motif du rapport (ex: "Trajet s'est mal passé")
     * Commentaire du passager
     * Statut: "Non traité"
     * Email du passager et du chauffeur
   - Pour chaque rapport:
     * Bouton "Détail" → affiche infos complètes
     * Bouton "Contacter chauffeur" (optionnel)
     * Bouton "Contacter passager" (optionnel)
     * Sélecteur d'action:
       - "Approuver les crédits du chauffeur" (signale fermé)
       - "Refuser les crédits du chauffeur" (crédits non attribués)
       - "Discuter avec les deux parties" (trajet reste en litige)

4. Employé valide un avis:
   - Cliquer "Valider"
   - Avis retire de la liste
   - Avis apparaît dans le profil du chauffeur

5. Employé refuse un avis:
   - Cliquer "Refuser"
   - Champ raison apparaît
   - Entrer raison (ex: "Contenu offensant")
   - Cliquer "Confirmer refus"
   - Avis supprimé
   - Passager notifié (optionnel)

6. Employé traite un rapport:
   - Cliquer "Détail"
   - Voir toutes les infos du trajet et du rapport
   - Sélectionner une action (voir étape 3)
   - Cliquer "Confirmer"
   - Rapport fermé
   - Historique du litige conservé (optionnel)

7. Dashboard employé:
   - Nombre d'avis en attente
   - Nombre de rapports non traités
   - Avis validés ce mois
   - Litiges résolus ce mois

8. Cas d'erreur:
   - Pas d'avis en attente → "Aucun avis à modérer"
   - Pas de rapport → "Aucun rapport actuellement"

9. Réinitialisation pour test:
   - Avis validé → supprimer via DELETE /admin/review/:id
   - Rapport traité → supprimer via DELETE /admin/report/:id
```

**Validation Vitest** (`EmployeeView.spec.js` - à créer):
- Render sections avis et rapports
- Boutons valider/refuser
- Sélecteur d'actions

**Validation E2E** (`employee-moderation.spec.js` - à créer):
- ✅ Employé peut valider un avis
- ✅ Employé peut refuser un avis
- ✅ Employé peut traiter un rapport
- ✅ Avis apparaît dans profil chauffeur après validation

---

### 6️⃣ ADMINISTRATEUR

#### US 13a - Gestion des Comptes

**Objectif**: Vérifier que l'admin peut gérer les comptes utilisateurs et employés.

**Parcours utilisateur - PRÉREQUIS: Compte admin (créé en base en amont)**:
```
1. Admin se connecte avec identifiants admin (Admin/Admin2025!)

2. Redirection vers /admin (ou /admin/dashboard)

3. Voir un menu admin:
   - Gestion des utilisateurs
   - Gestion des employés
   - Statistiques
   - Paramètres

4. SECTION UTILISATEURS
   - Tableau de tous les utilisateurs:
     * Pseudo, email, rôle(s), date inscription, statut
     * Nombre de trajets (passager), crédits actuels
   - Filtrer par:
     * Rôle (tous, passagers, chauffeurs)
     * Statut (actif, suspendu)
     * Date inscription
   - Pour chaque utilisateur:
     * Bouton "Détail" → infos complètes
     * Bouton "Suspendre" → désactive le compte
       - Modal: "Suspendre cet utilisateur?"
       - Champ raison (ex: "Non-respect des CGU")
       - Cliquer "Suspendre"
       - Utilisateur ne peut plus se connecter
     * Bouton "Réactiver" (si suspendu)
     * Bouton "Supprimer" (optionnel, très destructif)

5. SECTION EMPLOYÉS
   - Liste des employés:
     * Pseudo, email, date création, actif/inactif
     * Nombre d'avis modérés
     * Nombre de rapports traités
   - Bouton "Créer un nouvel employé":
     * Modal avec champs:
       - Pseudo (obligatoire)
       - Email (obligatoire, unique)
       - Mot de passe (auto-généré ou fourni)
       - Cliquer "Créer"
     * Employé reçoit un email avec identifiants
     * Nouvel employé apparaît dans la liste

   - Pour chaque employé:
     * Bouton "Détail"
     * Bouton "Désactiver" (rôle rétracté, peut rester connecté mais sans accès employé)
     * Bouton "Supprimer"

6. Cas d'erreur:
   - Email déjà existant → "Email déjà utilisé"
   - Champ obligatoire vide → "Ce champ est obligatoire"

7. Réinitialisation pour test:
   - Employé créé → Supprimer via DELETE /admin/employee/:id
   - Utilisateur suspendu → Réactiver
```

**Validation Vitest** (`AdminView.spec.js` - à créer):
- Render tableau utilisateurs
- Render tableau employés
- Boutons suspension/création

**Validation E2E** (`admin-account-management.spec.js` - à créer):
- ✅ Admin peut suspendre un utilisateur
- ✅ Admin peut créer un employé
- ✅ Admin peut désactiver un employé
- ✅ Utilisateur suspendu ne peut pas se connecter

---

#### US 13b - Tableau de Bord et Statistiques

**Objectif**: Vérifier que l'admin peut voir les statistiques de la plateforme.

**Parcours utilisateur**:
```
1. Admin accède à /admin → onglet "Statistiques"

2. Voir un tableau de bord avec:

   GRAPHIQUE 1 - COVOITURAGES PAR JOUR
   - Graphique en barres ou ligne
   - Axe X: dates (semaine, mois sélectionnable)
   - Axe Y: nombre de covoiturages créés
   - Hover affiche le nombre exact
   - Légende: "Covoiturages créés (derniers 30 jours)"
   - Exemple: Jour 1: 5, Jour 2: 8, Jour 3: 12, etc.

   GRAPHIQUE 2 - CRÉDITS GAGNÉS PAR JOUR
   - Graphique en barres ou ligne
   - Axe X: dates (semaine, mois sélectionnable)
   - Axe Y: total crédits gagnés (commissions)
   - Hover affiche le montant exact
   - Légende: "Crédits gagnés par la plateforme (commissions)"
   - Exemple: Jour 1: €10, Jour 2: €24, Jour 3: €36, etc.

   STATISTIQUES GLOBALES
   - Total des utilisateurs
   - Total des covoiturages (tous les temps)
   - Total des crédits gagnés (depuis le début)
   - Utilisateurs actifs (ce mois)
   - Taux de complétion (trajets réussis / trajets créés)

3. Options de filtrage:
   - Plage de dates (semaine, mois, année, personnalisée)
   - Type de statistiques (covoiturages, crédits, utilisateurs)

4. Export (optionnel):
   - Bouton "Exporter en CSV"
   - Télécharge un fichier CSV avec les données

5. Cas d'erreur:
   - Pas de données pour la plage sélectionnée → "Aucune donnée disponible"
   - Graphique charge correctement même avec peu de données
```

**Validation Vitest** (`AdminDashboard.spec.js` - à créer):
- Render graphiques
- Render statistiques globales
- Filtrage par dates

**Validation E2E** (`admin-statistics.spec.js` - à créer):
- ✅ Graphiques chargent correctement
- ✅ Filtres fonctionnels
- ✅ Statistiques cohérentes

---

## 🔄 Stratégie de Réinitialisation d'Environnement

### Approche Recommandée pour EcoRide

**Combinaison Option 3 + Option 4 + Endpoints de Nettoyage**:

#### Créer ces Endpoints Backend (Backend/routes/adminRoutes.js)

```javascript
// Endpoints de test/nettoyage (seulement en dev/test)
router.post('/test/reset-user', async (req, res) => {
  // Réinitialiser l'utilisateur sans suppression
  // - Retirer rôle chauffeur
  // - Supprimer les véhicules
  // - Supprimer les préférences
  // - Réinitialiser les crédits à 20
  // - Supprimer les trajets en cours/participations
  const { email } = req.body;
  // ... implémentation
});

router.post('/test/cleanup-user', async (req, res) => {
  // Supprimer complètement l'utilisateur
  const { email } = req.body;
  // ... implémentation
});

router.post('/test/cleanup-carpooling', async (req, res) => {
  // Supprimer un trajet spécifique
  const { carpoolingId } = req.body;
  // ... implémentation
});
```

#### Structurer les E2E Tests avec beforeEach/afterEach

```javascript
// Frontend/e2e/tests/driver-workflow.spec.js
test.describe('Driver Workflow', () => {
  let testUser = null;
  const TEST_EMAIL = 'test-driver@ecoride.test';

  test.beforeEach(async ({ page }) => {
    // Avant chaque test: réinitialiser l'état
    await fetch(`${API_URL}/admin/test/reset-user`, {
      method: 'POST',
      body: JSON.stringify({ email: TEST_EMAIL }),
    });
    
    // Login avec l'utilisateur reset
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="email-input"]', TEST_EMAIL);
    await page.fill('[data-testid="password-input"]', 'Test2025!');
    await page.click('[data-testid="login-button"]');
    await page.waitForNavigation();
  });

  test.afterEach(async ({ page }) => {
    // Après chaque test: nettoyage optionnel
    // Garder l'utilisateur pour inspection post-test
    // OU: await cleanup(TEST_EMAIL);
  });

  test('user can become driver', async ({ page }) => {
    // Test dans un état neutre et propre
    // Utilisateur connecté, mais sans rôle chauffeur
  });
});
```

#### Alternative Plus Simple: Utilisateurs Éphémères

```javascript
// Si vous voulez chaque test avec un nouvel utilisateur
const getUniqueEmail = () => `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@ecoride.test`;

test.beforeEach(async ({ page }) => {
  const email = getUniqueEmail();
  // Créer l'utilisateur
  await page.goto(`${BASE_URL}/register`);
  await page.fill('[data-testid="pseudo-input"]', `TestUser${Date.now()}`);
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', 'Test2025!');
  await page.fill('[data-testid="password-confirm-input"]', 'Test2025!');
  await page.click('[data-testid="register-button"]');
  await page.waitForNavigation();
  
  // Utilisateur créé et connecté, état vierge
});
```

---

## 📊 Résumé des Tests Existants vs À Créer

### ✅ Vitest Existants

- `HomeView.spec.js` — Page d'accueil
- `SearchBar.spec.js` — Barre de recherche
- `useSearchForm.spec.js` — Formulaire de recherche (composable)
- `BaseButton.spec.js`, `PrimarySecondary.spec.js` — Composants UI
- Plusieurs tests de composants affichage

### ⚠️ Vitest À Créer/Étendre (Post-évaluation)

| Composant/Logique                | Type        | Priorité  | Statut | Notes                           |
| -------------------------------- | ----------- | --------- | ------ | ------------------------------- |
| `useParticipationActions`        | Composable  | 🔴 Haute   | ⏳ TODO | Logique métier de participation |
| `useTripsActions`                | Composable  | 🔴 Haute   | ⏳ TODO | Démarrage/fin de trajet         |
| `TripFilters`                    | Composant   | 🟡 Moyenne | ⏳ TODO | Filtrage avancé                 |
| `ReviewForm`                     | Composant   | 🟡 Moyenne | ⏳ TODO | Soumission d'avis               |
| `CreditsView`                    | Vue         | 🟡 Moyenne | ⏳ TODO | Affichage crédits               |
| `AdminView`                      | Vue         | 🟡 Moyenne | ⏳ TODO | Gestion comptes                 |
| API services (`services/api.js`) | Service     | 🔴 Haute   | ⏳ TODO | Appels HTTP centralisés         |
| Validation de formulaires        | Utilitaires | 🟡 Moyenne | ⏳ TODO | Email, mot de passe, etc.       |

### ✅ E2E Existants (7 fichiers)

- ✅ `login.spec.js` — Connexion
- ✅ `become-driver.spec.js` — Profil chauffeur
- ✅ `my-trips.spec.js` — Gestion de trajets
- ✅ `search-results.spec.js` — Recherche et résultats
- ✅ `driver-preferences.spec.js` — Préférences chauffeur
- ✅ `icon-rendering.spec.js` — Vérification des icônes
- ✅ 1-2 autres fichiers non détaillés

### ✅ E2E Créés Cette Session (5 nouveaux fichiers)

| Parcours                       | Priorité  | Statut | Notes                              |
| ------------------------------ | --------- | ------ | ---------------------------------- |
| ✅ `homepage.spec.js`           | 🟡 Moyenne | ✅ FAIT | 5 tests, tous passant              |
| ✅ `registration.spec.js`       | 🔴 Haute   | ✅ FAIT | 4 tests inscription + validation   |
| ✅ `passenger-workflow.spec.js` | 🔴 Haute   | ✅ FAIT | 6 tests recherche → participation  |
| ✅ `driver-workflow.spec.js`    | 🔴 Haute   | ✅ FAIT | 7 tests création trajet → terminer |
| ✅ `review-submission.spec.js`  | 🔴 Haute   | ✅ FAIT | 7 tests avis et notation           |

### ⏳ E2E À Créer (Post-évaluation)

| Parcours                           | Priorité  | Statut | Notes                                    |
| ---------------------------------- | --------- | ------ | ---------------------------------------- |
| `employee-moderation.spec.js`      | 🟡 Moyenne | ⏳ TODO | Modération d'avis et rapports            |
| `admin-account-management.spec.js` | 🟡 Moyenne | ⏳ TODO | Création employé, suspension utilisateur |
| `admin-statistics.spec.js`         | 🟡 Moyenne | ⏳ TODO | Dashboard et graphiques                  |
| `credits-page.spec.js`             | 🟡 Moyenne | ⏳ TODO | Historique et solde crédits              |
| `edge-cases.spec.js`               | 🟡 Moyenne | ⏳ TODO | Erreurs, validations, cas limites        |

---

## 🎯 Plan d'Action Recommandé

### ✅ Phase 1: Foundation (COMPLÉTÉE)
1. ✅ Créer endpoints de test/nettoyage Backend
2. ✅ Créer E2E pour parcours critiques (5 fichiers, 29 tests)
3. ✅ Backend running et opérationnel
4. ✅ Stratégie de réinitialisation documentée

### 🟡 Phase 2: Coverage (Post-évaluation)
5. ⏳ Créer Vitest pour services API (`api.js`)
6. ⏳ Créer E2E pour employé et admin
7. ⏳ Tests de validation et cas d'erreur avancés

### ⏳ Phase 3: Refinement (Post-évaluation)
8. ⏳ Améliorer Vitest existants
9. ⏳ Ajouter tests de régression
10. ⏳ Vérifier couverture (aim: >80% components)
6. Ajouter tests de validation et cas d'erreur

### Phase 3: Refinement (Semaine 4)
7. Améliorer Vitest existants
8. Ajouter tests de régression
9. Vérifier couverture (aim: >80% components)

---

## 📝 Notes Importantes

- **Isolation des tests**: Utiliser beforeEach/afterEach strictement pour éviter les pollutions d'état
- **Données de test**: Prioriser utilisateurs éphémères ou réinitialisation via API
- **Timing**: E2E avec délais appropriés pour les animations et transitions
- **Accessibilité**: Utiliser `[data-testid]` plutôt que sélecteurs fragiles
- **Logs**: Garder logs pertinents dans Vitest (console.error/warn), retirer console.log

