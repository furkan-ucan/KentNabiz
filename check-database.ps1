# ==========================================
# KentNabız Veritabanı Kontrol Script'i
# PostgreSQL'e bağlanıp veri durumunu kontrol eder
# ==========================================

Write-Host "🔍 KENTNABIZ VERİTABANI KONTROL EDİLİYOR..." -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Yellow

# Docker-compose.yml'den alınan bağlantı bilgileri
$dbHost = "localhost"
$dbPort = "5432"
$dbName = "kentnabiz"
$dbUser = "dev"
$dbPassword = "dev123"

# PostgreSQL bağlantı string'i
$connectionString = "Host=$dbHost;Port=$dbPort;Database=$dbName;Username=$dbUser;Password=$dbPassword"

Write-Host "`n📡 Bağlantı Bilgileri:" -ForegroundColor Cyan
Write-Host "   🏠 Host: $dbHost" -ForegroundColor White
Write-Host "   🔌 Port: $dbPort" -ForegroundColor White
Write-Host "   🗄️ Database: $dbName" -ForegroundColor White
Write-Host "   👤 User: $dbUser" -ForegroundColor White

try {
    # Npgsql Assembly'yi yükle (PostgreSQL .NET sürücüsü)
    Write-Host "`nPostgreSQL .NET sürücüsü yükleniyor..." -ForegroundColor Cyan

    # NuGet'ten Npgsql yükle (eğer yoksa)
    if (-not (Get-Module -ListAvailable -Name Npgsql)) {
        Write-Host "   📦 Npgsql paketi yükleniyor..." -ForegroundColor Gray
        Install-PackageProvider -Name NuGet -Force -Scope CurrentUser
        Install-Module -Name Npgsql -Force -Scope CurrentUser
    }

    # Assembly yükle
    Add-Type -Path "$env:USERPROFILE\.nuget\packages\npgsql\*\lib\netstandard2.0\Npgsql.dll" -ErrorAction SilentlyContinue

    Write-Host "`n🔗 Veritabanına bağlanılıyor..." -ForegroundColor Cyan

    # Bağlantı oluştur
    $connection = New-Object Npgsql.NpgsqlConnection($connectionString)
    $connection.Open()

    Write-Host "✅ Bağlantı başarılı!" -ForegroundColor Green

    # =================
    # TABLO SAYILARINI KONTROL ET
    # =================
    Write-Host "`n📊 TABLO VERİ SAYILARI:" -ForegroundColor Cyan
    Write-Host "========================" -ForegroundColor Cyan
      $tableCounts = @(
        @{Name="users"; Display="Kullanicilar"},
        @{Name="departments"; Display="Departmanlar"},
        @{Name="teams"; Display="Takimlar"},
        @{Name="reports"; Display="Raporlar"},
        @{Name="assignments"; Display="Atamalar"},
        @{Name="report_categories"; Display="Kategoriler"},
        @{Name="specializations"; Display="Uzmanliklar"}
    )

    foreach ($table in $tableCounts) {
        $command = $connection.CreateCommand()
        $command.CommandText = "SELECT COUNT(*) FROM $($table.Name)"
        $count = $command.ExecuteScalar()

        $color = if ($count -gt 0) { "Green" } else { "Red" }
        Write-Host "   $($table.Display): $count" -ForegroundColor $color
    }

    # =================
    # REPORTS DETAY KONTROL
    # =================
    Write-Host "`n📋 RAPOR DETAYLARI:" -ForegroundColor Cyan
    Write-Host "===================" -ForegroundColor Cyan

    # Rapor durumları
    $statusCommand = $connection.CreateCommand()
    $statusCommand.CommandText = @"
        SELECT
            status,
            COUNT(*) as count
        FROM reports
        WHERE deleted_at IS NULL
        GROUP BY status
        ORDER BY count DESC
"@

    $statusReader = $statusCommand.ExecuteReader()
    while ($statusReader.Read()) {
        $status = $statusReader["status"]
        $count = $statusReader["count"]        $emoji = switch ($status) {
            "OPEN" { "OPEN" }
            "IN_PROGRESS" { "PROGRESS" }
            "IN_REVIEW" { "REVIEW" }
            "DONE" { "DONE" }
            default { "OTHER" }
        }
        Write-Host "   $emoji $status`: $count rapor" -ForegroundColor White
    }
    $statusReader.Close()

    # =================
    # ASSIGNMENTS DETAY KONTROL
    # =================
    Write-Host "`n🎯 ATAMA DETAYLARI:" -ForegroundColor Cyan
    Write-Host "===================" -ForegroundColor Cyan

    # Atama durumları
    $assignmentCommand = $connection.CreateCommand()
    $assignmentCommand.CommandText = @"
        SELECT
            status,
            COUNT(*) as count
        FROM assignments
        GROUP BY status
        ORDER BY count DESC
"@

    $assignmentReader = $assignmentCommand.ExecuteReader()
    while ($assignmentReader.Read()) {
        $status = $assignmentReader["status"]
        $count = $assignmentReader["count"]        $emoji = switch ($status) {
            "PENDING" { "PENDING" }
            "ACTIVE" { "ACTIVE" }
            "COMPLETED" { "COMPLETED" }
            default { "OTHER" }
        }
        Write-Host "   $emoji $status`: $count atama" -ForegroundColor White
    }
    $assignmentReader.Close()

    # =================
    # TARİH ARALIKLARI KONTROL
    # =================
    Write-Host "`n📅 TARİH ARALIKLARI:" -ForegroundColor Cyan
    Write-Host "====================" -ForegroundColor Cyan

    $dateCommand = $connection.CreateCommand()
    $dateCommand.CommandText = @"
        SELECT
            MIN(created_at) as min_date,
            MAX(created_at) as max_date,
            COUNT(*) as total_reports
        FROM reports
        WHERE deleted_at IS NULL
"@

    $dateReader = $dateCommand.ExecuteReader()
    if ($dateReader.Read()) {
        $minDate = $dateReader["min_date"]
        $maxDate = $dateReader["max_date"]
        $totalReports = $dateReader["total_reports"]

        Write-Host "   📅 En Eski Rapor: $minDate" -ForegroundColor White
        Write-Host "   📅 En Yeni Rapor: $maxDate" -ForegroundColor White
        Write-Host "   📊 Toplam: $totalReports rapor" -ForegroundColor White
    }
    $dateReader.Close()

    # =================
    # MATERIALIZED VIEW KONTROL
    # =================
    Write-Host "`n🔍 MATERIALIZED VIEW KONTROL:" -ForegroundColor Cyan
    Write-Host "==============================" -ForegroundColor Cyan

    try {
        $mvCommand = $connection.CreateCommand()
        $mvCommand.CommandText = "SELECT COUNT(*) FROM report_analytics_mv"
        $mvCount = $mvCommand.ExecuteScalar()
        Write-Host "   📊 Materialized View Kayıt: $mvCount" -ForegroundColor $(if ($mvCount -gt 0) { "Green" } else { "Red" })

        if ($mvCount -eq 0) {
            Write-Host "   ⚠️ Materialized View boş! Refresh gerekli." -ForegroundColor Yellow
        }
    } catch {
        Write-Host "   ❌ Materialized View bulunamadı!" -ForegroundColor Red
        Write-Host "   💡 Migration çalıştırılmamış olabilir." -ForegroundColor Yellow
    }

    # =================
    # SONUÇ ÖZETI
    # =================
    Write-Host "`n📋 SONUÇ ÖZETİ:" -ForegroundColor Green
    Write-Host "===============" -ForegroundColor Green

    $reportsCommand = $connection.CreateCommand()
    $reportsCommand.CommandText = "SELECT COUNT(*) FROM reports WHERE deleted_at IS NULL"
    $reportCount = $reportsCommand.ExecuteScalar()

    $assignmentsCommand = $connection.CreateCommand()
    $assignmentsCommand.CommandText = "SELECT COUNT(*) FROM assignments"
    $assignmentCount = $assignmentsCommand.ExecuteScalar()

    if ($reportCount -gt 0) {
        Write-Host "✅ Seed verileri mevcut!" -ForegroundColor Green
        Write-Host "   📊 $reportCount rapor" -ForegroundColor White
        Write-Host "   🎯 $assignmentCount atama" -ForegroundColor White
        Write-Host "`n💡 API'de veri görünmüyorsa:" -ForegroundColor Yellow
        Write-Host "   1. Materialized View refresh edilmeli" -ForegroundColor Gray
        Write-Host "   2. API cache temizlenmeli" -ForegroundColor Gray
        Write-Host "   3. Tarih filtreleri kontrol edilmeli" -ForegroundColor Gray
    } else {
        Write-Host "❌ Seed verileri YOK!" -ForegroundColor Red
        Write-Host "   🔄 npm run seed:run çalıştırılmalı" -ForegroundColor Yellow
    }

} catch {
    Write-Host "❌ Hata: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n💡 Olası Çözümler:" -ForegroundColor Yellow
    Write-Host "   1. Docker container'ın çalıştığını kontrol edin" -ForegroundColor Gray
    Write-Host "   2. Npgsql paketi yüklenememiş olabilir" -ForegroundColor Gray
    Write-Host "   3. Bağlantı bilgileri yanlış olabilir" -ForegroundColor Gray
} finally {
    if ($connection) {
        $connection.Close()
        Write-Host "`n🔒 Bağlantı kapatıldı." -ForegroundColor Gray
    }
}

Write-Host "`nKontrol tamamlandi!" -ForegroundColor Green
