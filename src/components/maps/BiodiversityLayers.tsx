"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TreePine, 
  Network, 
  Bird, 
  Shield, 
  Map, 
  Eye, 
  EyeOff, 
  Settings, 
  Info,
  Download,
  Filter
} from 'lucide-react';

interface BiodiversityLayerConfig {
  id: string;
  name: string;
  description: string;
  type: 'SUP' | 'CON' | 'BDU' | 'RES';
  category: string;
  icon: React.ReactNode;
  color: string;
  visible: boolean;
  opacity: number;
  minZoom: number;
  maxZoom: number;
  dataUrl: string;
  lastUpdated: Date;
  metadata: {
    source: string;
    accuracy: string;
    resolution: string;
    coverage: string;
  };
}

interface BiodiversityLayersProps {
  onLayerToggle: (layerId: string, visible: boolean) => void;
  onLayerOpacityChange: (layerId: string, opacity: number) => void;
  onLayerDataRequest: (layerId: string) => Promise<any>;
  currentZoom: number;
  selectedLayers: string[];
  onExportLayer: (layerId: string, format: 'geojson' | 'kml' | 'shapefile') => void;
}

// Configuración de capas de biodiversidad
const BIODIVERSITY_LAYERS: BiodiversityLayerConfig[] = [
  // Superficie (SUP) - Áreas verdes
  {
    id: 'sup_parques_urbanos',
    name: 'Parques Urbanos',
    description: 'Espacios verdes urbanos destinados al esparcimiento y conservación',
    type: 'SUP',
    category: 'Áreas Verdes',
    icon: <TreePine className="w-4 h-4" />,
    color: '#10B981',
    visible: true,
    opacity: 0.7,
    minZoom: 8,
    maxZoom: 20,
    dataUrl: '/api/biodiversity/sup/parques',
    lastUpdated: new Date('2024-01-15'),
    metadata: {
      source: 'Catastro Municipal',
      accuracy: '±5m',
      resolution: '1:5000',
      coverage: 'Nacional'
    }
  },
  {
    id: 'sup_jardines_botanicos',
    name: 'Jardines Botánicos',
    description: 'Jardines especializados en conservación de flora autóctona',
    type: 'SUP',
    category: 'Áreas Verdes',
    icon: <TreePine className="w-4 h-4" />,
    color: '#059669',
    visible: true,
    opacity: 0.8,
    minZoom: 10,
    maxZoom: 20,
    dataUrl: '/api/biodiversity/sup/jardines',
    lastUpdated: new Date('2024-02-01'),
    metadata: {
      source: 'Red de Jardines Botánicos',
      accuracy: '±2m',
      resolution: '1:1000',
      coverage: 'Regional'
    }
  },
  {
    id: 'sup_zonas_forestales',
    name: 'Zonas Forestales',
    description: 'Áreas boscosas periurbanas y bosques metropolitanos',
    type: 'SUP',
    category: 'Áreas Verdes',
    icon: <TreePine className="w-4 h-4" />,
    color: '#065F46',
    visible: false,
    opacity: 0.6,
    minZoom: 6,
    maxZoom: 18,
    dataUrl: '/api/biodiversity/sup/bosques',
    lastUpdated: new Date('2024-01-20'),
    metadata: {
      source: 'Ministerio de Medio Ambiente',
      accuracy: '±10m',
      resolution: '1:10000',
      coverage: 'Nacional'
    }
  },

  // Conectividad (CON) - Corredores
  {
    id: 'con_corredores_verdes',
    name: 'Corredores Verdes',
    description: 'Conexiones naturales entre espacios verdes urbanos',
    type: 'CON',
    category: 'Conectividad',
    icon: <Network className="w-4 h-4" />,
    color: '#3B82F6',
    visible: true,
    opacity: 0.6,
    minZoom: 10,
    maxZoom: 20,
    dataUrl: '/api/biodiversity/con/corredores',
    lastUpdated: new Date('2024-01-25'),
    metadata: {
      source: 'Plan Director Verde',
      accuracy: '±3m',
      resolution: '1:2000',
      coverage: 'Metropolitana'
    }
  },
  {
    id: 'con_rios_urbanos',
    name: 'Ríos Urbanos',
    description: 'Cursos de agua que actúan como corredores ecológicos',
    type: 'CON',
    category: 'Conectividad',
    icon: <Network className="w-4 h-4" />,
    color: '#1D4ED8',
    visible: true,
    opacity: 0.8,
    minZoom: 8,
    maxZoom: 20,
    dataUrl: '/api/biodiversity/con/rios',
    lastUpdated: new Date('2024-02-05'),
    metadata: {
      source: 'Confederación Hidrográfica',
      accuracy: '±1m',
      resolution: '1:1000',
      coverage: 'Regional'
    }
  },
  {
    id: 'con_vias_pecuarias',
    name: 'Vías Pecuarias',
    description: 'Caminos tradicionales de ganado convertidos en corredores verdes',
    type: 'CON',
    category: 'Conectividad',
    icon: <Network className="w-4 h-4" />,
    color: '#1E40AF',
    visible: false,
    opacity: 0.5,
    minZoom: 12,
    maxZoom: 20,
    dataUrl: '/api/biodiversity/con/pecuarias',
    lastUpdated: new Date('2024-01-10'),
    metadata: {
      source: 'Registro Pecuario',
      accuracy: '±5m',
      resolution: '1:5000',
      coverage: 'Regional'
    }
  },

  // Biodiversidad Urbana (BDU) - Especies
  {
    id: 'bdu_avifauna',
    name: 'Observaciones de Avifauna',
    description: 'Registros de especies de aves en entornos urbanos',
    type: 'BDU',
    category: 'Fauna',
    icon: <Bird className="w-4 h-4" />,
    color: '#F59E0B',
    visible: true,
    opacity: 0.7,
    minZoom: 12,
    maxZoom: 20,
    dataUrl: '/api/biodiversity/bdu/aves',
    lastUpdated: new Date('2024-02-10'),
    metadata: {
      source: 'eBird + Observadores locales',
      accuracy: '±50m',
      resolution: 'Punto',
      coverage: 'Ciudadana'
    }
  },
  {
    id: 'bdu_flora_autoctona',
    name: 'Flora Autóctona',
    description: 'Especies vegetales nativas en espacios urbanos',
    type: 'BDU',
    category: 'Flora',
    icon: <Bird className="w-4 h-4" />,
    color: '#D97706',
    visible: true,
    opacity: 0.8,
    minZoom: 14,
    maxZoom: 20,
    dataUrl: '/api/biodiversity/bdu/flora',
    lastUpdated: new Date('2024-01-30'),
    metadata: {
      source: 'Herbario Digital + Inventarios',
      accuracy: '±10m',
      resolution: 'Punto',
      coverage: 'Científica'
    }
  },
  {
    id: 'bdu_polinizadores',
    name: 'Polinizadores',
    description: 'Abejas, mariposas y otros polinizadores urbanos',
    type: 'BDU',
    category: 'Fauna',
    icon: <Bird className="w-4 h-4" />,
    color: '#92400E',
    visible: false,
    opacity: 0.6,
    minZoom: 15,
    maxZoom: 20,
    dataUrl: '/api/biodiversity/bdu/polinizadores',
    lastUpdated: new Date('2024-02-15'),
    metadata: {
      source: 'Proyecto Polinizadores Urbanos',
      accuracy: '±20m',
      resolution: 'Punto',
      coverage: 'Específica'
    }
  },

  // Resiliencia (RES) - Zonas vulnerables
  {
    id: 'res_islas_calor',
    name: 'Islas de Calor',
    description: 'Zonas urbanas con temperaturas elevadas',
    type: 'RES',
    category: 'Vulnerabilidad',
    icon: <Shield className="w-4 h-4" />,
    color: '#EF4444',
    visible: true,
    opacity: 0.5,
    minZoom: 8,
    maxZoom: 18,
    dataUrl: '/api/biodiversity/res/calor',
    lastUpdated: new Date('2024-02-01'),
    metadata: {
      source: 'Imágenes satelitales térmicas',
      accuracy: '±30m',
      resolution: '30m pixel',
      coverage: 'Nacional'
    }
  },
  {
    id: 'res_riesgo_inundacion',
    name: 'Riesgo de Inundación',
    description: 'Áreas susceptibles a inundaciones urbanas',
    type: 'RES',
    category: 'Vulnerabilidad',
    icon: <Shield className="w-4 h-4" />,
    color: '#DC2626',
    visible: true,
    opacity: 0.6,
    minZoom: 10,
    maxZoom: 20,
    dataUrl: '/api/biodiversity/res/inundacion',
    lastUpdated: new Date('2024-01-28'),
    metadata: {
      source: 'Modelos hidrológicos',
      accuracy: '±5m',
      resolution: '1:5000',
      coverage: 'Municipal'
    }
  },
  {
    id: 'res_contaminacion_aire',
    name: 'Calidad del Aire',
    description: 'Niveles de contaminación atmosférica',
    type: 'RES',
    category: 'Vulnerabilidad',
    icon: <Shield className="w-4 h-4" />,
    color: '#B91C1C',
    visible: false,
    opacity: 0.4,
    minZoom: 8,
    maxZoom: 16,
    dataUrl: '/api/biodiversity/res/aire',
    lastUpdated: new Date('2024-02-12'),
    metadata: {
      source: 'Red de Estaciones de Calidad del Aire',
      accuracy: '±100m',
      resolution: 'Interpolación',
      coverage: 'Regional'
    }
  }
];

export default function BiodiversityLayers({
  onLayerToggle,
  onLayerOpacityChange,
  onLayerDataRequest,
  currentZoom,
  selectedLayers,
  onExportLayer
}: BiodiversityLayersProps) {
  const [layers, setLayers] = useState<BiodiversityLayerConfig[]>(BIODIVERSITY_LAYERS);
  const [activeTab, setActiveTab] = useState<'SUP' | 'CON' | 'BDU' | 'RES'>('SUP');
  const [showSettings, setShowSettings] = useState<string | null>(null);
  const [filterText, setFilterText] = useState('');

  // Filter layers by type and search
  const filteredLayers = useMemo(() => {
    return layers.filter(layer => {
      const matchesType = layer.type === activeTab;
      const matchesSearch = layer.name.toLowerCase().includes(filterText.toLowerCase()) ||
                           layer.description.toLowerCase().includes(filterText.toLowerCase());
      const matchesZoom = currentZoom >= layer.minZoom && currentZoom <= layer.maxZoom;
      
      return matchesType && matchesSearch && matchesZoom;
    });
  }, [layers, activeTab, filterText, currentZoom]);

  // Handle layer visibility toggle
  const handleLayerToggle = useCallback((layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, visible: !layer.visible }
        : layer
    ));
    
    const layer = layers.find(l => l.id === layerId);
    if (layer) {
      onLayerToggle(layerId, !layer.visible);
    }
  }, [layers, onLayerToggle]);

  // Handle opacity change
  const handleOpacityChange = useCallback((layerId: string, opacity: number) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, opacity: opacity / 100 }
        : layer
    ));
    
    onLayerOpacityChange(layerId, opacity / 100);
  }, [onLayerOpacityChange]);

  // Load layer data when made visible
  useEffect(() => {
    const visibleLayers = layers.filter(layer => layer.visible);
    visibleLayers.forEach(layer => {
      if (selectedLayers.includes(layer.id)) return; // Already loaded
      onLayerDataRequest(layer.id);
    });
  }, [layers, selectedLayers, onLayerDataRequest]);

  // Get layer statistics
  const layerStats = useMemo(() => {
    const stats = {
      SUP: { total: 0, visible: 0, coverage: 0 },
      CON: { total: 0, visible: 0, coverage: 0 },
      BDU: { total: 0, visible: 0, coverage: 0 },
      RES: { total: 0, visible: 0, coverage: 0 }
    };

    layers.forEach(layer => {
      stats[layer.type].total++;
      if (layer.visible) {
        stats[layer.type].visible++;
        stats[layer.type].coverage += layer.opacity;
      }
    });

    return stats;
  }, [layers]);

  // Tab configuration
  const tabConfig = {
    SUP: {
      label: 'Superficie',
      description: 'Áreas verdes y espacios naturales',
      icon: <TreePine className="w-4 h-4" />,
      color: 'bg-green-100 text-green-800'
    },
    CON: {
      label: 'Conectividad',
      description: 'Corredores ecológicos y conexiones',
      icon: <Network className="w-4 h-4" />,
      color: 'bg-blue-100 text-blue-800'
    },
    BDU: {
      label: 'Biodiversidad',
      description: 'Especies de flora y fauna urbana',
      icon: <Bird className="w-4 h-4" />,
      color: 'bg-orange-100 text-orange-800'
    },
    RES: {
      label: 'Resiliencia',
      description: 'Vulnerabilidad y riesgos ambientales',
      icon: <Shield className="w-4 h-4" />,
      color: 'bg-red-100 text-red-800'
    }
  };

  const LayerCard = ({ layer }: { layer: BiodiversityLayerConfig }) => (
    <Card className={`transition-all duration-200 ${layer.visible ? 'ring-2 ring-blue-200' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div 
              className="w-4 h-4 rounded-full mt-1 flex-shrink-0"
              style={{ backgroundColor: layer.color }}
            />
            <div className="min-w-0 flex-1">
              <CardTitle className="text-sm font-medium truncate">{layer.name}</CardTitle>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{layer.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Switch
              checked={layer.visible}
              onCheckedChange={() => handleLayerToggle(layer.id)}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(showSettings === layer.id ? null : layer.id)}
              className="p-1"
            >
              <Settings className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {showSettings === layer.id && (
        <CardContent className="pt-0 space-y-4">
          {/* Opacity Control */}
          <div>
            <label className="text-xs font-medium text-gray-700">Opacidad: {Math.round(layer.opacity * 100)}%</label>
            <Slider
              value={[layer.opacity * 100]}
              onValueChange={([value]) => handleOpacityChange(layer.id, value)}
              max={100}
              min={0}
              step={5}
              className="mt-1"
            />
          </div>

          {/* Zoom Range */}
          <div className="text-xs text-gray-500">
            <div>Zoom: {layer.minZoom} - {layer.maxZoom}</div>
            <div>Actual: {currentZoom} {currentZoom < layer.minZoom || currentZoom > layer.maxZoom ? '(no visible)' : ''}</div>
          </div>

          {/* Metadata */}
          <div className="space-y-1 text-xs">
            <div><strong>Fuente:</strong> {layer.metadata.source}</div>
            <div><strong>Precisión:</strong> {layer.metadata.accuracy}</div>
            <div><strong>Actualizado:</strong> {layer.lastUpdated.toLocaleDateString()}</div>
          </div>

          {/* Export Options */}
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExportLayer(layer.id, 'geojson')}
              className="text-xs"
            >
              <Download className="w-3 h-3 mr-1" />
              GeoJSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExportLayer(layer.id, 'kml')}
              className="text-xs"
            >
              KML
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );

  return (
    <div className="w-80 bg-white rounded-lg shadow-lg border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-green-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Map className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Capas de Biodiversidad</h3>
          </div>
          <Badge variant="outline" className="text-xs">
            {layers.filter(l => l.visible).length} activas
          </Badge>
        </div>

        {/* Search */}
        <div className="mt-3 relative">
          <Filter className="w-4 h-4 absolute left-2 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar capas..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="flex-1">
        <TabsList className="grid grid-cols-4 w-full rounded-none">
          {Object.entries(tabConfig).map(([key, config]) => (
            <TabsTrigger
              key={key}
              value={key}
              className="text-xs data-[state=active]:bg-white"
            >
              <div className="flex flex-col items-center space-y-1">
                {config.icon}
                <span>{config.label}</span>
                <Badge variant="outline" className="text-xs px-1">
                  {layerStats[key as keyof typeof layerStats].visible}/{layerStats[key as keyof typeof layerStats].total}
                </Badge>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(tabConfig).map(([key, config]) => (
          <TabsContent key={key} value={key} className="p-4 space-y-3 max-h-96 overflow-y-auto">
            <div className={`p-3 rounded-lg ${config.color}`}>
              <div className="flex items-center space-x-2 mb-2">
                {config.icon}
                <h4 className="font-medium">{config.label}</h4>
              </div>
              <p className="text-sm">{config.description}</p>
              <div className="mt-2 text-xs">
                Capas visibles: {layerStats[key as keyof typeof layerStats].visible} de {layerStats[key as keyof typeof layerStats].total}
              </div>
            </div>

            {filteredLayers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay capas disponibles en este nivel de zoom</p>
                <p className="text-xs mt-1">Zoom actual: {currentZoom}</p>
              </div>
            ) : (
              filteredLayers.map(layer => (
                <LayerCard key={layer.id} layer={layer} />
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Footer with quick actions */}
      <div className="p-3 border-t bg-gray-50 flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setLayers(prev => prev.map(layer => ({ ...layer, visible: false })));
            layers.forEach(layer => onLayerToggle(layer.id, false));
          }}
          className="text-xs"
        >
          <EyeOff className="w-3 h-3 mr-1" />
          Ocultar todo
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const typeLayers = layers.filter(l => l.type === activeTab);
            const shouldShow = typeLayers.some(l => !l.visible);
            setLayers(prev => prev.map(layer => 
              layer.type === activeTab ? { ...layer, visible: shouldShow } : layer
            ));
            typeLayers.forEach(layer => onLayerToggle(layer.id, shouldShow));
          }}
          className="text-xs"
        >
          <Eye className="w-3 h-3 mr-1" />
          Alternar tipo
        </Button>
      </div>
    </div>
  );
}