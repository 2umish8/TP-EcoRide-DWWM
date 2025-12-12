#!/bin/bash
# Script de vérification AVANT de lancer npm run dev

echo "================================"
echo "🔍 Vérification Setup Local"
echo "================================"
echo ""

# 1. Vérifier Node.js
echo "1️⃣  Vérification Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js trouvé: $NODE_VERSION"
else
    echo "❌ Node.js NOT FOUND - installer depuis https://nodejs.org"
    exit 1
fi

echo ""

# 2. Vérifier npm
echo "2️⃣  Vérification npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm trouvé: $NPM_VERSION"
else
    echo "❌ npm NOT FOUND"
    exit 1
fi

echo ""

# 3. Vérifier .env
echo "3️⃣  Vérification fichier .env..."
if [ -f ".env" ]; then
    echo "✅ Fichier .env trouvé"
    
    # Extraire quelques variables importantes
    MYSQL_USER=$(grep "MYSQL_USER=" .env | cut -d= -f2)
    MONGO_DB=$(grep "MONGO_DATABASE=" .env | cut -d= -f2)
    echo "   - MySQL User: $MYSQL_USER"
    echo "   - MongoDB Database: $MONGO_DB"
else
    echo "❌ Fichier .env NOT FOUND à la racine"
    exit 1
fi

echo ""

# 4. Vérifier MySQL
echo "4️⃣  Vérification MySQL (localhost:3306)..."
if nc -z localhost 3306 2>/dev/null; then
    echo "✅ MySQL accessible sur localhost:3306"
else
    echo "⚠️  MySQL NOT accessible sur localhost:3306"
    echo "   Action: Démarrer MySQL sur votre machine"
    echo "   Sur Windows: MySQL Service -> Start"
    echo "   Sur macOS: brew services start mysql"
    echo "   Sur Linux: sudo service mysql start"
fi

echo ""

# 5. Vérifier MongoDB
echo "5️⃣  Vérification MongoDB (localhost:27017)..."
if nc -z localhost 27017 2>/dev/null; then
    echo "✅ MongoDB accessible sur localhost:27017"
else
    echo "⚠️  MongoDB NOT accessible sur localhost:27017"
    echo "   Action: Démarrer MongoDB sur votre machine"
    echo "   Sur Windows: MongoDB Service -> Start"
    echo "   Sur macOS: brew services start mongodb-community"
    echo "   Sur Linux: sudo service mongod start"
fi

echo ""

# 6. Vérifier dossiers Frontend et Backend
echo "6️⃣  Vérification structure projet..."
if [ -d "Frontend" ] && [ -d "Backend" ]; then
    echo "✅ Dossiers Frontend et Backend trouvés"
else
    echo "❌ Structure projet invalide"
    exit 1
fi

echo ""

# 7. Vérifier node_modules
echo "7️⃣  Vérification dépendances npm..."
if [ -d "Backend/node_modules" ]; then
    echo "✅ Backend/node_modules trouvé"
else
    echo "⚠️  Backend/node_modules NOT FOUND"
    echo "   Action: cd Backend && npm install"
fi

if [ -d "Frontend/node_modules" ]; then
    echo "✅ Frontend/node_modules trouvé"
else
    echo "⚠️  Frontend/node_modules NOT FOUND"
    echo "   Action: cd Frontend && npm install"
fi

echo ""
echo "================================"
echo "✨ Vérification Complétée!"
echo "================================"
echo ""
echo "Prêt à lancer? Utilise:"
echo ""
echo "  Terminal 1:"
echo "  cd Backend && npm run dev"
echo ""
echo "  Terminal 2:"
echo "  cd Frontend && npm run dev"
echo ""
