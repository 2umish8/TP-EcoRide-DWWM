# Script de vérification pour développement local - Windows PowerShell
# Usage: .\verify-setup.ps1

Write-Host "================================" -ForegroundColor Cyan
Write-Host "🔍 Verification Setup Local" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier Node.js
Write-Host "1️⃣  Verification Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js trouvé: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js NOT FOUND - installer depuis https://nodejs.org" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Vérifier npm
Write-Host "2️⃣  Verification npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm trouvé: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm NOT FOUND" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 3. Vérifier .env
Write-Host "3️⃣  Verification fichier .env..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ Fichier .env trouvé" -ForegroundColor Green
    
    # Lire le fichier .env
    $envContent = Get-Content ".env"
    $mysqlUser = ($envContent | Select-String "MYSQL_USER=" | Select-Object -First 1) -replace "MYSQL_USER=", ""
    $mongoDb = ($envContent | Select-String "MONGO_DATABASE=" | Select-Object -First 1) -replace "MONGO_DATABASE=", ""
    $viteUrl = ($envContent | Select-String "VITE_API_URL=" | Select-Object -First 1) -replace "VITE_API_URL=", ""
    
    Write-Host "   - MySQL User: $mysqlUser" -ForegroundColor Cyan
    Write-Host "   - MongoDB Database: $mongoDb" -ForegroundColor Cyan
    Write-Host "   - Vite API URL: $viteUrl" -ForegroundColor Cyan
} else {
    Write-Host "❌ Fichier .env NOT FOUND à la racine" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 4. Vérifier MySQL
Write-Host "4️⃣  Verification MySQL (localhost:3306)..." -ForegroundColor Yellow
$mysqlTest = Test-NetConnection -ComputerName localhost -Port 3306 -WarningAction SilentlyContinue
if ($mysqlTest.TcpTestSucceeded) {
    Write-Host "✅ MySQL accessible sur localhost:3306" -ForegroundColor Green
} else {
    Write-Host "⚠️  MySQL NOT accessible sur localhost:3306" -ForegroundColor Yellow
    Write-Host "   Action: Démarrer MySQL sur votre machine" -ForegroundColor Cyan
    Write-Host "   Sur Windows: Utilisez Services (services.msc) et démarrez MySQL80" -ForegroundColor Gray
}

Write-Host ""

# 5. Vérifier MongoDB
Write-Host "5️⃣  Verification MongoDB (localhost:27017)..." -ForegroundColor Yellow
$mongoTest = Test-NetConnection -ComputerName localhost -Port 27017 -WarningAction SilentlyContinue
if ($mongoTest.TcpTestSucceeded) {
    Write-Host "✅ MongoDB accessible sur localhost:27017" -ForegroundColor Green
} else {
    Write-Host "⚠️  MongoDB NOT accessible sur localhost:27017" -ForegroundColor Yellow
    Write-Host "   Action: Démarrer MongoDB sur votre machine" -ForegroundColor Cyan
    Write-Host "   Sur Windows: Utilisez Services (services.msc) et démarrez MongoDB" -ForegroundColor Gray
}

Write-Host ""

# 6. Vérifier dossiers Frontend et Backend
Write-Host "6️⃣  Verification structure projet..." -ForegroundColor Yellow
if ((Test-Path "Frontend") -and (Test-Path "Backend")) {
    Write-Host "✅ Dossiers Frontend et Backend trouvés" -ForegroundColor Green
} else {
    Write-Host "❌ Structure projet invalide" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 7. Vérifier node_modules
Write-Host "7️⃣  Verification dépendances npm..." -ForegroundColor Yellow

if (Test-Path "Backend\node_modules") {
    Write-Host "✅ Backend\node_modules trouvé" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend\node_modules NOT FOUND" -ForegroundColor Yellow
    Write-Host "   Action à faire: cd Backend ; npm install" -ForegroundColor Cyan
}

if (Test-Path "Frontend\node_modules") {
    Write-Host "✅ Frontend\node_modules trouvé" -ForegroundColor Green
} else {
    Write-Host "⚠️  Frontend\node_modules NOT FOUND" -ForegroundColor Yellow
    Write-Host "   Action à faire: cd Frontend ; npm install" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✨ Verification Completee!" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Prêt à lancer? Utilisez deux terminaux PowerShell:" -ForegroundColor Green
Write-Host ""
Write-Host "  Terminal 1:" -ForegroundColor Cyan
Write-Host "  cd Backend" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "  Terminal 2:" -ForegroundColor Cyan
Write-Host "  cd Frontend" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Puis:" -ForegroundColor Cyan
Write-Host "  - Frontend accessible à: http://localhost:5173" -ForegroundColor White
Write-Host "  - Backend API à: http://localhost:3000/api" -ForegroundColor White
Write-Host "  - Login avec: test / Test2025!" -ForegroundColor White
