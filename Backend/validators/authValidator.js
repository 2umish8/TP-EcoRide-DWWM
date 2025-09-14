const { z } = require("zod");

const loginSchema = z.object({
    identifier: z
        .string()
        .min(1, { message: "Identifiant requis (email ou pseudo)" }),
    password: z.string().min(1, { message: "Mot de passe requis" }),
});

const changePasswordSchema = z.object({
    currentPassword: z
        .string()
        .min(1, { message: "Mot de passe actuel requis" }),
    newPassword: z
        .string()
        .min(8, {
            message:
                "Le nouveau mot de passe doit contenir au moins 8 caractères",
        })
        .regex(/[A-Z]/, {
            message:
                "Le nouveau mot de passe doit contenir au moins une majuscule",
        })
        .regex(/[0-9]/, {
            message:
                "Le nouveau mot de passe doit contenir au moins un chiffre",
        })
        .regex(/[^A-Za-z0-9]/, {
            message:
                "Le nouveau mot de passe doit contenir au moins un symbole",
        }),
});

module.exports = { loginSchema, changePasswordSchema };
