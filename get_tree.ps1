function Get-Tree {
    param(
        [string]$Path = '.',
        [string]$Indent = ''
    )
    $items = Get-ChildItem -Path $Path -Force | Where-Object { $_.Name -notmatch 'node_modules|\.git|\.next' }
    foreach ($item in $items) {
        if ($item.PSIsContainer) {
            Write-Host "$Indent[DIR] $($item.Name)"
            Get-Tree -Path $item.FullName -Indent "$Indent  "
        } else {
            Write-Host "$Indent  $($item.Name)"
        }
    }
}
Get-Tree -Path 'c:\luminel manager'
