# inspect-db.ps1
# Docker‑compose içindeki PostgreSQL şemasını raporlar.
# ------------------------------------------------------

# -- Ayarlar --------------------------------------------------------------
$ServiceName = "postgres"
$DbName      = "kentnabiz"
$DbUser      = "dev"
$OutputFile  = "database-schema.txt"

Write-Host "`n🔍  Veritabanı şeması analizi başlatılıyor…" -ForegroundColor Cyan

# -- 1) Container duruyor mu? --------------------------------------------
$containerId = docker-compose ps -q $ServiceName
if (-not $containerId) {
    Write-Host "❌  '$ServiceName' servisi docker‑compose içinde bulunamadı." -ForegroundColor Red
    exit 1
}

$state = docker inspect --format '{{.State.Status}}' $containerId
if ($state -ne 'running') {
    Write-Host "❌  PostgreSQL servisi çalışmıyor. 'docker-compose up -d' ile başlatın." -ForegroundColor Red
    exit 1
}
Write-Host "✅  PostgreSQL servisi çalışıyor." -ForegroundColor Green

# -- 2) Rapor dizisi ------------------------------------------------------
$report = @()
$report += "# KentNabiz Veritabanı Şeması"
$report += "Oluşturulma: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$report += ""

# Sorgu şablonları
$sqlTables   = @"
SELECT table_name
FROM   information_schema.tables
WHERE  table_schema='public'
  AND  table_type='BASE TABLE'
  AND  table_name NOT IN ('spatial_ref_sys','report_analytics_mv')
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

$idxSql = "SELECT indexname FROM pg_indexes WHERE schemaname='public' AND tablename='{0}';"

# -- 3) Tablo listesi çek -------------------------------------------------
$tableNames = docker-compose exec -T $ServiceName psql -d $DbName -U $DbUser -t -A -c $sqlTables
$tableNames = $tableNames | Where-Object { $_.Trim() }   # boş satırları at

$report += "Toplam $($tableNames.Count) tablo bulundu."
Write-Host "`n📄  Toplam $($tableNames.Count) tablo bulundu." -ForegroundColor Cyan

foreach ($tbl in $tableNames) {

    # Başlık
    $report += "`n--------------------------------------------------"
    $report += "  Tablo: $tbl"
    $report += "--------------------------------------------------"
    Write-Host "`n🗂️  TABLO: $tbl" -ForegroundColor Yellow

    # -- Kolonlar ---------------------------------------------------------
    $columns = docker-compose exec -T $ServiceName psql -d $DbName -U $DbUser `
               -t -A -F '|' -c ($colSql -f $tbl)

    $report += ("{0,-25} {1,-20} {2,-7} {3}" -f 'KOLON ADI','TIP','NULL?','DEFAULT/LENGTH')
    $report += ("{0,-25} {1,-20} {2,-7} {3}" -f '---------','---','-----','--------------')

    foreach ($c in $columns) {
        $p = $c -split '\|'
        $nullable = if ($p[2] -eq 'YES') { 'Evet' } else { 'Hayır' }
        $extra    = if ($p[4]) { "($($p[4]))" } else { $p[3] }
        $line     = ("{0,-25} {1,-20} {2,-7} {3}" -f $p[0],$p[1],$nullable,$extra)
        $report  += $line
        Write-Host "   $line"
    }

    # -- Foreign keys -----------------------------------------------------
    $fks = docker-compose exec -T $ServiceName psql -d $DbName -U $DbUser `
           -t -A -F '|' -c ($fkSql -f $tbl)

    if ($fks) {
        $report += "`n  Foreign Keys:"
        Write-Host "   🔗 Foreign Keys" -ForegroundColor Magenta
        foreach ($f in $fks) {
            $p = $f -split '\|'
            $line = "     - $($p[0]) ➜  $($p[1])($($p[2]))"
            $report += $line
            Write-Host $line
        }
    }

    # -- İndeksler --------------------------------------------------------
    $idx = docker-compose exec -T $ServiceName psql -d $DbName -U $DbUser `
           -t -A -c ($idxSql -f $tbl)

    $idx = $idx | Where-Object { $_ -and -not $_.EndsWith('_pkey') }
    if ($idx) {
        $report += "`n  İndeksler:"
        Write-Host "   ⚡ İndeksler" -ForegroundColor Blue
        foreach ($i in $idx) {
            $line = "     - $i"
            $report += $line
            Write-Host $line
        }
    }
}

# -- 4) Dosyaya yaz -------------------------------------------------------
$report | Set-Content -Encoding utf8 $OutputFile
Write-Host "`n✅  Rapor '$OutputFile' dosyasına kaydedildi." -ForegroundColor Green
