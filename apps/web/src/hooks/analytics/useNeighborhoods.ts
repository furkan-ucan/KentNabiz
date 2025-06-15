// apps/web/src/hooks/analytics/useNeighborhoods.ts
import { useQuery } from '@tanstack/react-query';

export interface NeighborhoodFeature {
  type: 'Feature';
  properties: {
    name: string;
    population?: number;
    area?: number;
  };
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

export interface NeighborhoodCollection {
  type: 'FeatureCollection';
  features: NeighborhoodFeature[];
}

const fetchNeighborhoods = async (): Promise<NeighborhoodCollection> => {
  const response = await fetch('/geojson/islahiye-neighborhoods.geojson');
  if (!response.ok) {
    throw new Error('Mahalle verileri yüklenemedi.');
  }
  return await response.json();
};

export const useNeighborhoods = () => {
  return useQuery({
    queryKey: ['geojson', 'islahiye-neighborhoods'],
    queryFn: fetchNeighborhoods,
    staleTime: Infinity, // Bu veri değişmeyeceği için cache'i hiç eskitme
    gcTime: Infinity, // React Query v5'te cacheTime -> gcTime
    retry: 3,
    retryDelay: 1000,
  });
};
