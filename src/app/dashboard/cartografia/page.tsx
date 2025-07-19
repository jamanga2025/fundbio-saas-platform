"use client";

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { usePerformanceOptimization } from '@/lib/performance-optimizer';
import { monitoring } from '@/lib/monitoring';
import { Map, Database, Layers, Download, FileText, Info } from 'lucide-react';

// Lazy load the integrated map component for better performance
const IntegratedMapAnalysis = dynamic(() => import('@/components/maps/IntegratedMapAnalysis'), {
  ssr: false,
  loading: () => <MapLoadingSkeleton />
});

// Legacy components loaded only when needed
const GeoDataManager = dynamic(() => import('@/components/maps/GeoDataManager'), { ssr: false });
const IndicatorMap = dynamic(() => import('@/components/maps/IndicatorMap'), { ssr: false });

// Mock data imports
import { 
  pintoDistritosGeoJSON, 
  pintoProyectosGeoJSON, 
  availableGeoIndicators,
  getIndicatorDataForLayer 
} from '@/lib/mockGeoData';

// Loading skeleton component
function MapLoadingSkeleton() {
  return (
    <div className="w-full h-96 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto"></div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-green-600">Cargando Cartografía Optimizada</h3>
          <p className="text-sm text-gray-600">Inicializando análisis territorial avanzado...</p>
        </div>
      </div>
    </div>
  );
}

export default function CartografiaPage() {
  const [activeMode, setActiveMode] = useState<'integrated' | 'manager' | 'demo'>('integrated');
  const [demoLayers, setDemoLayers] = useState<any[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Performance monitoring
  const { getRecommendations, getVitals } = usePerformanceOptimization();
  
  useEffect(() => {
    // Record page load
    monitoring.recordMetric('cartografia_page_load', 1);
    
    // Monitor performance on mount
    const checkPerformance = () => {
      const vitals = getVitals();
      const recommendations = getRecommendations();
      
      if (recommendations.length > 0) {
        console.log('Performance recommendations:', recommendations);
      }
    };
    
    const timer = setTimeout(checkPerformance, 2000);
    return () => clearTimeout(timer);
  }, [getRecommendations, getVitals]);

  // Inicializar capas de demostración
  useEffect(() => {
    const initDemoLayers = () => {
      const demostrationLayers = [
        {
          id: 'distritos_pinto',
          name: 'Distritos y Barrios de Pinto',
          geoJsonData: pintoDistritosGeoJSON,
          indicatorData: getIndicatorDataForLayer('SUP-001'),
          visible: true,
          color: '#10B981',
          opacity: 0.7,
          style: 'choropleth' as const
        },
        {
          id: 'proyectos_pinto',
          name: 'Proyectos de Renaturalización',
          geoJsonData: pintoProyectosGeoJSON,
          indicatorData: getIndicatorDataForLayer('RES-001'),
          visible: true,
          color: '#3B82F6',
          opacity: 0.8,
          style: 'graduated' as const
        }
      ];
      
      setDemoLayers(demostrationLayers);
    };

    if (activeMode === 'demo') {
      initDemoLayers();
    }
  }, [activeMode]);

  const handleLayerToggle = (layerId: string, visible: boolean) => {
    setDemoLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, visible } : layer
    ));
  };

  const exportGeoData = (format: 'geojson' | 'csv') => {
    if (format === 'geojson') {
      // Exportar como GeoJSON
      const combinedData = {
        type: 'FeatureCollection',
        features: demoLayers.flatMap(layer => 
          layer.geoJsonData?.features?.map((feature: any) => ({
            ...feature,
            properties: {
              ...feature.properties,
              layer: layer.name,
              indicatorValue: layer.indicatorData?.find((d: any) => 
                d.featureId === feature.properties.id
              )?.value
            }
          })) || []
        )
      };

      const dataStr = JSON.stringify(combinedData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'pinto_geodatos_completo.geojson';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      // Exportar como CSV
      const csvData = demoLayers.flatMap(layer => 
        layer.indicatorData?.map((indicator: any) => ({
          capa: layer.name,
          feature_id: indicator.featureId,
          valor: indicator.value,
          unidad: indicator.unit,
          año: indicator.year || 2024
        })) || []
      );

      const csvHeaders = Object.keys(csvData[0] || {});
      const csvContent = [
        csvHeaders.join(','),
        ...csvData.map(row => csvHeaders.map(header => row[header as keyof typeof row]).join(','))
      ].join('\n');

      const dataBlob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'pinto_indicadores_territoriales.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Map className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Cartografía y Análisis Territorial
                </h1>
                <p className="text-sm text-gray-600">
                  Visualización espacial de indicadores ambientales
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveMode('integrated')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeMode === 'integrated'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Análisis Integrado
                </button>
                <button
                  onClick={() => setActiveMode('demo')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeMode === 'demo'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Demo Pinto
                </button>
                <button
                  onClick={() => setActiveMode('manager')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeMode === 'manager'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Gestión Avanzada
                </button>
              </div>
              
              {activeMode === 'demo' && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => exportGeoData('geojson')}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Download size={16} className="mr-2" />
                    GeoJSON
                  </button>
                  <button
                    onClick={() => exportGeoData('csv')}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <FileText size={16} className="mr-2" />
                    CSV
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeMode === 'integrated' ? (
          <Suspense fallback={<MapLoadingSkeleton />}>
            <IntegratedMapAnalysis
              height="calc(100vh - 200px)"
              defaultCenter={[40.4168, -3.7038]}
              defaultZoom={10}
              enableAnalytics={true}
              enableExport={true}
              className="w-full"
            />
          </Suspense>
        ) : activeMode === 'demo' ? (
          <div className="space-y-6">
            {/* Información de la demostración */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <Info size={20} className="text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Demostración: Municipio de Pinto (Madrid)
                  </h3>
                  <p className="text-blue-800 text-sm mb-3">
                    Esta vista muestra un ejemplo completo de cómo los indicadores de biodiversidad 
                    se pueden visualizar territorialmente a diferentes escalas:
                  </p>
                  <ul className="text-blue-800 text-sm space-y-1 list-disc list-inside">
                    <li><strong>Escala submunicipal:</strong> Distritos y barrios con indicadores SUP-001 (superficie verde/habitante)</li>
                    <li><strong>Escala de proyecto:</strong> Proyectos específicos de renaturalización con indicador RES-001 (retención de agua)</li>
                    <li><strong>Visualización interactiva:</strong> Mapas coropléticos, controles de capas, leyendas y popups informativos</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Distritos Analizados</p>
                    <p className="text-2xl font-bold text-gray-900">5</p>
                  </div>
                  <Layers className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Proyectos Activos</p>
                    <p className="text-2xl font-bold text-gray-900">5</p>
                  </div>
                  <Database className="h-8 w-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Superficie Total</p>
                    <p className="text-2xl font-bold text-gray-900">62.8</p>
                    <p className="text-xs text-gray-500">km²</p>
                  </div>
                  <Map className="h-8 w-8 text-purple-500" />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Inversión Total</p>
                    <p className="text-2xl font-bold text-gray-900">2.58M</p>
                    <p className="text-xs text-gray-500">€</p>
                  </div>
                  <FileText className="h-8 w-8 text-yellow-500" />
                </div>
              </div>
            </div>

            {/* Mapa de demostración */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Mapa Interactivo de Indicadores Territoriales
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Haz clic en las áreas para ver detalles de los indicadores. Usa los controles para alternar capas.
                </p>
              </div>
              
              <IndicatorMap
                layers={demoLayers}
                center={[40.2475, -3.6925]} // Centro de Pinto
                zoom={13}
                height="600px"
                onLayerToggle={handleLayerToggle}
                onFeatureClick={(feature, layerId) => {
                  console.log('Detalle de feature:', feature.properties);
                  // Aquí se podría abrir un modal con información detallada
                }}
              />
            </div>

            {/* Análisis territorial */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Análisis por Distritos
                </h3>
                <div className="space-y-3">
                  {pintoDistritosGeoJSON.features.map((feature, index) => {
                    const indicatorValue = getIndicatorDataForLayer('SUP-001').find(
                      d => d.featureId === feature.properties.id
                    );
                    
                    return (
                      <div key={feature.properties.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <h4 className="font-medium text-gray-900">{feature.properties.name}</h4>
                          <p className="text-sm text-gray-600">
                            {feature.properties.poblacion.toLocaleString()} habitantes • 
                            {feature.properties.superficie_ha} ha
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            {indicatorValue?.value.toFixed(1)} m²/hab
                          </p>
                          <p className="text-xs text-gray-500">Superficie verde</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Estado de Proyectos
                </h3>
                <div className="space-y-3">
                  {pintoProyectosGeoJSON.features.map((feature, index) => {
                    const statusColors = {
                      completado: 'bg-green-100 text-green-800',
                      en_progreso: 'bg-blue-100 text-blue-800',
                      planificado: 'bg-yellow-100 text-yellow-800'
                    };
                    
                    return (
                      <div key={feature.properties.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{feature.properties.name}</h4>
                          <p className="text-sm text-gray-600">
                            {feature.properties.categoria} • 
                            {(feature.properties.presupuesto / 1000).toFixed(0)}k €
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          statusColors[feature.properties.estado as keyof typeof statusColors]
                        }`}>
                          {feature.properties.estado.replace('_', ' ')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <GeoDataManager
            availableIndicators={availableGeoIndicators}
            onLayerUpdate={(layers) => {
              console.log('Capas actualizadas:', layers);
            }}
          />
        )}
      </div>
    </div>
  );
}