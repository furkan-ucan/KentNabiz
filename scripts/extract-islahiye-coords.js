/**
 * İslahiye GeoJSON'undan gerçekçi koordinatları çıkaran script
 */

const fs = require('fs');
const path = require('path');

// GeoJSON dosyasını oku
const geoJsonPath = path.join(
  __dirname,
  '../apps/web/src/assets/lottie/islahiye_neighborhoods.geojson'
);
const geoJson = JSON.parse(fs.readFileSync(geoJsonPath, 'utf8'));

console.log('🌍 İslahiye Mahalle Analizi');
console.log('='.repeat(50));

// İslahiye'nin genel bounding box'ını hesapla
let minLat = Infinity,
  maxLat = -Infinity;
let minLng = Infinity,
  maxLng = -Infinity;

const islahiyeCoords = [];

geoJson.features.forEach(feature => {
  const name = feature.properties?.name || 'Bilinmeyen';
  console.log(`🏘️  İşleniyor: ${name}`);

  if (feature.geometry && feature.geometry.type === 'Polygon' && feature.geometry.coordinates) {
    const coords = feature.geometry.coordinates[0]; // Polygon'un dış çemberi

    if (coords && coords.length > 0) {
      coords.forEach(coord => {
        if (Array.isArray(coord) && coord.length >= 2) {
          const [lng, lat] = coord;

          // Koordinat geçerliliği kontrolü (Türkiye/Gaziantep bölgesi)
          if (
            typeof lng === 'number' &&
            typeof lat === 'number' &&
            lng > 35 &&
            lng < 45 &&
            lat > 35 &&
            lat < 42
          ) {
            minLat = Math.min(minLat, lat);
            maxLat = Math.max(maxLat, lat);
            minLng = Math.min(minLng, lng);
            maxLng = Math.max(maxLng, lng);

            islahiyeCoords.push({ lat, lng, neighborhood: name });
          }
        }
      });
    }
  } else if (feature.geometry && feature.geometry.type === 'Point') {
    // Point geometry için
    const [lng, lat] = feature.geometry.coordinates;
    if (
      typeof lng === 'number' &&
      typeof lat === 'number' &&
      lng > 35 &&
      lng < 45 &&
      lat > 35 &&
      lat < 42
    ) {
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);

      islahiyeCoords.push({ lat, lng, neighborhood: name });
    }
  }
});

console.log(`📍 Toplam koordinat sayısı: ${islahiyeCoords.length}`);

if (islahiyeCoords.length === 0) {
  console.log('❌ Hiç geçerli koordinat bulunamadı! GeoJSON formatını kontrol edin.');
  process.exit(1);
}
console.log(`🗺️  Bounding Box:`);
console.log(`   Kuzey-Güney: ${minLat.toFixed(6)} - ${maxLat.toFixed(6)}`);
console.log(`   Doğu-Batı: ${minLng.toFixed(6)} - ${maxLng.toFixed(6)}`);

// Merkez nokta
const centerLat = (minLat + maxLat) / 2;
const centerLng = (minLng + maxLng) / 2;

console.log(`🎯 İslahiye Merkezi: [${centerLng.toFixed(6)}, ${centerLat.toFixed(6)}]`);

// Her mahalleden 2-3 koordinat seç
const neighborhoodSamples = {};
islahiyeCoords.forEach(coord => {
  if (!neighborhoodSamples[coord.neighborhood]) {
    neighborhoodSamples[coord.neighborhood] = [];
  }
  if (neighborhoodSamples[coord.neighborhood].length < 3) {
    neighborhoodSamples[coord.neighborhood].push([coord.lng, coord.lat]);
  }
});

// Rastgele 20-30 koordinat seç (reports.seed.ts için)
const selectedCoords = [];

// Önce merkez koordinatı ekle
selectedCoords.push([centerLng, centerLat]);

// Her mahalleden en az 1 koordinat
Object.keys(neighborhoodSamples).forEach(neighborhood => {
  if (neighborhoodSamples[neighborhood].length > 0) {
    selectedCoords.push(neighborhoodSamples[neighborhood][0]);
  }
});

// Eksik kalan sayıyı rastgele doldur
while (selectedCoords.length < 25 && islahiyeCoords.length > 0) {
  const randomIndex = Math.floor(Math.random() * islahiyeCoords.length);
  const coord = islahiyeCoords[randomIndex];
  const coordArray = [coord.lng, coord.lat];

  // Duplicate check
  if (
    !selectedCoords.some(
      existing =>
        Math.abs(existing[0] - coordArray[0]) < 0.0001 &&
        Math.abs(existing[1] - coordArray[1]) < 0.0001
    )
  ) {
    selectedCoords.push(coordArray);
  }
}

console.log('\n🎲 Seçilen Koordinatlar (reports.seed.ts için):');
console.log('const ISLAHIYE_LOCATIONS = [');
selectedCoords.forEach((coord, index) => {
  console.log(
    `  { coords: [${coord[0].toFixed(6)}, ${coord[1].toFixed(6)}], area: "İslahiye-${index + 1}" },`
  );
});
console.log('];');

console.log(
  '\n✅ Bu koordinatları reports.seed.ts dosyasındaki REALISTIC_LOCATIONS dizisinin yerine kopyalayın.'
);

// Dosyaya da yaz
const outputPath = path.join(__dirname, '../islahiye-coordinates.json');
fs.writeFileSync(
  outputPath,
  JSON.stringify(
    {
      boundingBox: { minLat, maxLat, minLng, maxLng },
      center: [centerLng, centerLat],
      selectedCoordinates: selectedCoords,
      neighborhoodSamples,
    },
    null,
    2
  )
);

console.log(`\n💾 Koordinatlar ${outputPath} dosyasına kaydedildi.`);
