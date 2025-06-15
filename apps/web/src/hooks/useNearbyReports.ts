import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { SharedReport, ReportStatus } from '@kentnabiz/shared';

interface NearbyReportsResponse {
  data: SharedReport[];
  total: number;
  page: number;
  limit: number;
}

interface NearbyReportsFilters {
  latitude: number;
  longitude: number;
  radius?: number; // metres, default 1000
  status?: ReportStatus[] | ReportStatus;
  page?: number;
  limit?: number;
}

/**
 * Belirtilen konuma yakın raporları getiren hook.
 * Kullanıcının mevcut konumuna göre yakındaki raporları getirir.
 * @param filters - Konum ve diğer filtreleme kriterleri
 */
export const useNearbyReports = (filters: NearbyReportsFilters) => {
  return useQuery<NearbyReportsResponse, Error>({
    queryKey: ['nearbyReports', filters],
    queryFn: async () => {
      try {
        // API parametrelerini hazırla
        const params: Record<string, string | number> = {
          latitude: filters.latitude,
          longitude: filters.longitude,
          radius: filters.radius || 1000,
          page: filters.page || 1,
          limit: filters.limit || 10,
        };

        // Status filtreleme
        if (filters.status) {
          if (Array.isArray(filters.status)) {
            // Birden fazla status varsa array olarak gönder
            params.status = filters.status.join(',');
          } else {
            // Tek status varsa string olarak gönder
            params.status = filters.status;
          }
        }

        // Query string oluştur
        const queryString = new URLSearchParams(
          Object.entries(params).map(([key, value]) => [key, value.toString()])
        ).toString();

        const response = await api.get(`/reports/nearby?${queryString}`);
        return response.data;
      } catch (error) {
        console.error('Nearby reports fetch error:', error);
        throw error;
      }
    },
    enabled: !!(filters.latitude && filters.longitude), // Konum bilgisi olmadan çalışmaz
    staleTime: 2 * 60 * 1000, // 2 dakika
    gcTime: 5 * 60 * 1000, // 5 dakika (eski cacheTime)
  });
};

/**
 * Kullanıcının mevcut konumunu alıp yakındaki raporları getiren hook.
 * Otomatik konum tespiti yapar.
 */
export const useMyLocationNearbyReports = (options?: {
  radius?: number;
  status?: ReportStatus[] | ReportStatus;
  page?: number;
  limit?: number;
}) => {
  // Konum için state
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Konum al
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Tarayıcınız konum servisini desteklemiyor.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationError(null);
      },
      error => {
        let errorMessage = 'Konum alınırken bir hata oluştu.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              'Konum izni reddedildi. Lütfen tarayıcı ayarlarınızdan konum erişimine izin verin.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Konum bilgisi mevcut değil.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Konum alınırken zaman aşımı oluştu.';
            break;
        }
        setLocationError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 dakika
      }
    );
  }, []);

  // Nearby reports hook'u
  const nearbyReportsQuery = useNearbyReports({
    latitude: location?.latitude ?? 0,
    longitude: location?.longitude ?? 0,
    radius: options?.radius,
    status: options?.status,
    page: options?.page,
    limit: options?.limit,
  });

  return {
    ...nearbyReportsQuery,
    location,
    locationError,
    isLocationLoading: !location && !locationError,
  };
};
