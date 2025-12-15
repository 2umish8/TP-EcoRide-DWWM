# Test Coverage Mapping & Implementation Gaps

**Date**: 15 décembre 2025  
**Status**: Reference for implementation planning  
**Purpose**: Track existing tests vs. TEST_STRATEGY_PLAN.md and identify what needs to be created

---

## 📊 Vitest Coverage Analysis

### ✅ Existants (13 tests)

| File | Component/Feature | Coverage | Status |
|------|-------------------|----------|--------|
| `Views/__tests__/HomeView.spec.js` | Page d'accueil | Render components | ✅ Done |
| `Views/__tests__/ProfileView.spec.js` | Profil utilisateur | Render + rôle display | ✅ Done |
| `composables/__tests__/useSearchForm.spec.js` | Formulaire recherche | État, validation, navigation | ✅ Done |
| `composables/__tests__/useScroll.spec.js` | Scroll utility | Scroll events | ✅ Done |
| `components/__tests__/HeroSection.spec.js` | Hero banner | Render | ✅ Done |
| `components/__tests__/SearchBar.spec.js` | Barre recherche | Input, emit, submit | ✅ Done |
| `components/__tests__/ArrowsFooter.spec.js` | Footer navigation | Render + navigation | ✅ Done |
| `components/__tests__/AboutSection.spec.js` | About section | Render | ✅ Done |
| `components/ui/__tests__/NavButton.spec.js` | Navigation button | Render + click | ✅ Done |
| `components/ui/__tests__/PrimarySecondary.spec.js` | Button variants | Primary + Secondary styles | ✅ Done |
| `components/ui/__tests__/BaseButton.spec.js` | Base button | Render + events | ✅ Done |
| `components/test/__tests__/VisualsDemo.spec.js` | Visual demo | Component render | ✅ Done |
| `Views/test/__tests__/VisualsView.spec.js` | Visuals page | Render | ✅ Done |

### ⚠️ À Créer (Priorité)

#### 🔴 Haute Priorité - Logique Métier Critique

| Feature | Vitest à Créer | US/Contexte | Notes |
|---------|----------------|-----------|-------|
| **Participation** | `useParticipationActions.spec.js` | US 10a/10b | • Validation des crédits<br/>• Débit/remboursement<br/>• Cas d'erreur (insuffisants, déjà participé) |
| **Gestion Trajet** | `useTripsActions.spec.js` | US 10c/11 | • Start/finish trajet<br/>• Versement crédits<br/>• Annulation + remboursement |
| **Services API** | `api.spec.js` (services/api.js) | Tous les US | • Erreurs réseau<br/>• Auth headers<br/>• Response parsing |
| **Avis** | `ReviewForm.spec.js` | US 11 | • Validation note (1-5)<br/>• Limites commentaire<br/>• Submit correctness |

#### 🟡 Priorité Moyenne - Composants & Filtres

| Feature | Vitest à Créer | US/Contexte | Notes |
|---------|----------------|-----------|-------|
| **Filtres Recherche** | `TripFilters.spec.js` | US 4 | • Mise à jour filtres<br/>• Combinaisons filtres<br/>• Reset filtres |
| **Crédits Page** | `CreditsView.spec.js` | Système crédits | • Affichage solde<br/>• Historique<br/>• Filtrage/tri |
| **Admin Comptes** | `AdminView.spec.js` | US 13a | • Render tableau<br/>• Suspend/activate<br/>• Créer employé |
| **Validation Formulaires** | `validators.spec.js` | Tous forms | • Email validation<br/>• Mot de passe sécurité<br/>• Plaque immatriculation |
| **Détail Covoiturage** | `CarpoolingDetailView.spec.js` | US 5 | • Render infos complètes<br/>• Avis du chauffeur<br/>• Préférences |

### Mapping Vitest → TEST_STRATEGY_PLAN.md

| US | Parcours | Vitest Existant | Vitest À Créer | E2E |
|----|----------|-----------------|-----------------|-----|
| **US 1** | Accueil | HomeView.spec.js ✅ | - | homepage.spec.js (à créer) |
| **US 2** | Navigation | NavButton.spec.js ✅ | AppNavbar.spec.js | navigation.spec.js (à créer) |
| **US 3/4** | Recherche + Filtres | SearchBar.spec.js ✅<br/>useSearchForm.spec.js ✅ | TripFilters.spec.js ⚠️ | search-results.spec.js ✅ |
| **US 5** | Détail Covoiturage | - | CarpoolingDetailView.spec.js ⚠️ | search-results.spec.js ✅ (intégré) |
| **US 6** | Inscription | - | validators.spec.js ⚠️ | registration.spec.js ⚠️ (à créer) |
| **US 7** | Connexion | - | validators.spec.js ⚠️ | login.spec.js ✅ |
| **US 8** | Profil + Rôles | ProfileView.spec.js ✅ | - | profile.spec.js ⚠️ (à créer) |
| **US 9** | Créer Trajet | - | ProposeRideForm.spec.js ⚠️ | create-trip.spec.js ⚠️ (à créer) |
| **US 10a** | Participation | - | useParticipationActions.spec.js 🔴 | passenger-workflow.spec.js 🔴 |
| **US 10b** | Annulation (Passager) | - | useParticipationActions.spec.js 🔴 | participation-cancel.spec.js ⚠️ |
| **US 10c** | Gestion Trajet (Chauffeur) | - | useTripsActions.spec.js 🔴 | driver-trip-management.spec.js 🔴 |
| **US 11** | Avis Passager | - | ReviewForm.spec.js 🟡 | review-submit.spec.js ⚠️ |
| **US 12** | Employé Modération | - | - | employee-moderation.spec.js ⚠️ |
| **US 13a** | Admin Comptes | - | AdminView.spec.js 🟡 | admin-account-management.spec.js ⚠️ |
| **US 13b** | Admin Statistiques | - | AdminDashboard.spec.js 🟡 | admin-statistics.spec.js ⚠️ |
| **Crédits** | Système Crédits | - | CreditsView.spec.js 🟡 | credits-page.spec.js ⚠️ |
| **Historique** | Trajets Passé/Chauffeur | - | useTrips.spec.js 🟡 | driver-history.spec.js ⚠️ |

---

## 📊 E2E Coverage Analysis

### ✅ Existants (8 tests)

| File | Parcours | Scope | Status |
|------|----------|-------|--------|
| `homepage.spec.js` | Titre page d'accueil | Basic | ✅ Done |
| `login.spec.js` | Connexion complète | Authentification | ✅ Done |
| `become-driver.spec.js` | Profil chauffeur complet | Chauffeur inscription | ✅ Done (243 lignes) |
| `driver-upgrade.spec.js` | Upgrade depuis profil | Chauffeur alternative | ✅ Done |
| `my-trips.spec.js` | Gestion trajets | Chauffeur + Passager | ✅ Done |
| `driver-preferences.spec.js` | Préférences chauffeur | Chauffeur détails | ✅ Done |
| `icon-rendering.spec.js` | Icones Font Awesome | UI/Icons | ✅ Done |
| `carpooling-workflow.spec.js` | Full workflow | Création/Recherche/Participation | ✅ Done |

### ⚠️ À Créer (Priorité)

#### 🔴 Haute Priorité - Parcours Critiques

| Test | Parcours | US | Pourquoi | Complexity |
|------|----------|-----|---------|-----------|
| `registration.spec.js` | Inscription → 20 crédits | US 6 | Crédits initiaux critiques | Haute |
| `passenger-workflow.spec.js` | Recherche → Participation → Annulation | US 3/4/10a/10b | Cœur du produit passager | Haute |
| `driver-trip-management.spec.js` | Démarrage → Fin → Versement crédits | US 10c/11 | Cœur du produit chauffeur | Haute |
| `review-submit.spec.js` | Avis post-trajet | US 11 | Système d'avis métier | Moyenne |

#### 🟡 Priorité Moyenne - Parcours Complémentaires

| Test | Parcours | US | Pourquoi | Complexity |
|------|----------|-----|---------|-----------|
| `navigation.spec.js` | Tous les liens navbar | US 2 | Accessibilité | Faible |
| `profile.spec.js` | Page profil complète | US 8 | Affichage user | Moyenne |
| `create-trip.spec.js` | Création trajet | US 9 | Chauffeur création | Moyenne |
| `participation-cancel.spec.js` | Annulation participation | US 10b | Remboursement | Moyenne |
| `driver-history.spec.js` | Historique trajets chauffeur | US 10 | Affichage historique | Faible |
| `employee-moderation.spec.js` | Modération avis + rapports | US 12 | Employé modération | Moyenne |
| `admin-account-management.spec.js` | Suspension/Création employé | US 13a | Admin comptes | Moyenne |
| `admin-statistics.spec.js` | Dashboard + graphiques | US 13b | Admin stats | Moyenne |
| `credits-page.spec.js` | Solde + historique crédits | Système | Affichage crédits | Faible |
| `edge-cases.spec.js` | Erreurs, validations, limites | Tous | Robustesse | Moyenne |

### Mapping E2E → TEST_STRATEGY_PLAN.md

```
✅ Existants et couverts
├── Homepage (Basic)
├── Login (Visiteur → Utilisateur)
├── Become Driver (Chauffeur Setup)
├── My Trips (Historique)
├── Driver Preferences (Préférences)
├── Carpooling Workflow (Recherche + Participation basique)
└── Icon Rendering (UI)

🔴 À créer (Haute Priorité)
├── Registration (Visiteur → Nouvel Utilisateur + 20 crédits)
├── Passenger Workflow (Passager: Recherche → Participe → Annule)
├── Driver Trip Management (Chauffeur: Démarre → Termine → Crédits)
└── Review Submit (Passager: Avis post-trajet)

🟡 À créer (Moyenne Priorité)
├── Navigation (Tous les liens)
├── Profile Detail (Affichage user complet)
├── Create Trip (Chauffeur creation)
├── Participation Cancel (Remboursement)
├── Driver History (Historique trips)
├── Employee Moderation (Modère avis + rapports)
├── Admin Accounts (Suspend/Créer employés)
├── Admin Statistics (Dashboard + graphs)
├── Credits Page (Historique + solde)
└── Edge Cases (Erreurs, validations)
```

---

## 🛠️ Implementation Sequence Recommended

### Phase 1: Foundation (Week 1-2)

**BACKEND SETUP** (Critical for E2E)
- [ ] Create `/admin/test/reset-user` endpoint
- [ ] Create `/admin/test/cleanup-user` endpoint
- [ ] Create `/admin/test/cleanup-carpooling` endpoint
- [ ] Test the endpoints manually

**VITEST CREATION** (High Priority)
1. [ ] `useParticipationActions.spec.js` — Participation logic (débit, remboursement, crédits)
2. [ ] `useTripsActions.spec.js` — Trip start/finish, credit calculation
3. [ ] `api.spec.js` — API service (error handling, auth headers)
4. [ ] `ReviewForm.spec.js` — Form validation + submit

**E2E CREATION** (High Priority)
1. [ ] `registration.spec.js` — New user + 20 credits
2. [ ] `passenger-workflow.spec.js` — Search → Join → Cancel
3. [ ] `driver-trip-management.spec.js` — Start → Finish → Credits
4. [ ] `review-submit.spec.js` — Review post-trip

### Phase 2: Coverage (Week 3)

**VITEST CREATION** (Medium Priority)
- [ ] `TripFilters.spec.js`
- [ ] `ProposeRideForm.spec.js`
- [ ] `CarpoolingDetailView.spec.js`
- [ ] `validators.spec.js` (email, password, plaque)
- [ ] `useTrips.spec.js` (fetch + filter trips)

**E2E CREATION** (Medium Priority)
- [ ] `navigation.spec.js`
- [ ] `profile.spec.js`
- [ ] `create-trip.spec.js`
- [ ] `participation-cancel.spec.js`
- [ ] `employee-moderation.spec.js`
- [ ] `admin-account-management.spec.js`
- [ ] `admin-statistics.spec.js`
- [ ] `credits-page.spec.js`

### Phase 3: Refinement (Week 4)

**VITEST ENHANCEMENTS**
- [ ] Add edge cases to existing tests
- [ ] Add error scenarios
- [ ] Extend composables with more conditions

**E2E FINALIZATION**
- [ ] `edge-cases.spec.js` — Erreurs, limites, validations
- [ ] `driver-history.spec.js` — Historique affichage
- [ ] Manual testing of all E2E tests

**VALIDATION**
- [ ] Run full Vitest suite: `npm run test:unit`
- [ ] Run full E2E suite: `npx playwright test --project=chromium`
- [ ] Code coverage report
- [ ] Lint check: `npm run lint`

---

## 📝 Notes Additionnelles

### Test Data Strategy

**For Vitest**:
- Use `vi.mock()` for API calls
- Create fixtures for common objects (trip, user, etc.)
- Use factory functions: `createMockTrip()`, `createMockUser()`

**For E2E**:
- Use `beforeEach()` to reset state via API endpoints
- Create ephemeral users per test: `test-${Date.now()}@ecoride.test`
- OR reuse global test users with cleanup: `test@test.com`

### Error Handling Vitest

```javascript
// Example: Testing error scenarios
test('should handle insufficient credits', () => {
  const user = { credits: 5 };
  const trip = { price: 50 };
  
  expect(() => {
    participateInTrip(user, trip);
  }).toThrow('Crédits insuffisants');
});

test('should refund on cancellation', () => {
  const user = { credits: 0 };
  const participation = { trip: { price: 50 } };
  
  cancelParticipation(user, participation);
  
  expect(user.credits).toBe(50);
});
```

### E2E Best Practices

```javascript
// Always use data-testid for selectors
await page.fill('[data-testid="email-input"]', 'test@example.com');

// Wait for actual conditions, not timeouts
await page.waitForNavigation();
await expect(page.locator('.success-message')).toBeVisible();

// Use beforeEach for setup, afterEach for cleanup
test.beforeEach(async ({ page }) => {
  // Reset state
  // Login
});

test.afterEach(async ({ page }) => {
  // Optional cleanup
  // Logout
});
```

---

## 🎯 Success Criteria

Once all tests are created and passing:

✅ **Vitest**:
- All 13 existing tests passing
- All new tests (20+) passing
- Coverage: >80% for components and composables

✅ **E2E**:
- All 8 existing tests passing
- All new tests (10+) passing
- No flaky tests (< 5% failure rate)
- Environment reset working reliably

✅ **Code Quality**:
- `npm run lint` passes with no blocking errors
- No console.log in source code (only console.error/warn)
- Max 300 lines per component file

✅ **Documentation**:
- TEST_STRATEGY_PLAN.md complete and reference document
- copilot-instructions.md updated with testing workflow
- Each test file has clear description comment
- Endpoint implementations documented in Backend/

