# inspect-db.ps1
# Docker‑compose içindeki PostgreSQL şemasını raporlar.
# ------------------------------------------------------
chcp 65001 | Out-Null # Konsol kod sayfasını UTF-8 olarak ayarla
$OutputEncoding = [System.Text.Encoding]::UTF8

# -- Ayarlar --------------------------------------------------------------
$ServiceName = "postgres"
$DbName      = "kentnabiz"
$DbUser      = "dev"
$OutputFile  = "database-schema.txt"

# -- 1) Container duruyor mu? --------------------------------------------
$containerId = docker-compose ps -q $ServiceName
if (-not $containerId) {
    exit 1
}

$state = docker inspect --format '{{.State.Status}}' $containerId
if ($state -ne 'running') {
    exit 1
}

# -- 2) Rapor dizisi ------------------------------------------------------
$report = @()
$report += "# KentNabiz Veritabanı Şeması"
$report += "Oluşturulma: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$report += ""

# Sorgu şablonları
$sqlTables = @"
SELECT table_name
FROM   information_schema.tables
WHERE  table_schema='public'
  AND  table_type IN ('BASE TABLE', 'MATERIALIZED VIEW')
  AND  table_name <> 'spatial_ref_sys'
ORDER BY table_name;
"@

$colSql = @"
SELECT column_name,
       udt_name,
       is_nullable,
       column_default,
       character_maximum_length
FROM   information_schema.columns
WHERE  table_schema = 'public'
  AND  table_name   = '{0}'
ORDER  BY ordinal_position;
"@

$fkSql = @"
SELECT kcu.column_name,
       ccu.table_name  AS foreign_table,
       ccu.column_name AS foreign_column
FROM   information_schema.table_constraints       tc
JOIN   information_schema.key_column_usage        kcu ON tc.constraint_name=kcu.constraint_name
JOIN   information_schema.constraint_column_usage ccu ON ccu.constraint_name=tc.constraint_name
WHERE  tc.constraint_type='FOREIGN KEY'
  AND  tc.table_name = '{0}';
"@

$sqlIdx = "SELECT indexname FROM pg_indexes WHERE schemaname='public' AND tablename='{0}';"

# -- 3) Tablo listesi çek -------------------------------------------------
$tableNamesOutput = docker-compose exec -T -e PGCLIENTENCODING=UTF8 $ServiceName psql -d $DbName -U $DbUser -t -A -c $sqlTables
$tableNames = $tableNamesOutput -split "\\r?\\n" | Where-Object { $_.Trim() -ne "" } | ForEach-Object { $_.Trim() }

$report += "Toplam $($tableNames.Count) tablo bulundu."

foreach ($tbl in $tableNames) {
    if (-not $tbl) { continue }

    # Başlık
    $report += "`n--------------------------------------------------"
    $report += "  Tablo: $tbl"
    $report += "--------------------------------------------------"

    # -- Kolonlar ---------------------------------------------------------
    $columnsOutput = docker-compose exec -T -e PGCLIENTENCODING=UTF8 $ServiceName psql -d $DbName -U $DbUser -t -A -F '|' -c ($colSql -f $tbl)
    $columnsLines = $columnsOutput -split "\\r?\\n" | Where-Object { $_.Trim() -ne "" }

    $report += ("{0,-25} {1,-20} {2,-7} {3}" -f 'KOLON ADI','TİP','NULL?','DEFAULT/LENGTH')
    $report += ("{0,-25} {1,-20} {2,-7} {3}" -f '---------','---','-----','--------------')

    foreach ($line in $columnsLines) {
        $parts = $line.Split('|') | ForEach-Object { $_.Trim() }
        if ($parts.Count -ge 3) {
             $columnName = $parts[0]
             $columnType = $parts[1]
             $nullable = if ($parts[2] -eq 'YES') { 'Evet' } else { 'Hayır' }
             $extra = ""
             if ($parts.Length -ge 5 -and $parts[4]) { $extra = "($($parts[4]))" } elseif ($parts.Length -ge 4 -and $parts[3]) { $extra = $parts[3] }
             $reportLine = ("{0,-25} {1,-20} {2,-7} {3}" -f $columnName, $columnType, $nullable, $extra)
             $report += $reportLine
        }
    }

    # -- Foreign Keys -----------------------------------------------------
    $fkOutput = docker-compose exec -T -e PGCLIENTENCODING=UTF8 $ServiceName psql -d $DbName -U $DbUser -t -A -F '|' -c ($fkSql -f $tbl)
    $fkLines = $fkOutput -split "\\r?\\n" | Where-Object { $_.Trim() -ne "" }

    if ($fkLines.Count -gt 0) {
        $report += ""
        $report += "  Foreign Keys:"
        foreach ($line in $fkLines) {
            $parts = $line.Split('|') | ForEach-Object { $_.Trim() }
            if ($parts.Count -ge 3) {
                $report += ("     - {0} → {1}({2})" -f $parts[0], $parts[1], $parts[2])
            }
        }
    }

    # -- İndeksler --------------------------------------------------------
    $idxOutput = docker-compose exec -T -e PGCLIENTENCODING=UTF8 $ServiceName psql -d $DbName -U $DbUser -t -A -c ($sqlIdx -f $tbl)
    $indexLines = $idxOutput -split "\\r?\\n" | Where-Object { $_.Trim() -ne "" }

    if ($indexLines.Count -gt 0) {
        $report += ""
        $report += "  İndeksler:"
        foreach ($line in $indexLines) {
            $idxName = $line.Trim()
            if ($idxName) {
                $report += "     - $idxName"
            }
        }
    }
}

# -- 4) Raporu dosyaya yaz ------------------------------------------------
$report | Set-Content -Path $OutputFile -Encoding UTF8 -Force
exit 0
