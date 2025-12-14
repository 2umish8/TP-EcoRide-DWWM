# Script pour identifier les classes CSS orphelines (version 2 - plus précise)

$frontendPath = "C:\Users\umisc\OneDrive\Documents\ECF\TP-EcoRide-DWWM\Frontend"
$cssPath = Join-Path $frontendPath "src\assets\css"
$srcPath = Join-Path $frontendPath "src"

Write-Host "`n🔍 Phase 1.1: Nettoyage des classes orphelines`n"

# Étape 1: Extraire toutes les classes CSS définies
Write-Host "📋 Étape 1: Extraction des classes CSS définies...`n"
$cssClasses = @{}

Get-ChildItem -Path $cssPath -Filter "*.css" -Recurse | ForEach-Object {
    $cssFile = $_
    $content = Get-Content -Path $_.FullName -Raw
    
    # Pattern: .classname suivi de { ou : ou espace ou , ou >
    [regex]::Matches($content, '\.([a-zA-Z][a-zA-Z0-9_-]*)\s*[\s{:,>+~\[]') | ForEach-Object {
        $className = $_.Groups[1].Value
        if (-not $cssClasses.ContainsKey($className)) {
            $cssClasses[$className] = @($cssFile.Name)
        } elseif ($cssClasses[$className] -notcontains $cssFile.Name) {
            $cssClasses[$className] += $cssFile.Name
        }
    }
}

Write-Host "✅ Classes CSS définies: $($cssClasses.Count)`n"
Write-Host "   Exemple: $(($cssClasses.Keys | Select-Object -First 5) -join ', ')`n"

# Étape 2: Extraire les classes réellement utilisées dans les .vue (statiques)
Write-Host "📋 Étape 2: Extraction des classes utilisées dans les .vue...`n"
$usedClasses = @{}

Get-ChildItem -Path $srcPath -Filter "*.vue" -Recurse | ForEach-Object {
    $vueFile = $_.Name
    $content = Get-Content -Path $_.FullName -Raw
    
    # Chercher class="..." (statiques uniquement)
    [regex]::Matches($content, 'class="([^"]+)"') | ForEach-Object {
        $fullClass = $_.Groups[1].Value
        
        # Diviser par espaces
        $classes = $fullClass -split '\s+' | Where-Object { $_ -and -not ($_ -match '[\{\}\[\]\(\)\$:;,]') }
        
        $classes | ForEach-Object {
            $className = $_
            if (-not $usedClasses.ContainsKey($className)) {
                $usedClasses[$className] = @()
            }
            if ($usedClasses[$className] -notcontains $vueFile) {
                $usedClasses[$className] += $vueFile
            }
        }
    }
}

Write-Host "✅ Classes utilisées trouvées: $($usedClasses.Count)`n"

# Étape 3: Identifier les classes orphelines (utilisées mais non définies)
Write-Host "📋 Étape 3: Identification des classes orphelines...`n"
$orphanClasses = @{}

$usedClasses.Keys | Sort-Object | ForEach-Object {
    $className = $_
    if (-not $cssClasses.ContainsKey($className)) {
        # Vérifier que ce n'est pas une classe Bootstrap ou valide
        if ($className -notmatch '^(container|row|col|btn|form|input|text|bg|p|m|d|w|h)') {
            $orphanClasses[$className] = $usedClasses[$className]
        }
    }
}

Write-Host "⚠️  Classes orphelines trouvées: $($orphanClasses.Count)`n"

if ($orphanClasses.Count -gt 0) {
    Write-Host "Exemples:"
    $orphanClasses.Keys | Select-Object -First 20 | ForEach-Object {
        $files = $orphanClasses[$_] -join ', '
        Write-Host "  ❌ .$_"
        Write-Host "     Utilisée dans: $files"
    }
    Write-Host ""
}

# Sauvegarder la liste détaillée
$orphanClasses.Keys | Sort-Object | Out-File -Path "$frontendPath\orphan-classes.txt" -Encoding UTF8
Write-Host "💾 Liste complète sauvegardée: orphan-classes.txt`n"

# Résumé
Write-Host "📊 Résumé:"
Write-Host "  Classes CSS définies: $($cssClasses.Count)"
Write-Host "  Classes utilisées (statiques): $($usedClasses.Count)"
Write-Host "  Classes orphelines: $($orphanClasses.Count)"
Write-Host ""
