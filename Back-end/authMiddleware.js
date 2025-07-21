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

// Middleware pour vérifier les rôles spécifiques
function requireRole(roleName) {
    return (req, res, next) => {
        // S'assurer que l'utilisateur est connecté
        if (!req.user) {
            return res
                .status(401)
                .json({ message: "Utilisateur non authentifié." });
        }

        // Vérifier si l'utilisateur a le rôle requis
        if (!req.user.roles || !req.user.roles.includes(roleName)) {
            return res.status(403).json({
                message: `Accès refusé : rôle '${roleName}' requis.`,
                userRoles: req.user.roles,
            });
        }

        next();
    };
}

// Middleware pour vérifier plusieurs rôles (OU logique)
function requireAnyRole(...roleNames) {
    return (req, res, next) => {
        if (!req.user) {
            return res
                .status(401)
                .json({ message: "Utilisateur non authentifié." });
        }

        const hasRole = roleNames.some(
            (role) => req.user.roles && req.user.roles.includes(role)
        );
        if (!hasRole) {
            return res.status(403).json({
                message: `Accès refusé : un des rôles suivants requis : ${roleNames.join(
                    ", "
                )}`,
                userRoles: req.user.roles,
            });
        }

        next();
    };
}

module.exports = {
    authMiddleware,
    requireRole,
    requireAnyRole,
};
