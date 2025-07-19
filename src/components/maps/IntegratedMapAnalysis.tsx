"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Map, Clock, BarChart3, Download, Settings, Maximize2 } from 'lucide-react';
import { monitoring } from '@/lib/monitoring';

// Lazy load components for better performance
const OptimizedMap = dynamic(() => import('./OptimizedMap'), { 
  ssr: false,
  loading: () => <MapLoadingSkeleton />
});

const TemporalAnalysis = dynamic(() => import('../temporal/TemporalAnalysis'), {
  ssr: false,
  loading: () => <div className="h-80 bg-gray-100 rounded animate-pulse" />
});

const BiodiversityLayers = dynamic(() => import('./BiodiversityLayers'), {
  ssr: false,
  loading: () => <div className="w-80 h-96 bg-gray-100 rounded animate-pulse" />
});

// Loading skeleton for map
function MapLoadingSkeleton() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-green-50 to-blue-50 rounded-lg flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto"></div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-green-600">Cargando Mapa Optimizado</h3>
          <p className="text-sm text-gray-600">Inicializando capas de biodiversidad...</p>
          <div className="w-32 h-2 bg-gray-200 rounded mx-auto">
            <div className="h-2 bg-green-500 rounded animate-pulse w-1/2"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface IntegratedMapAnalysisProps {
  height?: string;
  defaultCenter?: [number, number];
  defaultZoom?: number;
  enableAnalytics?: boolean;
  enableExport?: boolean;
  className?: string;
}

// Mock temporal data generator
function generateMockTemporalData() {
  const indicators = ['SUP_Parques', 'CON_Corredores', 'BDU_Especies', 'RES_Vulnerabilidad'];
  const data: any[] = [];
  const startDate = new Date('2022-01-01');
  const endDate = new Date('2027-12-31');

  for (let d = new Date(startDate); d <= endDate; d.setMonth(d.getMonth() + 3)) {
    indicators.forEach(indicator => {
      const baseValue = Math.random() * 100;
      const seasonalVariation = Math.sin((d.getMonth() / 12) * 2 * Math.PI) * 20;
      const trend = ((d.getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime())) * 30;
      
      data.push({
        timestamp: d.toISOString(),
        date: new Date(d),
        value: Math.max(0, baseValue + seasonalVariation + trend + (Math.random() - 0.5) * 10),
        indicator,
        category: indicator.split('_')[0],
        trend: Math.random() * 2 - 1
      });
    });
  }

  return data;
}

export default function IntegratedMapAnalysis({
  height = '600px',
  defaultCenter = [40.4168, -3.7038],
  defaultZoom = 10,
  enableAnalytics = true,
  enableExport = true,
  className = ''
}: IntegratedMapAnalysisProps) {
  // State management
  const [activeTab, setActiveTab] = useState<'map' | 'temporal' | 'analytics'>('map');
  const [mapData, setMapData] = useState({
    biodiversityLayers: [] as any[],
    selectedLayers: [] as string[],
    currentTime: new Date(),
    temporalData: generateMockTemporalData()
  });
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [currentZoom, setCurrentZoom] = useState(defaultZoom);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    dataPoints: 0,
    layersLoaded: 0
  });

  // Performance monitoring
  const recordMetric = useCallback((metric: string, value: number) => {
    setPerformanceMetrics(prev => ({
      ...prev,
      [metric]: value
    }));
    monitoring.recordMetric(`integrated_map_${metric}`, value);
  }, []);

  // Mock biodiversity data
  const biodiversityData = useMemo(() => ({
    SUP: {
      id: 'sup_areas',
      name: 'Áreas Verdes',
      type: 'SUP' as const,
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              name: 'Parque del Retiro',
              area: 125,
              species_count: 45,
              conservation_status: 'Protegido'
            },
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [-3.6886, 40.4152],
                [-3.6886, 40.4200],
                [-3.6800, 40.4200],
                [-3.6800, 40.4152],
                [-3.6886, 40.4152]
              ]]
            }
          }
        ]
      },
      visible: true,
      style: { fillColor: '#10B981', color: '#059669' }
    },
    CON: {
      id: 'con_corridors',
      name: 'Corredores Verdes',
      type: 'CON' as const,
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              name: 'Corredor Río Manzanares',
              length: 2.5,
              connectivity_index: 0.8
            },
            geometry: {
              type: 'LineString',
              coordinates: [
                [-3.7200, 40.4000],
                [-3.7100, 40.4100],
                [-3.7000, 40.4200]
              ]
            }
          }
        ]
      },
      visible: true,
      style: { color: '#3B82F6', weight: 4 }
    },
    BDU: {
      id: 'bdu_species',
      name: 'Observaciones de Especies',
      type: 'BDU' as const,
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              name: 'Gorrión Común',
              scientific_name: 'Passer domesticus',
              observations: 12,
              last_seen: '2024-02-15'
            },
            geometry: {
              type: 'Point',
              coordinates: [-3.7038, 40.4168]
            }
          }
        ]
      },
      visible: true,
      style: { color: '#F59E0B' }
    },
    RES: {
      id: 'res_vulnerability',
      name: 'Zonas de Riesgo',
      type: 'RES' as const,
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              name: 'Zona de Calor Urbano',
              risk_level: 'Alto',
              temperature_increase: 3.2
            },
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [-3.7200, 40.4000],
                [-3.7200, 40.4050],
                [-3.7100, 40.4050],
                [-3.7100, 40.4000],
                [-3.7200, 40.4000]
              ]]
            }
          }
        ]
      },
      visible: true,
      style: { fillColor: '#EF4444', color: '#DC2626' }
    }
  }), []);

  // Handle layer operations
  const handleLayerToggle = useCallback((layerId: string, visible: boolean) => {
    setMapData(prev => ({
      ...prev,
      selectedLayers: visible 
        ? [...prev.selectedLayers, layerId]
        : prev.selectedLayers.filter(id => id !== layerId)
    }));
    recordMetric('layer_toggle', visible ? 1 : 0);
  }, [recordMetric]);

  const handleLayerOpacityChange = useCallback((layerId: string, opacity: number) => {
    // Update layer opacity in map
    recordMetric('opacity_change', opacity);
  }, [recordMetric]);

  const handleLayerDataRequest = useCallback(async (layerId: string) => {
    const startTime = performance.now();
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const loadTime = performance.now() - startTime;
    recordMetric('layer_load_time', loadTime);
    
    return biodiversityData[layerId as keyof typeof biodiversityData]?.data || null;
  }, [biodiversityData, recordMetric]);

  const handleExportLayer = useCallback((layerId: string, format: 'geojson' | 'kml' | 'shapefile') => {
    const layer = biodiversityData[layerId as keyof typeof biodiversityData];
    if (!layer) return;

    const filename = `${layerId}_${new Date().toISOString().split('T')[0]}.${format}`;
    const data = JSON.stringify(layer.data, null, 2);
    
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    recordMetric('export_action', 1);
  }, [biodiversityData, recordMetric]);

  // Handle temporal analysis
  const handleTimeChange = useCallback((timestamp: string) => {
    setMapData(prev => ({
      ...prev,
      currentTime: new Date(timestamp)
    }));
  }, []);

  const handleTrendAnalysis = useCallback((trends: any) => {
    recordMetric('trend_analysis', Object.keys(trends.trends || {}).length);
  }, [recordMetric]);

  // Handle map events
  const handleMapReady = useCallback((map: any) => {
    setMapInstance(map);
    
    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });
    
    recordMetric('map_ready', 1);
  }, [recordMetric]);

  // Generate markers from temporal data
  const currentMarkers = useMemo(() => {
    return mapData.temporalData
      .filter(d => d.date <= mapData.currentTime)
      .slice(-50) // Limit to recent 50 points for performance
      .map((point, index) => ({
        id: `marker_${index}`,
        position: [
          defaultCenter[0] + (Math.random() - 0.5) * 0.1,
          defaultCenter[1] + (Math.random() - 0.5) * 0.1
        ] as [number, number],
        title: point.indicator,
        description: `Valor: ${point.value.toFixed(1)}`,
        value: point.value,
        category: point.category,
        timestamp: point.timestamp
      }));
  }, [mapData.temporalData, mapData.currentTime, defaultCenter]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Performance summary
  const performanceSummary = useMemo(() => {
    const totalMetrics = Object.values(performanceMetrics).reduce((a, b) => a + b, 0);
    return {
      score: Math.min(100, Math.max(0, 100 - (performanceMetrics.loadTime / 1000) * 20)),
      status: performanceMetrics.loadTime < 2000 ? 'Excellent' : 
               performanceMetrics.loadTime < 5000 ? 'Good' : 'Needs Improvement'
    };
  }, [performanceMetrics]);

  const containerClass = `${className} ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`;

  return (
    <div className={containerClass}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center space-x-3">
            <Map className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Análisis Integrado de Biodiversidad</h2>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Performance indicator */}
            <div className="flex items-center space-x-2 text-sm">
              <div className={`w-3 h-3 rounded-full ${
                performanceSummary.score > 80 ? 'bg-green-500' :
                performanceSummary.score > 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className="text-gray-600">{performanceSummary.status}</span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex" style={{ height: isFullscreen ? 'calc(100vh - 80px)' : height }}>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="flex-1 flex flex-col">
            {/* Tab navigation */}
            <TabsList className="grid grid-cols-3 w-full rounded-none border-b">
              <TabsTrigger value="map" className="flex items-center space-x-2">
                <Map className="w-4 h-4" />
                <span>Mapa Interactivo</span>
              </TabsTrigger>
              <TabsTrigger value="temporal" className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Análisis Temporal</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab content */}
            <div className="flex-1 flex">
              <TabsContent value="map" className="flex-1 flex m-0">
                <div className="flex-1 relative">
                  <OptimizedMap
                    center={defaultCenter}
                    zoom={defaultZoom}
                    height="100%"
                    biodiversityLayers={Object.values(biodiversityData)}
                    markers={currentMarkers}
                    enableClustering={true}
                    enableCaching={true}
                    enableLazyLoading={true}
                    onMapReady={handleMapReady}
                    onPerformanceMetric={recordMetric}
                  />
                </div>
                
                {/* Layer control panel */}
                <BiodiversityLayers
                  onLayerToggle={handleLayerToggle}
                  onLayerOpacityChange={handleLayerOpacityChange}
                  onLayerDataRequest={handleLayerDataRequest}
                  currentZoom={currentZoom}
                  selectedLayers={mapData.selectedLayers}
                  onExportLayer={handleExportLayer}
                />
              </TabsContent>

              <TabsContent value="temporal" className="flex-1 m-0 p-4">
                {enableAnalytics && (
                  <TemporalAnalysis
                    data={mapData.temporalData}
                    timeRange={{
                      start: new Date('2022-01-01'),
                      end: new Date('2027-12-31')
                    }}
                    onTimeChange={handleTimeChange}
                    onTrendAnalysis={handleTrendAnalysis}
                    indicators={['SUP_Parques', 'CON_Corredores', 'BDU_Especies', 'RES_Vulnerabilidad']}
                    autoPlay={false}
                    playbackSpeed={1}
                  />
                )}
              </TabsContent>

              <TabsContent value="analytics" className="flex-1 m-0 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Performance metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Tiempo de carga:</span>
                        <span>{performanceMetrics.loadTime.toFixed(0)}ms</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tiempo de render:</span>
                        <span>{performanceMetrics.renderTime.toFixed(0)}ms</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Capas cargadas:</span>
                        <span>{performanceMetrics.layersLoaded}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Puntos de datos:</span>
                        <span>{performanceMetrics.dataPoints}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Data summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Resumen de Datos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Marcadores visibles:</span>
                        <span>{currentMarkers.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Capas activas:</span>
                        <span>{mapData.selectedLayers.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Período temporal:</span>
                        <span>{Math.ceil((mapData.currentTime.getTime() - new Date('2022-01-01').getTime()) / (1000 * 60 * 60 * 24))} días</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Zoom actual:</span>
                        <span>{currentZoom}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Export options */}
                  {enableExport && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Exportar Datos</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const data = {
                              timestamp: new Date().toISOString(),
                              performanceMetrics,
                              mapData: {
                                center: defaultCenter,
                                zoom: currentZoom,
                                layers: mapData.selectedLayers,
                                currentTime: mapData.currentTime
                              }
                            };
                            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `biodiversity_analysis_${new Date().toISOString().split('T')[0]}.json`;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                          className="w-full"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Exportar Análisis
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}