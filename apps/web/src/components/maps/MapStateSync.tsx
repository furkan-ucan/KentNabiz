import { useEffect, useRef } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import { useSearchParams } from 'react-router-dom';
import { debounce } from 'lodash';

interface MapStateSyncProps {
  defaultCenter?: [number, number];
  defaultZoom?: number;
}

export const MapStateSync: React.FC<MapStateSyncProps> = ({
  defaultCenter = [37.025638, 36.631124], // İslahiye center
  defaultZoom = 9,
}) => {
  const map = useMap();
  const [searchParams, setSearchParams] = useSearchParams();
  const isInitialized = useRef(false);

  // Debounced URL update function
  const updateURL = useRef(
    debounce((lat: number, lng: number, zoom: number) => {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('lat', lat.toFixed(6));
      newParams.set('lng', lng.toFixed(6));
      newParams.set('zoom', zoom.toString());
      setSearchParams(newParams, { replace: true });
    }, 500)
  ).current;

  // Initialize map position from URL
  useEffect(() => {
    if (isInitialized.current) return;

    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const zoom = searchParams.get('zoom');

    if (lat && lng && zoom) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      const zoomNum = parseInt(zoom, 10);

      if (!isNaN(latNum) && !isNaN(lngNum) && !isNaN(zoomNum)) {
        map.setView([latNum, lngNum], zoomNum);
      }
    } else {
      map.setView(defaultCenter, defaultZoom);
    }

    isInitialized.current = true;
  }, [map, searchParams, defaultCenter, defaultZoom]);

  // Listen to map events
  useMapEvents({
    moveend: () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      updateURL(center.lat, center.lng, zoom);
    },
    zoomend: () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      updateURL(center.lat, center.lng, zoom);
    },
  });

  return null;
};

export default MapStateSync;
