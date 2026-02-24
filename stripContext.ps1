$content = Get-Content 'src\data\mockReadings.ts' -Raw -Encoding UTF8

$pattern = "<div className=`"bg-amber-50.*?</p></div>\\n\\n"
$content = [System.Text.RegularExpressions.Regex]::Replace($content, $pattern, "", [System.Text.RegularExpressions.RegexOptions]::Singleline)

Set-Content -Path 'src\data\mockReadings.ts' -Value $content -Encoding UTF8
Write-Output "Stripped hardcoded context blocks!"
