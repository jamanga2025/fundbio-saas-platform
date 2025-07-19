// Datos de ejemplo para testing de componentes de visualización

export const mockIndicatorData = [
  {
    id: 'SUP-001',
    name: 'Superficie de espacios verdes urbanos',
    category: 'Superficie',
    unit: 'm²',
    values: [
      { year: 2020, value: 125000, target: 130000 },
      { year: 2021, value: 127500, target: 135000 },
      { year: 2022, value: 132000, target: 140000 },
      { year: 2023, value: 138500, target: 145000 },
      { year: 2024, value: 143000, target: 150000 }
    ]
  },
  {
    id: 'BDU-001',
    name: 'Índice de biodiversidad urbana',
    category: 'Biodiversidad',
    unit: 'índice',
    values: [
      { year: 2020, value: 0.65, target: 0.70 },
      { year: 2021, value: 0.68, target: 0.72 },
      { year: 2022, value: 0.71, target: 0.74 },
      { year: 2023, value: 0.73, target: 0.76 },
      { year: 2024, value: 0.75, target: 0.78 }
    ]
  },
  {
    id: 'CON-001',
    name: 'Conectividad ecológica',
    category: 'Conectividad',
    unit: '%',
    values: [
      { year: 2020, value: 45, target: 50 },
      { year: 2021, value: 47, target: 52 },
      { year: 2022, value: 49, target: 54 },
      { year: 2023, value: 52, target: 56 },
      { year: 2024, value: 54, target: 58 }
    ]
  },
  {
    id: 'RES-001',
    name: 'Capacidad de retención de agua',
    category: 'Resiliencia',
    unit: 'L/m²',
    values: [
      { year: 2020, value: 12.5, target: 15.0 },
      { year: 2021, value: 13.2, target: 15.5 },
      { year: 2022, value: 14.1, target: 16.0 },
      { year: 2023, value: 14.8, target: 16.5 },
      { year: 2024, value: 15.3, target: 17.0 }
    ]
  },
  {
    id: 'CBA-001',
    name: 'Calidad del aire (PM2.5)',
    category: 'Calidad Ambiental',
    unit: 'µg/m³',
    values: [
      { year: 2020, value: 18.5, target: 15.0 },
      { year: 2021, value: 17.2, target: 14.5 },
      { year: 2022, value: 16.1, target: 14.0 },
      { year: 2023, value: 15.3, target: 13.5 },
      { year: 2024, value: 14.7, target: 13.0 }
    ]
  }
];

export const mockKPIData = [
  {
    id: 'total-green-space',
    title: 'Superficie Total Verde',
    value: 143000,
    unit: 'm²',
    previousValue: 138500,
    target: 150000,
    trend: 'up' as const,
    trendPercentage: 3.2,
    category: 'Superficie',
    color: 'green' as const
  },
  {
    id: 'biodiversity-index',
    title: 'Índice de Biodiversidad',
    value: 0.75,
    unit: 'índice',
    previousValue: 0.73,
    target: 0.78,
    trend: 'up' as const,
    trendPercentage: 2.7,
    category: 'Biodiversidad',
    color: 'blue' as const
  },
  {
    id: 'connectivity',
    title: 'Conectividad Ecológica',
    value: 54,
    unit: '%',
    previousValue: 52,
    target: 58,
    trend: 'up' as const,
    trendPercentage: 3.8,
    category: 'Conectividad',
    color: 'purple' as const
  },
  {
    id: 'water-retention',
    title: 'Retención de Agua',
    value: 15.3,
    unit: 'L/m²',
    previousValue: 14.8,
    target: 17.0,
    trend: 'up' as const,
    trendPercentage: 3.4,
    category: 'Resiliencia',
    color: 'blue' as const
  },
  {
    id: 'air-quality',
    title: 'Calidad del Aire',
    value: 14.7,
    unit: 'µg/m³',
    previousValue: 15.3,
    target: 13.0,
    trend: 'down' as const,
    trendPercentage: -3.9,
    category: 'Calidad Ambiental',
    color: 'green' as const
  },
  {
    id: 'projects-active',
    title: 'Proyectos Activos',
    value: 12,
    unit: 'proyectos',
    previousValue: 10,
    target: 15,
    trend: 'up' as const,
    trendPercentage: 20,
    category: 'Gestión',
    color: 'yellow' as const
  }
];

export const mockCategoryData = [
  { name: 'Superficie', value: 143000, color: '#10B981' },
  { name: 'Biodiversidad', value: 0.75, color: '#3B82F6' },
  { name: 'Conectividad', value: 54, color: '#8B5CF6' },
  { name: 'Resiliencia', value: 15.3, color: '#06B6D4' },
  { name: 'Calidad Ambiental', value: 14.7, color: '#F59E0B' }
];

export const mockTimeSeriesData = [
  { year: '2020', superficie: 125000, biodiversidad: 0.65, conectividad: 45, resiliencia: 12.5, calidad: 18.5 },
  { year: '2021', superficie: 127500, biodiversidad: 0.68, conectividad: 47, resiliencia: 13.2, calidad: 17.2 },
  { year: '2022', superficie: 132000, biodiversidad: 0.71, conectividad: 49, resiliencia: 14.1, calidad: 16.1 },
  { year: '2023', superficie: 138500, biodiversidad: 0.73, conectividad: 52, resiliencia: 14.8, calidad: 15.3 },
  { year: '2024', superficie: 143000, biodiversidad: 0.75, conectividad: 54, resiliencia: 15.3, calidad: 14.7 }
];