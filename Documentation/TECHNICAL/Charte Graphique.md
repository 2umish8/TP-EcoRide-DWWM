# Charte graphique
Ce document définit la charte graphique de notre projet EcoRide, incluant les couleurs, les typographies et les styles visuels à utiliser dans toutes les communications et interfaces utilisateur.
Ceci est créé spécialement pour s'assurer d'avoir un design cohérent et uniforme dans tout le site et bien gérer ce qui doit être scopé ou non dans les fichiers .vue.


## Règles générales
**Quand mettre globalement un style dans un fichier ou localement dans un composant ?**
- **Globalement** : Styles réutilisables dans plusieurs composants (ex : boutons, cartes, typographies, couleurs).
- **Localement** : Styles spécifiques à un composant unique (ex : mise en page d'une page, styles particuliers non réutilisables).

**Organisation des fichiers CSS**
- Fichiers globaux : `src/assets/css/` pour les styles partagés.
  - Un fichier de reset (Base CSS).
  - Un fichier pour les variables (couleurs, typographies).
  - Un fichier pour chaque composant (1 fichier bouton, 1 fichier carte, etc.).
  - Pas de fichiers CSS ailleurs dans le projet.
- Fichiers locaux : Directement dans les composants `.vue` pour les styles spécifiques.


## Couleurs principales
- **Couleur primaire** : #8fdab3
  - Utilisée partout dans l'interface pour les éléments interactifs comme les boutons, les liens, et les accents visuels.
- **Couleur primaire au survol** : #6bc26b
    - Utilisée uniquement pour les états de survol des éléments interactifs.
- **Couleur secondaire** : #79d09e
  - Utilisé principalement sur le texte, ou sinon la couleur de fond d'un élément secondaire.
- **Sombre primaire** : #1a1a1a
  - Fond principal de l'interface
- **Sombre secondaire** : #2d2d2d
  - Fond des cartes ou sections secondaires, utile pour différencier les zones.
- **Sombre tertiaire** : #24272b
  - Teinte bleutée, utile pour pied de page ou éléments nécessitant une distinction supplémentaire.
- **Clair primaire** : #ffffff
  - Titre ou texte interactif
- **Clair secondaire** : #cacaca
  - Texte principal sur fond sombre
- **Gris primaire** : #7a7a7a
  - Utilisé pour boutons désactivés, ou texte secondaire

## Typographies

- **Police principale :** Inter (utilisée pour l'ensemble de l'interface). Si `Inter` n'est pas disponible, la pile de secours système est utilisée : `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`.
- **Taille et hauteur de ligne par défaut :** `font-size: 15px` (base) et `line-height: 1.6` 
- **Variables CSS utiles :**
	- `--font-size-sm`: 0.875rem
	- `--font-size-base`: 1rem
	- `--font-size-lg`: 1.125rem
	- `--font-size-xl`: 1.25rem
	- `--font-weight-normal`: 400
	- `--font-weight-medium`: 500
	- `--font-weight-semibold`: 600
	- `--font-weight-bold`: 700

## Boutons
### Bouton principal
Utilisé pour les actions principales (ex : soumettre un formulaire).
- **Sans état** :
  - Icone à droite (Pour indiquer une action)
  - Couleur primaire en fond
  - Texte sombre.
  - Bord arrondi.
- **Au survol** :
  - Couleur primaire au survol en fond
  - Texte Clair.
  - Lever légèrement le bouton avec une ombre portée.
  - Transition douce entre les états.
- **Désactivé** :
  - Couleur grise en fond
  - Texte clair.
  - Curseur non interactif (curseur par défaut).
  - Opacité réduite pour indiquer l'état désactivé.

### Bouton secondaire
Utilisé pour les actions secondaires, souvent à côté d'un bouton principal.
- **Sans état** :
  - Pas d'icone
  - Fond avec flou léger
  - Texte de couleur primaire.
  - Bord arrondi, bordure de couleur primaire.
  - Couleur de fond avec faible opacité avec couleur primaire.
- **Au survol** :
  - Devient littéralement un bouton primaire sans état.
  - Léger lever du bouton avec une ombre portée.
  - Transition douce entre les états.
- **Désactivé** :
  - Fond gris clair translucide
  - Texte gris foncé.
  - Bordure grise.
  - Curseur non interactif (curseur par défaut).
  - Opacité réduite pour indiquer l'état désactivé.

### Lien/bouton de navigation
Utilisé pour la navigation entre les pages ou sections.
- **Sans état** :
  - Icone à gauche
  - Fond transparent
  - Texte blanc
  - Bord arrondi. (Invisible sans fond mais utile au survol)
- **Au survol** :
  - Fond de couleur primaire avec opacité réduite.
- **Désactivé** :
  - N'exste pas, geré via un v-if dans le code.

### Liens interlignes
Utilisé pour les liens dans le texte.
- **Sans état** :
  - Blanc primaire
  - Souligné
  - Curseur pointeur. (Normalement géré par le navigateur)
- **Au survol** :
  - Couleur secondaire
  - Souligné
  - Léger soulèvement avec une ombre portée.
  - Transition douce entre les états.
- **Désactivé** :
  - Gris primaire
  - Pas de soulignement
  - Curseur par défaut.

## Animations
Les animations doivent être utilisées avec parcimonie pour améliorer l'expérience utilisateur sans distraire.
- **Apparition de modale**
  - Fondu en entrée.
- **Disparition de modale**
  - Fondu en sortie.
- **Chargement**
  - Rotation continue pour indiquer le chargement.
- **Indicateur d'erreur**
  - Secousse horizontale pour attirer l'attention sur un champ erroné.
  - Durée courte pour ne pas être trop distrayant.
- **Attirer l'attention subtilement**
  - Rebondissement doux. (ex: indicateur de scroll vers le bas, icone de nouvelle notification)

## Cartes

### Style de base (commun à toutes les cartes), à mettre dans un fichier global
- **Titre** : Clair primaire, gras.
- **Texte** : Clair secondaire
- **Fond** : Sombre secondaire
- **Bordure** : Fine bordure grise avec arrondi modéré.
- **Ombre** : Ombre subtile pour indiquer la profondeur.
- **Padding** : Espacement interne de 24px.
- **Accessibilité** :
  - Contraste suffisant sur tous les textes.
  - États visuels clairs (couleur + forme, pas seulement la couleur).
  - Espacements réguliers pour navigation au clavier facile.

### Cartes de trajets (cliquables)
Héritent du style de base + comportement interactif.
- **Au survol** :
  - La carte se soulève légèrement (effet bouton).
  - L'ombre portée s'intensifie.
  - Le curseur devient une main (pointeur).
  - Transition douce et fluide.
- **Statut** : Petit texte en coin indiquant l'état (ex: "prévu", "en cours", "terminé", "annulé").
- **Logique de couleur** :
  - **Prévu** : Style normal (pas de couleur spécifique).
  - **En cours** : Style normal (pas de couleur spécifique).
  - **Terminé** : Accent vert.
  - **Annulé** : Accent gris.
- **Contenu principal** (ordre affiché) :
  - Trajet : Ville de départ → Ville d'arrivée avec icônes.
  - Infos du trajet : Date, heure, durée, distance.
  - Informations du conducteur : Avatar, nom, note/avis.
  - Véhicule : Type, couleur, immatriculation.
  - Tarif et places : Prix, nombre de places restantes.
- **Variantes** :
  - **Ma carte** (propriétaire) : Bordure verte supplémentaire.
  - **Carte écolo** : Accent vert clair.

### Cartes non-cliquables
Héritent du style de base, sans changement au survol. Curseur normal (par défaut).

#### Carte d'informations du conducteur
- **Avatar** : Image circulaire, bordure fine.
- **Contenu** :
  - Nom et prénom
  - Note globale (étoiles) + nombre d'avis
  - Nombre de trajets effectués
  - Type de véhicule préféré

#### Carte de préférences du conducteur
- **Contenu** :
  - Préférences musicales
  - Acceptation des animaux
  - Fumeurs ou non-fumeurs
  - Autres critères personnels
- **Présentation** : Icônes + texte court pour chaque préférence.

#### Carte d'avis / évaluation
- **Contenu** :
  - Avatar de l'auteur avec nom
  - Note (étoiles)
  - Texte de l'avis
  - Date de l'avis
- **Longueur** : Courte à moyenne pour rester lisible.

#### Carte d'informations générales
- **Contenu** : Texte, icônes et valeurs organisés simplement.
- **Usage** : Statistiques, détails, ou autres informations contextuelles.