# Script pour supprimer les classes orphelines des fichiers .vue
# Ne supprime que les classes véritablement orphelines (définies dans CSS ou dynamiques valides)

$frontendPath = "C:\Users\umisc\OneDrive\Documents\ECF\TP-EcoRide-DWWM\Frontend"
$cssPath = Join-Path $frontendPath "src\assets\css"
$srcPath = Join-Path $frontendPath "src"

# Étape 1: Construire la liste des classes CSS définies
$cssClasses = @{}
Get-ChildItem -Path $cssPath -Filter "*.css" -Recurse | ForEach-Object {
    $content = Get-Content -Path $_.FullName -Raw
    [regex]::Matches($content, '\.([a-zA-Z][a-zA-Z0-9_-]*)\s*[\s{:,>+~\[]') | ForEach-Object {
        $cssClasses[$_.Groups[1].Value] = $true
    }
}

# Lister les classes à GARDER (communes, Bootstrap, utiles)
$keepClasses = @(
    'container', 'row', 'col', 'col-md', 'col-lg', 'col-sm',
    'btn', 'btn-primary', 'btn-secondary',
    'form', 'form-control', 'form-group', 'input-group',
    'text', 'text-center', 'text-right', 'text-left',
    'bg', 'border', 'rounded',
    'p', 'pt', 'pb', 'pl', 'pr', 'px', 'py', 'mt', 'mb', 'ml', 'mr', 'mx', 'my',
    'm', 'p', 'd-flex', 'flex-column', 'align-items', 'justify-content',
    'mb-3', 'mb-2', 'mb-1', 'mt-3', 'mt-2', 'mt-1',
    'w-100', 'h-100',
    'gap',
    'active', 'disabled', 'hidden', 'show', 'hide'
)

Write-Host "`n🔍 Suppression des classes orphelines des fichiers .vue`n"
Write-Host "📋 Étape 1: Analyse des fichiers .vue...`n"

$filesModified = 0
$classesRemoved = 0

Get-ChildItem -Path $srcPath -Filter "*.vue" -Recurse | ForEach-Object {
    $vueFile = $_
    $content = Get-Content -Path $vueFile.FullName -Raw
    $originalContent = $content
    
    # Trouver tous les attributs class="..."
    [regex]::Matches($content, 'class="([^"]*)"') | ForEach-Object {
        $fullClassAttr = $_.Groups[1].Value
        $originalAttr = $fullClassAttr
        
        # Diviser les classes
        $classes = $fullClassAttr -split '\s+' | Where-Object { $_ }
        
        # Filtrer les classes valides
        $validClasses = @()
        $classes | ForEach-Object {
            $class = $_
            # Garder si:
            # - C'est une classe CSS connue
            # - C'est une classe courte utile (1-2 caractères)
            # - C'est une classe Bootstrap commune
            # - C'est un pattern d'une classe CSS existante (ex: btn-* si btn existe)
            
            if ($cssClasses.ContainsKey($class) -or 
                $keepClasses -contains $class -or
                ($class -match '^(btn|col|mt|mb|pt|pb|px|py|mx|my|ml|mr|pl|pr|p|m|d|w|h|text|bg|alert)-') -or
                ($class.Length -le 2)) {
                $validClasses += $class
            } elseif ($class -ne '') {
                # Classe orpheline détectée
                $classesRemoved++
            }
        }
        
        # Remplacer l'attribut si différent
        if ($validClasses.Count -eq 0) {
            $content = $content -replace 'class="' + [regex]::Escape($originalAttr) + '"', ''
        } else {
            $newAttr = $validClasses -join ' '
            if ($newAttr -ne $originalAttr) {
                $content = $content -replace 'class="' + [regex]::Escape($originalAttr) + '"', ('class="' + $newAttr + '"')
            }
        }
    }
    
    # Nettoyer les espaces doubles vides: class=""
    $content = $content -replace 'class=""', ''
    $content = $content -replace 'class="\s+"', ''
    
    if ($content -ne $originalContent) {
        Set-Content -Path $vueFile.FullName -Value $content -Encoding UTF8
        $filesModified++
        Write-Host "  ✅ $($vueFile.Name)"
    }
}

Write-Host "`n✅ Résumé:"
Write-Host "  Fichiers modifiés: $filesModified"
Write-Host "  Classes supprimées: $classesRemoved`n"
