// apps/web/src/hooks/analytics/useAnalyticsFilters.ts
import { useSearchParams } from 'react-router-dom';
import { useMemo, useCallback } from 'react';

export interface AnalyticsFilters {
  startDate: string | null;
  endDate: string | null;
  departmentId: string | null;
  categoryId: string | null;
  status: string | null;
  neighborhoodName: string | null;
  bbox?: string | null; // Alan seçimi için
}

const DEFAULT_FILTERS: AnalyticsFilters = {
  startDate: null,
  endDate: null,
  departmentId: null,
  categoryId: null,
  status: null,
  neighborhoodName: null,
  bbox: null,
};

export const useAnalyticsFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL'den filtreleri parse et
  const filters = useMemo<AnalyticsFilters>(() => {
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const departmentId = searchParams.get('departmentId');
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status');
    const neighborhoodName = searchParams.get('neighborhoodName');
    const bbox = searchParams.get('bbox');

    return {
      startDate: startDate || DEFAULT_FILTERS.startDate,
      endDate: endDate || DEFAULT_FILTERS.endDate,
      departmentId: departmentId || DEFAULT_FILTERS.departmentId,
      categoryId: categoryId || DEFAULT_FILTERS.categoryId,
      status: status || DEFAULT_FILTERS.status,
      neighborhoodName: neighborhoodName || DEFAULT_FILTERS.neighborhoodName,
      bbox: bbox || DEFAULT_FILTERS.bbox,
    };
  }, [searchParams]);

  // Debug log for filters
  // Parse URL parameters for filters

  // Filtreleri güncelle (URL'e yaz)
  const setFilters = useCallback(
    (newFilters: Partial<AnalyticsFilters>) => {
      const updatedFilters = { ...filters, ...newFilters };

      // Yeni URLSearchParams oluştur
      const newSearchParams = new URLSearchParams();

      // Null olmayan değerleri URL'e ekle
      Object.entries(updatedFilters).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          newSearchParams.set(key, value);
        }
      });

      // URL'i güncelle (sayfa yeniden yüklenmeden)
      setSearchParams(newSearchParams, { replace: true });
    },
    [filters, setSearchParams]
  );

  // Filtreleri sıfırla
  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  // Aktif filtre sayısını hesapla
  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(
      value => value !== null && value !== ''
    ).length;
  }, [filters]);

  return {
    filters,
    setFilters,
    resetFilters,
    activeFilterCount,
  };
};
