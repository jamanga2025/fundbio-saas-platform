// GeoJSON optimization utilities for better performance
export interface GeoJSONOptimizationOptions {
  precision?: number;
  removeEmptyFields?: boolean;
  simplifyGeometry?: boolean;
  tolerance?: number;
  removeMetadata?: boolean;
  maxFeatures?: number;
}

export class GeoJSONOptimizer {
  private static readonly DEFAULT_OPTIONS: GeoJSONOptimizationOptions = {
    precision: 6,
    removeEmptyFields: true,
    simplifyGeometry: true,
    tolerance: 0.001,
    removeMetadata: false,
    maxFeatures: 10000
  };

  static optimize(geoJson: any, options: GeoJSONOptimizationOptions = {}): any {
    const config = { ...this.DEFAULT_OPTIONS, ...options };
    
    if (!geoJson || typeof geoJson !== 'object') {
      return geoJson;
    }

    // Clone the object to avoid mutating the original
    const optimized = JSON.parse(JSON.stringify(geoJson));

    // Apply optimizations
    if (config.removeEmptyFields) {
      this.removeEmptyFields(optimized);
    }

    if (config.precision !== undefined) {
      this.roundCoordinates(optimized, config.precision);
    }

    if (config.simplifyGeometry && config.tolerance) {
      this.simplifyGeometry(optimized, config.tolerance);
    }

    if (config.removeMetadata) {
      this.removeMetadata(optimized);
    }

    if (config.maxFeatures && optimized.features) {
      optimized.features = optimized.features.slice(0, config.maxFeatures);
    }

    return optimized;
  }

  private static removeEmptyFields(obj: any): void {
    if (Array.isArray(obj)) {
      obj.forEach(item => this.removeEmptyFields(item));
    } else if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        if (value === null || value === undefined || value === '') {
          delete obj[key];
        } else if (typeof value === 'object') {
          this.removeEmptyFields(value);
          // Remove empty objects and arrays
          if (Array.isArray(value) && value.length === 0) {
            delete obj[key];
          } else if (typeof value === 'object' && Object.keys(value).length === 0) {
            delete obj[key];
          }
        }
      });
    }
  }

  private static roundCoordinates(obj: any, precision: number): void {
    if (Array.isArray(obj)) {
      obj.forEach(item => this.roundCoordinates(item, precision));
    } else if (obj && typeof obj === 'object') {
      if (obj.coordinates) {
        obj.coordinates = this.roundCoordinatesArray(obj.coordinates, precision);
      } else {
        Object.values(obj).forEach(value => this.roundCoordinates(value, precision));
      }
    }
  }

  private static roundCoordinatesArray(coords: any, precision: number): any {
    if (typeof coords[0] === 'number') {
      // This is a coordinate pair [lng, lat]
      return coords.map((coord: number) => Math.round(coord * Math.pow(10, precision)) / Math.pow(10, precision));
    } else if (Array.isArray(coords[0])) {
      // This is an array of coordinates
      return coords.map((coord: any) => this.roundCoordinatesArray(coord, precision));
    }
    return coords;
  }

  private static simplifyGeometry(obj: any, tolerance: number): void {
    if (Array.isArray(obj)) {
      obj.forEach(item => this.simplifyGeometry(item, tolerance));
    } else if (obj && typeof obj === 'object') {
      if (obj.geometry && obj.geometry.coordinates) {
        obj.geometry.coordinates = this.simplifyCoordinates(obj.geometry.coordinates, tolerance);
      } else {
        Object.values(obj).forEach(value => this.simplifyGeometry(value, tolerance));
      }
    }
  }

  private static simplifyCoordinates(coords: any, tolerance: number): any {
    if (typeof coords[0] === 'number') {
      return coords;
    } else if (Array.isArray(coords[0])) {
      if (coords.length > 2) {
        return this.douglasPeucker(coords, tolerance);
      }
      return coords.map((coord: any) => this.simplifyCoordinates(coord, tolerance));
    }
    return coords;
  }

  private static douglasPeucker(points: number[][], tolerance: number): number[][] {
    if (points.length <= 2) return points;

    const first = points[0];
    const last = points[points.length - 1];
    
    let maxDistance = 0;
    let maxIndex = 0;

    for (let i = 1; i < points.length - 1; i++) {
      const distance = this.perpendicularDistance(points[i], first, last);
      if (distance > maxDistance) {
        maxDistance = distance;
        maxIndex = i;
      }
    }

    if (maxDistance > tolerance) {
      const left = this.douglasPeucker(points.slice(0, maxIndex + 1), tolerance);
      const right = this.douglasPeucker(points.slice(maxIndex), tolerance);
      return [...left.slice(0, -1), ...right];
    }

    return [first, last];
  }

  private static perpendicularDistance(point: number[], lineStart: number[], lineEnd: number[]): number {
    const [x0, y0] = point;
    const [x1, y1] = lineStart;
    const [x2, y2] = lineEnd;

    const A = x0 - x1;
    const B = y0 - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;

    if (lenSq === 0) {
      return Math.sqrt(A * A + B * B);
    }

    const param = dot / lenSq;
    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = x0 - xx;
    const dy = y0 - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private static removeMetadata(obj: any): void {
    if (Array.isArray(obj)) {
      obj.forEach(item => this.removeMetadata(item));
    } else if (obj && typeof obj === 'object') {
      // Remove common metadata fields
      const metadataFields = ['crs', 'bbox', 'name', 'description', 'author', 'created', 'modified'];
      metadataFields.forEach(field => {
        if (obj[field]) {
          delete obj[field];
        }
      });

      // Process properties
      if (obj.properties && typeof obj.properties === 'object') {
        const nonEssentialProps = ['stroke', 'stroke-width', 'fill', 'fill-opacity', 'marker-color', 'marker-size', 'marker-symbol'];
        nonEssentialProps.forEach(prop => {
          if (obj.properties[prop]) {
            delete obj.properties[prop];
          }
        });
      }

      Object.values(obj).forEach(value => this.removeMetadata(value));
    }
  }

  static getOptimizationStats(original: any, optimized: any): {
    originalSize: number;
    optimizedSize: number;
    compressionRatio: number;
    sizeSavings: number;
  } {
    const originalSize = JSON.stringify(original).length;
    const optimizedSize = JSON.stringify(optimized).length;
    const compressionRatio = optimizedSize / originalSize;
    const sizeSavings = originalSize - optimizedSize;

    return {
      originalSize,
      optimizedSize,
      compressionRatio,
      sizeSavings
    };
  }

  static async compressGeoJSON(geoJson: any, options: GeoJSONOptimizationOptions = {}): Promise<string> {
    const optimized = this.optimize(geoJson, options);
    const jsonString = JSON.stringify(optimized);
    
    // Use compression if available
    if ('CompressionStream' in window) {
      const stream = new CompressionStream('gzip');
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();
      
      writer.write(new TextEncoder().encode(jsonString));
      writer.close();
      
      const chunks = [];
      let done = false;
      
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          chunks.push(value);
        }
      }
      
      const compressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
      let offset = 0;
      for (const chunk of chunks) {
        compressed.set(chunk, offset);
        offset += chunk.length;
      }
      
      return btoa(String.fromCharCode.apply(null, Array.from(compressed)));
    }
    
    return jsonString;
  }

  static async decompressGeoJSON(compressed: string): Promise<any> {
    try {
      // Try to decompress if it's compressed
      if ('DecompressionStream' in window) {
        const compressedData = Uint8Array.from(atob(compressed), c => c.charCodeAt(0));
        const stream = new DecompressionStream('gzip');
        const writer = stream.writable.getWriter();
        const reader = stream.readable.getReader();
        
        writer.write(compressedData);
        writer.close();
        
        const chunks = [];
        let done = false;
        
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            chunks.push(value);
          }
        }
        
        const decompressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
        let offset = 0;
        for (const chunk of chunks) {
          decompressed.set(chunk, offset);
          offset += chunk.length;
        }
        
        const jsonString = new TextDecoder().decode(decompressed);
        return JSON.parse(jsonString);
      }
      
      // Fallback to direct JSON parsing
      return JSON.parse(compressed);
    } catch (error) {
      console.error('Error decompressing GeoJSON:', error);
      throw error;
    }
  }
}

import { useState, useEffect } from 'react';

// Hook for optimizing GeoJSON data
export const useOptimizedGeoJSON = (geoJson: any, options: GeoJSONOptimizationOptions = {}) => {
  const [optimized, setOptimized] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!geoJson) return;

    setLoading(true);
    
    try {
      const optimizedData = GeoJSONOptimizer.optimize(geoJson, options);
      const optimizationStats = GeoJSONOptimizer.getOptimizationStats(geoJson, optimizedData);
      
      setOptimized(optimizedData);
      setStats(optimizationStats);
    } catch (error) {
      console.error('Error optimizing GeoJSON:', error);
      setOptimized(geoJson); // Fallback to original
    } finally {
      setLoading(false);
    }
  }, [geoJson, options]);

  return { optimized, loading, stats };
};

// Helper function for dynamic imports
export const loadGeoJSONOptimizer = async () => {
  const { GeoJSONOptimizer } = await import('./geoJsonOptimizer');
  return GeoJSONOptimizer;
};