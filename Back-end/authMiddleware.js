const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
    // Récupérer le token du header de la requête
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Format "Bearer TOKEN"

    if (token == null) {
        return res
            .status(401)
            .json({ message: "Accès non autorisé : token manquant." });
    }

    // Vérifier le token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Token invalide." });
        }
        // Ajouter les infos de l'utilisateur à l'objet de la requête
        req.user = user;
        next(); // Passer à la route suivante
    });
}

module.exports = authMiddleware;
