# Visuals Test Page

Small interactive page added to preview UI visuals from the Charte Graphique.

- Files added:
  - `Frontend/src/views/test/VisualsView.vue`
  - `Frontend/src/components/test/VisualsDemo.vue`
  - `Frontend/src/components/test/__tests__/VisualsDemo.spec.js`
  - `Frontend/src/views/test/__tests__/VisualsView.spec.js`
  - `Frontend/src/components/ui/BaseButton.vue`
  - `Frontend/src/components/ui/PrimaryButton.vue`
  - `Frontend/src/components/ui/SecondaryButton.vue`
  - `Frontend/src/components/ui/NavButton.vue`
  - `Frontend/src/components/ui/__tests__/BaseButton.spec.js`
  - `Frontend/src/components/ui/__tests__/PrimarySecondary.spec.js`
  - `Frontend/src/components/ui/__tests__/NavButton.spec.js`
  - `Frontend/src/assets/css/_buttons.css` (added secondary/nav styles)

- Router updated:
  - `Frontend/src/router/index.js` — new route `{ path: '/test/visuals', name: 'Visuals' }`

- Nav:
  - `Frontend/src/components/AppNavbar.vue` — added dev-only `Visuals` link

Purpose: provide a small playground to validate colors, buttons, cards, and typography.

Notes: Buttons were refactored into components: `BaseButton`, `PrimaryButton`, `SecondaryButton`, and `NavButton`. The global buttons stylesheet was removed in favor of scoped component styles; variables were simplified to a single main color (`#8fdab3`) and two neutrals (`#1a1a1a`, `#ffffff`).

Status: completed
