# Spécifications fonctionnelles.

## 🌐 Application Déployée - Accès Direct

**🎉 L'application EcoRide est maintenant déployée et accessible en ligne !**

### 📱 Accès à l'application
**URL : https://ecoridetp.netlify.app/**

Vous pouvez tester toutes les fonctionnalités décrites dans ce cahier des charges directement sur le site déployé.

### 🔑 Comptes de test prêts à utiliser

| 👤 Rôle               | 👤 Pseudo         | 🔐 Mot de passe | ⚡ Accès         |
| --------------------- | ----------------- | --------------- | ---------------- |
| 🛡️ **Administrateur** | Admin             | Admin2025!       | Gestion système  |
| 🧪 **Utilisateur**    | test              | Test2025!        | Participation&Création trajets    |

---

## 1. Objectifs
L’objectif principale de ce projet est de livrer une application web de covoiturage **« EcoRide »**, qui se veut **écologique**, que cela soit dans le **design**, ou dans les **fonctionnalités**.

L’application doit être **complète**, allant de la page d’accueil par de simples **visiteurs** non enregistrés, à la gestion par les **administrateurs**. Elle ne gérera **que les déplacements en voiture.**

Pour mieux approcher le projet, je vais séparer chaque partie, en fonction du rôle, et donc, du point de vue de « qui agit ? ».

> *Les utilisateurs concernés qui pourront interagir avec l’application seront :*
**Le visiteur :** Le visiteur est celui qui, n’a aucun compte, et qui arrive sur la plateforme. Qu’il soit déjà un utilisateur de la plateforme ou non, tant qu’il n’a pas de compte auquel il est connecté, il sera considéré comme un visiteur. Il pourra soit se connecter, soit s’inscrire pour créer un compte.
**L’utilisateur :** Par définition, un utilisateur est quelqu’un qui a un compte actif. Il peut être passager, chauffeur, ou les deux.
**L’utilisateur passager :** Un utilisateur passager, est quelqu’un qui choisit d’être un passager, autrement dit, profiter des services de covoiturages en tant que participant (Et non conducteur).
**L’utilisateur chauffeur :** Un utilisateur chauffeur, est un utilisateur, qui proposera les trajets, et qui sera rémunéré avec le système de crédit.
**L’employé :** L’employé, est du côté de l’entreprise EcoRide, son rôle majeur réside dans la modération et la gestion de conflit.
**L’administrateur :** L’administrateur, est comme son nom l’indique, gère les employés et l’application.
### **1. Fonctionnalités pour l'Utilisateur "Visiteur" (non authentifié)**

Pour mieux m'organiser, je vais spécifier sur chaque demande, si c'est 🎨 qui veut dire "Front-end" tandis que ⚙️ voudra dire "Back-end"
Lorsque l'emoji est attaché au titre de section, il sera automatiquement appliqué à toute la section, sauf mention contraire

- 🎨** Page d'Accueil (US 1)**
    
    - Afficher une présentation de l'entreprise avec des images.
        
    - Intégrer une barre de recherche pour trouver un itinéraire. (Écrire la destination)
        
    - _Afficher un bouton « Trouver un itinéraire » pour confirmer la destination_
        
    - _S’il appuie sur trouver un itinéraire sans avoir mis de destination, il ira tout de même à la page de recherche d’itinéraires avec le lieu de destination vide._
        
    - Disposer d'un pied de page (footer) contenant l'email de l’entreprise et un lien vers les mentions légales.
        
- 🎨** Navigation (US 2)**
    
    - Le menu principal doit permettre de :
        
        - Revenir à la page d'accueil.
            
        - Accéder à la vue des covoiturages.
            
        - Accéder à la page de connexion/_inscription_.
            
        - Accéder à la page de contact.
            
- 🎨**Recherche et Consultation de Covoiturages (US 3)**
    
    - Après avoir écrit le lieu de destination dans la barre de recherche (US 1)
        
        - ⚙️: Un formulaire doit permettre au visiteur de rechercher un **covoiturage** en renseignant une **ville** de départ (Automatiquement la position par défaut), une **ville** d'arrivée (Déjà remplie par défaut suite à la barre de recherche de l’accueil) et une date.
            
    - Une vue montrera un espace pour les options, par défaut, s’il n’y a aucun covoiturage visible.
        
    - ⚙️Les résultats affichent une liste d'itinéraires (**Carpools**) disponibles. Pour chaque itinéraire, il faut voir :
        
        - Le *pseudo*, la *photo* et la *note du chauffeur (NoSql)*.
            
        - Le *nombre* de *places restantes*.
            
        - Le *prix* du voyage.
            
        - La *date et l'heure de départ et d'arrivée*.
            
        - Une mention "*voyage écologique*" si le véhicule est *électrique*.
            
        - 🎨Un bouton "détail" pour accéder à la vue détaillée.
            
    - ⚙️Seuls les itinéraires avec au moins une place disponible sont affichés.
        
    - ⚙️Si aucun résultat n'est trouvé, le système doit proposer au visiteur la date du prochain itinéraire disponible le plus proche.
        

- ⚙️**Filtres de Recherche (US 4)**
    
    - Sur la page de résultats, des filtres doivent être disponibles pour affiner la recherche par :
        
        - Aspect écologique (**voiture électrique**).
            
        - **Prix maximum**.
            
        - **Durée maximale du voyage**.
            
        - **Note minimale du chauffeur**.
            
- ⚙️**Vue Détaillée d'un Covoiturage (US 5)**
    
    - Au clic sur "détail", le visiteur accède à une page web affichant toutes les informations de la page précédente, plus :
        
        - Les **avis** laissés sur le conducteur.
            
        - Le **modèle**, la **marque** et si elle est **électrique** ou non.
            
        - Les **préférences** du conducteur (fumeur, animaux).
            
- ⚙️**Inscription et Connexion (US 6, US 7)**
    
    - Le visiteur peut cliquer sur participer mais sera invité à se **connecter** ou à créer un **compte**.
        
    - La création de **compte** requiert un **pseudo**, une **adresse e-mail** et un mot **de passe sécurisé (Requis)**.
        
    - Un nouvel utilisateur reçoit **20 crédits** à l'inscription.
        

### **2. Fonctionnalités pour l'Utilisateur "Connecté" (Passager et/ou Chauffeur)**

- ⚙️**Espace Personnel (US 8)**
    
    - L'utilisateur peut définir son rôle : "**passager**", "**chauffeur**", ou **les deux**.
        
    - La sélection du rôle "**passager**" ne requiert pas d'informations supplémentaires.
        
- ⚙️**Participer à un Covoiturage (US 6)**
    
    - L'utilisateur peut participer à un voyage s'il reste au moins une place (Donc, revérifier à nouveau à ce stade, vu que d’autres auraient pu déjà le faire) et s'il dispose d'assez de crédits.
        
    - Une double confirmation est demandée pour valider l'utilisation des crédits.
        
    - La validation enregistre la participation dans l’espace « Passager », met à jour les crédits de l'utilisateur et le nombre de places du trajet (Coté « Chauffeur », sans validation pré-requis du chauffeur, car non explicite dans l’énoncé)
        
- ⚙️**Historique des Trajets (US 10)**
    
    - L'utilisateur (passager ou chauffeur) peut consulter l'historique de tous ses covoiturages.
        
- ⚙️**Annulation (US 10)**
    
    - Le passager peut annuler un covoiturage auquel il participe.
        
    - Dans ce cas, il est remboursé intégralement
        
    - Une place se libère, côté chauffeur
        
- ⚙️**Fin de Trajet et Avis (US 11)**
    
    - À la fin du trajet (déclenchée par le chauffeur), le passager reçoit un mail l'invitant à valider sur l’espace que le voyage s'est bien déroulé.
        
    - Le passager peut laisser un avis et une note, qui seront soumis à validation par un employé.
        
    - Si le trajet s'est mal passé, le passager peut le signaler via un commentaire qui sera traité par un employé avant la mise à jour des crédits du chauffeur.
        
### **3. Fonctionnalités Spécifiques au "Chauffeur"**

- ⚙️**Profil Chauffeur (US 8)**
    
    - Pour devenir chauffeur, l'utilisateur doit obligatoirement renseigner :
        
        - Les informations de son ou ses véhicules : plaque d'immatriculation, date de première immatriculation, modèle, couleur, marque.
            
        - Le nombre de places disponibles par véhicule.
            
        - Ses préférences : fumeur/non-fumeur, animaux/pas d'animaux, avec la possibilité d'ajouter des préférences personnalisées.
            
- ⚙️**Création d'un Voyage (US 9)**
    
    - Le chauffeur peut proposer un nouveau voyage depuis son espace.
        
    - Il doit définir l'adresse de départ et d'arrivée, et fixer un prix.
        
    - La plateforme prélève une commission de 2 crédits sur le prix fixé.
        
    - Il doit associer un de ses véhicules enregistrés au voyage. (Pourquoi pas le faire automatiquement s’il n’y a qu’une véhicule ?)
        
- ⚙️**Gestion de Trajet (US 10, US 11)**
    
    - Le chauffeur peut démarrer un trajet en cliquant sur un bouton « démarrer ».
        
    - À la fin du trajet, le bouton qui était de base « démarrer » devient « arrivé à destination »
        
    - Une fois le trajet terminé et validé par le participant, le chauffeur reçoit les crédits (- 2 frais de service, _et donc +2 à l’application_).
        
    - Le chauffeur peut annuler un covoiturage auquel il participe/conduit.
        
    - Dans ce cas, les passagers auront un remboursement des crédits qu’ils auront bloqués pour le trajet.
        
    - Et un mail est envoyé aux participants concernés.
        
### **4. Fonctionnalités pour l'Utilisateur "Employé"**

- ⚙️**Espace Employé (US11, US 12)**
    
    - L'employé se connecte pour accéder à un espace de gestion dédié.
        
    - Il peut valider ou refuser les avis laissés par les passagers avant leur publication.
        
    - Il peut consulter la liste des covoiturages signalés comme s'étant mal passés, avec accès aux détails du trajet (numéro de covoiturage) et aux contacts des personnes concernées (pseudos et mails) pour résoudre le litige.
        
    - Il a accès au descriptif du trajet (date de départ et d’arrivée ainsi que le lieu)
        
    - En cas d’un mauvais commentaire à la fin d’un trajet, il devra contacter le chauffeur (Donc, pourquoi pas ajouter la possibilité de le faire via le commentaire ?)
        

### **5. Fonctionnalités pour l'Utilisateur "Administrateur"**


- ⚙️**Gestion des Comptes (US 13)**
    
    - Le compte administrateur est créé en amont (impossible via l'application).
        
    - L'administrateur peut créer les comptes des employés.
        
    - Il peut suspendre n'importe quel compte utilisateur ou employé.
        
- ⚙️**Tableau de Bord et Statistiques (US 13)**
    
    - L'administrateur doit visualiser des statistiques via deux graphiques :
        
        - Nombre de covoiturages par jour.
            
        - Nombre de crédits gagnés par la plateforme en fonction des jours.
            
    - Il doit également voir le nombre total de crédits gagnés par la plateforme.
