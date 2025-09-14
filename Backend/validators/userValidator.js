const { z } = require("zod");

// Schéma pour la création d'un utilisateur (inscription)
const createUserSchema = z.object({
    pseudo: z
        .string()
        .min(3, { message: "Le pseudo doit contenir au moins 3 caractères" })
        .max(50, { message: "Le pseudo est trop long" }),
    email: z.string().email({ message: "Adresse email invalide" }),
    password: z
        .string()
        .min(8, {
            message: "Le mot de passe doit contenir au moins 8 caractères",
        })
        .regex(/[A-Z]/, {
            message: "Le mot de passe doit contenir au moins une majuscule",
        })
        .regex(/[0-9]/, {
            message: "Le mot de passe doit contenir au moins un chiffre",
        })
        .regex(/[^A-Za-z0-9]/, {
            message: "Le mot de passe doit contenir au moins un symbole",
        }),
});

module.exports = { createUserSchema };
