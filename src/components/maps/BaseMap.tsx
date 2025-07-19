"use client";

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface BaseMapProps {
  center?: [number, number];
  zoom?: number;
  height?: string;
  geoJsonData?: any;
  markers?: Array<{
    id: string;
    position: [number, number];
    title: string;
    description?: string;
    value?: number;
    color?: string;
  }>;
  onMapClick?: (lat: number, lng: number) => void;
  onFeatureClick?: (feature: any) => void;
  showControls?: boolean;
  layerStyle?: (feature: any) => any;
}

export default function BaseMap({
  center = [40.4168, -3.7038], // Madrid por defecto
  zoom = 10,
  height = '400px',
  geoJsonData,
  markers = [],
  onMapClick,
  onFeatureClick,
  showControls = true,
  layerStyle
}: BaseMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [keyboardNavigation, setKeyboardNavigation] = useState(false);

  // Estilo por defecto para capas GeoJSON
  const defaultStyle = (feature: any) => {
    return {
      fillColor: '#10B981',
      weight: 2,
      opacity: 1,
      color: '#059669',
      dashArray: '3',
      fillOpacity: 0.7,
      ...layerStyle?.(feature)
    };
  };

  // Crear marcador personalizado basado en valor
  const createCustomMarker = (marker: any) => {
    const color = marker.color || '#10B981';
    const size = marker.value ? Math.max(10, Math.min(30, marker.value / 100)) : 15;
    
    return L.divIcon({
      html: `
        <div style="
          background-color: ${color};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
          color: white;
        ">
          ${marker.value ? Math.round(marker.value) : ''}
        </div>
      `,
      className: 'custom-marker',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  };

  const handleFeatureClick = (feature: any, layer: any) => {
    setSelectedFeature(feature);
    if (onFeatureClick) {
      onFeatureClick(feature);
    }
    
    // Highlight de la feature clickeada
    layer.setStyle({
      weight: 4,
      color: '#0F766E',
      dashArray: '',
      fillOpacity: 0.9
    });
  };

  const handleKeyboardNavigation = (e: KeyboardEvent) => {
    if (!mapRef.current) return;
    
    const panDistance = 50;
    const zoomStep = 1;
    
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        mapRef.current.panBy([0, -panDistance]);
        break;
      case 'ArrowDown':
        e.preventDefault();
        mapRef.current.panBy([0, panDistance]);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        mapRef.current.panBy([-panDistance, 0]);
        break;
      case 'ArrowRight':
        e.preventDefault();
        mapRef.current.panBy([panDistance, 0]);
        break;
      case '+':
      case '=':
        e.preventDefault();
        mapRef.current.setZoom(mapRef.current.getZoom() + zoomStep);
        break;
      case '-':
        e.preventDefault();
        mapRef.current.setZoom(mapRef.current.getZoom() - zoomStep);
        break;
      case 'Escape':
        e.preventDefault();
        setSelectedFeature(null);
        break;
    }
  };

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (onMapClick) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  };

  useEffect(() => {
    // Configuración adicional del mapa si es necesario
    if (mapRef.current) {
      if (showControls) {
        // Agregar controles personalizados si es necesario
      }
      
      // Configurar navegación por teclado
      if (keyboardNavigation) {
        document.addEventListener('keydown', handleKeyboardNavigation);
        return () => document.removeEventListener('keydown', handleKeyboardNavigation);
      }
    }
  }, [showControls, keyboardNavigation]);

  useEffect(() => {
    // Simular carga del mapa
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Componente de skeleton loader
  const MapSkeleton = () => (
    <div className="w-full h-full bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
      <div className="text-gray-500">
        <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
        <p className="mt-2 text-sm">Cargando mapa...</p>
      </div>
    </div>
  );

  return (
    <div className="w-full relative" style={{ height }}>
      {/* Controles de accesibilidad */}
      <div className="absolute top-2 left-2 z-10 bg-white rounded-lg shadow-lg p-2 space-y-2">
        <button
          onClick={() => setKeyboardNavigation(!keyboardNavigation)}
          className={`px-3 py-1 text-xs rounded ${
            keyboardNavigation 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700'
          } hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500`}
          aria-label={`${keyboardNavigation ? 'Desactivar' : 'Activar'} navegación por teclado`}
          title="Usa las flechas para mover el mapa, +/- para zoom, ESC para deseleccionar"
        >
          ⌨️ Teclado
        </button>
        {selectedFeature && (
          <button
            onClick={() => setSelectedFeature(null)}
            className="px-3 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Deseleccionar elemento"
          >
            ✕ Cerrar
          </button>
        )}
      </div>

      {/* Información de elemento seleccionado */}
      {selectedFeature && (
        <div className="absolute bottom-2 left-2 right-2 z-10 bg-white rounded-lg shadow-lg p-4 max-w-sm">
          <h4 className="font-semibold text-gray-900 mb-2">
            {selectedFeature.properties?.name || selectedFeature.properties?.NAME || 'Elemento seleccionado'}
          </h4>
          {selectedFeature.properties?.description && (
            <p className="text-sm text-gray-600 mb-2">{selectedFeature.properties.description}</p>
          )}
          {selectedFeature.properties?.value && (
            <p className="text-sm font-medium text-green-600">
              Valor: {selectedFeature.properties.value}
            </p>
          )}
        </div>
      )}

      {/* Skeleton loader */}
      {isLoading && <MapSkeleton />}

      {/* Mapa principal */}
      <div className={`w-full h-full ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
        <div 
          role="application"
          aria-label="Mapa interactivo de biodiversidad"
          tabIndex={0}
          className="rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
          >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Capa GeoJSON */}
        {geoJsonData && (
          <GeoJSON
            data={geoJsonData}
            style={defaultStyle}
            onEachFeature={(feature, layer) => {
              layer.on({
                click: () => handleFeatureClick(feature, layer),
                mouseover: (e) => {
                  const layer = e.target;
                  layer.setStyle({
                    weight: 3,
                    color: '#0F766E',
                    dashArray: '',
                    fillOpacity: 0.8
                  });
                },
                mouseout: (e) => {
                  const layer = e.target;
                  layer.setStyle(defaultStyle(feature));
                }
              });

              // Popup con información de la feature
              if (feature.properties) {
                const props = feature.properties;
                const popupContent = `
                  <div class="p-2">
                    <h4 class="font-semibold text-gray-900">${props.name || props.NAME || 'Área'}</h4>
                    ${props.description ? `<p class="text-sm text-gray-600">${props.description}</p>` : ''}
                    ${props.value ? `<p class="text-sm font-medium text-green-600">Valor: ${props.value}</p>` : ''}
                  </div>
                `;
                layer.bindPopup(popupContent);
              }
            }}
          />
        )}

        {/* Marcadores */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.position}
            icon={createCustomMarker(marker)}
          >
            <Popup>
              <div className="p-2" role="dialog" aria-label={`Información de ${marker.title}`}>
                <h4 className="font-semibold text-gray-900">{marker.title}</h4>
                {marker.description && (
                  <p className="text-sm text-gray-600">{marker.description}</p>
                )}
                {marker.value && (
                  <p className="text-sm font-medium text-green-600">
                    Valor: {marker.value}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}