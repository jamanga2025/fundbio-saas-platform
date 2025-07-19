"use client";

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface OptimizedGeoJSONProps {
  data: any;
  style?: any;
  interactive?: boolean;
  onPerformanceMetric?: (metric: string, value: number) => void;
  simplificationTolerance?: number;
  maxFeatures?: number;
}

// GeoJSON optimization utilities
class GeoJSONOptimizer {
  // Simplify geometry using Douglas-Peucker algorithm
  static simplifyGeometry(geometry: any, tolerance: number = 0.001): any {
    if (!geometry || !geometry.coordinates) return geometry;

    const simplifyCoordinates = (coords: number[][], tolerance: number): number[][] => {
      if (coords.length <= 2) return coords;
      
      // Douglas-Peucker implementation
      const simplify = (points: number[][], tolerance: number): number[][] => {
        if (points.length <= 2) return points;
        
        let maxDistance = 0;
        let maxIndex = 0;
        const start = points[0];
        const end = points[points.length - 1];
        
        for (let i = 1; i < points.length - 1; i++) {
          const distance = this.perpendicularDistance(points[i], start, end);
          if (distance > maxDistance) {
            maxDistance = distance;
            maxIndex = i;
          }
        }
        
        if (maxDistance > tolerance) {
          const left = simplify(points.slice(0, maxIndex + 1), tolerance);
          const right = simplify(points.slice(maxIndex), tolerance);
          return [...left.slice(0, -1), ...right];
        } else {
          return [start, end];
        }
      };
      
      return simplify(coords, tolerance);
    };

    switch (geometry.type) {
      case 'LineString':
        return {
          ...geometry,
          coordinates: simplifyCoordinates(geometry.coordinates, tolerance)
        };
      case 'Polygon':
        return {
          ...geometry,
          coordinates: geometry.coordinates.map((ring: number[][]) => 
            simplifyCoordinates(ring, tolerance)
          )
        };
      case 'MultiPolygon':
        return {
          ...geometry,
          coordinates: geometry.coordinates.map((polygon: number[][][]) =>
            polygon.map((ring: number[][]) => simplifyCoordinates(ring, tolerance))
          )
        };
      default:
        return geometry;
    }
  }

  // Calculate perpendicular distance from point to line
  private static perpendicularDistance(point: number[], lineStart: number[], lineEnd: number[]): number {
    const [x, y] = point;
    const [x1, y1] = lineStart;
    const [x2, y2] = lineEnd;
    
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    
    if (lenSq === 0) return Math.sqrt(A * A + B * B);
    
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
    
    const dx = x - xx;
    const dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Filter features by viewport bounds
  static filterByBounds(features: any[], bounds: L.LatLngBounds): any[] {
    return features.filter(feature => {
      if (!feature.geometry) return false;
      
      const bbox = this.getBoundingBox(feature.geometry);
      if (!bbox) return true; // Include if we can't determine bounds
      
      const featureBounds = L.latLngBounds(
        [bbox.minLat, bbox.minLng],
        [bbox.maxLat, bbox.maxLng]
      );
      
      return bounds.intersects(featureBounds);
    });
  }

  // Get bounding box of geometry
  private static getBoundingBox(geometry: any): { minLat: number, maxLat: number, minLng: number, maxLng: number } | null {
    if (!geometry || !geometry.coordinates) return null;
    
    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;
    
    const processCoordinates = (coords: any) => {
      if (typeof coords[0] === 'number') {
        // Single coordinate pair [lng, lat]
        const [lng, lat] = coords;
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
      } else if (Array.isArray(coords[0])) {
        // Array of coordinates
        coords.forEach(processCoordinates);
      }
    };
    
    processCoordinates(geometry.coordinates);
    
    if (minLat === Infinity) return null;
    
    return { minLat, maxLat, minLng, maxLng };
  }

  // Convert to vector tiles format for better performance
  static toVectorTiles(geoJSON: any, zoomLevel: number): any {
    // Simplified vector tile conversion
    // In production, use libraries like @mapbox/vector-tile
    const tileSize = 256;
    const worldSize = tileSize * Math.pow(2, zoomLevel);
    
    const convertCoordinate = (coord: number[], bounds: any) => {
      const [lng, lat] = coord;
      const x = ((lng - bounds.west) / (bounds.east - bounds.west)) * worldSize;
      const y = ((bounds.north - lat) / (bounds.north - bounds.south)) * worldSize;
      return [Math.round(x), Math.round(y)];
    };
    
    // This is a simplified implementation
    // Real vector tiles would use proper tile indexing
    return geoJSON;
  }
}

export default function OptimizedGeoJSON({
  data,
  style,
  interactive = true,
  onPerformanceMetric,
  simplificationTolerance = 0.001,
  maxFeatures = 10000
}: OptimizedGeoJSONProps) {
  const map = useMap();
  const layerRef = useRef<L.GeoJSON | null>(null);
  const processedDataRef = useRef<any>(null);
  
  // Memoize processed data to avoid recomputation
  const processedData = useMemo(() => {
    if (!data) return null;
    
    const startTime = performance.now();
    
    let features = data.features || [data];
    
    // Limit number of features for performance
    if (features.length > maxFeatures) {
      features = features.slice(0, maxFeatures);
      onPerformanceMetric?.('features_limited', maxFeatures);
    }
    
    // Simplify geometries
    const simplifiedFeatures = features.map((feature: any) => ({
      ...feature,
      geometry: GeoJSONOptimizer.simplifyGeometry(feature.geometry, simplificationTolerance)
    }));
    
    const processTime = performance.now() - startTime;
    onPerformanceMetric?.('geojson_process_time', processTime);
    onPerformanceMetric?.('features_processed', simplifiedFeatures.length);
    
    return {
      type: 'FeatureCollection',
      features: simplifiedFeatures
    };
  }, [data, simplificationTolerance, maxFeatures, onPerformanceMetric]);

  // Style function with performance optimizations
  const styleFunction = useCallback((feature: any) => {
    const baseStyle = {
      weight: 2,
      opacity: 1,
      fillOpacity: 0.7,
      ...style
    };
    
    // Dynamic styling based on zoom level
    const zoom = map.getZoom();
    if (zoom < 10) {
      baseStyle.weight = 1;
      baseStyle.fillOpacity = 0.5;
    } else if (zoom > 15) {
      baseStyle.weight = 3;
      baseStyle.fillOpacity = 0.8;
    }
    
    return baseStyle;
  }, [style, map]);

  // Feature interaction handlers
  const onEachFeature = useCallback((feature: any, layer: L.Layer) => {
    if (!interactive) return;
    
    layer.on({
      mouseover: (e) => {
        const layer = e.target;
        layer.setStyle({
          weight: 4,
          color: '#0F766E',
          fillOpacity: 0.9
        });
        onPerformanceMetric?.('feature_mouseover', 1);
      },
      mouseout: (e) => {
        if (layerRef.current) {
          layerRef.current.resetStyle(e.target);
        }
      },
      click: (e) => {
        const zoom = map.getZoom();
        if (zoom < 15) {
          map.setView(e.latlng, Math.min(zoom + 2, 18));
        }
        onPerformanceMetric?.('feature_click', 1);
      }
    });
    
    // Add popup with feature information
    if (feature.properties) {
      const props = feature.properties;
      const popupContent = `
        <div class="p-3 max-w-xs">
          <h4 class="font-semibold text-gray-900 mb-2">
            ${props.name || props.NAME || 'Área de Biodiversidad'}
          </h4>
          ${props.description ? `<p class="text-sm text-gray-600 mb-2">${props.description}</p>` : ''}
          ${props.area ? `<p class="text-sm"><strong>Área:</strong> ${props.area} hectáreas</p>` : ''}
          ${props.species_count ? `<p class="text-sm"><strong>Especies:</strong> ${props.species_count}</p>` : ''}
          ${props.conservation_status ? `<p class="text-sm"><strong>Estado:</strong> ${props.conservation_status}</p>` : ''}
        </div>
      `;
      layer.bindPopup(popupContent);
    }
  }, [interactive, map, onPerformanceMetric]);

  // Update layer when data changes
  useEffect(() => {
    if (!processedData || !map) return;
    
    const startTime = performance.now();
    
    // Remove existing layer
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }
    
    // Create new optimized layer
    const layer = L.geoJSON(processedData as any, {
      style: styleFunction,
      onEachFeature: onEachFeature,
      // Use point to layer for custom marker rendering
      pointToLayer: (feature, latlng) => {
        const marker = L.circleMarker(latlng, {
          radius: 6,
          fillColor: '#10B981',
          color: '#059669',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        });
        return marker;
      }
    });
    
    // Add to map
    layer.addTo(map);
    layerRef.current = layer;
    
    const renderTime = performance.now() - startTime;
    onPerformanceMetric?.('geojson_render_time', renderTime);
    
    // Cleanup function
    return () => {
      if (layerRef.current && map) {
        map.removeLayer(layerRef.current);
      }
    };
  }, [processedData, map, styleFunction, onEachFeature, onPerformanceMetric]);

  // Handle zoom-based layer optimization
  useEffect(() => {
    if (!map || !layerRef.current) return;
    
    const handleZoomEnd = () => {
      const zoom = map.getZoom();
      const bounds = map.getBounds();
      
      // Re-filter features based on current view
      if (processedDataRef.current) {
        const visibleFeatures = GeoJSONOptimizer.filterByBounds(
          processedDataRef.current.features,
          bounds
        );
        
        onPerformanceMetric?.('visible_features', visibleFeatures.length);
        
        // Update layer style based on zoom
        if (layerRef.current) {
          layerRef.current.eachLayer((layer) => {
            if (layer instanceof L.Path) {
              layer.setStyle(styleFunction(null));
            }
          });
        }
      }
    };
    
    map.on('zoomend', handleZoomEnd);
    return () => {
      map.off('zoomend', handleZoomEnd);
    };
  }, [map, onPerformanceMetric, styleFunction]);

  // Store processed data reference
  useEffect(() => {
    processedDataRef.current = processedData;
  }, [processedData]);

  return null; // This component doesn't render anything directly
}