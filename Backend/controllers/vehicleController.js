const {
    PrismaClient,
    PrismaClientKnownRequestError,
} = require("@prisma/client");
const prisma = new PrismaClient();

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
        const hasDriverRole = await prisma.user_Role.findFirst({
            where: {
                user_id: userId,
                role: { name: "chauffeur" },
            },
        });

        if (!hasDriverRole) {
            return res.status(403).json({
                message: "Vous devez être chauffeur pour ajouter un véhicule.",
            });
        }

        // Obtenir ou créer l'ID de la marque
        let brand = await prisma.brand.findFirst({
            where: { name: brand_name },
        });
        if (!brand) {
            brand = await prisma.brand.create({
                data: { name: brand_name },
            });
        }

        // Obtenir ou créer l'ID de la couleur
        let color = await prisma.color.findFirst({
            where: { name: color_name },
        });
        if (!color) {
            color = await prisma.color.create({
                data: { name: color_name },
            });
        }

        // Insérer le véhicule
        const vehicle = await prisma.vehicle.create({
            data: {
                plate_number,
                first_registration_date: first_registration_date || null,
                model,
                seats_available,
                is_electric: is_electric || false,
                user_id: userId,
                brand_id: brand.id,
                color_id: color.id,
            },
        });

        res.status(201).json({
            message: "Véhicule ajouté avec succès !",
            vehicleId: vehicle.id,
        });
    } catch (error) {
        console.error(error);
        if (
            error instanceof PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
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

        const vehicles = await prisma.vehicle.findMany({
            where: { user_id: userId },
            include: {
                brand: true,
                color: true,
            },
            orderBy: { id: "desc" },
        });

        // Formatter les données pour maintenir la compatibilité avec le frontend
        const formattedVehicles = vehicles.map((vehicle) => ({
            ...vehicle,
            brand_name: vehicle.brand.name,
            color_name: vehicle.color.name,
        }));

        res.status(200).json({ vehicles: formattedVehicles });
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
        const vehicle = await prisma.vehicle.findUnique({
            where: { id: parseInt(vehicleId) },
            select: { user_id: true },
        });

        if (!vehicle) {
            return res.status(404).json({ message: "Véhicule non trouvé." });
        }

        if (vehicle.user_id !== userId) {
            return res.status(403).json({
                message: "Vous ne pouvez modifier que vos propres véhicules.",
            });
        }

        // Obtenir ou créer l'ID de la marque si fournie
        let brandId = null;
        if (brand_name) {
            let brand = await prisma.brand.findFirst({
                where: { name: brand_name },
            });
            if (!brand) {
                brand = await prisma.brand.create({
                    data: { name: brand_name },
                });
            }
            brandId = brand.id;
        }

        // Obtenir ou créer l'ID de la couleur si fournie
        let colorId = null;
        if (color_name) {
            let color = await prisma.color.findFirst({
                where: { name: color_name },
            });
            if (!color) {
                color = await prisma.color.create({
                    data: { name: color_name },
                });
            }
            colorId = color.id;
        }

        // Construire l'objet de données à mettre à jour
        const updateData = {};

        if (plate_number !== undefined) {
            updateData.plate_number = plate_number;
        }
        if (first_registration_date !== undefined) {
            updateData.first_registration_date = first_registration_date;
        }
        if (model !== undefined) {
            updateData.model = model;
        }
        if (seats_available !== undefined) {
            updateData.seats_available = seats_available;
        }
        if (is_electric !== undefined) {
            updateData.is_electric = is_electric;
        }
        if (brandId !== null) {
            updateData.brand_id = brandId;
        }
        if (colorId !== null) {
            updateData.color_id = colorId;
        }

        if (Object.keys(updateData).length === 0) {
            return res
                .status(400)
                .json({ message: "Aucune donnée à mettre à jour." });
        }

        const updatedVehicle = await prisma.vehicle.update({
            where: { id: parseInt(vehicleId) },
            data: updateData,
        });

        res.status(200).json({
            message: "Véhicule mis à jour avec succès !",
        });
    } catch (error) {
        console.error(error);
        if (
            error instanceof PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
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
        const vehicle = await prisma.vehicle.findUnique({
            where: { id: parseInt(vehicleId) },
            select: { user_id: true },
        });

        if (!vehicle) {
            return res.status(404).json({ message: "Véhicule non trouvé." });
        }

        if (vehicle.user_id !== userId) {
            return res.status(403).json({
                message: "Vous ne pouvez supprimer que vos propres véhicules.",
            });
        }

        // Vérifier que le véhicule n'est pas utilisé dans des covoiturages actifs
        const activeCarpoolings = await prisma.carpooling.findMany({
            where: {
                vehicle_id: parseInt(vehicleId),
                status: {
                    in: ["prévu", "démarré"],
                },
            },
            select: { id: true },
        });

        if (activeCarpoolings.length > 0) {
            return res.status(400).json({
                message:
                    "Impossible de supprimer ce véhicule car il est utilisé dans des covoiturages actifs.",
            });
        }

        // Supprimer le véhicule
        await prisma.vehicle.delete({
            where: { id: parseInt(vehicleId) },
        });

        res.status(200).json({
            message: "Véhicule supprimé avec succès !",
        });
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
        const brands = await prisma.brand.findMany({
            orderBy: { name: "asc" },
        });
        const colors = await prisma.color.findMany({
            orderBy: { name: "asc" },
        });

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
