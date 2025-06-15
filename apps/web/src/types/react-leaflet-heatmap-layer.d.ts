declare module 'react-leaflet-heatmap-layer-v3' {
  import { LayerProps } from 'react-leaflet';

  interface HeatmapLayerProps extends LayerProps {
    points: [number, number, number][]; // [lat, lng, intensity]
    radius?: number;
    blur?: number;
    maxZoom?: number;
    max?: number;
    minOpacity?: number;
    gradient?: Record<number, string>;
  }

  export default function HeatmapLayer(props: HeatmapLayerProps): JSX.Element;
}
