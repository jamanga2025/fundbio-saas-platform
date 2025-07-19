"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { monitoring } from '@/lib/monitoring';

// Dynamic imports para lazy loading
import dynamic from 'next/dynamic';

// Clustering disabled for build compatibility

// Lazy load advanced GeoJSON component
const OptimizedGeoJSON = dynamic(() => import('./OptimizedGeoJSON'), { ssr: false });

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface BiodiversityLayer {
  id: string;
  name: string;
  type: 'SUP' | 'CON' | 'BDU' | 'RES';
  data: any;
  visible: boolean;
  style?: any;
  minZoom?: number;
  maxZoom?: number;
}

interface OptimizedMapProps {
  center?: [number, number];
  zoom?: number;
  height?: string;
  biodiversityLayers?: BiodiversityLayer[];
  markers?: Array<{
    id: string;
    position: [number, number];
    title: string;
    description?: string;
    value?: number;
    category?: string;
    timestamp?: string;
  }>;
  enableClustering?: boolean;
  enableCaching?: boolean;
  enableLazyLoading?: boolean;
  onMapReady?: (map: L.Map) => void;
  onPerformanceMetric?: (metric: string, value: number) => void;
}

// Cache para tiles y datos GeoJSON
class MapCache {
  private static instance: MapCache;
  private cache = new Map<string, any>();
  private maxCacheSize = 100;
  private cacheExpiry = 10 * 60 * 1000; // 10 minutes

  static getInstance(): MapCache {
    if (!MapCache.instance) {
      MapCache.instance = new MapCache();
    }
    return MapCache.instance;
  }

  set(key: string, value: any): void {
    const now = Date.now();
    
    // Clear expired entries
    const keysToDelete: string[] = [];
    this.cache.forEach((v, k) => {
      if (now - v.timestamp > this.cacheExpiry) {
        keysToDelete.push(k);
      }
    });
    keysToDelete.forEach(k => this.cache.delete(k));

    // Limit cache size
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, { value, timestamp: now });
  }

  get(key: string): any {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.cacheExpiry) {
      this.cache.delete(key);
      return null;
    }

    return cached.value;
  }

  clear(): void {
    this.cache.clear();
  }
}

export default function OptimizedMap({
  center = [40.4168, -3.7038],
  zoom = 10,
  height = '400px',
  biodiversityLayers = [],
  markers = [],
  enableClustering = true,
  enableCaching = true,
  enableLazyLoading = true,
  onMapReady,
  onPerformanceMetric
}: OptimizedMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const cache = useMemo(() => MapCache.getInstance(), []);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedLayers, setLoadedLayers] = useState<Set<string>>(new Set());
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [viewBounds, setViewBounds] = useState<L.LatLngBounds | null>(null);
  const performanceStartTime = useRef<number>(0);

  // Performance monitoring
  const recordMetric = useCallback((metric: string, value: number) => {
    monitoring.recordMetric(`map_${metric}`, value);
    onPerformanceMetric?.(metric, value);
  }, [onPerformanceMetric]);

  // Optimized marker clustering configuration
  const clusterOptions = useMemo(() => ({
    chunkedLoading: true,
    chunkProgress: (processed: number, total: number) => {
      const progress = (processed / total) * 100;
      recordMetric('cluster_progress', progress);
    },
    maxClusterRadius: (zoom: number) => {
      // Reduce cluster radius at higher zoom levels
      return zoom > 15 ? 20 : zoom > 10 ? 40 : 80;
    },
    iconCreateFunction: (cluster: any) => {
      const count = cluster.getChildCount();
      let size = 30;
      let className = 'marker-cluster-small';

      if (count < 10) {
        size = 30;
        className = 'marker-cluster-small';
      } else if (count < 100) {
        size = 40;
        className = 'marker-cluster-medium';
      } else {
        size = 50;
        className = 'marker-cluster-large';
      }

      return L.divIcon({
        html: `<div><span>${count}</span></div>`,
        className: `marker-cluster ${className}`,
        iconSize: [size, size]
      });
    },
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true
  }), [recordMetric]);

  // Layer visibility based on zoom level
  const getVisibleLayers = useCallback((zoom: number) => {
    return biodiversityLayers.filter(layer => {
      const minZoom = layer.minZoom || 0;
      const maxZoom = layer.maxZoom || 20;
      return zoom >= minZoom && zoom <= maxZoom;
    });
  }, [biodiversityLayers]);

  // Lazy load layer data
  const loadLayerData = useCallback(async (layerId: string) => {
    if (!enableLazyLoading) return;

    const cacheKey = `layer_${layerId}`;
    const cached = enableCaching ? cache.get(cacheKey) : null;
    
    if (cached) {
      recordMetric('cache_hit', 1);
      return cached;
    }

    try {
      const startTime = performance.now();
      // Simulate loading layer data (replace with actual API call)
      const data = await new Promise(resolve => {
        setTimeout(() => resolve({ type: 'FeatureCollection', features: [] }), 100);
      });
      
      const loadTime = performance.now() - startTime;
      recordMetric('layer_load_time', loadTime);
      recordMetric('cache_miss', 1);

      if (enableCaching) {
        cache.set(cacheKey, data);
      }

      setLoadedLayers(prev => new Set(prev).add(layerId));
      return data;
    } catch (error) {
      console.error(`Failed to load layer ${layerId}:`, error);
      recordMetric('layer_load_error', 1);
      return null;
    }
  }, [enableLazyLoading, enableCaching, cache, recordMetric]);

  // Handle map events
  const handleMapReady = useCallback(() => {
    const loadTime = performance.now() - performanceStartTime.current;
    recordMetric('initial_load_time', loadTime);
    setIsLoading(false);
    
    if (mapRef.current && onMapReady) {
      onMapReady(mapRef.current);
    }
  }, [recordMetric, onMapReady]);

  const handleZoomEnd = useCallback(() => {
    if (!mapRef.current) return;
    
    const newZoom = mapRef.current.getZoom();
    setCurrentZoom(newZoom);
    recordMetric('zoom_level', newZoom);
    
    // Load/unload layers based on zoom level
    const visibleLayers = getVisibleLayers(newZoom);
    visibleLayers.forEach(layer => {
      if (!loadedLayers.has(layer.id)) {
        loadLayerData(layer.id);
      }
    });
  }, [getVisibleLayers, loadedLayers, loadLayerData, recordMetric]);

  const handleMoveEnd = useCallback(() => {
    if (!mapRef.current) return;
    
    const bounds = mapRef.current.getBounds();
    setViewBounds(bounds);
    
    // Record viewport metrics
    const boundsSize = bounds.getNorthEast().distanceTo(bounds.getSouthWest());
    recordMetric('viewport_size', boundsSize);
  }, [recordMetric]);

  // Initialize map
  useEffect(() => {
    performanceStartTime.current = performance.now();
  }, []);

  // Preload initial layers
  useEffect(() => {
    const visibleLayers = getVisibleLayers(currentZoom);
    visibleLayers.forEach(layer => {
      loadLayerData(layer.id);
    });
  }, [biodiversityLayers, currentZoom, getVisibleLayers, loadLayerData]);

  // Create biodiversity layer styles
  const getLayerStyle = useCallback((layer: BiodiversityLayer) => {
    const baseStyles = {
      SUP: { // Superficie - Áreas verdes
        fillColor: '#10B981',
        color: '#059669',
        weight: 2,
        fillOpacity: 0.6
      },
      CON: { // Conectividad - Corredores
        fillColor: '#3B82F6',
        color: '#1D4ED8',
        weight: 3,
        fillOpacity: 0.5,
        dashArray: '5, 5'
      },
      BDU: { // Biodiversidad urbana - Especies
        fillColor: '#F59E0B',
        color: '#D97706',
        weight: 2,
        fillOpacity: 0.7
      },
      RES: { // Resiliencia - Zonas vulnerables
        fillColor: '#EF4444',
        color: '#DC2626',
        weight: 2,
        fillOpacity: 0.5
      }
    };

    return {
      ...baseStyles[layer.type],
      ...layer.style
    };
  }, []);

  // Loading skeleton
  const MapSkeleton = () => (
    <div className="w-full h-full bg-gradient-to-br from-green-50 to-blue-50 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-green-600 font-medium">Optimizando mapa interactivo...</p>
        <p className="text-sm text-gray-500 mt-1">Cargando capas de biodiversidad</p>
      </div>
    </div>
  );

  return (
    <div className="w-full relative" style={{ height }}>
      {/* Performance indicators */}
      <div className="absolute top-2 right-2 z-10 bg-white rounded-lg shadow-lg p-2 space-y-1 text-xs">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${enableCaching ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <span>Cache</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${enableClustering ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
          <span>Clustering</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${enableLazyLoading ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
          <span>Lazy Load</span>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && <MapSkeleton />}

      {/* Map container */}
      <div className={`w-full h-full ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}>
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
          whenReady={handleMapReady}
          preferCanvas={true} // Better performance for many markers
          className="rounded-lg"
        >
          {/* Base tile layer with WebP support */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
            tileSize={256}
            crossOrigin={true}
          />

          {/* Biodiversity layers with controls */}
          <LayersControl position="topleft">
            {biodiversityLayers.map(layer => (
              <LayersControl.Overlay 
                key={layer.id} 
                name={layer.name} 
                checked={layer.visible}
              >
                {loadedLayers.has(layer.id) && layer.data && (
                  <OptimizedGeoJSON
                    data={layer.data}
                    style={getLayerStyle(layer)}
                    interactive={true}
                    onPerformanceMetric={recordMetric}
                  />
                )}
              </LayersControl.Overlay>
            ))}
          </LayersControl>

          {/* Optimized markers with clustering */}
          {false ? (
            <div>
              {markers.map(marker => (
                <Marker
                  key={marker.id}
                  position={marker.position}
                >
                  <Popup>
                    <div className="p-3 max-w-xs">
                      <h4 className="font-semibold text-gray-900 mb-2">{marker.title}</h4>
                      {marker.description && (
                        <p className="text-sm text-gray-600 mb-2">{marker.description}</p>
                      )}
                      {marker.value && (
                        <p className="text-sm font-medium text-green-600">
                          Valor: {marker.value}
                        </p>
                      )}
                      {marker.category && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-2">
                          {marker.category}
                        </span>
                      )}
                      {marker.timestamp && (
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(marker.timestamp).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </div>
          ) : (
            markers.map(marker => (
              <Marker key={marker.id} position={marker.position}>
                <Popup>
                  <div className="p-3 max-w-xs">
                    <h4 className="font-semibold text-gray-900 mb-2">{marker.title}</h4>
                    {marker.description && (
                      <p className="text-sm text-gray-600 mb-2">{marker.description}</p>
                    )}
                    {marker.value && (
                      <p className="text-sm font-medium text-green-600">
                        Valor: {marker.value}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))
          )}
        </MapContainer>
      </div>

      {/* Map statistics overlay */}
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
        <div>Zoom: {currentZoom}</div>
        <div>Marcadores: {markers.length}</div>
        <div>Capas: {loadedLayers.size}/{biodiversityLayers.length}</div>
      </div>
    </div>
  );
}