function Show-Tree {
  param (
    [string]$Path = ".",
    [int]$Indent = 0
  )

  $items = Get-ChildItem -Force -LiteralPath $Path | Where-Object {
    $_.Name -notmatch '^(node_modules|dist|\.git|\.turbo|coverage)$'
  }

  foreach ($item in $items) {
    $prefix = (' ' * $Indent) + '|-- '
    Write-Output "$prefix$item"

    if ($item.PSIsContainer) {
      Show-Tree -Path $item.FullName -Indent ($Indent + 2)
    }
  }
}

Show-Tree "." | Out-File -Encoding UTF8 structure.txt
