const mongoose = require('mongoose');
const Review = require('../models/Review');

const connectMongoDB = require('../Config/mongodb.js');

async function testMongoConnection() {
    console.log('🔍 Test de la connexion MongoDB...\n');

    try {
        // 1. Tester la connexion
        console.log('1️⃣ Connexion à MongoDB...');
        await connectMongoDB();
        console.log('✅ Connexion MongoDB établie');

        // 2. Tester l'accès au modèle Review
        console.log('\n2️⃣ Test du modèle Review...');
        const reviewCount = await Review.countDocuments();
        console.log(`✅ Modèle Review accessible - ${reviewCount} reviews trouvées`);

        // 3. Tester la méthode getAverageRating
        console.log('\n3️⃣ Test de la méthode getAverageRating...');
        const stats = await Review.getAverageRating(109);
        console.log('✅ Méthode getAverageRating fonctionnelle');
        console.log(`   - Note moyenne: ${stats.average}`);
        console.log(`   - Nombre total: ${stats.total}`);

        // 4. Tester la récupération de reviews
        console.log('\n4️⃣ Test de récupération de reviews...');
        const reviews = await Review.find({
            reviewedUserId: 109,
            validationStatus: "approved"
        }).limit(5);
        console.log(`✅ ${reviews.length} reviews récupérées pour l'utilisateur 109`);

        if (reviews.length > 0) {
            console.log('📝 Exemple de review:');
            console.log(`   - ID: ${reviews[0]._id}`);
            console.log(`   - Note: ${reviews[0].rating}`);
            console.log(`   - Commentaire: ${reviews[0].comment?.substring(0, 50)}...`);
        }

        // 5. Tester les reviews en attente
        console.log('\n5️⃣ Test des reviews en attente...');
        const pendingReviews = await Review.getPendingReviews();
        console.log(`✅ ${pendingReviews.length} reviews en attente de validation`);

        console.log('\n🎉 Tous les tests MongoDB sont passés avec succès !');

    } catch (error) {
        console.error('❌ Erreur lors du test MongoDB:', error.message);
        console.error('📄 Détails:', error);
    } finally {
        // Fermer la connexion
        await mongoose.connection.close();
        console.log('\n🔒 Connexion MongoDB fermée');
        process.exit(0);
    }
}

// Exécuter le test
testMongoConnection(); 