**Titre**: Refactorisation — Fichiers `Frontend/src` trop longs : causes et plan d'action

## Résumé
- Objectif: expliquer pourquoi plusieurs Single-File Components (SFC) et fichiers du dossier `Frontend/src` sont excessivement longs, identifier causes récurrentes et fournir un plan d'action concret et itératif pour nettoyer et découper le code.

## Fichiers identifiés (taille approximative)
- `src/views/MyTripsView.vue` — ~1982 lignes (très grand)
- `src/views/ProfileView.vue` — ~1562 lignes
- `src/views/SearchResultsView.vue` — ~1300 lignes
- `src/views/CarpoolingDetailView.vue` — ~1189 lignes
- `src/views/HomeView.vue` — ~779 lignes
- `src/views/CreateTripView.vue` — ~634 lignes

Ces fichiers représentent les plus gros points chauds — templates très volumineux, styles larges et logique métier/formatage clickée dans le même fichier.

## Principales causes observées côté frontend
- Composants monolithiques: templates, logique métier, state local et styles sont tous dans la même SFC sans découpage en composants atomiques.
- Répétition d'UI patterns: cartes de trajet, modals, tuiles, badges et tooltips ré-implémentés dans plusieurs vues plutôt que composants partagés.
- Logique métier et formatters dans les vues: fonctions de formatage de dates, calculs de durée, tri et filtres directement dans la SFC au lieu d'être dans des composables ou helpers.
- CSS volumineux scoped: styles lourds dans chaque SFC (au lieu d'extraire dans des modules CSS/variables partagées ou utilitaires) — ceci augmente la duplication.
- Modals & interactions complexes définies inline: code pour modals, confirmations et transitions dans la SFC au lieu d'un composant modal réutilisable.
- Absence ou utilisation limitée de composables: parties réutilisables (formatters, pagination, recherche) non extraites en `composables/`.
- Templates très détaillés: logique de rendu conditionnel lourde (v-if/v-for imbriqués), rendant la lecture difficile.
- Manque de tests unitaires: augmente le risque pendant le refactor et freine la découpe.

## Effets négatifs observés
- Maintenance lourde et mauvaise lisibilité.
- Difficile de réutiliser l'UI, multiplier les bugs lors d'ajouts.
- Tests manquants ou trop denses pour être isolés.

## Plan d'action recommandé (itératif, par priorité)
1. **Règle d'or**: viser des SFC < 300 lignes quand possible et une responsabilité par composant (UI OR logique métier).
2. **Extraire petits composants UI** (primaire): `TripCard`, `TripFilters`, `TripList`, `DriverCard`, `VehicleCard`, `Modal`, `Spinner`, `StatsCard`.
3. **Créer composables** (`/src/composables`): `useCarpoolings()`, `useFilters()`, `useDateFormatting()`, `useParticipation()` pour extraire logique et side-effects.
4. **Déplacer utilitaires** (`/src/utils`): formatters, helpers (calcul durée, formatMoney, getStars), et centraliser la logique réutilisée.
5. **Factoriser styles**: extraire variables et classes partagées dans `src/assets` ou `src/styles/components/` et réduire le `scoped` quand approprié.
6. **Standardiser les modals et confirmations**: remplacer modals inline par un composant modal réutilisable (slot-based).
7. **Ajouter tests unitaires**: pour chaque composant extrait et composable (Vitest). Tests E2E ciblés (Playwright) pour cas d'usage critiques.
8. **Refactor itératif (un fichier à la fois)**: commencer par `MyTripsView.vue` (plus grand), puis `ProfileView.vue`, `SearchResultsView.vue`, `CarpoolingDetailView.vue`, `HomeView.vue`, `CreateTripView.vue`.
9. **Métriques & CI**: ajouter règle ESLint `max-lines` (ex: 300), ajouter checks dans CI et exigence de tests unitaires pour chaque extraction.

## Checklist par vue (exemple pour `SearchResultsView.vue`)
- Créer `components/TripCard.vue` et remplacer le markup récurrent.
- Extraire logique de chargement/filtrage dans `composables/useCarpoolings.js`.
- Mettre les helpers `formatDuration`, `formatDate` dans `utils/formatters.js` et importer.
- Déplacer styles globaux réutilisables dans `assets/styles/trip.css`.
- Ajouter tests unitaires pour `TripCard` et `useCarpoolings`.

## Petites améliorations rapides (low hanging fruits)
- Supprimer `console.log` et code commenté inutilisé.
- Remplacer blocs d'icônes répétées par un `Icon` ou `CustomIcon` centralisé.
- Identifier les composants de modals et menus dropdown communs et les factoriser.

## Mesures de succès
- Réduction de la taille des SFCs ciblés (< 300 lignes).
- Nombre croissant de composants réutilisés et diminution du code dupliqué.
- Tests unitaires ajoutés et couverture minimale sur composants extraits.

## Outils & règles à activer
- ESLint: `max-lines` et règles Vue (ex: `max-attributes-per-line` pour lisibilité des templates).
- Vitest pour tests unitaires; Playwright pour E2E déjà présent pour tests de bout en bout.
- Optionnel: ajout d'un linter CI qui bloque PR avec SFC > seuil.

---
Si tu veux je peux: faire un audit automatique (lister tous les fichiers du `src` par taille, trouver occurrences de `console.log`, `TODO`, code commenté et proposer un MR avec extraction d'un composant exemple — par ex. extraire `TripCard` + `useCarpoolings` pour `SearchResultsView`). Dis‑moi quelle action tu veux que je fasse ensuite.

## Avancement: HomeView.vue (extraction incrémentale)
- ✅ `SearchBar.vue` créé et intégré dans `HomeView.vue` (remplace le markup de recherche)
- ✅ `useSearchForm.js` composable ajouté et utilisé dans `HomeView.vue` pour centraliser état et navigation
- ✅ `useScroll.js` composable ajouté et utilisé pour scroller vers l'ancre
- 🔜 Prochain: extraire `HeroSection.vue`, `AboutSection.vue`, `ArrowsFooter.vue` et déplacer leurs styles vers chaque composant

## Styles: Global CSS split (2025-12-13)

- **Objectif**: réduire la duplication et centraliser les variables/utilities/animations.
- **Actions réalisées**:
	- Création d'un dossier `Frontend/src/assets/css/` et scission de `main.css` en partials:
		- `_variables.css`, `_reset.css`, `_base.css`, `_typography.css`, `_layout.css`, `_utilities.css`, `_buttons.css`, `_cards.css`, `_forms.css`, `_modals.css`, `_animations.css`, `_overrides.css`.
	- Import de ces partials depuis `Frontend/src/assets/main.css`.
	- Réordonnancement des imports CSS dans `Frontend/src/main.js` pour charger `bootstrap` avant les partials et restauration du thème sombre initial via une classe `force-dark` ajoutée au `body`.
	- Ajout d'un logging minimal pour la migration (voir PR pour détails) et création de placeholders pour les styles centralisés.

- **Refactor CSS - TripCard & Modals (2025-12-13)**
	- `TripCard.vue` : extraction complète des styles globaux liés à la carte (header, route, details, footer, status-badges) vers `Frontend/src/assets/css/_cards.css`. Le SFC conserve une petite zone `style scoped` pour overrides spécifiques.
	- `SearchResultsView.vue` : suppression des styles `.trip-card` et `.trip-card` variants (moved to `_cards.css`); kept layout responsive tweaks in media queries.
- Centralization: moved `.detail-item`, `.driver-card`, `.spec-item`, `.rating-value` to `_cards.css` and removed duplicates in `CarpoolingDetailView.vue` and `DriverReviews.vue`.

- Buttons refactor (2025-12-14): moved global button styles into scoped components and added reusable button components under `src/components/ui/`:
	- Added `BaseButton.vue`, `PrimaryButton.vue`, `SecondaryButton.vue`, `NavButton.vue`, `InlineLink.vue`.
	- Cleared legacy `src/assets/css/_buttons.css` (styles moved to scoped components).
	- Replaced `GlassButton.vue` usages with `NavButton` in `src/components/AppNavbar.vue` and marked `GlassButton.vue` as deprecated.
	- Added tests for `BaseButton` (`Frontend/src/components/__tests__/BaseButton.spec.ts`).
	- Rationale: keep shared base layout/shape in `BaseButton.vue` and let variants override only the colors/hover/size for quick global changes.

	Note: Update E2E selectors if they depended on legacy `.btn-*` classes.
	- `ProfileView.vue` & `CarpoolingDetailView.vue` : removed duplicated `.modal-overlay` style and rely on `Frontend/src/assets/css/_modals.css`; kept minimal, view-specific modal overrides locally (background color, radius, etc.).

**Etat**: en cours — next steps: search for other duplicated modal/views and extract selectors into `_modals.css` or scoped overrides as needed.

**Etat**: en cours — certains composants (SFC) contiennent toujours des styles scéniques qui seront extraits progressivement.
