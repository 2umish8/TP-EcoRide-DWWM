# Script PowerShell pour vider TOUS les <style scoped> dans les fichiers .vue
# Les balises <style scoped> seront complètement supprimées

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontendSrcPath = Join-Path $scriptDir "..\Frontend\src"

$vueFiles = Get-ChildItem -Path $frontendSrcPath -Filter "*.vue" -Recurse -Force

Write-Host "`n🔍 Fichiers .vue trouvés: $($vueFiles.Count)`n" -ForegroundColor Cyan

$filesModified = 0
$totalStylesRemoved = 0

foreach ($file in $vueFiles) {
    try {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
        $originalContent = $content
        
        # Pattern pour trouver et supprimer <style scoped>...</style>
        $pattern = '<style\s+scoped[^>]*>.*?</style>'
        
        if ($content -match $pattern) {
            $matches = [regex]::Matches($content, $pattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)
            $totalStylesRemoved += $matches.Count
            
            # Supprimer tous les blocs <style scoped>
            $content = [regex]::Replace($content, $pattern, '', [System.Text.RegularExpressions.RegexOptions]::Singleline)
            
            # Nettoyer les lignes vides en excès (max 2 newlines consécutifs)
            $content = [regex]::Replace($content, '\n\n\n+', "`n`n")
            
            Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
            Write-Host "✓ $($file.Name)" -ForegroundColor Green
            $filesModified++
        }
    }
    catch {
        Write-Host "✗ Erreur: $($file.Name) - $_" -ForegroundColor Red
    }
}

Write-Host "`n✅ Résumé:" -ForegroundColor Cyan
Write-Host "   Style scoped supprimées: $totalStylesRemoved" -ForegroundColor Green
Write-Host "   Fichiers modifiés: $filesModified" -ForegroundColor Green
Write-Host "`n📝 Tous les styles sont maintenant gérés globalement via src/assets/css/`n" -ForegroundColor Yellow
