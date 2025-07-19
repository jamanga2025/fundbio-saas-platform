// Datos geoespaciales de ejemplo para la Fundación Biodiversidad

// GeoJSON de ejemplo para el municipio de Pinto (Madrid)
export const pintoMunicipioGeoJSON = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "id": "pinto_municipio",
        "name": "Pinto",
        "tipo": "municipio",
        "provincia": "Madrid",
        "superficie_km2": 62.8,
        "poblacion": 51132
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-3.7000, 40.2400],
          [-3.6800, 40.2400],
          [-3.6800, 40.2600],
          [-3.7000, 40.2600],
          [-3.7000, 40.2400]
        ]]
      }
    }
  ]
};

// GeoJSON de ejemplo para distritos/barrios de Pinto
export const pintoDistritosGeoJSON = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "id": "distrito_centro",
        "name": "Centro Histórico",
        "tipo": "distrito",
        "municipio": "Pinto",
        "superficie_ha": 245.8,
        "poblacion": 12500
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-3.6950, 40.2450],
          [-3.6900, 40.2450],
          [-3.6900, 40.2500],
          [-3.6950, 40.2500],
          [-3.6950, 40.2450]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "distrito_norte",
        "name": "Distrito Norte",
        "tipo": "distrito",
        "municipio": "Pinto",
        "superficie_ha": 189.4,
        "poblacion": 8900
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-3.6950, 40.2500],
          [-3.6900, 40.2500],
          [-3.6900, 40.2550],
          [-3.6950, 40.2550],
          [-3.6950, 40.2500]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "distrito_sur",
        "name": "Distrito Sur",
        "tipo": "distrito",
        "municipio": "Pinto",
        "superficie_ha": 298.7,
        "poblacion": 15200
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-3.6950, 40.2400],
          [-3.6900, 40.2400],
          [-3.6900, 40.2450],
          [-3.6950, 40.2450],
          [-3.6950, 40.2400]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "distrito_este",
        "name": "Barrio Verde",
        "tipo": "barrio",
        "municipio": "Pinto",
        "superficie_ha": 156.3,
        "poblacion": 7800
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-3.6900, 40.2450],
          [-3.6850, 40.2450],
          [-3.6850, 40.2500],
          [-3.6900, 40.2500],
          [-3.6900, 40.2450]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "distrito_oeste",
        "name": "Zona Industrial",
        "tipo": "distrito",
        "municipio": "Pinto",
        "superficie_ha": 412.1,
        "poblacion": 6732
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-3.7000, 40.2450],
          [-3.6950, 40.2450],
          [-3.6950, 40.2500],
          [-3.7000, 40.2500],
          [-3.7000, 40.2450]
        ]]
      }
    }
  ]
};

// GeoJSON de ejemplo para proyectos específicos (parques, áreas verdes)
export const pintoProyectosGeoJSON = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "id": "proyecto_parque_central",
        "name": "Parque Central Renaturalizado",
        "tipo": "proyecto",
        "categoria": "B1",
        "estado": "completado",
        "fecha_inicio": "2023-01-15",
        "fecha_fin": "2023-12-20",
        "presupuesto": 450000,
        "superficie_m2": 12500
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-3.6930, 40.2470],
          [-3.6920, 40.2470],
          [-3.6920, 40.2480],
          [-3.6930, 40.2480],
          [-3.6930, 40.2470]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "proyecto_corredor_verde",
        "name": "Corredor Verde Norte-Sur",
        "tipo": "proyecto",
        "categoria": "B2",
        "estado": "en_progreso",
        "fecha_inicio": "2024-03-01",
        "fecha_fin": "2024-11-30",
        "presupuesto": 780000,
        "longitud_m": 2800
      },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [-3.6925, 40.2520],
          [-3.6925, 40.2480],
          [-3.6925, 40.2440],
          [-3.6925, 40.2420]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "proyecto_huerto_urbano",
        "name": "Huerto Urbano Comunitario",
        "tipo": "proyecto",
        "categoria": "B3",
        "estado": "planificado",
        "fecha_inicio": "2024-09-01",
        "fecha_fin": "2025-03-31",
        "presupuesto": 120000,
        "superficie_m2": 3200
      },
      "geometry": {
        "type": "Point",
        "coordinates": [-3.6910, 40.2465]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "proyecto_cubierta_verde",
        "name": "Cubiertas Verdes Edificios Públicos",
        "tipo": "proyecto",
        "categoria": "B1",
        "estado": "completado",
        "fecha_inicio": "2023-06-01",
        "fecha_fin": "2023-10-15",
        "presupuesto": 280000,
        "superficie_m2": 850
      },
      "geometry": {
        "type": "Point",
        "coordinates": [-3.6935, 40.2475]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "proyecto_bosque_periurbano",
        "name": "Restauración Bosque Periurbano",
        "tipo": "proyecto",
        "categoria": "B4",
        "estado": "en_progreso",
        "fecha_inicio": "2024-01-15",
        "fecha_fin": "2025-12-31",
        "presupuesto": 950000,
        "superficie_ha": 45.2
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-3.6850, 40.2520],
          [-3.6800, 40.2520],
          [-3.6800, 40.2570],
          [-3.6850, 40.2570],
          [-3.6850, 40.2520]
        ]]
      }
    }
  ]
};

// Datos de indicadores asociados a las geometrías
export const mockIndicatorValues = {
  "SUP-001": [
    { featureId: "distrito_centro", value: 2.8, unit: "m²/hab", year: 2024 },
    { featureId: "distrito_norte", value: 4.2, unit: "m²/hab", year: 2024 },
    { featureId: "distrito_sur", value: 3.6, unit: "m²/hab", year: 2024 },
    { featureId: "distrito_este", value: 8.9, unit: "m²/hab", year: 2024 },
    { featureId: "distrito_oeste", value: 1.4, unit: "m²/hab", year: 2024 }
  ],
  "BDU-001": [
    { featureId: "distrito_centro", value: 0.65, unit: "índice", year: 2024 },
    { featureId: "distrito_norte", value: 0.78, unit: "índice", year: 2024 },
    { featureId: "distrito_sur", value: 0.71, unit: "índice", year: 2024 },
    { featureId: "distrito_este", value: 0.85, unit: "índice", year: 2024 },
    { featureId: "distrito_oeste", value: 0.42, unit: "índice", year: 2024 }
  ],
  "CON-001": [
    { featureId: "distrito_centro", value: 35, unit: "%", year: 2024 },
    { featureId: "distrito_norte", value: 62, unit: "%", year: 2024 },
    { featureId: "distrito_sur", value: 48, unit: "%", year: 2024 },
    { featureId: "distrito_este", value: 78, unit: "%", year: 2024 },
    { featureId: "distrito_oeste", value: 23, unit: "%", year: 2024 }
  ],
  "RES-001": [
    { featureId: "proyecto_parque_central", value: 28.5, unit: "L/m²", year: 2024 },
    { featureId: "proyecto_cubierta_verde", value: 35.2, unit: "L/m²", year: 2024 },
    { featureId: "proyecto_huerto_urbano", value: 22.8, unit: "L/m²", year: 2024 }
  ],
  "CBA-001": [
    { featureId: "distrito_centro", value: 16.8, unit: "µg/m³", year: 2024 },
    { featureId: "distrito_norte", value: 14.2, unit: "µg/m³", year: 2024 },
    { featureId: "distrito_sur", value: 15.6, unit: "µg/m³", year: 2024 },
    { featureId: "distrito_este", value: 12.1, unit: "µg/m³", year: 2024 },
    { featureId: "distrito_oeste", value: 19.4, unit: "µg/m³", year: 2024 }
  ]
};

// Lista de indicadores disponibles para testing
export const availableGeoIndicators = [
  {
    id: "SUP-001",
    name: "Superficie de espacios verdes por habitante",
    unit: "m²/hab",
    category: "Superficie",
    escala: "Submunicipal"
  },
  {
    id: "BDU-001",
    name: "Índice de biodiversidad urbana",
    unit: "índice",
    category: "Biodiversidad",
    escala: "Submunicipal"
  },
  {
    id: "CON-001",
    name: "Conectividad ecológica",
    unit: "%",
    category: "Conectividad",
    escala: "Submunicipal"
  },
  {
    id: "RES-001",
    name: "Capacidad de retención de agua",
    unit: "L/m²",
    category: "Resiliencia",
    escala: "Proyecto"
  },
  {
    id: "CBA-001",
    name: "Calidad del aire (PM2.5)",
    unit: "µg/m³",
    category: "Calidad Ambiental",
    escala: "Submunicipal"
  }
];

// Función para obtener datos de indicador por ID
export const getIndicatorDataForLayer = (indicatorId: string) => {
  return mockIndicatorValues[indicatorId as keyof typeof mockIndicatorValues] || [];
};