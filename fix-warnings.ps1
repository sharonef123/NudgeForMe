$cssPath = "src/index.css"
$cssContent = [System.IO.File]::ReadAllText($cssPath, [System.Text.Encoding]::UTF8)
$fixed = $cssContent -replace '@import url\("https://fonts\.googleapis\.com[^"]*"\);[\r\n]*', ''
$fixed = $fixed -replace '@import "\./styles/animations\.css";[\r\n]*', ''
$header = "@import url(`"https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800&display=swap`");`n@import `"./styles/animations.css`";`n`n"
$fixed = $header + $fixed
[System.IO.File]::WriteAllBytes($cssPath, [System.Text.Encoding]::UTF8.GetBytes($fixed))
Write-Host "CSS fixed" -ForegroundColor Green

$manifest = '{"name":"Nudge Me OS","short_name":"Nudge","description":"AI Personal Life OS","start_url":"/","display":"standalone","background_color":"#050507","theme_color":"#10b981","lang":"he","dir":"rtl","icons":[{"src":"/icons/icon-192.png","sizes":"192x192","type":"image/png","purpose":"any maskable"},{"src":"/icons/icon-512.png","sizes":"512x512","type":"image/png","purpose":"any maskable"}]}'
[System.IO.File]::WriteAllBytes("public/manifest.json", [System.Text.Encoding]::UTF8.GetBytes($manifest))
Write-Host "Manifest fixed" -ForegroundColor Green

$indexContent = [System.IO.File]::ReadAllText("index.html", [System.Text.Encoding]::UTF8)
$indexFixed = $indexContent -replace '<meta name="apple-mobile-web-app-capable" content="yes">', '<meta name="mobile-web-app-capable" content="yes">'
[System.IO.File]::WriteAllBytes("index.html", [System.Text.Encoding]::UTF8.GetBytes($indexFixed))
Write-Host "index.html fixed" -ForegroundColor Green

Write-Host "All done! Run: npm run build" -ForegroundColor Cyan