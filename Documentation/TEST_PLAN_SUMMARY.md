# Plan de Test - Résumé Exécutif

**Date**: 15 décembre 2025  
**Statut**: ✅ Complété  
**Prochaine étape**: Exécution du plan (Vitest → E2E → Refactoring)

---

## 📚 Documents Créés

### 1. **TEST_STRATEGY_PLAN.md** ⭐ (Document Principal)
- **Contenu**: Tous les parcours utilisateur (US) du Cahier des charges en français
- **Organisé par**: Rôles (Visiteur → Utilisateur → Chauffeur → Employé → Admin)
- **Inclut**:
  - Description détaillée de chaque parcours utilisateur
  - Validation Vitest requise
  - Validation E2E requise
  - Cas d'erreur à tester
  - Stratégies de réinitialisation d'environnement
  - Endpoints API à créer pour les tests

**👉 C'est le document de référence** pour savoir **QUOI tester**.

---

### 2. **TEST_COVERAGE_MAPPING.md** (Suivi d'Implémentation)
- **Contenu**: Vue d'ensemble des tests existants vs. à créer
- **Inclut**:
  - Liste des 13 Vitest existants avec statut ✅
  - Liste des Vitest à créer (priorité 🔴🟡)
  - Liste des 8 E2E existants avec statut ✅
  - Liste des E2E à créer (priorité 🔴🟡)
  - Mapping complet US → Vitest → E2E
  - Séquence d'implémentation recommandée par phase
  - Critères de succès

**👉 C'est le document de suivi** pour savoir **COMBIEN** de tests créer et dans quel ordre.

---

### 3. **MANUAL_TEST_CHECKLIST.md** (Validation Manuelle)
- **Contenu**: Checklist pratique pour tester chaque parcours manuellement
- **Format**: Cases à cocher (- [ ]) pour chaque étape
- **Inclut**:
  - Comptes de test disponibles
  - Parcours complets avec étapes détaillées
  - Validations à effectuer
  - Cas d'erreur à tester
  - Aucune connaissance technique requise (humain peut tester)

**👉 C'est le document pour le student** pour valider manuellement que tout fonctionne.

---

### 4. **copilot-instructions.md** (Mis à Jour)
- **Section ajoutée**: "🧪 Complete Testing Strategy"
- **Contenu**:
  - Workflow de test (Vitest → E2E → Régression)
  - Stratégies de réinitialisation d'environnement en détail
  - Exemple de code pour reset API
  - Exemple de tests avec beforeEach/afterEach
  - Compte d'utilisateurs éphémères
  - Vitest vs E2E trade-offs
  - Isolation des tests + best practices

**👉 C'est le guide** pour **COMMENT tester** (méthode et stratégie).

---

## 🎯 Stratégie de Réinitialisation d'Environnement

### ✅ Approche Recommandée (Combinée)

**Backend** (à implémenter dans `Backend/routes/adminRoutes.js`):
```javascript
POST /admin/test/reset-user          // Réinitialiser sans suppression
POST /admin/test/cleanup-user        // Supprimer complètement
POST /admin/test/cleanup-carpooling  // Supprimer un trajet
```

**E2E** (structure avec beforeEach):
```javascript
test.beforeEach(async ({ page }) => {
  // 1. Reset l'utilisateur de test
  await fetch(`${API_URL}/admin/test/reset-user`, {
    method: 'POST',
    body: JSON.stringify({ email: 'test@test.com' }),
  });
  
  // 2. Login
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', 'test@test.com');
  await page.fill('[data-testid="password-input"]', 'Test2025!');
  await page.click('[data-testid="login-button"]');
});
```

**Avantages**:
- ✅ État neutre entre chaque test
- ✅ Tests isolés et reproductibles
- ✅ Pas de pollution de DB
- ✅ Rapide (pas de suppression/création, juste reset)

---

## 🛠️ Workflow de Mise en Œuvre

### Phase 1: Foundation (Semaine 1-2) 🔴 Haute Priorité

**BACKEND**:
- [ ] Créer endpoints `/admin/test/reset-user`, `/cleanup-user`, `/cleanup-carpooling`
- [ ] Tester les endpoints manuellement

**VITEST** (4 fichiers):
- [ ] `useParticipationActions.spec.js` — Logique participation (débits, crédits)
- [ ] `useTripsActions.spec.js` — Logique trajet (démarrage, fin, versement)
- [ ] `api.spec.js` — Services API (erreurs, headers)
- [ ] `ReviewForm.spec.js` — Validation formulaire avis

**E2E** (4 fichiers):
- [ ] `registration.spec.js` — Inscription + 20 crédits
- [ ] `passenger-workflow.spec.js` — Recherche → Participation → Annulation
- [ ] `driver-trip-management.spec.js` — Démarrage → Fin → Versement crédits
- [ ] `review-submit.spec.js` — Avis post-trajet

### Phase 2: Coverage (Semaine 3) 🟡 Priorité Moyenne

**VITEST** (5+ fichiers):
- [ ] `TripFilters.spec.js`
- [ ] `ProposeRideForm.spec.js`
- [ ] `CarpoolingDetailView.spec.js`
- [ ] `validators.spec.js` (email, password, plaque)
- [ ] `useTrips.spec.js`

**E2E** (8+ fichiers):
- [ ] `navigation.spec.js`
- [ ] `profile.spec.js`
- [ ] `create-trip.spec.js`
- [ ] `participation-cancel.spec.js`
- [ ] `employee-moderation.spec.js`
- [ ] `admin-account-management.spec.js`
- [ ] `admin-statistics.spec.js`
- [ ] `credits-page.spec.js`

### Phase 3: Refinement (Semaine 4) ✅ Validation

- [ ] Ajouter tests edge cases
- [ ] Couverture > 80% pour composants
- [ ] Tous les E2E sans flakiness
- [ ] `npm run lint` ✅
- [ ] Documentation complète

---

## 📊 État Actuel

### Vitest: 13 Existants ✅

| Couverture      | Fichiers                                                                                                 |
| --------------- | -------------------------------------------------------------------------------------------------------- |
| ✅ Vues          | HomeView, ProfileView, VisualsView                                                                       |
| ✅ Composables   | useSearchForm, useScroll                                                                                 |
| ✅ UI Components | BaseButton, NavButton, PrimarySecondary, HeroSection, SearchBar, ArrowsFooter, AboutSection, VisualsDemo |
| ⚠️ Métier        | ❌ (À créer: useParticipationActions, useTripsActions, services API)                                      |

### E2E: 8 Existants ✅

| Couverture   | Fichiers                                                                  |
| ------------ | ------------------------------------------------------------------------- |
| ✅ Auth       | login.spec.js                                                             |
| ✅ Chauffeur  | become-driver.spec.js, driver-upgrade.spec.js, driver-preferences.spec.js |
| ✅ Historique | my-trips.spec.js                                                          |
| ✅ Workflow   | carpooling-workflow.spec.js (basique)                                     |
| ✅ UI         | icon-rendering.spec.js                                                    |
| ⚠️ Passager   | ❌ (À créer: passenger-workflow, participation-cancel, review-submit)      |
| ⚠️ Employé    | ❌ (À créer: employee-moderation)                                          |
| ⚠️ Admin      | ❌ (À créer: admin-accounts, admin-statistics)                             |

---

## 🔄 Workflow de Régression (Si E2E Échoue)

```
E2E Échoue
  ↓
1. Vérifier source code vs test script
   → Test mauvais? Corriger test
   → Code mauvais? Corriger code
  ↓
2. Créer/Étendre Vitest pour la zone affectée
   → Isoler le bug en tests unitaires
   → Inclure edge cases
  ↓
3. Exécuter Vitest → Debug
  ↓
4. Exécuter E2E → Valider le fix
  ↓
✅ E2E Passe → Continuer
```

---

## ✅ Checklist de Lancement

### Avant de commencer les tests:

- [ ] Backend démarre: `npm run dev` (port 3000)
- [ ] Frontend démarre: `npm run dev` (port 5173)
- [ ] Base de données initialisée
- [ ] Comptes de test en place:
  - [ ] test@test.com / Test2025! (utilisateur standard)
  - [ ] admin@ecoride.test / Admin2025! (admin)
- [ ] Endpoints `/admin/test/*` implémentés (priorité 🔴)
- [ ] copilot-instructions.md lu et compris
- [ ] TEST_STRATEGY_PLAN.md comme référence

---

## 📞 Questions/Clarifications

**Q: Par où commencer?**  
A: Lire TEST_STRATEGY_PLAN.md (Visiteur → Chauffeur) + MANUAL_TEST_CHECKLIST.md + commencer Phase 1 des tests.

**Q: Comment tester sans E2E?**  
A: MANUAL_TEST_CHECKLIST.md — checklist papier/digital pour tester manuellement.

**Q: Quel ordre de test?**  
A: Vitest d'abord (rapide) → E2E ensuite (intégration) → Si E2E échoue, retour Vitest.

**Q: Réinitialisation du DB entre tests?**  
A: Endpoints `/admin/test/reset-user` et `/cleanup-*` dans beforeEach() de chaque test.

**Q: Dois-je modifier le code source?**  
A: Principalement créer endpoints de test + créer fichiers Vitest/E2E. Refactoring vient **après** validation.

---

## 🎯 Succès = Tous les Tests Passent ✅

Quand tous les Vitest (existants + nouveaux) et tous les E2E (existants + nouveaux) passent:

✅ Application validée et fiable  
✅ Prête pour refactoring  
✅ Prête pour présentation orale  

---

## 📌 Dernière Remarque

Ce plan est **complet, détaillé et actionnable**. Le student peut maintenant:

1. **Lire** TEST_STRATEGY_PLAN.md pour comprendre chaque US
2. **Valider manuellement** avec MANUAL_TEST_CHECKLIST.md
3. **Créer les tests** suivant TEST_COVERAGE_MAPPING.md
4. **Implémenter** en utilisant copilot-instructions.md comme guide
5. **Itérer** avec la stratégie de régression si nécessaire

**Tous les parcours utilisateur du Cahier des charges sont couverts.**

Bon courage! 🚀

