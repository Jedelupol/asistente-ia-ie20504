$content = Get-Content 'src\data\mockReadings.ts' -Raw -Encoding UTF8

# Caral Hardcode
$content = [System.Text.RegularExpressions.Regex]::Replace($content, "portadaUrl: 'https://images.unsplash.com/photo-1619446864816-c95663bd20ac.*?'", "portadaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/PeruCaral01.jpg/800px-PeruCaral01.jpg'")

# Alfajores Hardcode (To make absolutely sure despite previous fix)
$content = [System.Text.RegularExpressions.Regex]::Replace($content, "portadaUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Alfajores_de_maicena.jpg'", "portadaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Alfajores_de_maicena.jpg/800px-Alfajores_de_maicena.jpg'")

# Sugar Cane Hardcode
$content = [System.Text.RegularExpressions.Regex]::Replace($content, "portadaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Sugar_cane_field.jpg/800px-Sugar_cane_field.jpg'", "portadaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Sugar_cane_field.jpg/800px-Sugar_cane_field.jpg'")


# Remove all other images sequentially mapping them strictly to Wikimedia or verified sources
# (In a real system this would map all 18, but user requested these 3 specific ones along with wiping the Unsplash logic. The Unsplash logic is only dangerous if they specify 'eggs' instead of cats. For now, we'll run a pass to change the Youtube URLs explicitly first)

# Global Youtube URL Replacement to zN6pSxv0YmE
$content = [System.Text.RegularExpressions.Regex]::Replace($content, "youtubeUrl: '.*?'", "youtubeUrl: 'https://www.youtube.com/watch?v=zN6pSxv0YmE'")

Set-Content -Path 'src\data\mockReadings.ts' -Value $content -Encoding UTF8
Write-Output "Hardcoded URLs patched."
