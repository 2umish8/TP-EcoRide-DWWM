# Icon Audit — EcoRide Frontend

This document lists the icons used in the frontend, their type, where they're declared / used, and the CSS or class that styles them. Use the "Action / Replacement" column to paste the link or CSS you want to use so I can reassign them in the next step.

---

## How to read this audit
- Icon Visual / Identifier — short description / emoji
- Type — Inline SVG / Font (FontAwesome) / Emoji / Image asset / Component
- File(s) — file locations where icon is declared and used
- Snippet — short sample of the icon markup (path or element)
- CSS class / styling — relevant CSS selectors that target the icon
- Action / Replacement — placeholder for the user to provide link or CSS

---

## 1) Notification icons (Success, Error, Warning, Info)
- Icon Visual: Success ✓, Error ⚠, Warning ⚠, Info ℹ
- Type: Inline SVG (path elements inside `Notification.vue`)
- File(s): `Frontend/src/components/Notification.vue`
- Snippets:
  - Success: `<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" .../>`
  - Error: `<path d="M12 9v2m0 4h.01m-6.938 4h13.856 ...z" .../>`
  - Warning: `<path d="M8.228 9c.549-1.165 2.03-2 3.772-2 ..." .../>`
  - Info: `<path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 ...z" .../>`
- CSS class / styling: `.notification-icon`, `.notification--success .notification-icon`, `.notification--error .notification-icon`, `.notification--warning .notification-icon`, `.notification--info .notification-icon` (defined in the same file, `scoped`)
- Action / Replacement: (paste link or CSS for icons here)

---

## 2) Navbar / Top menu icons (Home, Search, Trips, User, Login/Register, Logout)
- Icon Visuals: Home, Magnifying glass, Car, User, Login, Register, Logout
- Type: Inline SVG; Font Awesome is used for the dropdown items
- File(s):
  - `Frontend/src/components/AppNavbar.vue`
  - FontAwesome CDN in `Frontend/index.html` (CDN link) — `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css`
- Snippets:
  - Home: `<path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />` 
  - Search: `<path d="M15.5 14h-.79l-.28-.27A6.471 ..." />`
  - Trips: `<path d="M18.92 6.01C18.72 5.42..." />`
  - User (dropdown): `<path d="M12 2C14.2 2 16 3.8 16 6..." />`
  - FontAwesome items (used in dropdown): `<i class="fas fa-user dropdown-icon"></i>`, `<i class="fas fa-credit-card dropdown-icon"></i>`
- CSS class / styling:
  - `.nav-icon`, `.user-icon`, `.dropdown-icon` (AppNavbar.vue styles)
  - `.user-dropdown-menu .dropdown-item i` style targets `<i>` icons
- Action / Replacement: (paste link or CSS for icons here)

---

## 3) Home (arrows / scroll) icons
- Icon Visuals: Arrow / chevron, Scroll
- Type: Inline SVG and asset SVG
- File(s): `Frontend/src/views/HomeView.vue`, asset `Frontend/src/assets/scroll-svgrepo-com.svg`
- Snippets:
  - Arrow: `<path d="M7.41 8.59L12 13.17l4.59-4.58..." />`
  - Scroll asset (SVG file): `Frontend/src/assets/scroll-svgrepo-com.svg` (SVG file uses `viewBox 0 0 24 24`)
- CSS class / styling: `.scroll-svg`, `.arrow-icon` (in `HomeView.vue` style)
- Action / Replacement: (paste link or CSS for icons here)

---

## 4) User Profile Back icon
- Icon Visual: Back arrow
- Type: Inline SVG
- File(s): `Frontend/src/views/UserProfileView.vue`
- Snippet: `<path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />`
- CSS class / styling: `.back-icon` (see `UserProfileView.vue`)
- Action / Replacement: (paste link or CSS for icons here)

---

## 5) Credit icon component (IconCredit)
- Icon Visual: Coin / currency circle
- Type: Component `IconCredit.vue` (inline SVG inside component)
- File(s): `Frontend/src/components/icons/IconCredit.vue` and used in `SearchResultsView.vue`, `CarpoolingDetailView.vue` and others.
- Snippet: `<path d="M7 15.5c0 .049.006.096..." fill="currentColor" />` (long path)
- CSS class / styling: `.credit-icon` defined in `CarpoolingDetailView.vue` and inline style for usage in `SearchResultsView`.
- Action / Replacement: (paste link or CSS for icons here)

---

## 6) Custom Icon Component (CustomIcon.vue)
- Icon Visuals: user-edit, coins, sign-out, default circle
- Type: Inline SVG component (`CustomIcon.vue`) that switches by `name` prop
- File(s): `Frontend/src/components/CustomIcon.vue`
- Snippet: Multiple `<path d="..." v-if="name==='...'" />` entries or default circle
- CSS class / styling: `.custom-icon` in the same component
- Action / Replacement: (paste link or CSS for icons here)
- Note: I did not detect explicit usage of `<CustomIcon .../>` in the codebase (search returned none); might be unused — please confirm if you'd like it kept.

---

## 7) FontAwesome icons (via CDN)
- Icon Visuals: fa-eye, fa-eye-slash, fa-spinner, fa-check-circle, fa-exclamation-triangle, fa-user, fa-credit-card, and others
- Type: Font icon library (FontAwesome), CSS classes on `<i>` elements
- File(s): `Frontend/index.html` (CDN link), usages: `AppNavbar.vue`, `LoginView.vue`, `UserProfileView.vue`, `SearchResultsView.vue` etc.
- Examples:
  - `<i class="fas fa-exclamation-triangle error-icon"></i>` — used for some warnings
  - `<i class="fas fa-eye"></i>` / `<i class="fas fa-eye-slash"></i>` — used for password toggle
  - `<i class="fas fa-spinner fa-spin loading-spinner"></i>` — used for loading
- CSS class / styling: `.error-icon`, `.success-icon`, `.loading-spinner`, `.dropdown-icon`, etc.
- Action / Replacement: (paste link or CSS for icons here) — you might prefer to replace these with inline SVGs or a component for better control & less external dependencies.

---

## 8) Emoji icons (text span with emoji)
- Examples: 🔍, 📅, ➕, 🚗, 🟢, 🔴, ⏱️, 💰, 👥, 🚬, 🐕, 🎵, 💬, 🎉, ✅, ❌, 🌱, ⚡, ❄️, 📶
- Type: Inline text (emoji) used as icons
- File(s): Many, including `MyTripsView.vue`, `CarpoolingDetailView.vue`, `DriverPreferences.vue`, `ProfileView.vue`, `SearchResultsView.vue`, `ReportTripView.vue`, `RegisterView.vue`, `BecomeDriverView.vue`, etc.
- Snippet: `<span class="icon">🔍</span>` or direct emoji in text like `📅 Date :` or `🎉 Trajet créé`.
- CSS class / styling: `.icon`, `.role-icon`, `.badge`, `.my-trip-badge`, `.success-icon`, `.severity-icon` and more — these are defined in the per-view style blocks.
- Action / Replacement: (paste link or CSS for icons here) — emoji are simplest, but if you want consistent visuals, we can standardize to a dedicated icon set.

---

## 9) Image asset SVG files
- Files:
  - `Frontend/src/assets/scroll-svgrepo-com.svg`
  - `Frontend/src/assets/credits-svgrepo-com.svg`
- Type: SVG files stored in assets folder and imported in pages.
- Usage: scroll icon / credits icon
- Action / Replacement: (paste link or CSS for icons here)

---

## 10) Inline SVG icons in other views (small list)
- `HomeView.vue` — arrow icons (duplicate of `M7.41...` path), scroll (see above); CSS `.arrow-icon`, `.scroll-svg`
- `UserProfileView.vue` — `back-icon` path
- `CarpoolingDetailView.vue` — uses `IconCredit` and emoji; CSS `.credit-icon`
- `SearchResultsView.vue` — uses `IconCredit` component, emoji feature icons, and search-related inline icons
- `Notification.vue` — inline icons (see #1)

---

## Suggestions / Next steps
1. If you want to reassign / replace icons, paste the new link(s) / CSS / SVG code or references here under the "Action / Replacement" column for each icon listed, or give a global policy such as "All notification icons must be inline SVG in Notification.vue" or "Replace FontAwesome icons with inline SVG or component-based icons".
2. I can then:
   - Replace inline usages with component versions (easier to maintain)
   - Move emoji to Icon components or keep them as emoji if you prefer
   - Replace FontAwesome `<i>` tags with inline SVGs for better control
   - Consolidate icons into `Frontend/src/components/icons` and export a common `Icon` usage pattern

---

## Appendix: Quick grep commands used
- `grep -R "<svg" Frontend/src`
- `grep -R "<path d=\"" Frontend/src`
- `grep -R "<i class=\"fas" Frontend/src`
- `grep -R "span class=\"icon\"" Frontend/src`

---

If you confirm this audit looks good, tell me which icon(s) you want changed and provide the link or CSS for each, and I will implement replacements or refactors into dedicated icon components. If you want me to auto-standardize icons (e.g. convert all to components), I can propose and implement a plan.

---

## Fill-in Template (quick & simple)
Paste the FontAwesome CDN link / CSS class / SVG or component name you want to use next to each icon below.

Format: Icon Identifier : Replacement (FontAwesome class / CDN link / SVG path / Component name / Asset path)

Example: Navbar - Home : fas fa-home

Global FontAwesome CDN Link (if you want to use FontAwesome everywhere):
FontAwesome CDN: 







To add in header :
<script src="https://kit.fontawesome.com/8d61f38b16.js" crossorigin="anonymous"></script>

-- Icons to configure --

- Notification - success : <FontAwesomeIcon :icon="byPrefixAndName.fas['circle-check']" />
- Notification - error : <FontAwesomeIcon :icon="byPrefixAndName.fas['xmark']" />
- Notification - warning : <FontAwesomeIcon :icon="byPrefixAndName.fas['triangle-exclamation']" />
- Notification - info : <FontAwesomeIcon :icon="byPrefixAndName.fas['circle-exclamation']" />
- Navbar - Home : <FontAwesomeIcon :icon="byPrefixAndName.fas['house']" />
- Navbar - Search : <FontAwesomeIcon :icon="byPrefixAndName.fas['magnifying-glass']" />
- Navbar - Trips : <FontAwesomeIcon :icon="byPrefixAndName.fas['person-walking-luggage']" />
- Navbar - User (dropdown avatar) : <FontAwesomeIcon :icon="byPrefixAndName.fas['user']" />
- Navbar - Login (button) : <FontAwesomeIcon :icon="byPrefixAndName.fas['arrow-right-to-bracket']" />
- Navbar - Register (button) : <FontAwesomeIcon :icon="byPrefixAndName.fas['user-plus']" />
- Navbar - Logout (dropdown) : <FontAwesomeIcon :icon="byPrefixAndName.fas['user-xmark']" />
- Home - Arrow / chevron (down/up) : <FontAwesomeIcon :icon="byPrefixAndName.fas['chevron-down']" />
- Home - Scroll asset : <FontAwesomeIcon :icon="byPrefixAndName.fas['angles-down']" />
- UserProfile - Back : <FontAwesomeIcon :icon="byPrefixAndName.fas['arrow-left']" />
- SearchResults - Credit icon (IconCredit) : <FontAwesomeIcon :icon="byPrefixAndName.fas['coins']" />
- CarpoolingDetail - Credit icon (IconCredit) : <FontAwesomeIcon :icon="byPrefixAndName.fas['coins']" />
- CustomIcon - user-edit : <FontAwesomeIcon :icon="byPrefixAndName.fas['user-pen']" />
- CustomIcon - coins : <FontAwesomeIcon :icon="byPrefixAndName.fas['coins']" />
- CustomIcon - sign-out : <FontAwesomeIcon :icon="byPrefixAndName.fas['user-xmark']" />
- FontAwesome - eye : <FontAwesomeIcon :icon="byPrefixAndName.fas['eye']" />
- FontAwesome - eye-slash : <FontAwesomeIcon :icon="byPrefixAndName.fas['eye-slash']" />
- FontAwesome - spinner : <FontAwesomeIcon :icon="byPrefixAndName.fas['spinner']" />
- FontAwesome - check-circle : already defined above
- FontAwesome - exclamation-triangle : already defined above

Emojis must be replaced with FontAwesome icons as well:
- Emoji - Search (🔍) : Already defined above
- Emoji - Date (📅) : <FontAwesomeIcon :icon="byPrefixAndName.fas['calendar']" />
- Emoji - Add (➕) : <FontAwesomeIcon :icon="byPrefixAndName.fas['plus']" />
- Emoji - Car (🚗) : <FontAwesomeIcon :icon="byPrefixAndName.fas['car']" />
- Emoji - Accepted (🟢) : <FontAwesomeIcon :icon="byPrefixAndName.fas['check']" />
- Emoji - Rejected (🔴) : <FontAwesomeIcon :icon="byPrefixAndName.fas['check']" />
- Emoji - Time (⏱️) : <FontAwesomeIcon :icon="byPrefixAndName.fas['clock-rotate-left']" />
- Emoji - Price / credit (💰) : Already defined above
- Emoji - People (👥) : <FontAwesomeIcon :icon="byPrefixAndName.fas['user-group']" />
- Emoji - Smoking (🚬) : <FontAwesomeIcon :icon="byPrefixAndName.fas['smoking']" />
- Emoji - Pets (🐕) : <FontAwesomeIcon :icon="byPrefixAndName.fas['paw']" />
- Emoji - Music (🎵) : <FontAwesomeIcon :icon="byPrefixAndName.fas['music']" />
- Emoji - Chat (💬) : <FontAwesomeIcon :icon="byPrefixAndName.fas['comment']" />
- Emoji - Success (✅) : Already defined above
- Emoji - Error (❌) : Already defined above
- Emoji - Eco-friendly (🌱) : <FontAwesomeIcon :icon="byPrefixAndName.fas['leaf']" />
- Asset - scroll-svgrepo-com.svg : Already defined above
- Asset - credits-svgrepo-com.svg : Already defined above

Notes:
- If you paste a FontAwesome CDN link, I can replace FontAwesome `<i>` tags with a consistent version and optionally convert them to inline SVG components.
- If you paste inline SVG code or a component name (e.g., `IconCredit`), I can replace the usages to centralize icons in `Frontend/src/components/icons/`.
- If you want to keep emojis but unify styles, I can migrate emoji usages to a dedicated icon component that renders emoji or SVG depending on your preference.

When you're done filling this form, say "Apply changes" and I'll implement your choices.
