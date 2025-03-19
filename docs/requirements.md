# KentNabız – Gereksinimler ve İş Analizi Dokümanı

## 1. Fonksiyonel Gereksinimler

### 1.1. Kullanıcı Yönetimi

- Basit kullanıcı kaydı ve girişi
- Rol tabanlı yetkilendirme sistemi
  - Vatandaş
  - Yetkili
  - Admin

### 1.2. Rapor Yönetimi

- Sorun raporlama
  - Konum seçimi (harita/GPS)
  - Kategori seçimi
  - Fotoğraf ekleme
  - Açıklama ekleme
- Rapor güncelleme
  - Durum güncellemeleri
  - İlerleme bildirimleri
  - Çözüm açıklamaları
- Rapor etkileşimleri
  - Yorum ekleme
  - Benzer sorun bildirimi
  - Basit doğrulama sistemi

### 1.3. Harita Entegrasyonu

- İnteraktif harita görünümü
  - Sorun noktaları
  - Basit filtreleme
  - Kategori bazlı görünüm
- Lokasyon özellikleri
  - Yakındaki sorunlar
  - Basit rota gösterimi
  - Bölge istatistikleri

### 1.4. Bildirim Sistemi

- Web push notifications
  - Rapor güncellemeleri
  - Yakındaki sorunlar
  - Etkileşim bildirimleri
- Email bildirimleri (opsiyonel)
  - Önemli güncellemeler
  - Sistem bildirimleri

### 1.5. Analiz ve Raporlama

- Temel istatistikler
  - Bölge bazlı dağılımlar
  - Çözüm süreleri
  - Kategori analizleri
- Basit raporlar
  - Zaman bazlı analiz
  - Karşılaştırmalı veriler

## 2. Fonksiyonel Olmayan Gereksinimler

### 2.1. Performans

- Sayfa yüklenme süresi: < 3 saniye
- API yanıt süresi: < 200ms
- Harita render süresi: < 2 saniye
- Development ortamında yeterli performans

### 2.2. Güvenlik

- JWT tabanlı auth
- Role-based access control
- API rate limiting
- Temel güvenlik önlemleri
- Input validasyon

### 2.3. Kullanılabilirlik

- Responsive tasarım
- Basit offline desteği
- Türkçe arayüz
- Kullanıcı dostu UI
- Hata mesajları

### 2.4. Geliştirilebilirlik

- Modüler kod yapısı
- Dokümante API
- Birim testleri
- Local backup sistemi

## 3. Kullanıcı Hikayeleri

### 3.1. Vatandaş Perspektifi

1. "Yoldaki çukuru rapor etmek istiyorum"

   - Uygulamayı açar
   - Konumu seçer
   - "Altyapı" kategorisini seçer
   - Fotoğraf ve açıklama ekler
   - Raporu gönderir

2. "Mahallemdeki sorunları görmek istiyorum"
   - Haritayı açar
   - Konumunu merkez alır
   - Kategorileri filtreler
   - Detayları inceler

### 3.2. Yetkili Perspektifi

1. "Günlük raporları yönetmek istiyorum"

   - Panele giriş yapar
   - Raporları önceliklendirir
   - Durum güncellemesi yapar

2. "Bölge analizi yapmak istiyorum"
   - İstatistik sayfasını açar
   - Filtreleri uygular
   - Verileri inceler

## 4. İş Akışları

### 4.1. Sorun Raporlama Akışı

1. Vatandaş sorunu tespit eder
2. Rapor oluşturur
3. Sistem kategorize eder
4. Yetkiliye bildirim gider
5. Rapor "İnceleniyor" olur
6. Çözüm üretilir
7. Rapor "Çözüldü" olarak işaretlenir
8. Vatandaşa bildirim gider

### 4.2. Acil Durum Akışı

1. Acil durum işaretlenir
2. Öncelik yükseltilir
3. Yetkililere bildirim gider
4. Hızlı müdahale süreci başlar
5. Durum güncellemeleri yapılır

## 5. Harita Özellikleri

### 5.1. Harita Katmanları

- Temel harita
- Sorun noktaları
- İdari sınırlar
- Basit ısı haritası

### 5.2. Lokasyon Servisleri

- Adres arama
- Basit rota gösterimi
- Bölge seçimi
- Yakınlık hesaplama

### 5.3. Görselleştirme

- Marker clustering
- Kategori ikonları
- Yoğunluk gösterimi
- Basit filtreler

## 6. Teknik Gereksinimler

### 6.1. Development Ortamı

- VS Code
- Docker Desktop
- Node.js v18+
- pnpm
- Git

### 6.2. API Gereksinimleri

- RESTful endpoints
- JWT auth
- OpenAPI/Swagger docs
- Rate limiting

Bu doküman, KentNabız projesinin temel gereksinimlerini ve iş süreçlerini tek geliştirici perspektifiyle tanımlamaktadır. Geliştirme sürecinde bu doküman referans alınarak ilerlenmeli ve gerektiğinde güncellenmelidir.
