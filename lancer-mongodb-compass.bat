@echo off
echo.
echo 🧭 LANCEMENT MONGODB COMPASS - EcoRide
echo ================================================
echo.
echo 🔌 Votre chaîne de connexion MongoDB Atlas :
echo mongodb+srv://umischael:MRdUvBHHHq6G0uec@ecoride-production.zar6iod.mongodb.net/ecoride_reviews?retryWrites=true^&w=majority^&appName=EcoRide-Production
echo.
echo 📋 Cette chaîne a été copiée dans le presse-papier !
echo.
echo 🚀 Lancement de MongoDB Compass...

:: Copier la chaîne de connexion dans le presse-papier
echo mongodb+srv://umischael:MRdUvBHHHq6G0uec@ecoride-production.zar6iod.mongodb.net/ecoride_reviews?retryWrites=true^&w=majority^&appName=EcoRide-Production | clip

:: Lancer MongoDB Compass
start "" "C:\Program Files\MongoDB Compass\MongoDBCompass.exe"

echo.
echo 📖 Instructions :
echo 1. Collez la chaîne de connexion (Ctrl+V)
echo 2. Cliquez sur "Connect"
echo 3. Explorez la base "ecoride_reviews"
echo.
echo 📚 Consultez GUIDE_MONGODB_COMPASS.md pour plus d'aide !
echo.
pause
