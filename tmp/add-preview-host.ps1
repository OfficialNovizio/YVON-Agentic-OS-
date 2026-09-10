# YVON — interim local DNS for venture previews (until the BigRock wildcard goes live)
# Adds <venture>.preview.yvon.in -> 169.58.107.148 to the Windows hosts file. Idempotent.
$hosts = "$env:SystemRoot\System32\drivers\etc\hosts"
$marker = '# YVON venture preview (interim until BigRock wildcard DNS)'
$entry  = '169.58.107.148 novizio.preview.yvon.in'
$content = Get-Content -Path $hosts -Raw
if ($content -notmatch [regex]::Escape($entry)) {
  Add-Content -Path $hosts -Value "`r`n$marker`r`n$entry"
}
ipconfig /flushdns | Out-Null
Write-Output "hosts entry ensured + DNS cache flushed"
