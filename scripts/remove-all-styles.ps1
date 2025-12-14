# Script PowerShell pour vider TOUS les <style> dans les fichiers .vue
# Capture <style>, <style scoped>, <style lang="css"> etc.

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontendSrcPath = Join-Path $scriptDir "..\Frontend\src"

$vueFiles = Get-ChildItem -Path $frontendSrcPath -Filter "*.vue" -Recurse -Force

Write-Host "`n🔍 Fichiers .vue trouvés: $($vueFiles.Count)`n" -ForegroundColor Cyan

$filesModified = 0
$totalStylesRemoved = 0

foreach ($file in $vueFiles) {
    try {
        # Lire le fichier avec encoding UTF8
        $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
        $originalContent = $content
        
        # Pattern pour trouver <style...>...</style>
        # Faire plusieurs passes pour différentes variantes
        
        # Pass 1: <style scoped>...</style>
        $pattern1 = '<style\s+scoped[^>]*>([\s\S]*?)</style>'
        if ($content -match $pattern1) {
            Write-Host "  ✓ Found scoped in $($file.Name)"
            $content = [regex]::Replace($content, $pattern1, '', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
            $totalStylesRemoved++
        }
        
        # Pass 2: <style ...> (avec autres attributs)
        $pattern2 = '<style\s+[^>]*>([\s\S]*?)</style>'
        if ($content -match $pattern2) {
            Write-Host "  ✓ Found with attributes in $($file.Name)"
            $content = [regex]::Replace($content, $pattern2, '', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
            $totalStylesRemoved++
        }
        
        # Pass 3: <style> simple (sans attributs)
        $pattern3 = '<style>([\s\S]*?)</style>'
        if ($content -match $pattern3) {
            Write-Host "  ✓ Found simple style in $($file.Name)"
            $content = [regex]::Replace($content, $pattern3, '', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
            $totalStylesRemoved++
        }
        
        # Nettoyer les lignes vides en excès
        $content = [regex]::Replace($content, '\r?\n\s*\r?\n\s*\r?\n+', "`n`n")
        
        if ($content -ne $originalContent) {
            [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
            Write-Host "  ✅ Modified: $($file.Name)" -ForegroundColor Green
            $filesModified++
        }
    }
    catch {
        Write-Host "✗ Erreur: $($file.Name) - $_" -ForegroundColor Red
    }
}

Write-Host "`n✅ Résumé:" -ForegroundColor Cyan
Write-Host "   Blocs <style> supprimés: $totalStylesRemoved" -ForegroundColor Green
Write-Host "   Fichiers modifiés: $filesModified" -ForegroundColor Green
Write-Host "`n📝 Tous les styles sont maintenant gérés globalement via src/assets/css/`n" -ForegroundColor Yellow
