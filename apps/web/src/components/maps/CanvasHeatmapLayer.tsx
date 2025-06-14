import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface HeatPoint {
  lat: number;
  lng: number;
  intensity?: number;
}

interface CanvasHeatmapLayerProps {
  points: HeatPoint[];
  radius?: number;
  blur?: number;
  maxZoom?: number;
  gradient?: Record<string, string>;
  opacity?: number;
}

// Custom Canvas-based Heatmap Layer compatible with React 19
export const CanvasHeatmapLayer: React.FC<CanvasHeatmapLayerProps> = ({
  points,
  radius = 25,
  blur = 15,
  maxZoom = 18,
  gradient = {
    0.4: 'blue',
    0.6: 'cyan',
    0.7: 'lime',
    0.8: 'yellow',
    1.0: 'red',
  },
  opacity = 0.6,
}) => {
  const map = useMap();
  const canvasLayerRef = useRef<L.GridLayer | null>(null);

  useEffect(() => {
    if (!map || !points.length) return;

    // Create custom GridLayer for canvas-based heatmap
    const HeatmapGridLayer = L.GridLayer.extend({
      createTile: function (
        coords: L.Coords,
        done: (error: Error | null, tile: HTMLElement) => void
      ) {
        const tile = document.createElement('canvas');
        const ctx = tile.getContext('2d');
        const size = this.getTileSize();

        tile.width = size.x;
        tile.height = size.y;

        if (!ctx) {
          done(new Error('Canvas context not available'), tile);
          return tile;
        }

        // Calculate tile bounds
        const nwPoint = coords.multiplyBy(256);
        const sePoint = nwPoint.add([256, 256]);
        const nw = map.unproject(nwPoint, coords.z);
        const se = map.unproject(sePoint, coords.z);

        // Filter points within tile bounds
        const tilePoints = points.filter(
          point =>
            point.lat >= se.lat &&
            point.lat <= nw.lat &&
            point.lng >= nw.lng &&
            point.lng <= se.lng
        );

        if (tilePoints.length === 0) {
          done(null, tile);
          return tile;
        }

        // Create intensity map
        const intensityData = new Array(size.x * size.y).fill(0);

        tilePoints.forEach(point => {
          const pixelPoint = map.project([point.lat, point.lng], coords.z);
          const tilePixelPoint = pixelPoint.subtract(nwPoint);

          const x = Math.round(tilePixelPoint.x);
          const y = Math.round(tilePixelPoint.y);
          const intensity = point.intensity || 1;

          // Apply heat around the point
          for (let i = -radius; i <= radius; i++) {
            for (let j = -radius; j <= radius; j++) {
              const px = x + i;
              const py = y + j;

              if (px >= 0 && px < size.x && py >= 0 && py < size.y) {
                const distance = Math.sqrt(i * i + j * j);
                if (distance <= radius) {
                  const weight = Math.max(0, 1 - distance / radius);
                  const index = py * size.x + px;
                  intensityData[index] += intensity * weight;
                }
              }
            }
          }
        });

        // Find max intensity for normalization
        const maxIntensity = Math.max(...intensityData);
        if (maxIntensity === 0) {
          done(null, tile);
          return tile;
        }

        // Create color gradient
        const gradientStops = Object.keys(gradient)
          .map(Number)
          .sort((a, b) => a - b);

        // Draw heatmap
        const imageData = ctx.createImageData(size.x, size.y);

        for (let i = 0; i < intensityData.length; i++) {
          const normalizedIntensity = intensityData[i] / maxIntensity;

          if (normalizedIntensity > 0) {
            // Apply blur effect
            const blurredIntensity = Math.min(
              1,
              normalizedIntensity * (1 + blur / 10)
            );

            // Get color from gradient
            let color = 'rgba(0,0,0,0)';
            for (let j = 0; j < gradientStops.length - 1; j++) {
              if (
                blurredIntensity >= gradientStops[j] &&
                blurredIntensity <= gradientStops[j + 1]
              ) {
                color = gradient[gradientStops[j + 1]];
                break;
              }
            }

            // Convert color to RGBA
            const canvas = document.createElement('canvas');
            const tempCtx = canvas.getContext('2d');
            if (tempCtx) {
              tempCtx.fillStyle = color;
              tempCtx.fillRect(0, 0, 1, 1);
              const colorData = tempCtx.getImageData(0, 0, 1, 1).data;

              const pixelIndex = i * 4;
              imageData.data[pixelIndex] = colorData[0]; // R
              imageData.data[pixelIndex + 1] = colorData[1]; // G
              imageData.data[pixelIndex + 2] = colorData[2]; // B
              imageData.data[pixelIndex + 3] = Math.round(
                blurredIntensity * opacity * 255
              ); // A
            }
          }
        }

        ctx.putImageData(imageData, 0, 0);

        done(null, tile);
        return tile;
      },
    }); // Create and add the heatmap layer
    const heatmapLayer = new HeatmapGridLayer();
    heatmapLayer.setOpacity(opacity);

    map.addLayer(heatmapLayer);
    canvasLayerRef.current = heatmapLayer;

    // Cleanup function
    return () => {
      if (canvasLayerRef.current) {
        map.removeLayer(canvasLayerRef.current);
        canvasLayerRef.current = null;
      }
    };
  }, [map, points, radius, blur, maxZoom, gradient, opacity]);

  // Update layer when zoom level changes
  useEffect(() => {
    if (!map || !canvasLayerRef.current) return;

    const handleZoomEnd = () => {
      if (canvasLayerRef.current && map.getZoom() > maxZoom) {
        map.removeLayer(canvasLayerRef.current);
      } else if (
        canvasLayerRef.current &&
        map.hasLayer(canvasLayerRef.current) === false &&
        map.getZoom() <= maxZoom
      ) {
        map.addLayer(canvasLayerRef.current);
      }
    };

    map.on('zoomend', handleZoomEnd);

    return () => {
      map.off('zoomend', handleZoomEnd);
    };
  }, [map, maxZoom]);

  return null;
};

export default CanvasHeatmapLayer;
