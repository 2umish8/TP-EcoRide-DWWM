# Scripts de test et maintenance - Backend

## Contenu

Ce dossier contient des scripts d'automatisation et de test :

-   `testAPI.js` : tests des endpoints principaux
-   `runAllTests.js` : exécute l'ensemble des tests
-   `cleanDatabase.js` : nettoie ou réinitialise la base de données de test

## Exemples d'utilisation

```powershell
# Exécuter tous les tests
node scripts/runAllTests.js

# Nettoyer la base de données de test
node scripts/cleanDatabase.js clean
```

## Stack de déploiement

Les scripts supposent que l'application est déployée ou configurée avec les fournisseurs suivants :

-   Backend : Render
-   MySQL : Aiven (MySQL managé)
-   MongoDB : MongoDB Atlas
-   Frontend : Netlify

Avant d'exécuter des scripts qui interagissent avec les bases de données, assurez-vous que les variables d'environnement locales ou CI pointent vers les instances appropriées.
