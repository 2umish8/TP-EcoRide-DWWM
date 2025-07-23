# 🧪 Guide de Test - Fin de Trajet et Avis (US 11)

## 🎯 Objectif

Valider le workflow complet de fin de trajet avec envoi automatique d'emails d'invitation aux avis.

## 📋 Fonctionnalités Testées

### ✅ Backend

1. **Fin de covoiturage avec notifications email**

    - Calcul automatique des gains du chauffeur
    - Envoi d'emails aux passagers avec liens vers les formulaires d'avis
    - Gestion des erreurs d'envoi d'email

2. **Système d'avis MongoDB**
    - Création d'avis avec statut "pending"
    - Validation par employé (approved/rejected)
    - Système de signalement de problèmes

### ✅ Frontend

1. **Interface d'avis depuis email**

    - Formulaire de notation (étoiles)
    - Commentaires texte
    - Option de signalement de problème

2. **Interface de signalement**
    - Catégorisation des problèmes
    - Niveaux de gravité
    - Descriptions détaillées

## 🚀 Exécution des Tests

### Test Automatique (Backend)

```powershell
# Démarrer le serveur backend
cd TP-EcoRide-DWWM\Back-end
npm start

# Dans un autre terminal, lancer le test
node scripts/testTripCompletionAndReviews.js
```

### Test Manuel (Frontend)

1. **Démarrer le frontend**

    ```powershell
    cd TP-EcoRide-DWWM\Front-end
    npm run dev
    ```

2. **Tester les formulaires directement**
    - Avis : `http://localhost:5173/review/123?driverId=456`
    - Signalement : `http://localhost:5173/report/123?driverId=456`

## 📧 Simulation des Emails

En mode développement, les emails sont simulés dans la console :

```
📧 EMAIL SIMULÉ - Invitation à laisser un avis
To: passager@test.com
Subject: 🌟 Votre trajet EcoRide est terminé - Laissez votre avis
─────────────────────────────────────────────────────────
Bonjour,

Votre trajet avec chauffeur_123 est terminé !

Cliquez ici pour laisser votre avis :
http://localhost:5173/review/456?driverId=123

En cas de problème, signalez-le ici :
http://localhost:5173/report/456?driverId=123

Merci de faire confiance à EcoRide !
```

## 🎬 Scénarios de Test

### Scénario 1 : Avis Positif

1. Chauffeur termine le trajet
2. Passager reçoit l'email
3. Passager clique sur le lien d'avis
4. Passager donne 5 étoiles + commentaire positif
5. Employé valide l'avis
6. Avis apparaît sur le profil chauffeur

### Scénario 2 : Signalement de Problème

1. Chauffeur termine le trajet
2. Passager reçoit l'email
3. Passager clique sur "Signaler un problème"
4. Passager remplit le formulaire de signalement
5. Employé traite le signalement
6. Actions correctives prises

## 🔍 Points de Vérification

### ✅ Backend

-   [ ] `finishCarpooling` calcule les gains correctement
-   [ ] Emails envoyés à tous les passagers
-   [ ] Avis créés avec statut "pending"
-   [ ] Validation employé fonctionne
-   [ ] Signalements traités séparément

### ✅ Frontend

-   [ ] Formulaire d'avis charge les informations du trajet
-   [ ] Système d'étoiles fonctionne
-   [ ] Bascule vers signalement fonctionne
-   [ ] Validation des formulaires
-   [ ] Messages d'erreur/succès

### ✅ Intégration

-   [ ] Liens email redirectent vers bonnes pages
-   [ ] Paramètres URL transmis correctement
-   [ ] Données sauvegardées en base
-   [ ] Workflow complet sans erreur

## 🛠️ Dépannage

### Erreurs Communes

**Email ne s'envoie pas :**

```
⚠️ Mode développement : emails simulés dans la console
```

**Frontend ne charge pas :**

```powershell
# Vérifier que le serveur dev tourne
npm run dev
# Port par défaut : http://localhost:5173
```

**Erreur MongoDB :**

```javascript
// Vérifier la connexion MongoDB dans server.js
MongoClient.connect(mongoUrl, { useUnifiedTopology: true });
```

**Erreur MySQL :**

```javascript
// Vérifier db.js pour la configuration MySQL
connection.connect((err) => { ... })
```

## 📊 Résultats Attendus

### Logs de Succès

```
✅ Covoiturage terminé avec succès
💰 Gains calculés : 75 crédits
📧 3 passagers notifiés par email
⭐ Avis soumis et en attente de validation
👨‍💼 Validation employé effectuée
🌟 Avis publié sur le profil chauffeur
```

### Métriques

-   **Temps de traitement** : < 2 secondes
-   **Emails envoyés** : 100% des passagers
-   **Avis validés** : Selon politique employé
-   **Erreurs** : Gestion gracieuse, pas de crash

## 🎯 Critères de Validation

Le test est réussi si :

1. ✅ Fin de trajet déclenche automatiquement les emails
2. ✅ Passagers reçoivent liens fonctionnels
3. ✅ Formulaires d'avis sont accessibles et fonctionnels
4. ✅ Système de validation employé opérationnel
5. ✅ Avis validés apparaissent publiquement
6. ✅ Signalements traités séparément

---

_Guide créé pour EcoRide - US 11 : Fin de Trajet et Avis_
_Version : 1.0 | Date : $(Get-Date -Format "dd/MM/yyyy")_
