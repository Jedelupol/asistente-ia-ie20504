$content = Get-Content 'src\data\mockReadings.ts' -Raw -Encoding UTF8

$plazaSequence = @"
imagenesSecuencia: [
            'https://images.unsplash.com/photo-1534960578657-3f82acbd6330?auto=format&fit=crop&q=80&w=600', // Ice cream / Plaza
            'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=600', // Dog playing
            'https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&q=80&w=600', // Plaza worried
            'https://images.unsplash.com/photo-1560807707-8cc77767d783?auto=format&fit=crop&q=80&w=600'  // Dog happy
        ]
"@

$gatoSequence = @"
imagenesSecuencia: [
            'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Cat_November_2010-1a.jpg/600px-Cat_November_2010-1a.jpg', // Cat looking at water
            'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Cat_August_2010-4.jpg/600px-Cat_August_2010-4.jpg', // Cat ready to pounce
            'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/600px-Cat03.jpg', // Cat with a small
            'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Cat_sleeping_2.jpg/600px-Cat_sleeping_2.jpg'  // Cat sleeping
        ]
"@

$heladoSequence = @"
imagenesSecuencia: [
            'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&q=80&w=600', // Ice cream cart/person
            'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&q=80&w=600', // Kids running/happy
            'https://images.unsplash.com/photo-1555507036-ab1e4006aa07?auto=format&fit=crop&q=80&w=600', // Delicious ice cream cone
            'https://images.unsplash.com/photo-1563805042-7684c8a9e9ce?auto=format&fit=crop&q=80&w=600'  // Empty plaza
        ]
"@

$content = [System.Text.RegularExpressions.Regex]::Replace($content, "(id:\s*'1-plaza'.*?)imagenesSecuencia: \[[^\]]+\]", " `$1$plazaSequence", [System.Text.RegularExpressions.RegexOptions]::Singleline)
$content = [System.Text.RegularExpressions.Regex]::Replace($content, "(id:\s*'1-gato-puerto'.*?)imagenesSecuencia: \[[^\]]+\]", " `$1$gatoSequence", [System.Text.RegularExpressions.RegexOptions]::Singleline)
$content = [System.Text.RegularExpressions.Regex]::Replace($content, "(id:\s*'1-helados'.*?)imagenesSecuencia: \[[^\]]+\]", " `$1$heladoSequence", [System.Text.RegularExpressions.RegexOptions]::Singleline)

Set-Content -Path 'src\data\mockReadings.ts' -Value $content -Encoding UTF8
Write-Output "Sequences strictly mapped!"
