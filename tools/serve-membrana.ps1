# Local preview for the Membrana product page (localhost only).
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root
$Port = 8080
Write-Host "Membrana local preview:"
Write-Host "  http://localhost:$Port/?local=membrana#membrana"
Write-Host "Press Ctrl+C to stop."
python -m http.server $Port
