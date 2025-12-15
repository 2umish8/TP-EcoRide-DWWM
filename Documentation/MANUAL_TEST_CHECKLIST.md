# Checklist de Test Manuel - EcoRide

**Purpose**: Checklist pratique pour tester manuellement chaque parcours utilisateur  
**Format**: À utiliser avec les tests automatisés (Vitest + E2E)  
**Note**: Cocher chaque case au fur et à mesure de vos tests

---

## 🎯 Pré-Conditions: Setup

### ✅ Avant de commencer

- [x] Backend démarré: `npm run dev` dans `Backend/`
- [x] Frontend démarré: `npm run dev` dans `Frontend/`
- [x] Base de données initialisée
- [x] Serveur accessible sur `http://localhost:3000` (API)
- [x] App accessible sur `http://localhost:5173` (Frontend)
- [x] Navigateur console ouverte (F12) - aucune erreur rouge

### 📝 Comptes de Test Disponibles

| Rôle        | Pseudo    | Email                 | Mot de passe | Notes                              |
| ----------- | --------- | --------------------- | ------------ | ---------------------------------- |
| Passager    | test      | test@test.com         | Test2025!    | Utilisateur de test global         |
| Admin       | Admin     | admin@ecoride.test    | Admin2025!   | Admin (créer employés, voir stats) |
| Nouvel User | (À créer) | test-XXX@ecoride.test | Test2025!    | Pour tester inscription            |

---

## 👤 VISITEUR (Non authentifié)

### US 1 - Page d'Accueil

**Parcours**:
1. Accéder à http://localhost:5173
2. Vérifier présence:
   - [x] Logo EcoRide (cliquable)
   - [x] Titre "EcoRide | Covoiturage écologique"
   - [x] Section "À Propos" avec texte + images
   - [x] Barre de recherche avec placeholder "Destination"
   - [x] Bouton "ecoRIDEZ"
   - [x] Footer avec email de contact
   - [x] Lien "Mentions légales"

3. Interactions:
   - [x] Cliquer sur logo → revenir à l'accueil
   - [x] Cliquer sur "Mentions légales" → page légale s'ouvre
   - [x] Taper "Lyon" dans la barre → texte s'affiche
   - [ ] Cliquer "Trouver un itinéraire" → va à /search avec "Lyon" comme destination

4. Aucune erreur console:
   - [ ] F12 → Console → aucun message d'erreur rouge


**Validation**: ✅ Passé / ❌ Échoué

---

### US 2 - Navigation

**Parcours**:
1. Depuis la page d'accueil, regarder la navbar:
   - [ ] Logo EcoRide visible et cliquable
   - [ ] Lien "Accueil" → / (reload page)
   - [ ] Lien "Covoiturages" → /search
   - [ ] Lien "Connexion / Inscription" → /login
   - [ ] Lien "Contact" (si existe) → fonctionne

2. Cliquer sur chaque lien:
   - [ ] "Accueil" → page d'accueil (/)
   - [ ] "Covoiturages" → page de recherche (/search)
   - [ ] "Connexion" → page de login (/login)
   - [ ] Logo → page d'accueil (/)

3. Navigation responsive (mobile):
   - [ ] Sur écran petit (< 768px), menu hamburger visible (optionnel)
   - [ ] Cliquer hamburger → menu se déploie


**Validation**: ✅ Passé / ❌ Échoué

---

### US 3 & 4 - Recherche et Filtres (Visiteur)

**Parcours**:

1. Aller à /search (ou cliquer "Covoiturages" depuis accueil)

2. Vérifier le formulaire:
   - [ ] Champ "Départ" prérempli (géolocalisation ou "Votre position")
   - [ ] Champ "Arrivée" (vide ou prérempli)
   - [ ] Champ "Date/Heure" (aujourd'hui ou date future)
   - [ ] Bouton "Rechercher"
   - [ ] Section "Filtres" (visible ou déployable)

3. Remplir et rechercher:
   - [ ] Départ: "Paris"
   - [ ] Arrivée: "Lyon"
   - [ ] Date: demain (sélectionner via date picker)
   - [ ] Cliquer "Rechercher"

4. Vérifier les résultats:
   - [ ] Liste de covoiturages s'affiche
   - [ ] Pour chaque covoiturage:
      • - [ ] Pseudo + photo du chauffeur
      • - [ ] Note du chauffeur (★★★★★)
      • - [ ] Nombre de places ("2 places restantes")
      • - [ ] Prix ("45 €")
      • - [ ] Date/heure départ et arrivée
      • - [ ] Badge "Écologique" si électrique
      • - [ ] Bouton "Détail"

5. Appliquer les filtres:
   - [ ] Cliquer "Filtres" ou déployer la section
   - [ ] Véhicule électrique → toggle/checkbox
   - [ ] Prix max: 50€ → slider ou input
   - [ ] Durée max: 2h → slider ou input
   - [ ] Note chauffeur min: 4.0 → slider ou input
   - [ ] Les résultats se mettent à jour immédiatement

6. Cas "Aucun résultat":
   - [ ] Si 0 covoiturage → message "Aucun résultat"
   - [ ] Système propose: "Prochain trajet disponible: [date]"

7. Cliquer sur "Détail":
   - [ ] Redirection vers /search/:id (ou modal)
   - [ ] Page/modal affiche infos complètes (voir US 5)

8. Cliquer "Participer" sans auth:
   - [ ] Redirection vers /login
   - [ ] Message: "Connectez-vous pour participer"


**Validation**: ✅ Passé / ❌ Échoué

---

### US 5 - Vue Détaillée

**Parcours**:

1. Depuis résultats, cliquer "Détail" d'un covoiturage

2. Vérifier toutes les infos affichées:
   - [ ] Chauffeur: pseudo, photo, note globale
   - [ ] Trajet: départ, arrivée, date, heure, durée
   - [ ] Prix par personne
   - [ ] Places restantes
   - [ ] Badge "Écologique" (si électrique)
   
3. Infos véhicule:
   - [ ] Modèle (ex: "Tesla Model 3")
   - [ ] Marque (ex: "Tesla")
   - [ ] Couleur (ex: "Gris métallisé")
   - [ ] Immatriculation (ex: "AB-123-CD")
   - [ ] Électrique: "Oui" / "Non"

4. Préférences du chauffeur:
   - [ ] Fumeur: "Non-fumeur"
   - [ ] Animaux: "Animaux acceptés"
   - [ ] Musique: "Oui" (si renseigné)
   - [ ] Autres préférences (texte libre)

5. Avis du chauffeur:
   - [ ] Liste des avis (si existe)
   - [ ] Pour chaque avis:
      • - [ ] Note (★★★★★)
      • - [ ] Commentaire
      • - [ ] Auteur (pseudo)
      • - [ ] Date

6. Bouton "Participer":
   - [ ] Visible (pas d'erreur)
   - [ ] Cliquer → redirection /login (pas connecté)


**Validation**: ✅ Passé / ❌ Échoué

---

### US 6 - Inscription (Visiteur → Nouvel Utilisateur)

**Parcours**:

1. Cliquer "Inscription" dans navbar → /register

2. Vérifier le formulaire:
   - [ ] Champ "Pseudo" (obligatoire)
   - [ ] Champ "Email" (obligatoire, validation email)
   - [ ] Champ "Mot de passe" (obligatoire)
   - [ ] Champ "Confirmer mot de passe"
   - [ ] Checkbox "J'accepte les CGU et mentions légales"
   - [ ] Bouton "S'inscrire"
   - [ ] Lien "Déjà inscrit? Connexion" → /login

3. Remplir correctement:
   - [ ] Pseudo: "TestUser123"
   - [ ] Email: "test.user.123@ecoride.test"
   - [ ] Mot de passe: "SecurePass2025!"
   - [ ] Confirmer: "SecurePass2025!"
   - [ ] Cocher CGU
   - [ ] Cliquer "S'inscrire"

4. Vérifier la réussite:
   - [ ] Message de succès: "Inscription réussie!"
   - [ ] Redirection vers /login OU /profile (auto-login)
   - [ ] Si auto-login → utilisateur connecté (pseudo visible dans navbar)

5. Vérifier les crédits:
   - [ ] Aller à /profile ou /credits
   - [ ] Solde initial: 20 crédits
   - [ ] Historique vide (première création)

6. Tester les validations (erreurs):
   
   **Cas: Email déjà existant**
   - [ ] Email: "test@test.com" (compte existant)
   - [ ] Cliquer "S'inscrire"
   - [ ] Erreur: "Email déjà utilisé"
   
   **Cas: Mots de passe non identiques**
   - [ ] Mot de passe: "Pass1234!"
   - [ ] Confirmer: "Pass5678!"
   - [ ] Cliquer "S'inscrire"
   - [ ] Erreur: "Les mots de passe ne correspondent pas"
   
   **Cas: Mot de passe faible**
   - [ ] Mot de passe: "123" (trop court)
   - [ ] Cliquer "S'inscrire"
   - [ ] Erreur: "Mot de passe doit contenir au moins 8 caractères..."
   
   **Cas: Email invalide**
   - [ ] Email: "invalid-email"
   - [ ] Cliquer "S'inscrire"
   - [ ] Erreur: "Format email invalide"
   
   **Cas: Pseudo vide**
   - [ ] Pseudo: "" (vide)
   - [ ] Cliquer "S'inscrire"
   - [ ] Erreur: "Le pseudo est obligatoire"

7. Après inscription réussie:
   - [ ] Tenter connexion avec les identifiants créés
   - [ ] Connexion réussit
   - [ ] Crédits = 20


**Validation**: ✅ Passé / ❌ Échoué

---

### US 7 - Connexion (Visiteur)

**Parcours**:

1. Cliquer "Connexion" dans navbar → /login

2. Vérifier le formulaire:
   - [ ] Champ "Email"
   - [ ] Champ "Mot de passe"
   - [ ] Case "Rester connecté" (optionnel)
   - [ ] Bouton "Connexion"
   - [ ] Lien "Créer un compte" → /register
   - [ ] Lien "Mot de passe oublié?" (optionnel)

3. Connexion réussie avec test@test.com:
   - [ ] Email: "test@test.com"
   - [ ] Mot de passe: "Test2025!"
   - [ ] Cliquer "Connexion"
   - [ ] Message: "Connexion réussie"
   - [ ] Redirection vers /profile
   - [ ] Navbar affiche "test" (pseudo)
   - [ ] Menu utilisateur visible (dropdown ou lien vers profil)

4. Vérifier la session:
   - [ ] Token JWT stocké en localStorage
   - [ ] Rafraîchir page (F5) → reste connecté
   - [ ] Aller à /search → toujours connecté

5. Tester les validations (erreurs):
   
   **Cas: Email inexistant**
   - [ ] Email: "noexist@ecoride.test"
   - [ ] Mot de passe: "Test2025!"
   - [ ] Cliquer "Connexion"
   - [ ] Erreur: "Email ou mot de passe incorrect"
   
   **Cas: Mot de passe faux**
   - [ ] Email: "test@test.com"
   - [ ] Mot de passe: "WrongPassword"
   - [ ] Cliquer "Connexion"
   - [ ] Erreur: "Email ou mot de passe incorrect"
   
   **Cas: Champ vide**
   - [ ] Email: "" (vide)
   - [ ] Cliquer "Connexion"
   - [ ] Erreur: "Ce champ est obligatoire"

6. Déconnexion:
   - [ ] Cliquer sur pseudo → menu utilisateur
   - [ ] Cliquer "Déconnexion"
   - [ ] Redirection vers /login
   - [ ] Token supprimé de localStorage


**Validation**: ✅ Passé / ❌ Échoué

---

## 👥 UTILISATEUR CONNECTÉ - PASSAGER

### Profil & Rôles

**Prérequis**: Utilisateur connecté (test@test.com ou nouvel utilisateur)

**Parcours**:

1. Cliquer sur "test" (pseudo) dans navbar
   → Redirection vers /profile

2. Vérifier la page de profil:
   - [ ] Photo de profil
   - [ ] Pseudo: "test"
   - [ ] Email: "test@test.com"
   - [ ] Crédits actuels: 20 (ou autre solde)

3. Section "Rôles":
   - [ ] Carte "Passager" (actif par défaut)
      • - [ ] Bouton "Je suis passager" (ou déjà sélectionné)
      • - [ ] Description simple
   - [ ] Carte "Chauffeur"
      • - [ ] Bouton "Je veux devenir chauffeur"
      • - [ ] Lien vers /become-driver

4. Rester passager:
   - [ ] Cliquer "Je suis passager"
   - [ ] État passager activé
   - [ ] Recharger page → rôle persiste

5. Vérifier les crédits:
   - [ ] Section crédits affiche: "20 crédits"
   - [ ] Lien vers /credits visible


**Validation**: ✅ Passé / ❌ Échoué

---

### US 10a - Recherche & Participation

**Prérequis**: Utilisateur connecté en tant que passager

**Parcours**:

1. Aller à /search (depuis navbar "Covoiturages")

2. Chercher un covoiturage avec places disponibles:
   - [ ] Départ: "Paris"
   - [ ] Arrivée: "Lyon"
   - [ ] Date: demain
   - [ ] Cliquer "Rechercher"

3. Vérifier les résultats:
   - [ ] Liste de covoiturages s'affiche
   - [ ] Chaque covoiturage affiche "Participer" (bouton actif, pas de redirection login)

4. Cliquer "Détail" d'un covoiturage avec places:
   - [ ] Page détail s'ouvre
   - [ ] Bouton "Participer - 45 crédits" visible
   - [ ] Crédits actuels visibles: "Vous avez 20 crédits"

5. Cliquer "Participer":
   - [ ] Modal/dialog: "Confirmer la participation?"
   - [ ] Affiche: prix, places, crédits actuels
   - [ ] Buttons: "Annuler" et "Confirmer"

6. Vérifier suffisance des crédits:
   
   **Cas: Assez de crédits**
   - [ ] Crédits: 20, Prix: 15€
   - [ ] Cliquer "Confirmer"
   - [ ] Message: "Vous participez au trajet!"
   - [ ] Modal ferme, retour à détail covoiturage
   - [ ] Covoiturage rafraîchit: "1 place restante" (au lieu de 2)
   - [ ] Bouton "Participer" disparaît (déjà inscrit)
   
   **Cas: Crédits insuffisants**
   - [ ] Crédits: 5, Prix: 45€
   - [ ] Cliquer "Confirmer"
   - [ ] Erreur: "Crédits insuffisants"
   - [ ] Lien vers /credits visible
   - [ ] Participation non effectuée

7. Vérifier l'inscription:
   - [ ] Aller à /my-trips
   - [ ] Section "Passager" affiche le trajet
   - [ ] Trajet montre: chauffeur, destination, date, prix

8. Vérifier les crédits débités:
   - [ ] Aller à /profile → Crédits: 5 (20 - 15)
   - [ ] Aller à /credits → Historique:
      • Transaction: "-15 crédits (Participation trajet Paris → Lyon)"
      • Date: aujourd'hui

9. Cas d'erreur:
   
   **Trajet complet (0 places)**
   - [ ] Rechercher un covoiturage avec 0 places
   - [ ] Bouton "Participer" désactivé (grisé)
   - [ ] Tooltip: "Ce trajet est complet"
   
   **Trajet déjà passé**
   - [ ] Chercher un covoiturage avec date passée
   - [ ] Bouton "Participer" désactivé
   - [ ] Tooltip: "Ce trajet a déjà commencé"


**Validation**: ✅ Passé / ❌ Échoué

---

### US 10b - Annulation de Covoiturage

**Prérequis**: Passager avec participation active

**Parcours**:

1. Aller à /my-trips → section "Passager"

2. Vérifier le trajet en attente:
   - [ ] Affichage: chauffeur, destination, date, prix
   - [ ] Statut: "À venir" ou "Confirmé"
   - [ ] Boutons: "Annuler" et "Détail"

3. Cliquer "Annuler":
   - [ ] Modal: "Annuler votre participation?"
   - [ ] Affiche remboursement: "+15 crédits"
   - [ ] Buttons: "Continuer" et "Annuler"

4. Cliquer "Continuer":
   - [ ] Message: "Votre participation a été annulée"
   - [ ] Modal ferme
   - [ ] Trajet supprimé de "Mes trajets"

5. Vérifier le remboursement:
   - [ ] Aller à /profile → Crédits: 20 (5 + 15 remboursé)
   - [ ] Aller à /credits → Historique:
      • Transaction: "+15 crédits (Remboursement annulation trajet)"

6. Vérifier les places libérées:
   - [ ] Aller à /search
   - [ ] Chercher le même trajet
   - [ ] Places: "2 places restantes" (au lieu de 1)
   - [ ] Bouton "Participer" réactivé

7. Cas d'erreur:
   
   **Trajet déjà commencé**
   ☐ Trajet à démarrer (heure approche)
   ☐ Bouton "Annuler" désactivé
   ☐ Tooltip: "Ce trajet a déjà commencé"


**Validation**: ✅ Passé / ❌ Échoué

---

### US 11 - Avis (Passager)

**Prérequis**: Trajet terminé par le chauffeur, participation complète

**Parcours**:

1. Trajet est terminé (chauffeur a cliqué "Arrivé à destination")

2. Passager reçoit un email:
   - [ ] (Vérifier console/logs E2E)
   - [ ] Sujet: "Merci pour votre trajet!"
   - [ ] Lien: /review/:tripId

3. Accéder au formulaire d'avis:
   - [ ] Cliquer lien email → /review/:tripId
   - [ ] OU aller à /my-trips → "Laisser un avis" (optionnel)

4. Vérifier le formulaire:
   - [ ] Photo/nom du chauffeur
   - [ ] Résumé trajet: départ, arrivée, date
   - [ ] Champ "Note" (sélecteur étoiles 1-5)
   - [ ] Champ "Commentaire" (textarea, max 500 chars)
   - [ ] Checkboxes (optionnelles):
      • - [ ] "Le trajet s'est bien déroulé"
      • - [ ] "Le chauffeur était courtois"
      • - [ ] "Véhicule propre et confortable"
   - [ ] Buttons: "Soumettre" et "Plus tard"

5. Remplir et soumettre:
   - [ ] Note: 5 étoiles (cliquer sur 5ème étoile)
   - [ ] Commentaire: "Excellent trajet! Recommandé!"
   - [ ] Cocher checkboxes
   - [ ] Cliquer "Soumettre"
   - [ ] Message: "Votre avis a été soumis pour validation"
   - [ ] Redirection vers /my-trips

6. Vérifier l'avis en attente:
   - [ ] Trajet dans /my-trips affiche: "Avis en attente de modération"
   - [ ] État: "En attente"

7. Avis positif vs. problématique:
   
   **Avis positif (cas normal - voir étape 5)**
   ☐ Note: 5 étoiles
   ☐ Commentaire positif
   ☐ Avis soumis pour validation
   
   **Avis problématique**
   - [ ] Checkbox spéciale: "Le trajet s'est mal déroulé"
   - [ ] Champ commentaire devient obligatoire
   - [ ] Entrer détails: "Le chauffeur a pris une mauvaise route..."
   - [ ] Note peut être basse (1-2 étoiles)
   - [ ] Cliquer "Soumettre"
   - [ ] Message: "Votre rapport a été envoyé à nos modérateurs"
   - [ ] Trajet marké: "Signalé - En attente de traitement"

8. Vérifier dans le profil du chauffeur:
   ☐ (Après validation par employé)
   ☐ Aller à /user/:chauffeurId
   ☐ Section "Avis" affiche le nouvel avis (si validé)

9. Cas d'erreur:
   
   **Trajet pas encore terminé**
   ☐ Essayer d'accéder à /review/:tripId manuellement
   ☐ Erreur: "Ce trajet n'est pas encore terminé"
   
   **Déjà un avis soumis**
   ☐ Essayer de soumettre 2 avis
   ☐ Erreur: "Vous avez déjà laissé un avis pour ce trajet"
   
   **Commentaire trop long**
   ☐ Entrer 600+ caractères
   ☐ Erreur: "Le commentaire ne doit pas dépasser 500 caractères"


**Validation**: ✅ Passé / ❌ Échoué

---

## 🚗 UTILISATEUR CONNECTÉ - CHAUFFEUR

### US 8 - Profil Chauffeur

**Prérequis**: Utilisateur connecté (nouvel utilisateur ou test@test.com)

**Parcours**:

1. Aller à /profile
   ☐ Cliquer "Je veux devenir chauffeur"
   ☐ Redirection vers /become-driver

2. ÉTAPE 1 - VÉHICULE(S):
   ☐ Titre: "Ajouter vos véhicules"
   ☐ Bouton "Ajouter un véhicule"
   ☐ Cliquer sur le bouton

3. Formulaire véhicule:
   ☐ Champ "Marque" (dropdown: Renault, Peugeot, Tesla, etc.)
      • Sélectionner: "Tesla"
   ☐ Champ "Modèle" (text input)
      • Entrer: "Model 3"
   ☐ Champ "Couleur" (color picker ou dropdown)
      • Sélectionner: "Gris"
   ☐ Champ "Plaque d'immatriculation" (text, format XX-000-XX)
      • Entrer: "AB-123-CD"
   ☐ Champ "Date de première immatriculation" (date picker)
      • Sélectionner: 2020-01-15
   ☐ Champ "Nombre de places" (number, 1-8)
      • Entrer: 4
   ☐ Checkbox "Véhicule électrique"
      • Cocher: ☑
   ☐ Bouton "Ajouter ce véhicule"

4. Vérifier le véhicule ajouté:
   ☐ Véhicule apparaît dans la liste:
      • "Tesla Model 3 - Gris - 4 places"
      • Badge "Écologique"
   ☐ Option "Modifier" / "Supprimer" (optionnel)
   ☐ Bouton "Ajouter un autre véhicule" visible

5. Ajouter un 2ème véhicule (optionnel):
   ☐ Cliquer "Ajouter un autre véhicule"
   ☐ Remplir infos différentes (ex: Renault Clio)
   ☐ Ajouter à la liste

6. Validation des véhicules:
   
   **Cas: Plaque invalide**
   ☐ Format mauvais: "ABC123DE"
   ☐ Cliquer "Ajouter ce véhicule"
   ☐ Erreur: "Format plaque incorrect (XX-000-XX)"
   
   **Cas: Date future**
   ☐ Date: 2030-01-15 (future)
   ☐ Cliquer "Ajouter ce véhicule"
   ☐ Erreur: "Date de première immatriculation invalide"

7. Bouton "Valider et continuer":
   ☐ Au moins 1 véhicule ajouté
   ☐ Cliquer "Valider et continuer"
   ☐ Passage à ÉTAPE 2

8. ÉTAPE 2 - PRÉFÉRENCES:
   ☐ Titre: "Vos préférences de conduite"
   
   ☐ Section "Fumeur":
      • Radio buttons: "Fumeur" / "Non-fumeur"
      • Sélectionner: "Non-fumeur"
   
   ☐ Section "Animaux":
      • Radio buttons: "Animaux acceptés" / "Pas d'animaux"
      • Sélectionner: "Animaux acceptés"
   
   ☐ Section "Musique" (optionnel):
      • Radio buttons: "Musique" / "Pas de musique"
      • Sélectionner: "Musique"
   
   ☐ Section "Réseaux sociaux" (optionnel):
      • Radio buttons: "Oui" / "Non"
      • Sélectionner: "Non"
   
   ☐ Champ libre "Autres préférences" (textarea, max 200 chars)
      • Entrer: "Je suis ponctuel et courtois"
   
   ☐ Bouton "Valider et devenir chauffeur"

9. Vérifier la validation:
   
   **Cas: Aucune préférence sélectionnée**
   ☐ Ne rien sélectionner
   ☐ Cliquer "Valider et devenir chauffeur"
   ☐ Erreur: "Vous devez renseigner vos préférences"

10. Après validation:
    ☐ Message: "Vous êtes maintenant chauffeur!"
    ☐ Redirection vers /profile
    ☐ Rôle chauffeur visible: "Chauffeur ✓"
    ☐ Nouvelle section dans navbar: "Créer un trajet"
    ☐ /my-trips affiche section "Chauffeur"

11. Réinitialisation pour test suivant:
    ☐ IMPORTANT: Pour tests répétés
    ☐ (À implémenter) Endpoint: DELETE /user/driver-profile
    ☐ OU: Utiliser nouvel utilisateur pour chaque test
    ☐ OU: Rétrograder le rôle: POST /user/role {role: "passenger"}


**Validation**: ✅ Passé / ❌ Échoué

---

### US 9 - Création de Trajet

**Prérequis**: Utilisateur est chauffeur (voir US 8)

**Parcours**:

1. Aller à /create-trip (ou menu /profile → "Créer un trajet")

2. Vérifier le formulaire:
   ☐ Champ "Adresse de départ" (autocomplete)
   ☐ Champ "Adresse d'arrivée" (autocomplete)
   ☐ Champ "Date et heure de départ" (datetime picker)
   ☐ Champ "Durée estimée" OU "Heure d'arrivée" (auto-calculée ou manuelle)
   ☐ Champ "Prix par personne" (number, > 0)
   ☐ Sélecteur "Véhicule" (dropdown: liste des véhicules du chauffeur)
   ☐ Bouton "Créer le trajet"

3. Remplir le formulaire:
   ☐ Départ: "Paris (13 Rue de la Paix)"
      • Autocomplete proposera des adresses
      • Sélectionner la bonne
   ☐ Arrivée: "Lyon (10 Quai Saint-Antoine)"
      • Idem
   ☐ Date/heure: demain 08:00
      • Date picker: sélectionner demain
      • Heure: 08:00
   ☐ Durée: 4h 30min (optionnel si auto-calculée)
   ☐ Prix: 45 (euros)
   ☐ Véhicule: "Tesla Model 3 (4 places)"
   ☐ Cliquer "Créer le trajet"

4. Vérifier la création:
   ☐ Message: "Trajet créé avec succès!"
   ☐ Redirection vers /my-trips
   ☐ Nouveau trajet aparaît dans section "Chauffeur"
   ☐ Trajet affiche: "Paris → Lyon, demain 08:00, 45€"

5. Vérifier la commission:
   ☐ (Après que passagers rejoignent et trajet terminé)
   ☐ 1 passager à 45€ → chauffeur reçoit 43€ (45 - 2 commission)
   ☐ Vérifier dans historique crédits

6. Vérifier la recherche:
   ☐ Aller à /search
   ☐ Chercher: Paris → Lyon, demain
   ☐ Nouveau trajet apparaît dans les résultats
   ☐ "4 places restantes"

7. Validation des champs:
   
   **Cas: Adresses vides**
   ☐ Départ: "" (vide)
   ☐ Cliquer "Créer le trajet"
   ☐ Erreur: "L'adresse de départ est obligatoire"
   
   **Cas: Prix ≤ 0**
   ☐ Prix: 0 (ou -5)
   ☐ Cliquer "Créer le trajet"
   ☐ Erreur: "Le prix doit être positif"
   
   **Cas: Date dans le passé**
   ☐ Date: hier
   ☐ Cliquer "Créer le trajet"
   ☐ Erreur: "La date doit être dans le futur"
   
   **Cas: Pas de véhicule**
   ☐ (Si chauffeur sans véhicule)
   ☐ Cliquer "Créer le trajet"
   ☐ Erreur: "Vous devez ajouter un véhicule"

8. Réinitialisation pour test suivant:
   ☐ (À implémenter) DELETE /carpooling/:tripId
   ☐ OU: test utilise beforeEach() pour trajet frais


**Validation**: ✅ Passé / ❌ Échoué

---

### US 10c - Gestion de Trajet (Chauffeur)

**Prérequis**: Trajet créé avec au moins 1 participant

**Parcours**:

1. Aller à /my-trips → section "Chauffeur"

2. Vérifier le trajet:
   ☐ Destination: "Paris → Lyon"
   ☐ Date/heure départ: demain 08:00
   ☐ Nombre de passagers: "1 passager inscrit"
   ☐ Statut: "À venir"
   ☐ Bouton "Démarrer" (actif si heure approche)
   ☐ Bouton "Détail"
   ☐ Bouton "Annuler"

3. Démarrer le trajet (à l'heure du départ):
   ☐ Cliquer "Démarrer"
   ☐ Modal: "Commencer le trajet?"
   ☐ Affiche: destination, passagers (liste)
   ☐ Buttons: "Annuler" et "Démarrer"
   ☐ Cliquer "Démarrer"

4. Vérifier le démarrage:
   ☐ Message: "Trajet démarré"
   ☐ Bouton change en "Arrivé à destination"
   ☐ Statut: "En cours"
   ☐ Timestamp de départ enregistré (vérifiable dans détail)

5. Terminer le trajet (à l'arrivée):
   ☐ Cliquer "Arrivé à destination"
   ☐ Modal: "Terminer le trajet?"
   ☐ Affiche: destination, passagers
   ☐ Buttons: "Continuer" et "Annuler"
   ☐ Cliquer "Continuer"

6. Vérifier la termination:
   ☐ Message: "Trajet terminé!"
   ☐ Statut trajet: "Terminé"
   ☐ Bouton "Arrivé à destination" disparaît
   ☐ Timestamp d'arrivée enregistré

7. Vérifier le versement des crédits:
   ☐ Aller à /profile → Crédits augmenté
   ☐ Aller à /credits → Historique:
      • Transaction: "+43 crédits (Trajet Paris → Lyon, 1 passager)"
      • Date: aujourd'hui

8. Vérifier les notifications aux passagers:
   ☐ (Vérifier logs ou email de test)
   ☐ Passagers reçoivent notification: "Le trajet est terminé"
   ☐ Lien vers formulaire d'avis: /review/:tripId

9. Annulation par le chauffeur:
   
   **Avant démarrage**
   ☐ Nouveau trajet non démarré
   ☐ Cliquer "Annuler"
   ☐ Modal: "Annuler ce trajet?"
   ☐ "Tous les passagers seront remboursés"
   ☐ Buttons: "Continuer" et "Annuler"
   ☐ Cliquer "Continuer"
   
   ☐ Message: "Trajet annulé"
   ☐ Trajet dispara de /my-trips
   ☐ Passagers remboursés:
      • Crédits restaurés (prix du trajet)
      • Historique: "+45 crédits (Remboursement annulation trajet)"
   ☐ Email notification aux passagers (optionnel)

10. Cas d'erreur:
    
    **Trajet pas encore commençable**
    ☐ Trajet dans 2h (pas assez proche)
    ☐ Bouton "Démarrer" désactivé ou avec tooltip
    ☐ Message: "Le trajet peut être démarré 15 min avant"
    
    **Trajet déjà terminé**
    ☐ Trajet passé (terminé il y a 1h)
    ☐ Boutons "Démarrer" / "Annuler" désactivés
    ☐ Bouton "Arrivé à destination" grisé

11. Réinitialisation pour test suivant:
    ☐ Trajet créé → test annuler → état neutre
    ☐ Trajet créé → test démarrer/terminer → suppression (DELETE /carpooling/:id)


**Validation**: ✅ Passé / ❌ Échoué

---

## 💼 EMPLOYÉ

### US 12 - Espace Employé (Modération)

**Prérequis**: Employé créé par admin

**Parcours**:

1. Employé se connecte:
   ☐ Email: employee@ecoride.test
   ☐ Mot de passe: Employee2025! (créé par admin)
   ☐ Redirection vers /employee (ou /admin/employee)

2. Vérifier le dashboard:
   ☐ Titre: "Espace Modérateur"
   ☐ Deux sections principales:
      • Section "Avis en attente"
      • Section "Rapports de trajet"

3. SECTION MODÉRATION D'AVIS:
   ☐ Liste d'avis en attente de validation
   ☐ Pour chaque avis:
      • Auteur (pseudo passager)
      • Note (★★★★★)
      • Commentaire
      • Chauffeur cible (pseudo + photo)
      • Trajet (destination, date)
      • Statut: "En attente"
   ☐ Buttons: "Valider" et "Refuser"

4. Valider un avis:
   ☐ Cliquer "Valider" sur un avis
   ☐ Confirmation: "Avis validé"
   ☐ Avis retire de la liste
   ☐ Avis apparaît dans profil du chauffeur (/user/:driverId)

5. Refuser un avis:
   ☐ Cliquer "Refuser" sur un avis
   ☐ Modal ou champ raison apparaît
   ☐ Entrer raison: "Contenu offensant / inapproprié"
   ☐ Cliquer "Confirmer refus"
   ☐ Confirmation: "Avis refusé"
   ☐ Avis retire de la liste et supprimé
   ☐ Passager notifié (optionnel)

6. SECTION RAPPORTS DE TRAJET:
   ☐ Liste de trajets signalés
   ☐ Pour chaque rapport:
      • Numéro trajet (ID)
      • Destination, date, participants
      • Chauffeur (pseudo + email)
      • Passager auteur du rapport (pseudo + email)
      • Motif: "Le trajet s'est mal passé"
      • Commentaire du passager
      • Statut: "Non traité"
   ☐ Buttons: "Détail" et optionnels "Contacter chauffeur" / "Contacter passager"

7. Traiter un rapport:
   ☐ Cliquer "Détail" sur un rapport
   ☐ Modal/page affiche infos complètes:
      • Trajet complet (départ, arrivée, heure, prix)
      • Participants (liste)
      • Rapport complet
   ☐ Sélecteur d'action:
      • "Approuver les crédits du chauffeur"
      • "Refuser les crédits du chauffeur"
      • "Discuter avec les deux parties" (optionnel)
   ☐ Sélectionner action (ex: "Approuver les crédits")
   ☐ Cliquer "Confirmer"
   ☐ Message: "Rapport traité"
   ☐ Rapport retire de la liste

8. Dashboard stats:
   ☐ Nombre d'avis en attente
   ☐ Nombre de rapports non traités
   ☐ Avis validés ce mois
   ☐ Litiges résolus ce mois

9. Cas d'erreur:
   
   **Aucun avis à modérer**
   ☐ Liste avis vide
   ☐ Message: "Aucun avis à modérer"
   
   **Aucun rapport**
   ☐ Liste rapports vide
   ☐ Message: "Aucun rapport actuellement"

10. Réinitialisation pour test:
    ☐ Avis validé → supprimer (DELETE /admin/review/:id)
    ☐ Rapport traité → supprimer (DELETE /admin/report/:id)


**Validation**: ✅ Passé / ❌ Échoué

---

## 👨‍💼 ADMINISTRATEUR

### US 13a - Gestion des Comptes

**Prérequis**: Admin connecté (Admin / Admin2025!)

**Parcours**:

1. Admin se connecte:
   ☐ Email: admin@ecoride.test
   ☐ Mot de passe: Admin2025!
   ☐ Redirection vers /admin (ou /admin/dashboard)

2. Menu admin:
   ☐ Gestion des utilisateurs
   ☐ Gestion des employés
   ☐ Statistiques
   ☐ Paramètres (optionnel)

3. SECTION UTILISATEURS:
   ☐ Tableau avec tous les utilisateurs:
      • Pseudo, Email, Rôle(s), Date inscription, Statut
   ☐ Filtres:
      • Par rôle: "Tous", "Passagers", "Chauffeurs"
      • Par statut: "Actifs", "Suspendus"
   ☐ Pour chaque utilisateur:
      • Bouton "Détail"
      • Bouton "Suspendre" / "Réactiver"
      • Bouton "Supprimer" (optionnel, très destructif)

4. Suspendre un utilisateur:
   ☐ Cliquer "Suspendre" sur un utilisateur actif
   ☐ Modal: "Suspendre cet utilisateur?"
   ☐ Champ "Raison de suspension":
      • Entrer: "Non-respect des CGU"
   ☐ Cliquer "Suspendre"
   ☐ Message: "Utilisateur suspendu"
   ☐ Statut utilisateur: "Suspendu"
   ☐ Utilisateur ne peut plus se connecter
   ☐ (Test) Essayer de se connecter avec ce compte:
      • Login avec email suspendu
      • Erreur: "Compte suspendu. Contactez l'administrateur"

5. Réactiver un utilisateur:
   ☐ Utilisateur suspendu dans le tableau
   ☐ Statut: "Suspendu"
   ☐ Cliquer "Réactiver"
   ☐ Modal: "Réactiver cet utilisateur?"
   ☐ Cliquer "Réactiver"
   ☐ Message: "Utilisateur réactivé"
   ☐ Statut: "Actif"
   ☐ (Test) Se connecter à nouveau fonctionne

6. SECTION EMPLOYÉS:
   ☐ Tableau avec tous les employés:
      • Pseudo, Email, Date création, Actif/Inactif
      • Nombre d'avis modérés
      • Nombre de rapports traités
   ☐ Bouton "Créer un nouvel employé"

7. Créer un employé:
   ☐ Cliquer "Créer un nouvel employé"
   ☐ Modal avec champs:
      • Pseudo: "Employee2"
      • Email: "employee2@ecoride.test"
      • Mot de passe: (auto-généré ou fourni)
   ☐ Cliquer "Créer"
   ☐ Message: "Employé créé avec succès"
   ☐ Employé aparaît dans la liste
   ☐ Email envoyé à employee2@ecoride.test (optionnel)
   ☐ (Test) Nouvel employé peut se connecter

8. Désactiver un employé:
   ☐ Employé actif dans la liste
   ☐ Cliquer "Désactiver"
   ☐ Modal: "Désactiver cet employé?"
   ☐ Cliquer "Désactiver"
   ☐ Statut: "Inactif"
   ☐ Employé ne peut plus accéder à /employee (si implémenté)

9. Réactiver un employé:
   ☐ Employé inactif
   ☐ Cliquer "Réactiver"
   ☐ Statut: "Actif"

10. Cas d'erreur:
    
    **Email déjà existant**
    ☐ Créer avec email existant
    ☐ Erreur: "Email déjà utilisé"
    
    **Pseudo vide**
    ☐ Créer avec pseudo vide
    ☐ Erreur: "Le pseudo est obligatoire"

11. Réinitialisation:
    ☐ Employé créé → supprimer (DELETE /admin/employee/:id)
    ☐ Utilisateur suspendu → réactiver


**Validation**: ✅ Passé / ❌ Échoué

---

### US 13b - Tableau de Bord & Statistiques

**Prérequis**: Admin connecté

**Parcours**:

1. Admin accède à /admin → onglet "Statistiques"

2. Voir le dashboard avec 2 graphiques:
   
   GRAPHIQUE 1 - COVOITURAGES PAR JOUR
   ☐ Type: Graphique en barres ou ligne
   ☐ Axe X: Dates (exemple: 1 dec, 2 dec, 3 dec, ...)
   ☐ Axe Y: Nombre de covoiturages créés
   ☐ Légende: "Covoiturages créés (derniers 30 jours)"
   ☐ Hover sur barre → affiche nombre exact
   ☐ Exemple: 1 dec: 5 trajets, 2 dec: 8 trajets, etc.
   
   GRAPHIQUE 2 - CRÉDITS GAGNÉS PAR JOUR
   ☐ Type: Graphique en barres ou ligne
   ☐ Axe X: Dates
   ☐ Axe Y: Crédits gagnés (commissions €)
   ☐ Légende: "Crédits gagnés par la plateforme (commissions)"
   ☐ Hover sur barre → affiche montant exact
   ☐ Exemple: 1 dec: €10, 2 dec: €24, etc.

3. Statistiques globales:
   ☐ Total des utilisateurs: "XX utilisateurs"
   ☐ Total des covoiturages: "XX trajets"
   ☐ Total des crédits gagnés: "€XXXX"
   ☐ Utilisateurs actifs ce mois: "XX"
   ☐ Taux de complétion: "XX.X%"

4. Filtres:
   ☐ Sélecteur plage de dates:
      • "Cette semaine"
      • "Ce mois"
      • "Année"
      • "Personnalisée" (date picker)
   ☐ Changer la plage → graphiques se mettent à jour

5. Export (optionnel):
   ☐ Bouton "Exporter en CSV"
   ☐ Cliquer → fichier CSV téléchargé
   ☐ Contenu: dates, nombres, crédits

6. Cas d'erreur:
   
   **Pas de données**
   ☐ Sélectionner une plage sans données
   ☐ Graphiques affichent: "Aucune donnée disponible"
   ☐ Stats globales: "0"

7. Vérification des données:
   ☐ (Après création/participation de trajets)
   ☐ Graphique "Covoiturages par jour" augmente
   ☐ Graphique "Crédits gagnés" augmente (commission 2€ par trajet)
   ☐ Statistiques globales augmentent


**Validation**: ✅ Passé / ❌ Échoué

---

## 📊 SYSTÈME DE CRÉDITS (Tous rôles)

### Crédits: Historique Complet

**Prérequis**: Utilisateur avec plusieurs transactions

**Parcours**:

1. Aller à /credits (ou /profile → onglet "Crédits")

2. Affichage du solde:
   ☐ "Vous disposez de 78 crédits"
   ☐ Barre de progression visuelle
   ☐ Aucun bouton d'achat (optionnel si système existe)

3. Historique des transactions:
   ☐ Tableau avec colonnes:
      • Date (ex: "15 déc 2025, 10:30")
      • Type (ex: "Participation", "Remboursement", "Création trajet")
      • Montant (ex: "-15 €", "+15 €")
      • Description (ex: "Trajet Paris → Lyon")
   ☐ Ordre: Plus récent en haut
   ☐ Exemple historique:
      • 15 déc: +20 € (Bonus inscription)
      • 14 déc: -15 € (Trajet Paris → Lyon)
      • 14 déc: +15 € (Remboursement annulation)

4. Filtres (optionnels):
   ☐ Par type:
      • "Tous"
      • "Participation"
      • "Remboursement"
      • "Création trajet"
   ☐ Par date:
      • "Cette semaine"
      • "Ce mois"
      • "Tout le temps"

5. Tri:
   ☐ "Plus récent" (défaut)
   ☐ "Plus ancien"
   ☐ "Montant croissant"
   ☐ "Montant décroissant"

6. Pagination (si > 20 transactions):
   ☐ Afficher "Showing 1-20 of 45 transactions"
   ☐ Boutons "Précédent" / "Suivant"
   ☐ Cliquer pour voir pages suivantes


**Validation**: ✅ Passé / ❌ Échoué

---

## 🎯 Final Validation Checklist

### ✅ Avant de terminer

**Console & Logs**:
- [ ] F12 → Console → Aucune erreur rouge
- [ ] Aucun console.log en production (seulement console.error/warn)

**Performance**:
- [ ] Pages chargent en < 3 secondes
- [ ] Pas de lag ou jank sur les animations
- [ ] Responsive sur mobile (< 768px)

**Liens & Navigation**:
- [ ] Tous les liens internes fonctionnent
- [ ] Mentions légales s'ouvrent (nouveau tab ou modal)
- [ ] Contact redirige vers email client (mailto:)

**Formulaires**:
- [ ] Tous les formulaires se soumettent
- [ ] Validations affichent messages d'erreur clairs
- [ ] Pas de console errors sur submit

**Authentification**:
- [ ] Login/Logout fonctionne
- [ ] Session persiste après reload
- [ ] Utilisateur suspendu ne peut pas se connecter

**Crédits & Transactions**:
- [ ] Nouvelle inscription = 20 crédits
- [ ] Participation débit correctement
- [ ] Annulation rembourse intégralement
- [ ] Historique complète

**Avis & Modération**:
- [ ] Avis peut être soumis
- [ ] Avis apparaît dans profil après validation
- [ ] Avis refusé disparaît

**Rôles & Permissions**:
- [ ] Passager peut participer
- [ ] Chauffeur peut créer trajet
- [ ] Employé peut modérer
- [ ] Admin peut suspendre/créer employés

---

## 📝 Notes de Test

**Pour chaque test**:
1. Cocher les boîtes au fur et à mesure
2. Si erreur → noter dans la section "Problème"
3. Créer un issue GitHub ou note de bug
4. Refaire le test après correction


**Problèmes trouvés**:

|      | Cas            | Erreur                 | Comportement attendu | Statut        |
| ---- | -------------- | ---------------------- | -------------------- | ------------- |
| US 1 | Accueil → logo | Redirection 404        | Revenir à /          | À fixer       |
| US 7 | Login          | Erreur "Invalid token" | Connexion réussit    | À investiguer |
| ...  | ...            | ...                    | ...                  | ...           |


**Communication avec l'équipe dev**:
- Si test échoue → vérifier le code source
- Si test et code OK → peut être un problème E2E (timing, état DB, etc.)
- Relancer test → souvent résout les problèmes temporaires

---

## ✅ Succès Final

**Tous les tests passés** → Application **prête pour refactoring et présentation orale!**

