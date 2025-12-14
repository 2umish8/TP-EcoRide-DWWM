# Nouveaux composants UI

## SecondaryText

- **But** : Composant très simple qui encapsule un `span` et applique la couleur `--color-secondary` définie dans la charte graphique.
- **Fichier** : `Frontend/src/components/ui/SecondaryText.vue`
- **Tests** : `Frontend/src/components/__tests__/SecondaryText.spec.ts` (tests unitaires Vitest)
- **Date** : 2025-12-14
- **État** : terminé

### Notes
- Le style visuel est géré par la classe utilitaire `.text-secondary` dans `src/assets/css/_utilities.css` (utilise la variable `--color-secondary`).
- Le composant accepte les attributs HTML additionnels (ex: `title`, `class`) et les transfère au `span` via `$attrs`.
