/**
 * Haversine formula kullanarak iki koordinat arasındaki mesafeyi hesaplar
 * @param lat1 İlk nokta enlem
 * @param lon1 İlk nokta boylam
 * @param lat2 İkinci nokta enlem
 * @param lon2 İkinci nokta boylam
 * @returns Kilometre cinsinden mesafe
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Dünya yarıçapı (kilometre)
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Derece cinsinden açıyı radyana çevirir
 * @param degrees Derece cinsinden açı
 * @returns Radyan cinsinden açı
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Kullanıcı konumu ve rapor konumu arasındaki mesafeyi hesaplar
 * @param userLocation Kullanıcı konumu {lat, lng}
 * @param reportLocation Rapor konumu {latitude, longitude}
 * @returns Kilometre cinsinden mesafe
 */
export function calculateReportDistance(
  userLocation: { lat: number; lng: number },
  reportLocation: { latitude: number; longitude: number }
): number {
  return calculateDistance(
    userLocation.lat,
    userLocation.lng,
    reportLocation.latitude,
    reportLocation.longitude
  );
}
