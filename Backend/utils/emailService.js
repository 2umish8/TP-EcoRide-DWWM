/**
 * Service d'envoi d'emails EcoRide
 * Utilise nodemailer pour l'envoi de notifications par email
 */

const nodemailer = require("nodemailer");

/**
 * Configuration du transporteur email
 * En développement, utilise un faux transporteur (console)
 * En production, configurez avec vos paramètres SMTP réels
 */
const createTransporter = () => {
    if (process.env.NODE_ENV === "production") {
        // Configuration production (à adapter selon votre fournisseur)
        return nodemailer.createTransporter({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    } else {
        // Configuration de développement - affiche dans la console
        return nodemailer.createTransporter({
            streamTransport: true,
            newline: "unix",
            buffer: true,
        });
    }
};

/**
 * Envoie un email d'invitation à laisser un avis après un trajet terminé
 * @param {Object} params - Paramètres de l'email
 * @param {string} params.passengerEmail - Email du passager
 * @param {string} params.passengerName - Nom/pseudo du passager
 * @param {string} params.driverName - Nom/pseudo du chauffeur
 * @param {string} params.departureAddress - Adresse de départ
 * @param {string} params.arrivalAddress - Adresse d'arrivée
 * @param {string} params.departureDate - Date du trajet
 * @param {number} params.carpoolingId - ID du covoiturage
 * @param {number} params.driverId - ID du chauffeur à évaluer
 */
const sendReviewInvitation = async ({
    passengerEmail,
    passengerName,
    driverName,
    departureAddress,
    arrivalAddress,
    departureDate,
    carpoolingId,
    driverId,
}) => {
    try {
        const transporter = createTransporter();

        // Formater la date
        const formattedDate = new Date(departureDate).toLocaleDateString(
            "fr-FR",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );

        // Contenu de l'email
        const subject = `🚗 Votre trajet EcoRide est terminé - Laissez un avis`;

        const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trajet terminé - EcoRide</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
        }
        .header { 
            background: linear-gradient(135deg, #4CAF50, #45a049); 
            color: white; 
            padding: 20px; 
            text-align: center; 
            border-radius: 10px 10px 0 0; 
        }
        .content { 
            background: #f9f9f9; 
            padding: 30px; 
            border-radius: 0 0 10px 10px; 
            border: 1px solid #ddd; 
        }
        .trip-details { 
            background: white; 
            padding: 20px; 
            margin: 20px 0; 
            border-radius: 8px; 
            border-left: 4px solid #4CAF50; 
        }
        .btn-primary { 
            display: inline-block; 
            background: #4CAF50; 
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 10px 5px; 
            font-weight: bold; 
        }
        .btn-secondary { 
            display: inline-block; 
            background: #ff9800; 
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 10px 5px; 
            font-weight: bold; 
        }
        .footer { 
            text-align: center; 
            margin-top: 30px; 
            font-size: 12px; 
            color: #666; 
        }
        .rating-stars {
            font-size: 24px;
            color: #ffc107;
            margin: 10px 0;
        }
        .section {
            margin: 25px 0;
            padding: 20px;
            background: white;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚗 Trajet terminé !</h1>
        <p>Votre expérience EcoRide compte pour nous</p>
    </div>
    
    <div class="content">
        <h2>Bonjour ${passengerName} !</h2>
        
        <p>Votre trajet EcoRide avec <strong>${driverName}</strong> s'est terminé avec succès !</p>
        
        <div class="trip-details">
            <h3>📍 Détails du trajet</h3>
            <p><strong>🚀 Départ :</strong> ${departureAddress}</p>
            <p><strong>🎯 Arrivée :</strong> ${arrivalAddress}</p>
            <p><strong>📅 Date :</strong> ${formattedDate}</p>
            <p><strong>👤 Chauffeur :</strong> ${driverName}</p>
        </div>

        <div class="section">
            <h3>⭐ Comment s'est passé votre trajet ?</h3>
            <p>Votre avis est précieux pour améliorer l'expérience EcoRide et aider les autres utilisateurs à choisir leurs trajets.</p>
            
            <div style="text-align: center; margin: 20px 0;">
                <p><strong>Évaluez votre chauffeur :</strong></p>
                <div class="rating-stars">⭐⭐⭐⭐⭐</div>
            </div>
            
            <div style="text-align: center;">
                <a href="${
                    process.env.FRONTEND_URL || "http://localhost:5173"
                }/review/${carpoolingId}?driverId=${driverId}" class="btn-primary">
                    ✍️ Laisser un avis
                </a>
            </div>
        </div>

        <div class="section">
            <h3>⚠️ Un problème pendant le trajet ?</h3>
            <p>Si le trajet ne s'est pas déroulé comme prévu, vous pouvez le signaler. Notre équipe examinera votre signalement avant la mise à jour des crédits du chauffeur.</p>
            
            <div style="text-align: center;">
                <a href="${
                    process.env.FRONTEND_URL || "http://localhost:5173"
                }/report/${carpoolingId}?driverId=${driverId}" class="btn-secondary">
                    🚨 Signaler un problème
                </a>
            </div>
        </div>

        <div class="section">
            <p><strong>Que se passe-t-il ensuite ?</strong></p>
            <ul>
                <li>✅ Votre avis sera examiné par notre équipe avant publication</li>
                <li>💰 Les crédits du chauffeur seront mis à jour après validation</li>
                <li>🔄 Vous pouvez continuer à utiliser EcoRide pour vos prochains trajets</li>
            </ul>
        </div>

        <p style="margin-top: 30px;">
            <strong>Merci de faire partie de la communauté EcoRide ! 🌱</strong><br>
            Ensemble, nous rendons les déplacements plus écologiques et conviviaux.
        </p>
    </div>
    
    <div class="footer">
        <p>© ${new Date().getFullYear()} EcoRide - Plateforme de covoiturage éco-responsable</p>
        <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
        <p style="font-size: 10px;">
            Si vous ne souhaitez plus recevoir ces notifications, 
            vous pouvez modifier vos préférences dans votre espace personnel EcoRide.
        </p>
    </div>
</body>
</html>`;

        const textContent = `
🚗 TRAJET ECORIDE TERMINÉ

Bonjour ${passengerName} !

Votre trajet EcoRide avec ${driverName} s'est terminé avec succès !

📍 DÉTAILS DU TRAJET
🚀 Départ : ${departureAddress}
🎯 Arrivée : ${arrivalAddress}
📅 Date : ${formattedDate}
👤 Chauffeur : ${driverName}

⭐ LAISSEZ UN AVIS
Votre expérience compte ! Évaluez votre chauffeur et aidez la communauté EcoRide.
Lien : ${
            process.env.FRONTEND_URL || "http://localhost:5173"
        }/review/${carpoolingId}?driverId=${driverId}

⚠️ SIGNALER UN PROBLÈME
Si le trajet ne s'est pas bien passé, signalez-le à notre équipe.
Lien : ${
            process.env.FRONTEND_URL || "http://localhost:5173"
        }/report/${carpoolingId}?driverId=${driverId}

QUE SE PASSE-T-IL ENSUITE ?
✅ Votre avis sera examiné par notre équipe avant publication
💰 Les crédits du chauffeur seront mis à jour après validation
🔄 Vous pouvez continuer à utiliser EcoRide pour vos prochains trajets

Merci de faire partie de la communauté EcoRide ! 🌱
Ensemble, nous rendons les déplacements plus écologiques et conviviaux.

---
© ${new Date().getFullYear()} EcoRide - Plateforme de covoiturage éco-responsable
Cet email a été envoyé automatiquement, merci de ne pas y répondre.
`;

        const mailOptions = {
            from: `"EcoRide" <${
                process.env.SMTP_FROM || "noreply@ecoride.com"
            }>`,
            to: passengerEmail,
            subject: subject,
            text: textContent,
            html: htmlContent,
        };

        if (process.env.NODE_ENV === "production") {
            const result = await transporter.sendMail(mailOptions);
            console.log(
                `✅ Email d'invitation à l'avis envoyé à ${passengerEmail}:`,
                result.messageId
            );
            return { success: true, messageId: result.messageId };
        } else {
            // En développement, simuler l'envoi
            console.log("\n" + "=".repeat(80));
            console.log("📧 SIMULATION D'ENVOI D'EMAIL - INVITATION À L'AVIS");
            console.log("=".repeat(80));
            console.log(`À: ${passengerEmail}`);
            console.log(`Sujet: ${subject}`);
            console.log("\n--- CONTENU ---");
            console.log(textContent);
            console.log("=".repeat(80) + "\n");

            return { success: true, messageId: `dev-${Date.now()}` };
        }
    } catch (error) {
        console.error(
            "❌ Erreur lors de l'envoi de l'email d'invitation à l'avis:",
            error
        );
        return { success: false, error: error.message };
    }
};

/**
 * Envoie un email de notification au chauffeur quand le trajet est terminé
 * @param {Object} params - Paramètres de l'email
 * @param {string} params.driverEmail - Email du chauffeur
 * @param {string} params.driverName - Nom/pseudo du chauffeur
 * @param {string} params.departureAddress - Adresse de départ
 * @param {string} params.arrivalAddress - Adresse d'arrivée
 * @param {string} params.departureDate - Date du trajet
 * @param {number} params.participantsCount - Nombre de participants
 * @param {number} params.earnings - Gains du chauffeur
 */
const sendTripCompletionNotification = async ({
    driverEmail,
    driverName,
    departureAddress,
    arrivalAddress,
    departureDate,
    participantsCount,
    earnings,
}) => {
    try {
        const transporter = createTransporter();

        const formattedDate = new Date(departureDate).toLocaleDateString(
            "fr-FR",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );

        const subject = `🎉 Trajet terminé avec succès - Gains: ${earnings} crédits`;

        const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trajet terminé - EcoRide</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4CAF50, #45a049); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd; }
        .earnings-box { background: #e8f5e8; border: 2px solid #4CAF50; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0; }
        .trip-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #4CAF50; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎉 Félicitations ${driverName} !</h1>
        <p>Votre trajet EcoRide s'est terminé avec succès</p>
    </div>
    
    <div class="content">
        <div class="earnings-box">
            <h2>💰 Vos gains</h2>
            <h1 style="color: #4CAF50; margin: 0;">${earnings} crédits</h1>
            <p>Avec ${participantsCount} passager${
            participantsCount > 1 ? "s" : ""
        }</p>
        </div>
        
        <div class="trip-details">
            <h3>📍 Détails du trajet</h3>
            <p><strong>🚀 Départ :</strong> ${departureAddress}</p>
            <p><strong>🎯 Arrivée :</strong> ${arrivalAddress}</p>
            <p><strong>📅 Date :</strong> ${formattedDate}</p>
        </div>

        <p><strong>Que se passe-t-il maintenant ?</strong></p>
        <ul>
            <li>✅ Vos crédits ont été automatiquement ajoutés à votre compte</li>
            <li>📧 Vos passagers vont recevoir une invitation à laisser un avis</li>
            <li>⭐ Les avis seront visibles après validation par notre équipe</li>
            <li>🔄 Vous pouvez créer de nouveaux covoiturages</li>
        </ul>

        <p style="margin-top: 30px;">
            <strong>Merci de contribuer à une mobilité plus durable ! 🌱</strong>
        </p>
    </div>
</body>
</html>`;

        const textContent = `
🎉 FÉLICITATIONS ${driverName.toUpperCase()} !

Votre trajet EcoRide s'est terminé avec succès

💰 VOS GAINS: ${earnings} crédits
Avec ${participantsCount} passager${participantsCount > 1 ? "s" : ""}

📍 DÉTAILS DU TRAJET
🚀 Départ : ${departureAddress}
🎯 Arrivée : ${arrivalAddress}
📅 Date : ${formattedDate}

QUE SE PASSE-T-IL MAINTENANT ?
✅ Vos crédits ont été automatiquement ajoutés à votre compte
📧 Vos passagers vont recevoir une invitation à laisser un avis
⭐ Les avis seront visibles après validation par notre équipe
🔄 Vous pouvez créer de nouveaux covoiturages

Merci de contribuer à une mobilité plus durable ! 🌱

---
© ${new Date().getFullYear()} EcoRide
`;

        const mailOptions = {
            from: `"EcoRide" <${
                process.env.SMTP_FROM || "noreply@ecoride.com"
            }>`,
            to: driverEmail,
            subject: subject,
            text: textContent,
            html: htmlContent,
        };

        if (process.env.NODE_ENV === "production") {
            const result = await transporter.sendMail(mailOptions);
            console.log(
                `✅ Email de confirmation de fin de trajet envoyé à ${driverEmail}:`,
                result.messageId
            );
            return { success: true, messageId: result.messageId };
        } else {
            console.log("\n" + "=".repeat(80));
            console.log(
                "📧 SIMULATION D'ENVOI D'EMAIL - CONFIRMATION CHAUFFEUR"
            );
            console.log("=".repeat(80));
            console.log(`À: ${driverEmail}`);
            console.log(`Sujet: ${subject}`);
            console.log("\n--- CONTENU ---");
            console.log(textContent);
            console.log("=".repeat(80) + "\n");

            return { success: true, messageId: `dev-${Date.now()}` };
        }
    } catch (error) {
        console.error(
            "❌ Erreur lors de l'envoi de l'email de confirmation au chauffeur:",
            error
        );
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendReviewInvitation,
    sendTripCompletionNotification,
    createTransporter,
};
