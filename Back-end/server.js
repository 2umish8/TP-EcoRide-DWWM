// Importer Express
const express = require('express');

// Créer l'application Express
const app = express();

// Définir le port d'écoute
const PORT = process.env.PORT || 3000;

// Créer une route de test pour vérifier que tout fonctionne
app.get('/', (req, res) => {
    res.send('Le serveur EcoRide fonctionne !');
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});

