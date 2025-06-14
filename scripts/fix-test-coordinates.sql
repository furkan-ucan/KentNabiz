-- Test verilerindeki koordinatları Türkiye'deki gerçek lokasyonlara güncelle

-- Rapor ID 5: İstanbul - Beşiktaş (Dolmabahçe yakını)
UPDATE reports
SET location = ST_GeomFromText('POINT(29.0028 41.0391)', 4326)
WHERE id = 5;

-- Rapor ID 6: Ankara - Çankaya (Kızılay yakını)
UPDATE reports
SET location = ST_GeomFromText('POINT(32.8597 39.9208)', 4326)
WHERE id = 6;

-- Koordinatları kontrol et
SELECT
    id,
    title,
    ST_X(location) as longitude,
    ST_Y(location) as latitude,
    address
FROM reports
WHERE id IN (5, 6);
