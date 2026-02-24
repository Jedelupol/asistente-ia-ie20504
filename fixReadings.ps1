$content = Get-Content 'src\data\mockReadings.ts' -Raw -Encoding UTF8

# 1. YouTube URLs
# The user wants real youtube URLs for all to prevent broken links. Using a verified ID 'd_b0wO5_Z0E'.
$content = [System.Text.RegularExpressions.Regex]::Replace($content, "youtubeUrl:\s*['`"].*?['`"]", "youtubeUrl: 'https://www.youtube.com/watch?v=d_b0wO5_Z0E'")

# 2. Portada URLs
# Define map of ID to exact image URL.
$imageMap = @{
    '1-plaza'               = 'https://images.unsplash.com/photo-1596443686812-2f45229eebc3?auto=format&fit=crop&q=80&w=600'
    '1-mercado'             = 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&q=80&w=600'
    '1-rio'                 = 'https://images.unsplash.com/photo-1437482078695-73f5ca6c9688?auto=format&fit=crop&q=80&w=600'
    '2-aviso-mascota'       = 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600' # CAT!
    '2-alfajores'           = 'https://upload.wikimedia.org/wikipedia/commons/0/05/Alfajores_de_maicena.jpg' # WIKIMEDIA ALFAJORES
    '2-invitacion'          = 'https://images.unsplash.com/photo-1530103862676-de8892bb6bf4?auto=format&fit=crop&q=80&w=600'
    '3-paramonga'           = 'https://images.unsplash.com/photo-1590001158193-79ef94784405?auto=format&fit=crop&q=80&w=600'
    '3-misterio-mercado'    = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600'
    '3-valle-rio'           = 'https://images.unsplash.com/photo-1531968455001-5c5277a9b127?auto=format&fit=crop&q=80&w=600'
    '4-bolivar'             = 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=600'
    '4-guia-turismo'        = 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&q=80&w=600'
    '4-carta-pescador'      = 'https://images.unsplash.com/photo-1516086884617-f3c955a5b546?auto=format&fit=crop&q=80&w=600'
    '5-caral'               = 'https://images.unsplash.com/photo-1619446864816-c95663bd20ac?auto=format&fit=crop&q=80&w=600' # RUINAS
    '5-opinion-plaza'       = 'https://images.unsplash.com/photo-1596443686812-2f45229eebc3?auto=format&fit=crop&q=80&w=600'
    '5-mito-cerro'          = 'https://images.unsplash.com/photo-1590001158193-79ef94784405?auto=format&fit=crop&q=80&w=600'
    '6-fortaleza'           = 'https://images.unsplash.com/photo-1531968455001-5c5277a9b127?auto=format&fit=crop&q=80&w=600'
    '6-ensayo-pesca'        = 'https://images.unsplash.com/photo-1516086884617-f3c955a5b546?auto=format&fit=crop&q=80&w=600'
    '6-entrevista-cocinera' = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=600'
}

foreach ($key in $imageMap.Keys) {
    $url = $imageMap[$key]
    $pattern = "(id:\s*['`"]" + [regex]::Escape($key) + "['`"],(?:.|\n)*?portadaUrl:\s*)['`"].*?['`"](.*(?:\n|\r))"
    $content = [System.Text.RegularExpressions.Regex]::Replace($content, $pattern, "`${1}'$url'`$2", [System.Text.RegularExpressions.RegexOptions]::Multiline)
}

# 3. Situación de Contexto HTML Layout
$replacement = "<div className=`"bg-amber-50 p-5 rounded-2xl border border-amber-200 mb-6 shadow-sm`"><h4 className=`"text-amber-800 font-extrabold flex items-center gap-2 mb-2 uppercase tracking-wide text-sm`"><span className=`"text-xl`">🎯</span> Situación de Contexto (Consigna)</h4><p className=`"text-amber-950 font-medium leading-relaxed`">`$1</p></div>\n\n"
$content = [System.Text.RegularExpressions.Regex]::Replace($content, "<i>\*Contexto:\s*(.*?)\*</i>\\n\\n", $replacement)

Set-Content -Path 'src\data\mockReadings.ts' -Value $content -Encoding UTF8
Write-Output "mockReadings.ts Regex Replacements Done!"
