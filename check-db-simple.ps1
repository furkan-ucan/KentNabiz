# PostgreSQL Veritabani Kontrol Script'i
Write-Host "KENTNABIZ VERITABANI KONTROL" -ForegroundColor Yellow
Write-Host "=============================" -ForegroundColor Yellow

# Basit psql komutu ile kontrol
Write-Host "`nPostgreSQL'e baglaniliyor..." -ForegroundColor Cyan

$env:PGPASSWORD = "dev123"

try {
    # Tablo sayilari
    Write-Host "`nTABLO VERI SAYILARI:" -ForegroundColor Cyan

    $users = & psql -h localhost -p 5432 -U dev -d kentnabiz -t -c "SELECT COUNT(*) FROM users;"
    Write-Host "Kullanicilar: $($users.Trim())" -ForegroundColor White

    $departments = & psql -h localhost -p 5432 -U dev -d kentnabiz -t -c "SELECT COUNT(*) FROM departments;"
    Write-Host "Departmanlar: $($departments.Trim())" -ForegroundColor White

    $teams = & psql -h localhost -p 5432 -U dev -d kentnabiz -t -c "SELECT COUNT(*) FROM teams;"
    Write-Host "Takimlar: $($teams.Trim())" -ForegroundColor White

    $reports = & psql -h localhost -p 5432 -U dev -d kentnabiz -t -c "SELECT COUNT(*) FROM reports WHERE deleted_at IS NULL;"
    Write-Host "Raporlar: $($reports.Trim())" -ForegroundColor $(if ($reports.Trim() -gt 0) { "Green" } else { "Red" })

    $assignments = & psql -h localhost -p 5432 -U dev -d kentnabiz -t -c "SELECT COUNT(*) FROM assignments;"
    Write-Host "Atamalar: $($assignments.Trim())" -ForegroundColor $(if ($assignments.Trim() -gt 0) { "Green" } else { "Red" })

    Write-Host "`nRAPOR DURUMLARI:" -ForegroundColor Cyan
    $reportStatus = & psql -h localhost -p 5432 -U dev -d kentnabiz -c "SELECT status, COUNT(*) FROM reports WHERE deleted_at IS NULL GROUP BY status;"
    Write-Host $reportStatus -ForegroundColor White

    Write-Host "`nATAMA DURUMLARI:" -ForegroundColor Cyan
    $assignmentStatus = & psql -h localhost -p 5432 -U dev -d kentnabiz -c "SELECT status, COUNT(*) FROM assignments GROUP BY status;"
    Write-Host $assignmentStatus -ForegroundColor White

    Write-Host "`nTARIH ARALIGI:" -ForegroundColor Cyan
    $dateRange = & psql -h localhost -p 5432 -U dev -d kentnabiz -c "SELECT MIN(created_at), MAX(created_at), COUNT(*) FROM reports WHERE deleted_at IS NULL;"
    Write-Host $dateRange -ForegroundColor White

    Write-Host "`nMATERIALIZED VIEW:" -ForegroundColor Cyan
    try {
        $mvCount = & psql -h localhost -p 5432 -U dev -d kentnabiz -t -c "SELECT COUNT(*) FROM report_analytics_mv;"
        Write-Host "Materialized View Kayit: $($mvCount.Trim())" -ForegroundColor $(if ($mvCount.Trim() -gt 0) { "Green" } else { "Red" })
    } catch {
        Write-Host "Materialized View bulunamadi!" -ForegroundColor Red
    }

    Write-Host "`nSONUC:" -ForegroundColor Green
    if ($reports.Trim() -gt 0) {
        Write-Host "VERI VAR! API'de problem olabilir." -ForegroundColor Green
    } else {
        Write-Host "VERI YOK! Seed calistirilmali." -ForegroundColor Red
    }

} catch {
    Write-Host "Hata: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "psql yuklu degil veya PostgreSQL calismiyot olabilir." -ForegroundColor Yellow
}
