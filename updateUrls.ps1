$content = Get-Content 'src\data\mockReadings.ts' -Raw

$content = $content.Replace("'https://www.youtube.com/watch?v=17X21wV6A8o'", "'https://www.youtube.com/watch?v=F2hB_u-dEqE'")
$content = $content.Replace("'https://www.youtube.com/watch?v=kYxRk2rX5yI'", "'https://www.youtube.com/watch?v=d_b0wO5_Z0E'")
$content = $content.Replace("'https://www.youtube.com/watch?v=Fj2FjL1L10U'", "'https://www.youtube.com/watch?v=1eJ4Y6R4k4s'")
$content = $content.Replace("'https://www.youtube.com/watch?v=Jb13nB1k4R4'", "'https://www.youtube.com/watch?v=S01Zsc2I4N4'")
$content = $content.Replace("'https://www.youtube.com/watch?v=R0_A4fJc81M'", "'https://www.youtube.com/watch?v=CqYm5L7_tO4'")
$content = $content.Replace("'https://www.youtube.com/watch?v=t1rPOZtXyxc'", "'https://www.youtube.com/watch?v=L9wIfYc272A'")

$content = $content.Replace("https://images.unsplash.com/photo-1542640244-7e672d6cb461?q=80&w=1470&auto=format&fit=crop", "https://images.unsplash.com/photo-1590001158193-79ef94784405?auto=format&fit=crop&q=80&w=600")
$content = $content.Replace("https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?q=80&w=1470&auto=format&fit=crop", "https://images.unsplash.com/photo-1590001158193-79ef94784405?auto=format&fit=crop&q=80&w=600")
$content = $content.Replace("https://images.unsplash.com/photo-1616421974757-79a6da44b829?q=80&w=1470&auto=format&fit=crop", "https://images.unsplash.com/photo-1590001158193-79ef94784405?auto=format&fit=crop&q=80&w=600")

$content = $content.Replace("https://images.unsplash.com/photo-1527066236129-cbaf7f20184b?q=80&w=1470&auto=format&fit=crop", "https://images.unsplash.com/photo-1531968455001-5c5277a9b127?auto=format&fit=crop&q=80&w=600")
$content = $content.Replace("https://images.unsplash.com/photo-1504681869696-d977211a5f4c?q=80&w=1470&auto=format&fit=crop", "https://images.unsplash.com/photo-1531968455001-5c5277a9b127?auto=format&fit=crop&q=80&w=600")
$content = $content.Replace("https://images.unsplash.com/photo-1498084393753-b411b2d26b34?q=80&w=1470&auto=format&fit=crop", "https://images.unsplash.com/photo-1531968455001-5c5277a9b127?auto=format&fit=crop&q=80&w=600")
$content = $content.Replace("https://images.unsplash.com/photo-1518182170546-076616fdcd8e?q=80&w=1470&auto=format&fit=crop", "https://images.unsplash.com/photo-1531968455001-5c5277a9b127?auto=format&fit=crop&q=80&w=600")

$content = $content.Replace("https://images.unsplash.com/photo-1616031037971-c7b903fb7cb7?q=80&w=1470&auto=format&fit=crop", "https://images.unsplash.com/photo-1616031037971-c7b903fb7cb7?auto=format&fit=crop&q=80&w=600")

$content = $content.Replace("?q=80&w=1470&auto=format&fit=crop", "?auto=format&fit=crop&q=80&w=600")

Set-Content -Path 'src\data\mockReadings.ts' -Value $content
