const db = require("../Config/db.js");

/* --------------------------------------------------- Statistiques générales de la plateforme ----------------- */
const getPlatformStats = async (req, res) => {
    try {
        // Nombre total d'utilisateurs
        const [totalUsersResult] = await db.query(
            "SELECT COUNT(*) as total FROM user"
        );
        const totalUsers = totalUsersResult[0].total;

        // Nombre d'utilisateurs par rôle
        const roleStatsSql = `
            SELECT r.name, COUNT(ur.user_id) as count
            FROM role r
            LEFT JOIN user_role ur ON r.id = ur.role_id
            GROUP BY r.id, r.name
        `;
        const [roleStats] = await db.query(roleStatsSql);

        // Nombre total de covoiturages
        const [totalCarpoolingsResult] = await db.query(
            "SELECT COUNT(*) as total FROM carpooling"
        );
        const totalCarpoolings = totalCarpoolingsResult[0].total;

        // Covoiturages par statut
        const carpoolingStatsSql = `
            SELECT status, COUNT(*) as count
            FROM carpooling
            GROUP BY status
        `;
        const [carpoolingStats] = await db.query(carpoolingStatsSql);

        // Total des participations
        const [totalParticipationsResult] = await db.query(
            "SELECT COUNT(*) as total FROM participation"
        );
        const totalParticipations = totalParticipationsResult[0].total;

        // Commission totale générée
        const commissionSql = `
            SELECT COALESCE(SUM(p_count.participants * c.platform_commission_earned), 0) as total_commission
            FROM carpooling c
            INNER JOIN (
                SELECT carpooling_id, COUNT(*) as participants
                FROM participation 
                WHERE cancellation_date IS NULL
                GROUP BY carpooling_id
            ) p_count ON c.id = p_count.carpooling_id
            WHERE c.status = 'terminé'
        `;
        const [commissionResult] = await db.query(commissionSql);
        const totalCommission = commissionResult[0].total_commission;

        // Nombre de véhicules
        const [totalVehiclesResult] = await db.query(
            "SELECT COUNT(*) as total FROM vehicle"
        );
        const totalVehicles = totalVehiclesResult[0].total;

        res.status(200).json({
            totalUsers,
            roleStats,
            totalCarpoolings,
            carpoolingStats,
            totalParticipations,
            totalCommission,
            totalVehicles,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur lors de la récupération des statistiques.",
        });
    }
};

/* --------------------------------------------------- Lister tous les utilisateurs ----------------------------- */
const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, search = "", role = "" } = req.query;
        const offset = (page - 1) * limit;

        let sql = `
            SELECT u.id, u.pseudo, u.email, u.credits, u.suspended, u.creation_date,
                   GROUP_CONCAT(r.name) as roles
            FROM user u
            LEFT JOIN user_role ur ON u.id = ur.user_id
            LEFT JOIN role r ON ur.role_id = r.id
        `;

        const conditions = [];
        const params = [];

        if (search) {
            conditions.push("(u.pseudo LIKE ? OR u.email LIKE ?)");
            params.push(`%${search}%`, `%${search}%`);
        }

        if (role) {
            conditions.push("r.name = ?");
            params.push(role);
        }

        if (conditions.length > 0) {
            sql += " WHERE " + conditions.join(" AND ");
        }

        sql += ` GROUP BY u.id ORDER BY u.creation_date DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        const [users] = await db.query(sql, params);

        // Compter le total pour la pagination
        let countSql = "SELECT COUNT(DISTINCT u.id) as total FROM user u";
        if (role) {
            countSql +=
                " LEFT JOIN user_role ur ON u.id = ur.user_id LEFT JOIN role r ON ur.role_id = r.id";
        }

        const countParams = [];
        if (conditions.length > 0) {
            countSql += " WHERE " + conditions.join(" AND ");
            if (search) {
                countParams.push(`%${search}%`, `%${search}%`);
            }
            if (role) {
                countParams.push(role);
            }
        }

        const [countResult] = await db.query(countSql, countParams);
        const total = countResult[0].total;

        res.status(200).json({
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur lors de la récupération des utilisateurs.",
        });
    }
};

/* --------------------------------------------------- Suspendre/Réactiver un utilisateur ---------------------- */
const toggleUserSuspension = async (req, res) => {
    try {
        const userId = req.params.id;
        const { suspended, reason } = req.body;

        if (typeof suspended !== "boolean") {
            return res.status(400).json({
                message: "Le statut de suspension doit être true ou false.",
            });
        }

        // Vérifier que l'utilisateur existe
        const [userCheck] = await db.query(
            "SELECT id, pseudo, suspended FROM user WHERE id = ?",
            [userId]
        );

        if (userCheck.length === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        const user = userCheck[0];

        if (user.suspended === suspended) {
            const status = suspended ? "suspendu" : "actif";
            return res.status(400).json({
                message: `L'utilisateur est déjà ${status}.`,
            });
        }

        // Mettre à jour le statut
        const [result] = await db.query(
            "UPDATE user SET suspended = ? WHERE id = ?",
            [suspended, userId]
        );

        if (result.affectedRows > 0) {
            const action = suspended ? "suspendu" : "réactivé";
            res.status(200).json({
                message: `Utilisateur ${user.pseudo} ${action} avec succès.`,
            });
        } else {
            res.status(500).json({
                message: "Erreur lors de la mise à jour du statut.",
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur lors de la modification du statut utilisateur.",
        });
    }
};

/* --------------------------------------------------- Gérer les rôles d'un utilisateur ------------------------- */
const manageUserRoles = async (req, res) => {
    try {
        const userId = req.params.id;
        const { roles } = req.body; // Array de noms de rôles

        if (!Array.isArray(roles) || roles.length === 0) {
            return res.status(400).json({
                message: "Veuillez fournir une liste de rôles valide.",
            });
        }

        // Vérifier que l'utilisateur existe
        const [userCheck] = await db.query(
            "SELECT pseudo FROM user WHERE id = ?",
            [userId]
        );

        if (userCheck.length === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        // Démarrer une transaction
        await db.query("START TRANSACTION");

        try {
            // Supprimer tous les rôles actuels
            await db.query("DELETE FROM user_role WHERE user_id = ?", [userId]);

            // Ajouter les nouveaux rôles
            for (const roleName of roles) {
                const [roleCheck] = await db.query(
                    "SELECT id FROM role WHERE name = ?",
                    [roleName]
                );

                if (roleCheck.length === 0) {
                    await db.query("ROLLBACK");
                    return res.status(400).json({
                        message: `Le rôle "${roleName}" n'existe pas.`,
                    });
                }

                await db.query(
                    "INSERT INTO user_role (user_id, role_id) VALUES (?, ?)",
                    [userId, roleCheck[0].id]
                );
            }

            await db.query("COMMIT");

            res.status(200).json({
                message: `Rôles mis à jour avec succès pour ${userCheck[0].pseudo}.`,
            });
        } catch (error) {
            await db.query("ROLLBACK");
            throw error;
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur lors de la mise à jour des rôles.",
        });
    }
};

/* --------------------------------------------------- Lister tous les covoiturages ----------------------------- */
const getAllCarpoolings = async (req, res) => {
    try {
        const { page = 1, limit = 20, status = "", search = "" } = req.query;
        const offset = (page - 1) * limit;

        let sql = `
            SELECT c.*, u.pseudo as driver_pseudo, v.model, v.plate_number,
                   COUNT(p.id) as participants_count
            FROM carpooling c
            INNER JOIN user u ON c.driver_id = u.id
            INNER JOIN vehicle v ON c.vehicle_id = v.id
            LEFT JOIN participation p ON c.id = p.carpooling_id AND p.cancellation_date IS NULL
        `;

        const conditions = [];
        const params = [];

        if (status) {
            conditions.push("c.status = ?");
            params.push(status);
        }

        if (search) {
            conditions.push(
                "(c.departure_address LIKE ? OR c.arrival_address LIKE ? OR u.pseudo LIKE ?)"
            );
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (conditions.length > 0) {
            sql += " WHERE " + conditions.join(" AND ");
        }

        sql += ` GROUP BY c.id ORDER BY c.departure_datetime DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        const [carpoolings] = await db.query(sql, params);

        res.status(200).json({ carpoolings });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur lors de la récupération des covoiturages.",
        });
    }
};

/* --------------------------------------------------- Annuler un covoiturage (admin) --------------------------- */
const adminCancelCarpooling = async (req, res) => {
    try {
        const carpoolingId = req.params.id;
        const { reason } = req.body;

        // Utiliser la même logique que l'annulation normale mais sans vérifier le propriétaire
        await db.query("START TRANSACTION");

        try {
            const carpoolingSql =
                "SELECT status, price_per_passenger FROM carpooling WHERE id = ?";
            const [carpoolingCheck] = await db.query(carpoolingSql, [
                carpoolingId,
            ]);

            if (carpoolingCheck.length === 0) {
                await db.query("ROLLBACK");
                return res
                    .status(404)
                    .json({ message: "Covoiturage non trouvé." });
            }

            if (carpoolingCheck[0].status === "annulé") {
                await db.query("ROLLBACK");
                return res
                    .status(400)
                    .json({ message: "Ce covoiturage est déjà annulé." });
            }

            // Récupérer et rembourser les participants
            const participantsSql = `
                SELECT passenger_id, credits_paid 
                FROM participation 
                WHERE carpooling_id = ? AND cancellation_date IS NULL
            `;
            const [participants] = await db.query(participantsSql, [
                carpoolingId,
            ]);

            for (const participant of participants) {
                await db.query(
                    "UPDATE user SET credits = credits + ? WHERE id = ?",
                    [participant.credits_paid, participant.passenger_id]
                );

                await db.query(
                    "UPDATE participation SET cancellation_date = CURRENT_TIMESTAMP WHERE passenger_id = ? AND carpooling_id = ?",
                    [participant.passenger_id, carpoolingId]
                );
            }

            await db.query(
                "UPDATE carpooling SET status = 'annulé' WHERE id = ?",
                [carpoolingId]
            );

            await db.query("COMMIT");

            res.status(200).json({
                message:
                    "Covoiturage annulé par l'administration. Les participants ont été remboursés.",
            });
        } catch (error) {
            await db.query("ROLLBACK");
            throw error;
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur lors de l'annulation du covoiturage.",
        });
    }
};

module.exports = {
    getPlatformStats,
    getAllUsers,
    toggleUserSuspension,
    manageUserRoles,
    getAllCarpoolings,
    adminCancelCarpooling,
};
