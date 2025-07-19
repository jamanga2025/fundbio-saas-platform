"use client";

import { useState, useMemo } from 'react';
import ShapefileUpload from './ShapefileUpload';
import IndicatorMap from './IndicatorMap';
import { Map, Upload, Database, Layers, Download, Trash2, Edit3 } from 'lucide-react';

interface GeoLayer {
  id: string;
  name: string;
  fileName: string;
  geoJsonData: any;
  indicatorData?: Array<{
    featureId: string;
    value: number;
    unit: string;
    year?: number;
    indicatorId?: string;
  }>;
  visible: boolean;
  color: string;
  opacity: number;
  style: 'choropleth' | 'graduated' | 'categorized';
  uploadDate: Date;
}

interface GeoDataManagerProps {
  availableIndicators?: Array<{
    id: string;
    name: string;
    unit: string;
    category: string;
  }>;
  onLayerUpdate?: (layers: GeoLayer[]) => void;
}

export default function GeoDataManager({ 
  availableIndicators = [],
  onLayerUpdate 
}: GeoDataManagerProps) {
  const [layers, setLayers] = useState<GeoLayer[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'layers' | 'map'>('upload');
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Colores predefinidos para las capas
  const layerColors = [
    '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', 
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];

  const handleDataLoaded = (geoJsonData: any, fileName: string) => {
    const newLayer: GeoLayer = {
      id: Date.now().toString(),
      name: fileName.replace(/\.[^/.]+$/, ""), // Remover extensión
      fileName,
      geoJsonData,
      visible: true,
      color: layerColors[layers.length % layerColors.length],
      opacity: 0.7,
      style: 'choropleth',
      uploadDate: new Date()
    };

    const updatedLayers = [...layers, newLayer];
    setLayers(updatedLayers);
    setActiveTab('layers');
    setError(null);
    
    if (onLayerUpdate) {
      onLayerUpdate(updatedLayers);
    }
  };

  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const updateLayer = (layerId: string, updates: Partial<GeoLayer>) => {
    const updatedLayers = layers.map(layer => 
      layer.id === layerId ? { ...layer, ...updates } : layer
    );
    setLayers(updatedLayers);
    
    if (onLayerUpdate) {
      onLayerUpdate(updatedLayers);
    }
  };

  const deleteLayer = (layerId: string) => {
    const updatedLayers = layers.filter(layer => layer.id !== layerId);
    setLayers(updatedLayers);
    
    if (selectedLayer === layerId) {
      setSelectedLayer(null);
    }
    
    if (onLayerUpdate) {
      onLayerUpdate(updatedLayers);
    }
  };

  const handleLayerToggle = (layerId: string, visible: boolean) => {
    updateLayer(layerId, { visible });
  };

  const exportLayer = (layerId: string) => {
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;

    const dataStr = JSON.stringify(layer.geoJsonData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${layer.name}_exported.geojson`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Generar datos simulados de indicadores para testing
  const generateMockIndicatorData = (layer: GeoLayer, indicatorId: string) => {
    if (!layer.geoJsonData?.features) return [];
    
    const indicator = availableIndicators.find(i => i.id === indicatorId);
    if (!indicator) return [];

    return layer.geoJsonData.features.map((feature: any, index: number) => ({
      featureId: feature.properties?.id || 
                feature.properties?.ID || 
                feature.properties?.name || 
                feature.properties?.NAME || 
                `feature_${index}`,
      value: Math.random() * 100 + 10, // Valor aleatorio para demo
      unit: indicator.unit,
      year: 2024,
      indicatorId: indicatorId
    }));
  };

  const assignIndicatorToLayer = (layerId: string, indicatorId: string) => {
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;

    const indicatorData = generateMockIndicatorData(layer, indicatorId);
    updateLayer(layerId, { indicatorData });
  };

  // Estadísticas de las capas
  const layerStats = useMemo(() => {
    return {
      totalLayers: layers.length,
      visibleLayers: layers.filter(l => l.visible).length,
      totalFeatures: layers.reduce((sum, layer) => 
        sum + (layer.geoJsonData?.features?.length || 0), 0
      ),
      layersWithIndicators: layers.filter(l => l.indicatorData && l.indicatorData.length > 0).length
    };
  }, [layers]);

  const tabs = [
    { id: 'upload', label: 'Subir Datos', icon: <Upload size={20} /> },
    { id: 'layers', label: 'Gestionar Capas', icon: <Layers size={20} /> },
    { id: 'map', label: 'Visualizar Mapa', icon: <Map size={20} /> }
  ];

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Database size={24} className="mr-3 text-green-600" />
            Gestión de Datos Geoespaciales
          </h2>
          
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="bg-green-50 px-3 py-2 rounded">
              <div className="text-lg font-bold text-green-600">{layerStats.totalLayers}</div>
              <div className="text-xs text-green-700">Capas Totales</div>
            </div>
            <div className="bg-blue-50 px-3 py-2 rounded">
              <div className="text-lg font-bold text-blue-600">{layerStats.visibleLayers}</div>
              <div className="text-xs text-blue-700">Capas Visibles</div>
            </div>
            <div className="bg-purple-50 px-3 py-2 rounded">
              <div className="text-lg font-bold text-purple-600">{layerStats.totalFeatures}</div>
              <div className="text-xs text-purple-700">Geometrías</div>
            </div>
            <div className="bg-yellow-50 px-3 py-2 rounded">
              <div className="text-lg font-bold text-yellow-600">{layerStats.layersWithIndicators}</div>
              <div className="text-xs text-yellow-700">Con Indicadores</div>
            </div>
          </div>
        </div>

        {/* Navegación por pestañas */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Mostrar errores */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800 text-sm underline mt-2"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Contenido de las pestañas */}
      {activeTab === 'upload' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <ShapefileUpload
            onDataLoaded={handleDataLoaded}
            onError={handleUploadError}
            maxFileSize={100}
          />
        </div>
      )}

      {activeTab === 'layers' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Gestión de Capas Geoespaciales
          </h3>
          
          {layers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay capas cargadas. Ve a la pestaña "Subir Datos" para cargar archivos.
            </div>
          ) : (
            <div className="space-y-4">
              {layers.map((layer) => (
                <div
                  key={layer.id}
                  className={`border rounded-lg p-4 ${
                    selectedLayer === layer.id ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={layer.visible}
                        onChange={(e) => updateLayer(layer.id, { visible: e.target.checked })}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <div
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: layer.color }}
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">{layer.name}</h4>
                        <p className="text-sm text-gray-500">
                          {layer.geoJsonData?.features?.length || 0} geometrías • 
                          {layer.fileName} • 
                          {layer.uploadDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedLayer(layer.id)}
                        className="text-gray-400 hover:text-blue-600"
                        title="Editar capa"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => exportLayer(layer.id)}
                        className="text-gray-400 hover:text-green-600"
                        title="Exportar capa"
                      >
                        <Download size={16} />
                      </button>
                      <button
                        onClick={() => deleteLayer(layer.id)}
                        className="text-gray-400 hover:text-red-600"
                        title="Eliminar capa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Asignación de indicadores */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Asignar Indicador:
                      </label>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            assignIndicatorToLayer(layer.id, e.target.value);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">Seleccionar indicador...</option>
                        {availableIndicators.map(indicator => (
                          <option key={indicator.id} value={indicator.id}>
                            {indicator.name} ({indicator.unit})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estilo de Visualización:
                      </label>
                      <select
                        value={layer.style}
                        onChange={(e) => updateLayer(layer.id, { 
                          style: e.target.value as 'choropleth' | 'graduated' | 'categorized' 
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="choropleth">Mapa Coroplético</option>
                        <option value="graduated">Símbolos Graduados</option>
                        <option value="categorized">Categorizado</option>
                      </select>
                    </div>
                  </div>

                  {/* Información del indicador asignado */}
                  {layer.indicatorData && layer.indicatorData.length > 0 && (
                    <div className="mt-3 p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-700">
                        <strong>Indicador asignado:</strong> {layer.indicatorData.length} valores • 
                        Rango: {Math.min(...layer.indicatorData.map(d => d.value)).toFixed(2)} - 
                        {Math.max(...layer.indicatorData.map(d => d.value)).toFixed(2)} 
                        {layer.indicatorData[0].unit}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'map' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {layers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No hay capas para visualizar. Sube algunos archivos geoespaciales primero.
            </div>
          ) : (
            <IndicatorMap
              layers={layers.map(layer => ({
                id: layer.id,
                name: layer.name,
                geoJsonData: layer.geoJsonData,
                indicatorData: layer.indicatorData,
                visible: layer.visible,
                color: layer.color,
                opacity: layer.opacity,
                style: layer.style
              }))}
              height="600px"
              onLayerToggle={handleLayerToggle}
              onFeatureClick={(feature, layerId) => {
                console.log('Feature clicked:', feature, 'Layer:', layerId);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}