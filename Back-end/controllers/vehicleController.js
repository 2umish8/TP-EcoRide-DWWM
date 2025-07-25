const db = require("../Config/db.js");

/* --------------------------------------------------- Ajouter un véhicule ------------------------------------------ */
const addVehicle = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            plate_number,
            first_registration_date,
            model,
            seats_available,
            is_electric,
            brand_name,
            color_name,
        } = req.body;

        // Validation des données obligatoires
        if (
            !plate_number ||
            !model ||
            !seats_available ||
            !brand_name ||
            !color_name
        ) {
            return res.status(400).json({
                message:
                    "Veuillez fournir toutes les informations obligatoires.",
            });
        }

        // Vérifier que l'utilisateur a le rôle chauffeur
        const roleCheckSql = `
            SELECT 1 FROM user_role ur 
            INNER JOIN role r ON ur.role_id = r.id 
            WHERE ur.user_id = ? AND r.name = 'chauffeur'
        `;
        const [roleCheck] = await db.query(roleCheckSql, [userId]);

        if (roleCheck.length === 0) {
            return res.status(403).json({
                message: "Vous devez être chauffeur pour ajouter un véhicule.",
            });
        }

        // Obtenir ou créer l'ID de la marque
        let brandId;
        const [brandResult] = await db.query(
            "SELECT id FROM brand WHERE name = ?",
            [brand_name]
        );
        if (brandResult.length > 0) {
            brandId = brandResult[0].id;
        } else {
            const [insertBrand] = await db.query(
                "INSERT INTO brand (name) VALUES (?)",
                [brand_name]
            );
            brandId = insertBrand.insertId;
        }

        // Obtenir ou créer l'ID de la couleur
        let colorId;
        const [colorResult] = await db.query(
            "SELECT id FROM color WHERE name = ?",
            [color_name]
        );
        if (colorResult.length > 0) {
            colorId = colorResult[0].id;
        } else {
            const [insertColor] = await db.query(
                "INSERT INTO color (name) VALUES (?)",
                [color_name]
            );
            colorId = insertColor.insertId;
        }

        // Insérer le véhicule
        const vehicleSql = `
            INSERT INTO vehicle (plate_number, first_registration_date, model, seats_available, is_electric, user_id, brand_id, color_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(vehicleSql, [
            plate_number,
            first_registration_date || null,
            model,
            seats_available,
            is_electric || false,
            userId,
            brandId,
            colorId,
        ]);

        if (result.affectedRows > 0) {
            res.status(201).json({
                message: "Véhicule ajouté avec succès !",
                vehicleId: result.insertId,
            });
        } else {
            res.status(500).json({
                message: "Erreur lors de l'ajout du véhicule.",
            });
        }
    } catch (error) {
        console.error(error);
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message:
                    "Un véhicule avec cette plaque d'immatriculation existe déjà.",
            });
        }
        res.status(500).json({
            message: "Erreur lors de l'ajout du véhicule.",
        });
    }
};

/* --------------------------------------------------- Lister les véhicules d'un utilisateur -------------------- */
const getUserVehicles = async (req, res) => {
    try {
        const userId = req.user.id;

        const sql = `
            SELECT v.*, b.name as brand_name, c.name as color_name
            FROM vehicle v
            LEFT JOIN brand b ON v.brand_id = b.id
            LEFT JOIN color c ON v.color_id = c.id
            WHERE v.user_id = ?
            ORDER BY v.id DESC
        `;
        const [vehicles] = await db.query(sql, [userId]);

        res.status(200).json({ vehicles });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur lors de la récupération des véhicules.",
        });
    }
};

/* --------------------------------------------------- Modifier un véhicule -------------------------------------- */
const updateVehicle = async (req, res) => {
    try {
        const userId = req.user.id;
        const vehicleId = req.params.id;
        const {
            plate_number,
            first_registration_date,
            model,
            seats_available,
            is_electric,
            brand_name,
            color_name,
        } = req.body;

        // Vérifier que le véhicule appartient à l'utilisateur
        const ownerCheckSql = "SELECT user_id FROM vehicle WHERE id = ?";
        const [ownerCheck] = await db.query(ownerCheckSql, [vehicleId]);

        if (ownerCheck.length === 0) {
            return res.status(404).json({ message: "Véhicule non trouvé." });
        }

        if (ownerCheck[0].user_id !== userId) {
            return res.status(403).json({
                message: "Vous ne pouvez modifier que vos propres véhicules.",
            });
        }

        // Obtenir ou créer l'ID de la marque si fournie
        let brandId = null;
        if (brand_name) {
            const [brandResult] = await db.query(
                "SELECT id FROM brand WHERE name = ?",
                [brand_name]
            );
            if (brandResult.length > 0) {
                brandId = brandResult[0].id;
            } else {
                const [insertBrand] = await db.query(
                    "INSERT INTO brand (name) VALUES (?)",
                    [brand_name]
                );
                brandId = insertBrand.insertId;
            }
        }

        // Obtenir ou créer l'ID de la couleur si fournie
        let colorId = null;
        if (color_name) {
            const [colorResult] = await db.query(
                "SELECT id FROM color WHERE name = ?",
                [color_name]
            );
            if (colorResult.length > 0) {
                colorId = colorResult[0].id;
            } else {
                const [insertColor] = await db.query(
                    "INSERT INTO color (name) VALUES (?)",
                    [color_name]
                );
                colorId = insertColor.insertId;
            }
        }

        // Construire la requête de mise à jour dynamiquement
        const updates = [];
        const values = [];

        if (plate_number !== undefined) {
            updates.push("plate_number = ?");
            values.push(plate_number);
        }
        if (first_registration_date !== undefined) {
            updates.push("first_registration_date = ?");
            values.push(first_registration_date);
        }
        if (model !== undefined) {
            updates.push("model = ?");
            values.push(model);
        }
        if (seats_available !== undefined) {
            updates.push("seats_available = ?");
            values.push(seats_available);
        }
        if (is_electric !== undefined) {
            updates.push("is_electric = ?");
            values.push(is_electric);
        }
        if (brandId !== null) {
            updates.push("brand_id = ?");
            values.push(brandId);
        }
        if (colorId !== null) {
            updates.push("color_id = ?");
            values.push(colorId);
        }

        if (updates.length === 0) {
            return res
                .status(400)
                .json({ message: "Aucune donnée à mettre à jour." });
        }

        values.push(vehicleId);
        const updateSql = `UPDATE vehicle SET ${updates.join(
            ", "
        )} WHERE id = ?`;
        const [result] = await db.query(updateSql, values);

        if (result.affectedRows > 0) {
            res.status(200).json({
                message: "Véhicule mis à jour avec succès !",
            });
        } else {
            res.status(500).json({
                message: "Erreur lors de la mise à jour du véhicule.",
            });
        }
    } catch (error) {
        console.error(error);
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message:
                    "Un véhicule avec cette plaque d'immatriculation existe déjà.",
            });
        }
        res.status(500).json({
            message: "Erreur lors de la mise à jour du véhicule.",
        });
    }
};

/* --------------------------------------------------- Supprimer un véhicule ------------------------------------- */
const deleteVehicle = async (req, res) => {
    try {
        const userId = req.user.id;
        const vehicleId = req.params.id;

        // Vérifier que le véhicule appartient à l'utilisateur
        const ownerCheckSql = "SELECT user_id FROM vehicle WHERE id = ?";
        const [ownerCheck] = await db.query(ownerCheckSql, [vehicleId]);

        if (ownerCheck.length === 0) {
            return res.status(404).json({ message: "Véhicule non trouvé." });
        }

        if (ownerCheck[0].user_id !== userId) {
            return res.status(403).json({
                message: "Vous ne pouvez supprimer que vos propres véhicules.",
            });
        }

        // Vérifier que le véhicule n'est pas utilisé dans des covoiturages actifs
        const activeCarpoolingSql = `
            SELECT COUNT(*) as count FROM carpooling 
            WHERE vehicle_id = ? AND status IN ('prévu', 'démarré')
        `;
        const [activeCheck] = await db.query(activeCarpoolingSql, [vehicleId]);

        if (activeCheck[0].count > 0) {
            return res.status(400).json({
                message:
                    "Impossible de supprimer ce véhicule car il est utilisé dans des covoiturages actifs.",
            });
        }

        // Supprimer le véhicule
        const deleteSql = "DELETE FROM vehicle WHERE id = ?";
        const [result] = await db.query(deleteSql, [vehicleId]);

        if (result.affectedRows > 0) {
            res.status(200).json({
                message: "Véhicule supprimé avec succès !",
            });
        } else {
            res.status(500).json({
                message: "Erreur lors de la suppression du véhicule.",
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur lors de la suppression du véhicule.",
        });
    }
};

/* --------------------------------------------------- Obtenir toutes les marques et couleurs ------------------- */
const getBrandsAndColors = async (req, res) => {
    try {
        const [brands] = await db.query("SELECT * FROM brand ORDER BY name");
        const [colors] = await db.query("SELECT * FROM color ORDER BY name");

        res.status(200).json({ brands, colors });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur lors de la récupération des marques et couleurs.",
        });
    }
};

module.exports = {
    addVehicle,
    getUserVehicles,
    updateVehicle,
    deleteVehicle,
    getBrandsAndColors,
};
