$content = Get-Content 'src\data\mockReadings.ts' -Raw -Encoding UTF8

$replacements = @{
    '1-plaza'             = 'https://images.unsplash.com/photo-1596443686812-2f45229eebc3?auto=format&fit=crop&q=80&w=600'
    '1-gato-puerto'       = 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&q=80&w=600'
    '1-helados'           = 'https://images.unsplash.com/photo-1557142046-c704a3adf364?auto=format&fit=crop&q=80&w=600'
    '2-aviso-mascota'     = 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600'
    '2-invitacion'        = 'https://images.unsplash.com/photo-1530103862676-de8892bb6bf4?auto=format&fit=crop&q=80&w=600'
    '3-paramonga'         = 'https://images.unsplash.com/photo-1590001158193-79ef94784405?auto=format&fit=crop&q=80&w=600'
    '3-misterio-mercado'  = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600'
    '4-bolivar'           = 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=600'
    '4-guia-turismo'      = 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&q=80&w=600'
    '4-carta-pescador'    = 'https://images.unsplash.com/photo-1516086884617-f3c955a5b546?auto=format&fit=crop&q=80&w=600'
    '5-debate-plaza'      = 'https://images.unsplash.com/photo-1596443686812-2f45229eebc3?auto=format&fit=crop&q=80&w=600'
    '5-leyenda-cerro'     = 'https://images.unsplash.com/photo-1590001158193-79ef94784405?auto=format&fit=crop&q=80&w=600'
    '6-mito-rio'          = 'https://images.unsplash.com/photo-1531968455001-5c5277a9b127?auto=format&fit=crop&q=80&w=600'
    '6-ensayo-mar'        = 'https://images.unsplash.com/photo-1516086884617-f3c955a5b546?auto=format&fit=crop&q=80&w=600'
    '6-entrevista-cocina' = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=600'
}

foreach ($key in $replacements.Keys) {
    $url = $replacements[$key]
    $pattern = "(id:\s*'$key',\s*titulo:.*?\s*grado:.*?\s*tipoTexto:.*?\s*portadaUrl: )'[^']+?'"
    $content = [System.Text.RegularExpressions.Regex]::Replace($content, $pattern, "`$1'$url'", [System.Text.RegularExpressions.RegexOptions]::Singleline)
}

# Fix dynamic sequences to hardcoded arrays too (Phase 1 readings)
$content = [System.Text.RegularExpressions.Regex]::Replace($content, "imagenesSecuencia:\s*\[\s*'[^']+',\s*'[^']+',\s*'[^']+',\s*'[^']+'\s*\]", "imagenesSecuencia: ['https://images.unsplash.com/photo-1534960578657-3f82acbd6330?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1560807707-8cc77767d783?auto=format&fit=crop&q=80&w=600']", [System.Text.RegularExpressions.RegexOptions]::Singleline)

Set-Content -Path 'src\data\mockReadings.ts' -Value $content -Encoding UTF8
Write-Output "Hallucinations Removed. All media safely anchored."
