# Script PowerShell pour supprimer tous les <style scoped> des fichiers .vue
# Approche : lire chaque fichier, supprimer le bloc style, réécrire

$vueFiles = Get-ChildItem -Path "Frontend\src" -Filter "*.vue" -Recurse -Force

Write-Host "`n🔍 Found $($vueFiles.Count) .vue files`n" -ForegroundColor Cyan

$removedCount = 0

foreach ($file in $vueFiles) {
    try {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
        $originalLength = $content.Length
        
        # Supprimer <style scoped>...</style> avec tous les caractères entre (incluant newlines)
        # Utilise -Singleline pour que . match les newlines
        $newContent = $content -replace '(?s)<style\s+scoped[^>]*>.*?</style>', ''
        
        # Nettoyer les newlines excessives
        $newContent = $newContent -replace '\n\n\n+', "`n`n"
        
        # Si du contenu a été retiré
        if ($newContent.Length -ne $originalLength) {
            Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8 -NoNewline
            Write-Host "✓ $($file.Name)" -ForegroundColor Green
            $removedCount++
        }
    }
    catch {
        Write-Host "✗ Error: $($file.Name)" -ForegroundColor Red
    }
}

Write-Host "`n✅ Summary:" -ForegroundColor Cyan
Write-Host "   Files processed: $($vueFiles.Count)" -ForegroundColor Cyan
Write-Host "   Style scoped removed: $removedCount" -ForegroundColor Cyan
Write-Host "`n📝 All styles are now managed globally in src/assets/css/`n" -ForegroundColor Yellow
