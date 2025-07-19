"use client";

import { useState, useMemo } from 'react';
import BaseMap from './BaseMap';
import { Layers, Eye, EyeOff, Settings, Palette } from 'lucide-react';

interface IndicatorLayer {
  id: string;
  name: string;
  geoJsonData: any;
  indicatorData?: Array<{
    featureId: string;
    value: number;
    unit: string;
    year?: number;
  }>;
  visible: boolean;
  color: string;
  opacity: number;
  style?: 'choropleth' | 'graduated' | 'categorized';
}

interface IndicatorMapProps {
  layers: IndicatorLayer[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onLayerToggle?: (layerId: string, visible: boolean) => void;
  onLayerStyleChange?: (layerId: string, style: any) => void;
  onFeatureClick?: (feature: any, layerId: string) => void;
  selectedIndicator?: string;
}

export default function IndicatorMap({
  layers,
  center = [40.4168, -3.7038],
  zoom = 10,
  height = '500px',
  onLayerToggle,
  onLayerStyleChange,
  onFeatureClick,
  selectedIndicator
}: IndicatorMapProps) {
  const [showLegend, setShowLegend] = useState(true);
  const [showLayerControls, setShowLayerControls] = useState(true);

  // Procesar datos para el mapa
  const processedData = useMemo(() => {
    const visibleLayers = layers.filter(layer => layer.visible);
    
    if (visibleLayers.length === 0) return null;
    
    // Combinar todas las capas visibles
    const combinedFeatures: any[] = [];
    
    visibleLayers.forEach(layer => {
      if (layer.geoJsonData && layer.geoJsonData.features) {
        const layerFeatures = layer.geoJsonData.features.map((feature: any) => {
          // Buscar datos del indicador para esta feature
          const indicatorValue = layer.indicatorData?.find(
            data => data.featureId === feature.properties?.id || 
                   data.featureId === feature.properties?.ID ||
                   data.featureId === feature.properties?.name ||
                   data.featureId === feature.properties?.NAME
          );
          
          return {
            ...feature,
            properties: {
              ...feature.properties,
              layerId: layer.id,
              layerName: layer.name,
              indicatorValue: indicatorValue?.value,
              indicatorUnit: indicatorValue?.unit,
              indicatorYear: indicatorValue?.year,
              layerColor: layer.color,
              layerOpacity: layer.opacity
            }
          };
        });
        
        combinedFeatures.push(...layerFeatures);
      }
    });
    
    return {
      type: 'FeatureCollection',
      features: combinedFeatures
    };
  }, [layers]);

  // Función de estilo para las capas
  const getLayerStyle = (feature: any) => {
    const props = feature.properties;
    if (!props) return {};

    const layer = layers.find(l => l.id === props.layerId);
    if (!layer) return {};

    let fillColor = layer.color;
    let fillOpacity = layer.opacity;

    // Aplicar estilo basado en valor del indicador
    if (props.indicatorValue && layer.style === 'choropleth') {
      // Normalizar valor para determinar intensidad del color
      const maxValue = Math.max(...(layer.indicatorData?.map(d => d.value) || [1]));
      const minValue = Math.min(...(layer.indicatorData?.map(d => d.value) || [0]));
      const normalizedValue = (props.indicatorValue - minValue) / (maxValue - minValue);
      
      fillOpacity = 0.3 + (normalizedValue * 0.6); // Entre 0.3 y 0.9
    }

    return {
      fillColor,
      weight: 2,
      opacity: 1,
      color: layer.color,
      fillOpacity,
      dashArray: layer.visible ? '' : '5, 5'
    };
  };

  // Generar marcadores para puntos de interés
  const markers = useMemo(() => {
    const allMarkers: any[] = [];
    
    layers.forEach(layer => {
      if (layer.visible && layer.indicatorData) {
        layer.indicatorData.forEach(data => {
          // Buscar la geometría correspondiente
          const feature = layer.geoJsonData?.features?.find((f: any) => 
            f.properties?.id === data.featureId ||
            f.properties?.ID === data.featureId ||
            f.properties?.name === data.featureId ||
            f.properties?.NAME === data.featureId
          );
          
          if (feature && feature.geometry.type === 'Point') {
            const [lng, lat] = feature.geometry.coordinates;
            allMarkers.push({
              id: `${layer.id}_${data.featureId}`,
              position: [lat, lng] as [number, number],
              title: `${layer.name}: ${data.value} ${data.unit}`,
              description: feature.properties?.name || feature.properties?.NAME || 'Punto de interés',
              value: data.value,
              color: layer.color
            });
          }
        });
      }
    });
    
    return allMarkers;
  }, [layers]);

  const handleFeatureClick = (feature: any) => {
    if (onFeatureClick) {
      onFeatureClick(feature, feature.properties?.layerId);
    }
  };

  const toggleLayer = (layerId: string) => {
    if (onLayerToggle) {
      const layer = layers.find(l => l.id === layerId);
      onLayerToggle(layerId, !layer?.visible);
    }
  };

  // Crear paleta de colores para la leyenda
  const getLegendData = () => {
    return layers
      .filter(layer => layer.visible && layer.indicatorData)
      .map(layer => {
        const values = layer.indicatorData!.map(d => d.value);
        const maxValue = Math.max(...values);
        const minValue = Math.min(...values);
        
        return {
          name: layer.name,
          color: layer.color,
          minValue,
          maxValue,
          unit: layer.indicatorData![0]?.unit || ''
        };
      });
  };

  return (
    <div className="relative">
      {/* Mapa */}
      <BaseMap
        center={center}
        zoom={zoom}
        height={height}
        geoJsonData={processedData}
        markers={markers}
        layerStyle={getLayerStyle}
        onFeatureClick={handleFeatureClick}
      />

      {/* Controles de capas */}
      {showLayerControls && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 min-w-64 max-h-96 overflow-y-auto z-[1000]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Layers size={16} className="mr-2" />
              Capas
            </h3>
            <button
              onClick={() => setShowLayerControls(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <EyeOff size={16} />
            </button>
          </div>
          
          <div className="space-y-2">
            {layers.map(layer => (
              <div key={layer.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={layer.visible}
                    onChange={() => toggleLayer(layer.id)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <div
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: layer.color }}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {layer.name}
                  </span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-500">
                    {layer.indicatorData?.length || 0} datos
                  </span>
                  <button
                    className="text-gray-400 hover:text-gray-600"
                    title="Configurar capa"
                  >
                    <Settings size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botón para mostrar controles de capas */}
      {!showLayerControls && (
        <button
          onClick={() => setShowLayerControls(true)}
          className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 z-[1000]"
          title="Mostrar controles de capas"
        >
          <Eye size={20} className="text-gray-600" />
        </button>
      )}

      {/* Leyenda */}
      {showLegend && getLegendData().length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 min-w-48 z-[1000]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Palette size={16} className="mr-2" />
              Leyenda
            </h3>
            <button
              onClick={() => setShowLegend(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <EyeOff size={16} />
            </button>
          </div>
          
          <div className="space-y-3">
            {getLegendData().map((legend, index) => (
              <div key={index}>
                <div className="flex items-center space-x-2 mb-2">
                  <div
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: legend.color }}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {legend.name}
                  </span>
                </div>
                
                <div className="ml-6 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Min: {legend.minValue.toFixed(2)} {legend.unit}</span>
                    <span>Max: {legend.maxValue.toFixed(2)} {legend.unit}</span>
                  </div>
                  
                  {/* Barra de gradiente */}
                  <div 
                    className="h-2 rounded mt-1"
                    style={{
                      background: `linear-gradient(to right, ${legend.color}30, ${legend.color})`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botón para mostrar leyenda */}
      {!showLegend && (
        <button
          onClick={() => setShowLegend(true)}
          className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-2 z-[1000]"
          title="Mostrar leyenda"
        >
          <Palette size={20} className="text-gray-600" />
        </button>
      )}
    </div>
  );
}