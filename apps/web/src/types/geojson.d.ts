// Type declaration for GeoJSON files
declare module '*.geojson' {
  import { FeatureCollection } from 'geojson';
  const value: FeatureCollection;
  export default value;
}
