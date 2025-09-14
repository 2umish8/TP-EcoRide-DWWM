const { ZodError } = require("zod");

// Middleware pour valider req.body avec un schema Zod
function validateBody(schema) {
    return (req, res, next) => {
        try {
            const result = schema.parse(req.body);
            // attacher la valeur validée (utile si le schema transforme des valeurs)
            req.validatedBody = result;
            return next();
        } catch (err) {
            if (err instanceof ZodError) {
                const errors = err.issues.map((e) => ({
                    path: e.path.join("."),
                    message: e.message,
                }));
                return res.status(400).json({ errors });
            }
            return next(err);
        }
    };
}

module.exports = { validateBody };
