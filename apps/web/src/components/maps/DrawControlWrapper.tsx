import React, { useRef, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';

interface DrawControlWrapperProps {
  onBboxCreate: (bbox: string) => void;
  onBboxClear: () => void;
}

interface DrawEvent {
  layer: L.Layer & { getBounds?: () => L.LatLngBounds };
}

interface EditEvent {
  layers: {
    eachLayer: (
      fn: (layer: L.Layer & { getBounds?: () => L.LatLngBounds }) => void
    ) => void;
  };
}

export const DrawControlWrapper: React.FC<DrawControlWrapperProps> = ({
  onBboxCreate,
  onBboxClear,
}) => {
  const map = useMap();
  const drawnItemsRef = useRef<L.FeatureGroup>(new L.FeatureGroup());
  const drawControlRef = useRef<L.Control.Draw | null>(null);

  useEffect(() => {
    const drawnItems = drawnItemsRef.current;
    map.addLayer(drawnItems);

    // Draw control options
    const drawControl = new L.Control.Draw({
      position: 'topleft',
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
          drawError: {
            color: '#e1e100',
            message: '<strong>Hata!</strong> Şekil kendini kesemez!',
          },
          shapeOptions: {
            color: '#1976d2',
            weight: 3,
            opacity: 0.8,
            fillOpacity: 0.2,
          },
        },
        rectangle: {
          shapeOptions: {
            color: '#1976d2',
            weight: 3,
            opacity: 0.8,
            fillOpacity: 0.2,
          },
        },
        circle: false,
        circlemarker: false,
        marker: false,
        polyline: false,
      },
      edit: {
        featureGroup: drawnItems,
        remove: true,
      },
    });

    drawControlRef.current = drawControl;
    map.addControl(drawControl); // Event handlers
    const onCreated = (e: DrawEvent) => {
      const layer = e.layer;
      drawnItems.addLayer(layer);

      // Calculate bounding box
      if (layer.getBounds) {
        const bounds = layer.getBounds();
        const bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
        onBboxCreate(bbox);
      }
    };

    const onDeleted = () => {
      onBboxClear();
    };

    const onEdited = (e: EditEvent) => {
      const layers = e.layers;
      let bbox = '';

      layers.eachLayer(
        (layer: L.Layer & { getBounds?: () => L.LatLngBounds }) => {
          if (layer.getBounds) {
            const bounds = layer.getBounds();
            bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
          }
        }
      );

      if (bbox) {
        onBboxCreate(bbox);
      }
    }; // Add event listeners
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map.on('draw:created', onCreated as any);
    map.on('draw:deleted', onDeleted);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map.on('draw:edited', onEdited as any);

    // Cleanup
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.off('draw:created', onCreated as any);
      map.off('draw:deleted', onDeleted);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.off('draw:edited', onEdited as any);

      if (drawControlRef.current) {
        map.removeControl(drawControlRef.current);
      }
      map.removeLayer(drawnItems);
    };
  }, [map, onBboxCreate, onBboxClear]);

  return null;
};

export default DrawControlWrapper;
