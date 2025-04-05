import { Injectable } from '@nestjs/common';
import { Point } from 'geojson';
import { LocationDto } from '../dto/location.dto';

// Define a safer typed Point interface
interface SafePoint extends Point {
  coordinates: [number, number];
}

// Define an interface for validating structure first
interface GeoJSONLikeObject {
  type: string;
  coordinates: unknown[];
}

/**
 * Type guard to check if an object has the basic GeoJSON Point structure
 * This first validates the object has the right properties before accessing them
 */
function hasGeoJSONStructure(point: unknown): point is GeoJSONLikeObject {
  return typeof point === 'object' && point !== null && 'type' in point && 'coordinates' in point;
}

/**
 * More specific type guard for validating a complete Point object
 */
function isValidPoint(point: unknown): point is { type: string; coordinates: number[] } {
  if (!hasGeoJSONStructure(point)) {
    return false;
  }

  // Now it's safe to access these properties
  return typeof point.type === 'string' && Array.isArray(point.coordinates);
}

@Injectable()
export class LocationService {
  /**
   * Creates a GeoJSON Point from latitude and longitude
   */
  createPoint(latitude: number, longitude: number): SafePoint {
    return {
      type: 'Point',
      coordinates: [longitude, latitude],
    };
  }

  /**
   * Creates a GeoJSON Point from LocationDto
   */
  createPointFromDto(locationDto: LocationDto): SafePoint {
    if (!locationDto) {
      throw new Error('Location data is required');
    }

    return {
      type: 'Point',
      coordinates: [locationDto.longitude, locationDto.latitude],
    };
  }

  /**
   * Calculates the distance between two points in meters
   * Uses the Haversine formula
   */
  calculateDistance(point1: SafePoint, point2: SafePoint): number {
    // No need to validate if we're using SafePoint
    const [lon1, lat1] = point1.coordinates;
    const [lon2, lat2] = point2.coordinates;

    // Earth's radius in meters
    const R = 6371e3;

    // Convert latitude and longitude from degrees to radians
    const φ1 = this.toRadians(lat1);
    const φ2 = this.toRadians(lat2);
    const Δφ = this.toRadians(lat2 - lat1);
    const Δλ = this.toRadians(lon2 - lon1);

    // Calculate haversine formula
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Return distance in meters
    return R * c;
  }

  /**
   * Extracts latitude and longitude from a GeoJSON Point
   */
  extractCoordinates(point: SafePoint): { latitude: number; longitude: number } {
    const [longitude, latitude] = point.coordinates;
    return { latitude, longitude };
  }

  /**
   * Gets a bounding box around a point with the given radius in meters
   * Useful for preliminary filtering before more precise distance calculations
   */
  getBoundingBox(
    latitude: number,
    longitude: number,
    radiusInMeters: number
  ): {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  } {
    // Earth's radius in meters
    const R = 6371e3;

    // Convert radius from meters to degrees (approximate)
    const radLat = (radiusInMeters / R) * (180 / Math.PI);
    const radLon = (radiusInMeters / (R * Math.cos((latitude * Math.PI) / 180))) * (180 / Math.PI);

    return {
      minLat: latitude - radLat,
      maxLat: latitude + radLat,
      minLon: longitude - radLon,
      maxLon: longitude + radLon,
    };
  }

  /**
   * Safely casts a Point to SafePoint
   * Validates that the point is a valid GeoJSON Point first
   * Throws an error if the point is invalid
   */
  castToSafePoint(point: unknown): SafePoint {
    if (!point) {
      throw new Error('Point is required');
    }

    // Check basic structure first
    if (!hasGeoJSONStructure(point)) {
      throw new Error('Invalid GeoJSON object structure');
    }

    // Validate GeoJSON specifics with more detailed checking
    if (!isValidPoint(point)) {
      throw new Error('Invalid GeoJSON format: requires string type and array coordinates');
    }

    // Now we can safely check the point type
    if (point.type !== 'Point') {
      throw new Error('Invalid GeoJSON type. Expected "Point"');
    }

    if (point.coordinates.length !== 2) {
      throw new Error('Invalid coordinates. Expected [longitude, latitude]');
    }

    // At this point we know it's a valid Point
    return {
      type: 'Point',
      coordinates: point.coordinates as [number, number],
    };
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
