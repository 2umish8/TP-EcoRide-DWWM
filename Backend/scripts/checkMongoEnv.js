require('dotenv').config();

console.log('🔧 Vérification des variables d\'environnement MongoDB...\n');

// Vérifier les variables MongoDB
const mongoVars = {
    'MONGODB_URI': process.env.MONGODB_URI,
    'MONGODB_DATABASE': process.env.MONGODB_DATABASE,
    'MONGODB_USER': process.env.MONGODB_USER,
    'MONGODB_PASSWORD': process.env.MONGODB_PASSWORD
};

console.log('📋 Variables MongoDB:');
Object.entries(mongoVars).forEach(([key, value]) => {
    if (value) {
        console.log(`✅ ${key}: ${key.includes('PASSWORD') ? '***' : value}`);
    } else {
        console.log(`❌ ${key}: Non définie`);
    }
});

// Vérifier les variables MySQL pour comparaison
console.log('\n📋 Variables MySQL:');
const mysqlVars = {
    'DB_HOST': process.env.DB_HOST,
    'DB_USER': process.env.DB_USER,
    'DB_NAME': process.env.DB_NAME,
    'DB_PASSWORD': process.env.DB_PASSWORD
};

Object.entries(mysqlVars).forEach(([key, value]) => {
    if (value) {
        console.log(`✅ ${key}: ${key.includes('PASSWORD') ? '***' : value}`);
    } else {
        console.log(`❌ ${key}: Non définie`);
    }
});

// Vérifier les variables générales
console.log('\n📋 Variables générales:');
const generalVars = {
    'NODE_ENV': process.env.NODE_ENV,
    'PORT': process.env.PORT,
    'JWT_SECRET': process.env.JWT_SECRET ? 'Définie' : 'Non définie'
};

Object.entries(generalVars).forEach(([key, value]) => {
    console.log(`✅ ${key}: ${value}`);
});

console.log('\n🔍 Analyse:');
if (mongoVars.MONGODB_URI) {
    console.log('✅ MONGODB_URI est définie');
    if (mongoVars.MONGODB_URI.includes('railway') || mongoVars.MONGODB_URI.includes('mongodb.net')) {
        console.log('✅ URI MongoDB semble être une connexion cloud (Railway/Atlas)');
    } else {
        console.log('⚠️ URI MongoDB semble être locale');
    }
} else {
    console.log('❌ MONGODB_URI manquante - cela peut causer des erreurs');
}

if (mysqlVars.DB_HOST && mysqlVars.DB_USER && mysqlVars.DB_NAME) {
    console.log('✅ Variables MySQL complètes');
} else {
    console.log('❌ Variables MySQL incomplètes');
}

console.log('\n💡 Recommandations:');
if (!mongoVars.MONGODB_URI) {
    console.log('   - Définir MONGODB_URI dans les variables d\'environnement');
}
if (!process.env.JWT_SECRET) {
    console.log('   - Définir JWT_SECRET pour la sécurité');
} 